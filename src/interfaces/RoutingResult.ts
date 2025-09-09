import type Nullable from './Nullable.js';
import type { CliCoreCommandCallback } from './CliCoreCommand.js';
import type Arguments from './Arguments.js';

/**
 * Represents the result of routing a command.
 */
type RoutingResult = {
    /**
     * The chain of commands that were executed, for example:
     * `appName command1 subcommand1 subcommand2` will be:
     * `['command1', 'subcommand1', 'subcommand2']`
     */
    commandChain: string[];
    /**
     * The arguments that remained after routing the command.
     */
    commandArguments: Arguments;
} & (
    | {
          /**
           * The status of the routing result.
           * * `error`: The command was not found or an error in the Router occurred.
           * * `callback`: The command was found and the callback function is returned.
           * * `help`: The help flag was used, so no command is executed.
           */
          status: 'error';
          /**
           * The result of the command. It can be an error or the callback function.
           */
          result: Error;
      }
    | {
          /**
           * The status of the routing result.
           * * `error`: The command was not found or an error in the Router occurred.
           * * `callback`: The command was found and the callback function is returned.
           * * `help`: The help flag was used, so no command is executed.
           */
          status: 'help';
          /**
           * The result of the command. It can be an error or the callback function.
           */
          result: null;
      }
    | {
          /**
           * The status of the routing result.
           * * `error`: The command was not found or an error in the Router occurred.
           * * `callback`: The command was found and the callback function is returned.
           * * `help`: The help flag was used, so no command is executed.
           */
          status: 'callback';
          /**
           * The result of the command. It can be an error or the callback function.
           */
          result: CliCoreCommandCallback;
      }
);

/**
 * An internal version of RoutingResult to avoid type errors when building the result object.
*/
export type InternalRoutingResult = Omit<RoutingResult, 'result' | 'status'> & {
    /**
     * The result of the command. It can be an error, the callback function, or null.
     */
    result: Nullable<Error | CliCoreCommandCallback>;
    /**
     * The status of the routing result.
     * * `error`: The command was not found or an error in the Router occurred.
     * * `callback`: The command was found and the callback function is returned.
     * * `help`: The help flag was used, so no command is executed.
     */
    status: 'error' | 'help' | 'callback';
}

export default RoutingResult;
