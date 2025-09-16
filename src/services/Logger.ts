import { Chalk } from 'chalk';
import { colorize } from 'json-colorizer';

import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type Nullable from '../interfaces/Nullable.js';

export type LoggerOptions = Pick<CliCoreOptions, 'behavior'>;
export type LoggerInstance = ReturnType<typeof Logger>;

type MessageLogLevel = 'debug' | 'info' | 'warn' | 'error' | 'data';

export function LoggerFactory(options: LoggerOptions) {
    return (origin: string) => Logger(options, origin);
}

/**
 * Creates a logger instance for a specific origin.
 * @param options The logger options, including behavior settings
 * @param origin The origin name to include in log messages
 * @returns An object with logging methods (debug, info, warning, error, json) and formatting utilities
 */
export default function Logger(options: LoggerOptions, origin: string) {
    const chalk = new Chalk({
        level:
            typeof options.behavior.colorfulOutput === 'number'
                ? options.behavior.colorfulOutput
                : options.behavior.colorfulOutput
                  ? undefined
                  : 0
    });

    /**
     * Joins multiple message parts into a single string with spaces.
     * @param message The message parts to join
     * @returns The joined message string
     */
    function join(...message: string[]): string {
        return message.join(' ');
    }

    /**
     * Formats the log level with appropriate colors and styles.
     * @param level The log level to format
     * @returns The formatted log level string
     */
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
        }

        return message + spacing;
    }

    /**
     * Formats the message prefix including timestamp, level, and origin if in debug mode.
     * @param level The log level of the message
     * @returns The formatted message prefix, or null if not in debug mode
     */
    function _formatMessagePrefix(level: MessageLogLevel): Nullable<string> {
        return options.behavior.debugMode
            ? `${chalk.green(new Date().toISOString())} ${_formatMessageLevel(level)} ${chalk.gray('[' + origin + ']')} `
            : '';
    }

    /**
     * Formats a debug message with the appropriate prefix.
     * @param message The debug message to format
     * @returns The formatted debug message
     */
    function formatDebug(message: string): string {
        return _formatMessagePrefix('debug') + message;
    }

    /**
     * Formats a warning message with the appropriate prefix.
     * @param message The warning message to format
     * @returns The formatted warning message
     */
    function formatWarning(message: string): string {
        return _formatMessagePrefix('warn') + message;
    }

    /**
     * Formats an info message with the appropriate prefix.
     * @param message The info message to format
     * @returns The formatted info message
     */
    function formatInfo(message: string): string {
        return _formatMessagePrefix('info') + message;
    }

    /**
     * Formats an error message with the appropriate prefix.
     * @param error The error to format
     * @returns The formatted error message
     */
    function formatError(error: Error): string {
        const message = options.behavior.debugMode
            ? error.message + '\n' + error.stack
            : error.message;

        return _formatMessagePrefix('error') + message;
    }

    /**
     * Formats JSON data into a pretty-printed string, optionally colorized.
     * @param data The JSON data to format, either as a string or an object
     * @returns The formatted JSON string
     */
    function formatJson(data: string | object): string {
        const message = options.behavior.colorfulOutput
            ? colorize(data, {
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
              })
            : JSON.stringify(data, null, 2);

        return _formatMessagePrefix('data') + '\n' + message;
    }

    /**
     * Logs a debug message if debug mode is enabled.
     * @param message The debug message to log
     */
    function debug(message: string): void {
        if (!options.behavior.debugMode) return;

        console.log(formatDebug(message));
    }

    /**
     * Logs an info message.
     * @param message The info message to log
     */
    function info(message: string): void {
        console.log(formatInfo(message));
    }

    /**
     * Logs a warning message.
     * @param message The warning message to log
     */
    function warning(message: string): void {
        console.warn(formatWarning(message));
    }

    /**
     * Logs an error message.
     * @param error The error to log
     */
    function error(error: Error): void {
        console.error(formatError(error));
    }

    /**
     * Logs JSON data in a pretty-printed format.
     * @param data The JSON data to log, either as a string or an object
     */
    function json(data: string | object): void {
        console.log(formatJson(data));
    }

    return {
        /**
         * Formatting utilities for log messages.
         */
        format: {
            /**
             * Joins multiple message parts into a single string with spaces.
             * @param message The message parts to join
             * @returns The joined message string
             */
            join,
            /**
             * Formats a debug message with the appropriate prefix.
             * @param message The debug message to format
             * @returns The formatted debug message
             */
            debug: formatDebug,
            /**
             * Formats an info message with the appropriate prefix.
             * @param message The info message to format
             * @returns The formatted info message
             */
            info: formatInfo,
            /**
             * Formats a warning message with the appropriate prefix.
             * @param message The warning message to format
             * @returns The formatted warning message
             */
            warning: formatWarning,
            /**
             * Formats an error message with the appropriate prefix.
             * @param error The error to format
             * @returns The formatted error message
             */
            error: formatError,
            /**
             * Formats JSON data into a pretty-printed string, optionally colorized.
             * @param data The JSON data to format, either as a string or an object
             * @returns The formatted JSON string
             */
            json: formatJson
        },
        /**
         * Logs a debug message if debug mode is enabled.
         * @param message The debug message to log
         */
        debug,
        /**
         * Logs an info message.
         * @param message The info message to log
         */
        info,
        /**
         * Logs a warning message.
         * @param message The warning message to log
         */
        warning,
        /**
         * Logs an error message.
         * @param error The error to log
         */
        error,
        /**
         * Logs JSON data in a pretty-printed format.
         * @param data The JSON data to log, either as a string or an object
         */
        json,
        /**
         * A [Chalk](https://github.com/chalk/chalk) instance for custom colorful output.
         * It will respect the `colorfulOutput` behavior option.
         */
        colors: chalk
    };
}
