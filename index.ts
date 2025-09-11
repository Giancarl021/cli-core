import fillObject from 'fill-object';
import constants from './src/util/constants.js';
import Router from './src/services/Router.js';
import Descriptor from './src/services/Descriptor.js';
import Parser from './src/services/Parser.js';
import ExtensionBundler from './src/services/ExtensionBundler.js';
import CommandHelpers from './src/services/CommandHelpers.js';
import { LoggerFactory, type LoggerInstance } from './src/services/Logger.js';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import type { PartialCliCoreOptions } from './src/interfaces/CliCoreOptions.js';
import type CliCoreCommand from './src/interfaces/CliCoreCommand.js';
import type CliCoreExtension from './src/interfaces/CliCoreExtension.js';
import type CliCoreCommandAddons from './src/interfaces/CliCoreCommandAddons.js';
import type {
    CliCoreCommandThis,
    Stdio
} from './src/interfaces/CliCoreCommand.js';

type CliCoreInstance = ReturnType<typeof CliCore>;

/**
 *
 * @param options The options to create the CLI Core instance, requiring at least
 * the `appName` and `commands` properties
 * @returns The CLI Core instance, ready to be run
 */
export default function CliCore(options: PartialCliCoreOptions) {
    const _options = fillObject(
        options as CliCoreOptions,
        constants.defaultOptions,
        true
    );

    const bundler = ExtensionBundler(_options);
    const parser = Parser(_options.arguments);
    const router = Router(_options);
    const descriptor = Descriptor(_options);
    const loggerFactory = LoggerFactory(_options);

    /**
     * Handles an error based on the debug mode option
     */
    function _handleError(logger: LoggerInstance, error: Error) {
        if (_options.behavior.debugMode) {
            throw error;
        }

        logger.error(error);
        process.exit(1);
    }

    /**
     * Handles the result of a command based on the debug mode and noOutput options
     * @param logger The logger instance to use for output
     * @param result The result to handle
     * @returns The result string if in debug mode and not noOutput, otherwise void
     */
    function _handleResult(
        logger: LoggerInstance,
        result: string | typeof constants.noOutputSymbol
    ): void | string {
        if (result === constants.noOutputSymbol) {
            return;
        }

        if (_options.behavior.debugMode) {
            // Reject output if exit code is set to non-zero
            if (process.exitCode && process.exitCode !== 0) {
                throw new Error(result);
            }
            return result;
        }

        logger.info(result);
    }

    /**
     * Runs a series of interceptors in sequence, passing the result of each
     * as the input of the next one
     * @param interceptors The interceptors to be run
     * @param input The initial input to be passed to the first interceptor
     * @returns The final result after all interceptors have been run
     */
    async function _runInterceptors<T>(
        interceptors: ((options: CliCoreOptions, input: T) => Promise<T> | T)[],
        input: T
    ): Promise<T> {
        let data = input;
        for (const interceptor of interceptors) {
            data = await interceptor(_options, data);
        }

        return data;
    }

    /**
     * Runs the CLI Core instance, processing the arguments, routing the command,
     * executing it and handling the output
     * @returns A promise that resolves when the execution is complete
     */
    async function run(): Promise<void | string> {
        const interceptors = bundler.getInterceptors();

        const rawArgs = await _runInterceptors(
            interceptors.beforeParsing,
            _options.arguments.origin.slice(_options.arguments.ignoreFirst)
        );

        const { args, flags } = await _runInterceptors(
            interceptors.beforeRouting,
            parser.parse(rawArgs)
        );

        const navigation = await _runInterceptors(
            interceptors.beforeRunning,
            router.navigate(args, flags)
        );

        const logger = loggerFactory(
            _options.appName + '::Command::' + navigation.commandChain.join('.')
        );

        if (navigation.status === 'error') {
            _handleError(logger, navigation.result);
            return;
        }

        let result: string | typeof constants.noOutputSymbol;

        if (navigation.status === 'help') {
            result = descriptor.render(navigation.commandChain);
        } else {
            try {
                const stdio: Stdio = {
                    stdin: process.stdin,
                    stdout: process.stdout,
                    stderr: process.stderr
                };

                const helpers = CommandHelpers(navigation.commandArguments, flags, stdio);
                const context: CliCoreCommandThis = {
                    stdio,
                    logger,
                    helpers,
                    appName: _options.appName,
                    extensions: bundler.bundle(helpers),
                    NO_OUTPUT: constants.noOutputSymbol
                };

                result = await navigation.result.call(
                    context,
                    navigation.commandArguments,
                    flags
                );
            } catch (error) {
                const _err =
                    error instanceof Error ? error : new Error(String(error));

                _handleError(logger, _err);
                return;
            }
        }

        result = await _runInterceptors(interceptors.beforePrinting, result);

        const final = _handleResult(logger, result);

        await _runInterceptors(interceptors.beforeEnding, undefined);

        return final;
    }

    return {
        /**
         * Runs the CLI Core instance, processing the arguments, routing the command,
         * executing it and handling the output
         * @returns A promise that resolves when the execution is complete
         */
        run
    };
}

/**
 * A helper function to make easier to define a CLI Core command
 * without having to import interfaces
 * @param command The command to be created
 * @returns The defined command
 */
export function defineCommand(command: CliCoreCommand): CliCoreCommand {
    return command;
}

export type {
    CliCoreOptions,
    CliCoreCommand,
    CliCoreInstance,
    CliCoreCommandAddons,
    CliCoreExtension,
    PartialCliCoreOptions
};
