import fillObject from 'fill-object';
import constants from './src/util/constants.js';
import Router from './src/services/Router.js';
import Descriptor from './src/services/Descriptor.js';
import Parser from './src/services/Parser.js';
import ExtensionBundler from './src/services/ExtensionBundler.js';
import CommandHelpers from './src/services/CommandHelpers.js';
import {
    ExtensionLoggerFactory,
    LoggerFactory,
    type LoggerInstance
} from './src/services/Logger.js';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import type { PartialCliCoreOptions } from './src/interfaces/CliCoreOptions.js';
import type CliCoreCommand from './src/interfaces/CliCoreCommand.js';
import type CliCoreExtension from './src/interfaces/CliCoreExtension.js';
import type CliCoreCommandAddons from './src/interfaces/CliCoreCommandAddons.js';
import type {
    CliCoreCommandThis,
    Stdio
} from './src/interfaces/CliCoreCommand.js';
import type HelpDescriptor from './src/interfaces/HelpDescriptor.js';
import type Arguments from './src/interfaces/Arguments.js';
import type Flags from './src/interfaces/Flags.js';
import type FlowInterceptors from './src/interfaces/FlowInterceptors.js';
import type ParsedArguments from './src/interfaces/ParsedArguments.js';
import type RoutingResult from './src/interfaces/RoutingResult.js';
import type { CommandDescriptor } from './src/interfaces/HelpDescriptor.js';
import type { InterceptorOptions } from './src/interfaces/CliCoreExtension.js';

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

    _options.commands = options.commands;

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
        result: string | symbol
    ): void | string {
        const _result =
            result === constants.noOutputSymbol
                ? constants.noOutputSymbol
                : String(result);

        if (_result === constants.noOutputSymbol) {
            return;
        }

        if (_options.behavior.debugMode) {
            // Reject output if exit code is set to non-zero
            if (process.exitCode && process.exitCode !== 0) {
                throw new Error(_result);
            }
            return _result;
        }

        logger.info(_result);
    }

    /**
     * Runs a series of interceptors in sequence, passing the result of each
     * as the input of the next one
     * @param interceptors The interceptors to be run
     * @param input The initial input to be passed to the first interceptor
     * @returns The final result after all interceptors have been run
     */
    async function _runInterceptors<T>(
        interceptorType: keyof FlowInterceptors,
        interceptors: {
            callback: (options: InterceptorOptions, input: T) => Promise<T> | T;
            extensionName: string;
        }[],
        input: T
    ): Promise<T> {
        let data = input;
        const loggerFactory = ExtensionLoggerFactory(_options);

        for (const { callback, extensionName } of interceptors) {
            data = await callback(
                {
                    ..._options,
                    logger: loggerFactory(
                        `${options.appName}::Extensions::${extensionName}.interceptors.${interceptorType}`
                    )
                },
                data
            );
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
            'beforeParsing',
            interceptors.beforeParsing,
            _options.arguments.origin.slice(_options.arguments.ignoreFirst)
        );

        const { args, flags } = await _runInterceptors(
            'beforeRouting',
            interceptors.beforeRouting,
            parser.parse(rawArgs)
        );

        const navigation = await _runInterceptors(
            'beforeRunning',
            interceptors.beforeRunning,
            router.navigate(args, flags)
        );

        const logger = loggerFactory(
            _options.appName +
                '::Command' +
                (navigation.commandChain.length
                    ? '::' + navigation.commandChain.join('.')
                    : '')
        );

        if (navigation.status === 'error') {
            _handleError(logger, navigation.result);
            return;
        }

        let result: string | symbol;

        if (navigation.status === 'help') {
            result = descriptor.render(navigation.commandChain);
        } else {
            try {
                const stdio: Stdio = {
                    stdin: process.stdin,
                    stdout: process.stdout,
                    stderr: process.stderr
                };

                const helpers = CommandHelpers(
                    navigation.commandArguments,
                    flags,
                    stdio
                );
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

        result = await _runInterceptors(
            'beforePrinting',
            interceptors.beforePrinting,
            result
        );

        const final = _handleResult(logger, result);

        await _runInterceptors(
            'beforeEnding',
            interceptors.beforeEnding,
            undefined
        );

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

/**
 * A helper function to make easier to define a CLI Core Help Descriptor
 * for a single command application
 * @param helpDescriptor The help descriptor for the command
 * @returns The defined help descriptor
 */
export function defineSingleCommandHelpDescriptor(
    helpDescriptor: CommandDescriptor
): HelpDescriptor {
    return {
        ...helpDescriptor,
        $schema: constants.singleCommandHelpDescriptorSchema
    };
}

/**
 * A helper function to make easier to define a CLI Core Help Descriptor
 * for multiple commands and command groups
 * @param helpDescriptor The help descriptor for the commands and command groups
 * @returns The defined help descriptor
 */
export function defineMultiCommandHelpDescriptor(
    helpDescriptor: Exclude<HelpDescriptor, CommandDescriptor>
): HelpDescriptor {
    return helpDescriptor;
}

export type {
    CliCoreOptions,
    CliCoreCommand,
    CliCoreInstance,
    CliCoreCommandAddons,
    CliCoreExtension,
    PartialCliCoreOptions,
    HelpDescriptor,
    Arguments,
    Flags,
    FlowInterceptors,
    ParsedArguments,
    RoutingResult
};
