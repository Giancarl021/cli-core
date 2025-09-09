import fillObject from 'fill-object';
import constants from './src/util/constants.js';
import { LoggerFactory, type LoggerInstance } from './src/services/Logger.js';
import Router from './src/services/Router.js';
import Descriptor from './src/services/Descriptor.js';
import Parser from './src/services/Parser.js';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import type { PartialCliCoreOptions } from './src/interfaces/CliCoreOptions.js';
import type CliCoreCommand from './src/interfaces/CliCoreCommand.js';
import type CliCoreExtension from './src/interfaces/CliCoreExtension.js';
import type CliCoreCommandAddons from './src/interfaces/CliCoreCommandAddons.js';

type CliCoreInstance = ReturnType<typeof CliCore>;

export default function CliCore(options: PartialCliCoreOptions) {
    const _options = fillObject(
        options as CliCoreOptions,
        constants.defaultOptions,
        true
    );

    const parser = Parser(_options.arguments);
    const router = Router(_options);
    const descriptor = Descriptor(_options);
    const loggerFactory = LoggerFactory(_options);

    async function _handleError(logger: LoggerInstance, error: Error) {
        if (_options.behavior.debugMode) {
            throw error;
        }
    }

    async function run() {
        const { args, flags } = parser.parse();
        const navigation = router.navigate(args, flags);

        const logger = loggerFactory(
            _options.appName + '::Command::' + navigation.commandChain.join('.')
        );

        if (navigation.status === 'error')
            await _handleError(logger, navigation.result);
    }

    return {
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
