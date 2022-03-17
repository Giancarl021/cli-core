module.exports = function (appName, flagOptions, commandDescription = null) {
    function render(commandChain = []) {
        const l = commandChain.length;

        if (!l) return noHelp();

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
            r += `${temp.args ? ' ' + renderArguments(temp.args) : ''}\n  Description: ${temp.description}${temp.flags ? '\n  Flags:\n' + renderFlags(flags) : ''}`;
        }

        return r;

        function noHelp() {
            return `No help description found for command "${appName} ${commandChain.join(' ')}"`;
        }
    }

    function renderSubcommands(subcommands) {
        let r = '';

        for (const commandName in subcommands) {
            const command = subcommands[commandName];

            if (typeof command === 'object') {
                r += `    ${commandName}: ${command.description}`;
            } else {
                r += `    ${commandName}: ${command}`;
            }
        }

        return r;
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
            const flagName = getFullFlag(f);

            if (typeof flag === 'string') {
                r.push(`    ${flagName}: ${flag}`);
            } else {
                r.push(`    ${flagName}: ${flag.description}`);
            }
        }
    }

    function getFullFlag(flagName) {
        const l = flagName.length;

        if (!l) {
            if (flagOptions.parseEmptyFlags) return '<empty>';
            else throw new Error('Empty flag names are not allowed');
        }
    }

    return {
        render
    };
}