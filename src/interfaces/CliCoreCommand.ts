import type { CommandHelpersInstance } from '../services/CommandHelpers.js';
import type Args from './Args.js';
import type Awaitable from './Awaitable.js';
import type CliCoreCommandAddons from './CliCoreCommandAddons.js';
import type Flags from './Flags.js';

export interface CliCoreCommandThis {
    appName: string;
    extensions: CliCoreCommandAddons;
    helpers: CommandHelpersInstance;
}

export type CliCoreCommandCallback = (
    this: CliCoreCommandThis,
    args: Args,
    flags: Flags
) => Awaitable<string>;

export interface CliCoreCommandGroup {
    [commandName: string]: CliCoreCommandGroup | CliCoreCommandCallback;
}

type CliCoreCommand = CliCoreCommandCallback | CliCoreCommandGroup;

export default CliCoreCommand;
