import { Chalk } from 'chalk';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type {
    ArgDescriptor,
    CommandDescriptor,
    CommandGroupDescriptor,
    FlagsDescriptor
} from '../interfaces/HelpDescriptor.js';
import HelpDescriptor from '../interfaces/HelpDescriptor.js';
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
                let temp = chalk.blueBright(arg.name);

                if (arg.multiple) {
                    temp += chalk.blue(`[, ${temp}[, ...]]`);
                }

                temp = chalk.blueBright('<') + temp + chalk.blueBright('>');

                if (arg.optional) {
                    temp = chalk.cyan('[') + temp + chalk.cyan(']');
                }

                result.push(temp);
            }
        }

        return result.join(' ');
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

            if (isComplex) {
                result.push(
                    `  ${flagName}${flag.optional === false ? chalk.redBright(' (required)') : ''}: ${chalk.white(flag.description)}${(chalk.gray(flag.values && flag.values.length ? `\n      Values: ${flag.values.join(' | ')}` : ''))}`
                );
            } else {
                result.push(`  ${flagName}: ${chalk.gray(flag)}`);
            }
        }

        return result.join('\n');

        function getFullFlagNames(name: string, aliases: string[]): string {
            return [name, ...aliases]
                .map(getFullFlagName)
                .filter(Boolean)
                .join(' | ');

            function getFullFlagName(name: string): string | null {
                const result = [];

                if (!name.length) {
                    if (options.arguments.flags.ignoreEmptyFlags) return null;
                    else result.push(defaultPrefix);
                } else {
                    result.push(defaultPrefix + name);
                }

                return result
                    .map(chalk.magentaBright)
                    .join(chalk.magenta(' | '));
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
            result += `${currentDescriptor.args ? ' ' + _renderArguments(currentDescriptor.args) : ''}\n  ${chalk.white('Description:'  + currentDescriptor.description)}${currentDescriptor.flags ? chalk.white('\n  Flags:\n') + _renderFlags(currentDescriptor.flags) : ''}`;
        }

        return result;
    }

    return {
        render
    };
}
