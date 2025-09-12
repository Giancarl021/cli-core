import { Chalk } from 'chalk';
import { isEmpty as isObjectEmpty } from '../util/object.js';
import { isEmpty as isStringEmpty } from '../util/string.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type HelpDescriptor from '../interfaces/HelpDescriptor.js';
import type {
    ArgDescriptor,
    CommandDescriptor,
    CommandGroupDescriptor,
    FlagsDescriptor,
    SingleCommandHelpDescriptor,
    StdioDescriptor
} from '../interfaces/HelpDescriptor.js';
import type AnyRecord from '../interfaces/AnyRecord.js';
import constants from '../util/constants.js';

export type DescriptorOptions = Pick<
    CliCoreOptions,
    'appName' | 'appDescription' | 'behavior' | 'arguments' | 'help'
>;

export type DescriptorInstance = ReturnType<typeof Descriptor>;

/**
 * Renders help descriptors for the CLI application and its commands.
 * @param options The descriptor options, including application details and help configuration
 * @returns An object with a `render` method to generate help text
 */
export default function Descriptor(options: DescriptorOptions) {
    const chalk = new Chalk({
        level: options.behavior.colorfulOutput ? undefined : 0
    });

    /**
     * The default flag prefix used when rendering help messages.
     * It is always the longest non-empty prefix defined in the options.
     */
    const defaultPrefix = options.arguments.flags.prefixes
        .filter(prefix => !isStringEmpty(prefix))
        .sort((a, b) => b.length - a.length)
        .shift();

    /**
     * Checks if the provided help descriptor is for a single command application.
     * @param help The help descriptor to check
     * @returns True if it is a single command help descriptor, otherwise false
     */
    function _isSingleCommandHelpDescriptor(
        help: HelpDescriptor
    ): help is SingleCommandHelpDescriptor {
        return (
            '$schema' in help &&
            help.$schema === constants.singleCommandHelpDescriptorSchema
        );
    }

    /**
     * Renders the default help message for the application.
     * @param help The help descriptor containing commands and descriptions
     * @returns The formatted help message as a string
     */
    function _defaultHelp(help: HelpDescriptor): string {
        if (_isSingleCommandHelpDescriptor(help)) {
            return _renderPrefix([]) + _renderCommandDescriptor(help);
        }

        return `${chalk.whiteBright(options.appName)}\n${options.appDescription ? chalk.white(`  Description: ${options.appDescription}\n`) : ''}  ${chalk.white('Commands:\n') + _renderSubcommands(help)}`;
    }

    /**
     * Renders a message indicating that no help is found for a specific command.
     * @param commandChain The chain of commands leading to the current command
     * @returns The formatted no-help message as a string
     */
    function _noHelp(commandChain: string[] = []): string {
        return `No help found for command ${chalk.whiteBright(options.appName)}${chalk.yellow(commandChain.length ? ' ' + commandChain.join(' ') : '')}`;
    }

    /**
     * Renders the command prefix including the application name and command chain.
     * @param commandChain The chain of commands to include in the prefix
     * @returns The formatted command prefix as a string
     */
    function _renderPrefix(commandChain: string[]): string {
        return `${chalk.whiteBright(options.appName)} ${chalk.yellow(commandChain.join(' '))}`;
    }

    /**
     * Renders subcommands from a given set of subcommands.
     * @param subcommands The subcommands to render
     * @returns The formatted subcommands as a string
     */
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

    /**
     * Renders command arguments into a formatted string.
     * @param args The arguments to render
     * @returns The formatted arguments as a string
     */
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

    /**
     * Renders standard input/output/error streams into a formatted string.
     * @param stdio The stdio descriptor to render
     * @returns The formatted stdio information as a string
     */
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

    /**
     * Renders flags into a formatted string.
     * @param flags The flags descriptor to render
     * @returns The formatted flags as a string
     */
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

        /**
         * Gets the full flag names including prefixes and aliases.
         * @param name The main flag name
         * @param aliases The aliases for the flag
         * @returns The formatted flag names as a string, or null if no valid name
         */
        function getFullFlagNames(
            name: string,
            aliases: string[]
        ): string | null {
            const parts = [name, ...aliases]
                .map(getFullFlagName)
                .filter(Boolean);

            return parts.length ? parts.join(chalk.magenta(' | ')) : null;

            /**
             * Gets the full flag name with prefix.
             * @param name The flag name
             * @returns The formatted flag name with prefix, or null if no valid name
             */
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

    /**
     * Renders a command descriptor into a formatted string.
     * @param descriptor The command descriptor to render
     * @returns The formatted command descriptor as a string
     */
    function _renderCommandDescriptor(descriptor: CommandDescriptor): string {
        return `${
            descriptor.args ? ' ' + _renderArguments(descriptor.args) : ''
        }\n  ${chalk.white('Description:' + descriptor.description)}${
            descriptor.stdio
                ? chalk.white(`\n  STDIO:\n`) + _renderStdio(descriptor.stdio)
                : ''
        }${
            descriptor.flags
                ? chalk.white('\n  Flags:\n') + _renderFlags(descriptor.flags)
                : ''
        }`;
    }

    /**
     * Renders the help message for a given command chain.
     * @param commandChain The chain of commands to render help for
     * @returns The formatted help message as a string
     */
    function render(commandChain: string[]): string {
        const { ...help } = options.help;

        if (_isSingleCommandHelpDescriptor(help)) return _defaultHelp(help);

        delete (help as AnyRecord)['$schema'];

        if (isObjectEmpty(help)) return _noHelp();

        if (!commandChain.length) return _defaultHelp(help);

        let currentDescriptor = help[commandChain[0]] || null;
        let result = _renderPrefix(commandChain);

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
            result += _renderCommandDescriptor(currentDescriptor);
        }

        return result;
    }

    return {
        /**
         * Renders the help message for a given command chain.
         * @param commandChain The chain of commands to render help for
         * @returns The formatted help message as a string
         */
        render
    };
}
