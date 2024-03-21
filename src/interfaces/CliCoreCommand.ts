import type { CommandHelpersInstance } from 'src/services/CommandHelpers.js';
import type Args from './Args.js';
import type Awaitable from './Awaitable.js';
import type CliCoreBundledExtensions from './CliCoreBundledExtensions.js';
import type Flags from './Flags.js';

export interface CliCoreCommandThis {
    appName: string;
    extensions: CliCoreBundledExtensions;
    helpers: CommandHelpersInstance;
}

export type CliCoreCommand = (
    this: CliCoreCommandThis,
    args: Args,
    flags: Flags
) => Awaitable<string>;
