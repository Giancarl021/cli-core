import type Nullable from './Nullable.js';
import type { CliCoreCommandCallback } from './CliCoreCommand.js';
import type Arguments from './Arguments.js';

/**
 * Represents the result of routing a command.
 */
interface RoutingResult {
    /**
     * The status of the routing result.
     * * `error`: The command was not found or an error in the Router occurred.
     */
    status: 'error' | 'help' | 'callback';
    /**
     * The chain of commands that were executed, for example:
     * `appName command1 subcommand1 subcommand2` will be:
     * `['command1', 'subcommand1', 'subcommand2']`
     */
    commandChain: string[];
    /**
     * The result of the command. It can be an error or the callback function.
     */
    result: Nullable<Error | CliCoreCommandCallback>;
    /**
     * The arguments that remained after routing the command.
     */
    commandArguments: Arguments;
}

export default RoutingResult;
