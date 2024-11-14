import { Chalk } from 'chalk';
import { colorize } from 'json-colorizer';

import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type Nullable from '../interfaces/Nullable.js';

export type LoggerOptions = Pick<CliCoreOptions, 'behavior'>;
export type LoggerInstance = ReturnType<typeof Logger>;

type MessageLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'data';

export default function Logger(options: LoggerOptions, origin: string) {
    const chalk = new Chalk({
        level: options.behavior.colorfulOutput ? undefined : 0
    });

    function join(...message: string[]): string {
        return message.join(' ');
    }

    function _formatMessageLevel(level: MessageLogLevel) {
        const levelFormatted = level.toUpperCase();
        const spacing = level.length < 5 ? ' '.repeat(5 - level.length) : '';
        let message: string;

        switch (level) {
            case 'debug':
                message = chalk.bgGray.black(levelFormatted);
                break;
            case 'info':
                message = chalk.blueBright(levelFormatted);
                break;
            case 'warn':
                message = chalk.yellowBright(levelFormatted);
                break;
            case 'error':
                message = chalk.redBright(levelFormatted);
                break;
            case 'data':
                message = chalk.bgWhiteBright.black(levelFormatted);
                break;
            default:
                throw new Error(`Unknown log level: ${level}`);
        }

        return message + spacing;
    }

    function _formatMessagePrefix(level: MessageLogLevel): Nullable<string> {
        return options.behavior.debugMode
            ? `${chalk.green(new Date().toISOString())} ${_formatMessageLevel(level)} ${chalk.whiteBright('[' + origin + ']')} `
            : '';
    }

    function formatDebug(message: string): string {
        return _formatMessagePrefix('debug') + message;
    }

    function formatWarning(message: string): string {
        return _formatMessagePrefix('warn') + message;
    }

    function formatInfo(message: string): string {
        return _formatMessagePrefix('info') + message;
    }

    function formatError(error: Error): string {
        const message = options.behavior.debugMode
            ? error.message + '\n' + error.stack
            : error.message;

        return _formatMessagePrefix('error') + message;
    }

    function formatJson(data: string | object): string {
        const message = colorize(data, {
            indent: 2,
            colors: {
                BooleanLiteral: chalk.magentaBright,
                Brace: chalk.whiteBright,
                NullLiteral: chalk.gray,
                NumberLiteral: chalk.greenBright,
                StringLiteral: chalk.yellowBright,
                Bracket: chalk.whiteBright,
                Colon: chalk.white,
                Comma: chalk.white,
                StringKey: chalk.blueBright,
                Whitespace: chalk.gray
            }
        });

        return _formatMessagePrefix('data') + '\n' + message;
    }

    function debug(message: string): void {
        if (!options.behavior.debugMode) return;

        console.log(formatDebug(message));
    }

    function info(message: string): void {
        console.log(formatInfo(message));
    }

    function warning(message: string): void {
        console.warn(formatWarning(message));
    }

    function error(error: Error): void {
        console.error(formatError(error));
    }

    function json(data: string | object): void {
        console.log(formatJson(data));
    }

    return {
        format: {
            join,
            debug: formatDebug,
            info: formatInfo,
            warning: formatWarning,
            error: formatError,
            json: formatJson
        },
        debug,
        info,
        warning,
        error,
        json,
        colors: chalk
    };
}
