import { Chalk } from 'chalk';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type HelpDescriptor from '../interfaces/HelpDescriptor.js';
import type {
    ArgDescriptor,
    CommandDescriptor,
    CommandGroupDescriptor,
    FlagsDescriptor,
    StdioDescriptor
} from '../interfaces/HelpDescriptor.js';
import { isEmpty as isObjectEmpty } from '../util/object.js';
import { isEmpty as isStringEmpty } from '../util/string.js';

export type DescriptorOptions = Pick<
    CliCoreOptions,
    'appName' | 'appDescription' | 'behavior' | 'arguments' | 'help'
>;

export type DescriptorInstance = ReturnType<typeof Descriptor>;

export default function Descriptor(options: DescriptorOptions) {
    const chalk = new Chalk({
        level: options.behavior.colorfulOutput ? undefined : 0
    });

    const defaultPrefix = options.arguments.flags.prefixes
        .filter(prefix => !isStringEmpty(prefix))
        .sort((a, b) => b.length - a.length)
        .shift();

    function _defaultHelp(help: HelpDescriptor): string {
        return `${chalk.whiteBright(options.appName)}\n${options.appDescription ? chalk.white(`  Description: ${options.appDescription}\n`) : ''}  ${chalk.white('Commands:\n') + _renderSubcommands(help)}`;
    }

    function _noHelp(commandChain: string[] = []): string {
        return `No help found for command ${chalk.whiteBright(options.appName)}${chalk.yellow(commandChain.length ? ' ' + commandChain.join(' ') : '')}`;
    }

    function _renderSubcommands(
        subcommands: Record<
            string,
            CommandGroupDescriptor | CommandDescriptor | string
        >
    ): string {
        const result = [];

        for (const commandName in subcommands) {
            const command = subcommands[commandName];

            if (typeof command === 'object') {
                result.push(
                    `  ${chalk.yellow(commandName)}: ${chalk.white(command.description)}`
                );
            } else {
                result.push(
                    `  ${chalk.yellow(commandName)}: ${chalk.white(command)}`
                );
            }
        }

        return result.join('\n');
    }

    function _renderArguments(args: (string | ArgDescriptor)[]): string {
        const result: string[] = [];

        for (const arg of args) {
            if (typeof arg === 'string') {
                result.push(chalk.blueBright(`<${arg}>`));
            } else {
                let temp = chalk.blueBright('<' + arg.name + '>');

                if (arg.multiple) {
                    temp += chalk.blue(`[, ${temp}[, ...]]`);
                }

                if (arg.optional) {
                    temp = chalk.cyan('[') + temp + chalk.cyan(']');
                }

                result.push(temp);
            }
        }

        return result.join(' ');
    }

    function _renderStdio(stdio: StdioDescriptor): string {
        const result: string[] = [];

        if (stdio.stdin) {
            result.push(
                `    ${chalk.greenBright('stdin')}: ${chalk.white(stdio.stdin)}`
            );
        }

        if (stdio.stdout) {
            result.push(
                `    ${chalk.greenBright('stdout')}: ${chalk.white(stdio.stdout)}`
            );
        }

        if (stdio.stderr) {
            result.push(
                `    ${chalk.greenBright('stderr')}: ${chalk.white(stdio.stderr)}`
            );
        }

        return result.join('\n');
    }

    function _renderFlags(flags: FlagsDescriptor): string {
        if (!defaultPrefix) return '';

        const result = [];

        for (const f in flags) {
            const flag = flags[f];
            const isComplex = typeof flag === 'object';
            const flagName = getFullFlagNames(
                f,
                isComplex ? flag.aliases || [] : []
            );

            if (!flagName) continue;

            if (isComplex) {
                result.push(
                    `    ${flagName}${flag.optional === false ? chalk.redBright(' (required)') : ''}: ${chalk.white(flag.description)}${chalk.gray(flag.values && flag.values.length ? `\n      Values: ${flag.values.join(' | ')}` : '')}`
                );
            } else {
                result.push(`    ${flagName}: ${chalk.gray(flag)}`);
            }
        }

        return result.join('\n');

        function getFullFlagNames(
            name: string,
            aliases: string[]
        ): string | null {
            const parts = [name, ...aliases]
                .map(getFullFlagName)
                .filter(Boolean);

            return parts.length ? parts.join(chalk.magenta(' | ')) : null;

            function getFullFlagName(name: string): string | null {
                let result: string | null;

                if (!name.length) {
                    if (options.arguments.flags.ignoreEmptyFlags) return null;
                    else result = String(defaultPrefix);
                } else {
                    result = String(defaultPrefix) + name;
                }

                return chalk.magentaBright(result);
            }
        }
    }

    function render(commandChain: string[]): string {
        const { $schema: _, ...help } = options.help;

        if (isObjectEmpty(help)) return _noHelp();

        if (!commandChain.length) return _defaultHelp(help);

        let currentDescriptor = help[commandChain[0]] || null;
        let result = `${chalk.whiteBright(options.appName)} ${chalk.yellow(commandChain.join(' '))}`;

        if (currentDescriptor === null) return _noHelp(commandChain);

        for (let i = 1; i < commandChain.length; i++) {
            if (
                typeof currentDescriptor === 'object' &&
                'subcommands' in currentDescriptor &&
                commandChain[i] in currentDescriptor.subcommands
            )
                currentDescriptor =
                    currentDescriptor.subcommands[commandChain[i]];
            else currentDescriptor = null;

            if (currentDescriptor === null) return _noHelp(commandChain);
        }

        if (typeof currentDescriptor === 'string') {
            result += chalk.white(`\n  Description: ${currentDescriptor}`);
        } else if ('subcommands' in currentDescriptor) {
            result += `\n${currentDescriptor.description ? chalk.white(`  Description: ${currentDescriptor.description}\n`) : ''}  ${chalk.white('Subcommands:')}\n${_renderSubcommands(currentDescriptor.subcommands)}`;
        } else {
            result += `${
                currentDescriptor.args
                    ? ' ' + _renderArguments(currentDescriptor.args)
                    : ''
            }\n  ${chalk.white('Description:' + currentDescriptor.description)}${
                currentDescriptor.stdio
                    ? chalk.white(`\n  STDIO:\n`) +
                      _renderStdio(currentDescriptor.stdio)
                    : ''
            }${
                currentDescriptor.flags
                    ? chalk.white('\n  Flags:\n') +
                      _renderFlags(currentDescriptor.flags)
                    : ''
            }`;
        }

        return result;
    }

    return {
        render
    };
}
