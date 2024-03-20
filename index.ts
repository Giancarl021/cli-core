import fillObject from 'fill-object';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import constants from 'src/util/constants.js';

export default function cliCore(options: CliCoreOptions) {
    const _options = fillObject(options, constants.defaultOptions, true);

    const commands = structuredClone(_options.commands);
    console.log(commands);
}

export type { CliCoreOptions };
