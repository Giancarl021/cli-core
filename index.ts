import fillObject from 'fill-object';
import constants from './src/util/constants.js';

import type CliCoreOptions from './src/interfaces/CliCoreOptions.js';
import type { PartialCliCoreOptions } from './src/interfaces/CliCoreOptions.js';
import type CliCoreBundledExtensions from './src/interfaces/CliCoreBundledExtensions.js';

export default function cliCore(options: PartialCliCoreOptions) {
    const _options = fillObject(
        options as CliCoreOptions,
        constants.defaultOptions,
        true
    );

    console.log(_options);
}

export type { CliCoreOptions, PartialCliCoreOptions, CliCoreBundledExtensions };
