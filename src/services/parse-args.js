const regexEscape = require('regex-escape');
const typeInference = require('@giancarl021/type-inference');

const isEmpty = require('../util/is-empty-string');

module.exports = function (
    argv = process.argv,
    {
        flagPrefix = '--',
        singleCharacterFlagPrefix = '-',
        singleCharacterFlagOnlyUppercase = false,
        tryTypeInference = true,
        parseFlags = true,
        parseEmptyFlags = false,
        keepArgsStartingFromIndex = 2
    } = {}
) {
    const rawArgs = argv.slice(keepArgsStartingFromIndex);

    if (
        !parseFlags ||
        (isEmpty(flagPrefix) && isEmpty(singleCharacterFlagPrefix))
    )
        return { args: rawArgs, flags: {} };

    const l = rawArgs.length;

    const flags = {};
    const args = [];

    const parseFlag = createFlagParser();
    let captureValue = false;
    let lastFlagName = null;

    const format = tryTypeInference ? arg => typeInference(arg) : _ => _;

    for (let i = 0; i < l; i++) {
        const arg = rawArgs[i];

        if (captureValue) {
            flags[lastFlagName] = format(arg);
            captureValue = false;
            continue;
        }

        const flagName = parseFlag(arg);

        if (flagName !== null) {
            flags[flagName] = null;
            captureValue = true;
            lastFlagName = flagName;
            continue;
        }

        args.push(format(arg));
    }

    return {
        args,
        flags
    };

    function createFlagParser() {
        const workflow = [];

        if (!isEmpty(flagPrefix)) {
            const callback = parseEmptyFlags
                ? arg =>
                      arg.startsWith(flagPrefix)
                          ? arg.substr(flagPrefix.length)
                          : null
                : arg => {
                      if (!arg.startsWith(flagPrefix)) return null;
                      const value = arg.substr(flagPrefix.length);
                      if (!value.length) return null;
                      return value;
                  };

            workflow.push(callback);
        }

        if (!isEmpty(singleCharacterFlagPrefix)) {
            const singleCharacterFlagRegex = new RegExp(
                `^${regexEscape(singleCharacterFlagPrefix)}[${singleCharacterFlagOnlyUppercase ? '' : 'a-z'}A-Z0-9!@#$?]${parseEmptyFlags ? '?' : ''}$`
            );

            workflow.push(arg =>
                singleCharacterFlagRegex.test(arg) ? arg.substr(-1) : null
            );
        }

        return arg => {
            for (const fn of workflow) {
                const result = fn(arg);
                if (result !== null) return result;
            }

            return null;
        };
    }
};
