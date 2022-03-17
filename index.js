const clone = require('clone');
const fillObject = require('fill-object');
const { defaultOptions } = require('./src/util/constants');
const parseArgs = require('./src/services/parse-args');
const createRouter = require('./src/services/router');
const createDescriptor = require('./src/services/descriptor');

function main(appName, options = defaultOptions) {
    options = fillObject(options, defaultOptions, true);

    const commands = clone(options.commands);
    let help = clone(options.help);
    const { helpFlags, ...flagOptions } = options.args.flags;
    const { exitOnError, returnResult, logger } = options.behavior;

    flagOptions.keepArgsStartingFromIndex = options.behavior.keepArgsStartingFromIndex;

    const navigate = createRouter(appName, commands, options.context, options.extensions, helpFlags);
    const descriptor = createDescriptor(appName, options.appDescription, flagOptions, help);

    function setHelp(helpDescription) {
        help = clone(helpDescription);
    }

    function getHelp() {
        return help;
    }

    function setCommand(commandName, callback) {
        commands[commandName] = callback;
    }

    function removeCommand(commandName) {
        delete commands[commandName];
    }

    function getCommand(commandName) {
        return commands[commandName];
    }

    async function handleError(errorObject) {
        if (exitOnError) {
            await logger(errorObject.message);
            process.exit(1);
        }

        throw errorObject;
    }

    async function run() {
        const { args, flags } = parseArgs(options.args.origin, flagOptions);
        const { fn, meta } = navigate(args, flags);

        if (meta.error) await handleError(meta.error);

        let result;

        if (meta.help) {
            result = descriptor.render(meta.chain);
        } else {
            try {
                result = String(await fn());
            } catch (err) {
                await handleError(err);
            }
        }

        if (returnResult) return result;

        await logger(result);
    }

    return {
        command: {
            get: getCommand,
            set: setCommand,
            remove: removeCommand
        },
        help: {
            get: getHelp,
            set: setHelp
        },
        run
    };
}

module.exports = main;