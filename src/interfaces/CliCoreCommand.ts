import type { CommandHelpersInstance } from '../services/CommandHelpers.js';
import type { LoggerInstance } from '../services/Logger.js';
import type Arguments from './Arguments.js';
import type Awaitable from './Awaitable.js';
import type CliCoreCommandAddons from './CliCoreCommandAddons.js';
import type Flags from './Flags.js';

/**
 * Represents the standard input/output/error streams.
 */
export interface Stdio {
    /**
     * The standard input stream.
     */
    stdin: NodeJS.ReadStream;
    /**
     * The standard output stream.
     */
    stdout: NodeJS.WriteStream;
    /**
     * The standard error stream.
     */
    stderr: NodeJS.WriteStream;
}

/**
 * The `this` context of a command function. It
 * contains details about the application and
 * gives access to extensions and helpers.
 */
export interface CliCoreCommandThis {
    /**
     * The name of the application.
     */
    appName: string;
    /**
     * The extensions used by the application
     */
    extensions: CliCoreCommandAddons;
    /**
     * Helpers for parsing and outputting data
     */
    helpers: CommandHelpersInstance;
    /**
     * The logger instance for the command,
     * allowing colorful and formatted output.
     */
    logger: LoggerInstance;
    /**
     * The standard input/output/error streams
     * available to the command.
     */
    stdio: Stdio;
    /**
     * Signal to indicate that the command
     * will not produce any output.
     * This is useful for commands that
     * perform actions without printing
     * anything to the console.
     */
    readonly NO_OUTPUT: symbol;
}

/**
 * Represents a command function in a CLI application.
 * @param args The arguments passed to the command
 * @param flags The flags passed to the command
 * @returns The output of the command, must be a awaitable `string` or `this.NO_OUTPUT` to
 * indicate no output will be produced.
 */
export type CliCoreCommandCallback = (
    this: CliCoreCommandThis,
    args: Arguments,
    flags: Flags
) => Awaitable<string | symbol>;

/**
 * Represents a group of commands in a CLI application.
 * It can contain both commands and sub-groups.
 */
export interface CliCoreCommandGroup {
    /**
     * The commands and sub-groups in this group.
     */
    [commandName: string]: CliCoreCommandGroup | CliCoreCommandCallback;
}

/**
 * Represents a command in a CLI application. Can be a
 * single command or a group of commands.
 */
type CliCoreCommand = CliCoreCommandCallback | CliCoreCommandGroup;

export default CliCoreCommand;
