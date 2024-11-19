import fillObject from 'fill-object';
import constants from './src/util/constants.js';
import Logger from './src/services/Logger.js';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import type { PartialCliCoreOptions } from './src/interfaces/CliCoreOptions.js';
import type CliCoreCommand from './src/interfaces/CliCoreCommand.js';
import type CliCoreExtension from './src/interfaces/CliCoreExtension.js';
import type CliCoreCommandAddons from './src/interfaces/CliCoreCommandAddons.js';

export default function cliCore(options: PartialCliCoreOptions) {
    const _options = fillObject(
        options as CliCoreOptions,
        constants.defaultOptions,
        true
    );

    console.log(_options);

    function defineLogger(origin: string) {
        return Logger(_options, origin);
    }
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
    CliCoreCommandAddons,
    CliCoreExtension,
    PartialCliCoreOptions
};
