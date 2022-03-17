const isEmpty = require('../util/is-empty-string');

module.exports = function (appName, appDescription, flagOptions, commandDescription = null) {
    const isFlagPrefixEmpty = isEmpty(flagOptions.flagPrefix);
    const isSingleCharacterFlagPrefixEmpty = isEmpty(flagOptions.singleCharacterFlagPrefix);

    if (
        commandDescription &&
        (isFlagPrefixEmpty && isSingleCharacterFlagPrefixEmpty) &&
        commandHasFlagsDefined(commandDescription)
    ) throw new Error('Command description cannot have flags defined without any flag prefixes');

    if (
        commandDescription &&
        isFlagPrefixEmpty &&
        commandHasAnyMultipleCharacterFlags(commandDescription)
    ) throw new Error('Command description cannot have multiple character flags without a proper flag prefix');

    function render(commandChain = []) {
        if (!commandDescription) return noHelp();

        const l = commandChain.length;

        if (!l) return defaultHelp();

        let temp = commandDescription[commandChain[0]] || null;
        let r = `${appName} ${commandChain.join(' ')}`;

        if (temp === null) return noHelp();

        for (let i = 1; i < l; i++) {
            temp = temp.subcommands ? (temp.subcommands[commandChain[i]] || null) : null;

            if (temp === null) return noHelp();
        }

        if (typeof temp === 'string') {
            r += `\n  Description: ${temp}`;
        }
        else if (temp.subcommands) {
            r += `\n${temp.description ? `  Description: ${temp.description}\n` : ''}  Subcommands:\n${renderSubcommands(temp.subcommands)}`;
        } else {
            r += `${temp.args ? ' ' + renderArguments(temp.args) : ''}\n  Description: ${temp.description}${temp.flags ? '\n  Flags:\n' + renderFlags(temp.flags) : ''}`;
        }

        return r;

        function noHelp() {
            return `No help description found for command "${appName}${l ? ' ' + commandChain.join(' '): ''}"`;
        }

        function defaultHelp() {
            return `${appName}\n${appDescription ? `  Description: ${appDescription}\n` : ''}  Commands:\n${renderSubcommands(commandDescription)}`;
        }
    }

    function renderSubcommands(subcommands) {
        const r = [];

        for (const commandName in subcommands) {
            const command = subcommands[commandName];

            if (typeof command === 'object') {
                r.push(`    ${commandName}: ${command.description}`);
            } else {
                r.push(`    ${commandName}: ${command}`);
            }
        }

        return r.join('\n');
    }

    function renderArguments(args) {
        const r = [];

        for (const arg of args) {
            if (typeof arg === 'string') {
                r.push(`<${arg}>`);
            } else {
                let temp = `<${arg.name}>`;

                if (arg.multiple) {
                    temp = `${temp}[, ${temp}[, ...]]`;
                }

                if (arg.optional) {
                    temp = `[${temp}]`;
                }

                r.push(temp);
            }
        }

        return r.join(' ');
    }

    function renderFlags(flags) {
        const r = [];

        for (const f in flags) {
            const flag = flags[f];
            const isComplex = typeof flag === 'object';
            const flagName = getFullFlagNames(f, isComplex ? (flag.aliases || []) : []);

            if (isComplex) {
                r.push(`    ${flagName}${flag.hasOwnProperty('optional') ? (!flag.optional ? ' (required)' : '') : ''}: ${flag.description}${(flag.values && flag.values.length) ? `\n      Values: ${flag.values.join(' | ')}` : ''}`);
            } else {
                r.push(`    ${flagName} : ${flag}`);
            }
        }

        return r.join('\n');
    }

    function getFullFlagNames(name, aliases) {
        return [name, ...aliases].map(getFullName).join(' | ');

        function getFullName(name) {
            const r = [];
            const l = name.length;
            const empty = '<empty>';

            if (!l) {
                if (flagOptions.parseEmptyFlags) {
                    if (!isFlagPrefixEmpty) r.push(flagOptions.flagPrefix + empty);
                    if (!isSingleCharacterFlagPrefixEmpty) r.push(flagOptions.singleCharacterFlagPrefix + empty);
                }
                else throw new Error('Empty flag names are not allowed');
            } else if (l === 1) {
                if (isSingleCharacterFlagPrefixEmpty) r.push(flagOptions.flagPrefix + name);
                else r.push(flagOptions.singleCharacterFlagPrefix + name);
            } else {
                r.push(flagOptions.flagPrefix + name);
            }

            return r.join(' | ');
        }
    }

    function commandHasFlagsDefined(commandDescriptor) {
        for (const command in commandDescriptor) {
            const temp = commandDescriptor[command];            
            if (typeof temp === 'string') continue;
            if (Object.keys(temp.flags || {}).length) return true;
            if (commandHasFlagsDefined(temp.subcommands)) return true;
        }

        return false;
    }

    function commandHasAnyMultipleCharacterFlags(commandDescriptor) {
        for (const command in commandDescriptor) {
            const temp = commandDescriptor[command];            
            if (typeof temp === 'string') continue;

            const keys = Object.keys(temp.flags || {});

            if (keys) {
                for (const key of keys) {
                    const flag = temp.flags[key];
                    if (key.length > 1) return true;
                    if (
                        typeof flag === 'object' &&
                        (flag.aliases && flag.aliases.length) &&
                        flag.aliases.some(alias => alias.length > 1)
                    ) return true;
                }    
            }
            if (commandHasAnyMultipleCharacterFlags(temp.subcommands)) return true;
        }

        return false;
    }

    return {
        render
    };
}