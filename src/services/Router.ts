import type Arguments from '../interfaces/Arguments.js';
import type Flags from '../interfaces/Flags.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type RoutingResult from '../interfaces/RoutingResult.js';
import type Undefinable from '../interfaces/Undefinable.js';
import type CliCoreCommand from '../interfaces/CliCoreCommand.js';
import type { CliCoreCommandGroup } from '../interfaces/CliCoreCommand.js';
import type { InternalRoutingResult } from '../interfaces/RoutingResult.js';

export type RouterInstance = ReturnType<typeof Router>;

export type RouterOptions = Pick<
    CliCoreOptions,
    'appName' | 'commands' | 'arguments'
>;

/**
 * Navigates through the command structure based on provided arguments and flags.
 * @param options The router options, including the command structure and argument parsing settings
 * @returns An object with a `navigate` method to process arguments and flags
 */
export default function Router(options: RouterOptions) {
    /**
     * Navigates through the command structure based on provided arguments and flags.
     * @param args The command-line arguments to process
     * @param flags The parsed flags from the command line
     * @returns The result of the routing process, including status, command chain, and any relevant data
     */
    function navigate(args: Arguments, flags: Flags): RoutingResult {
        const result: InternalRoutingResult = {
            status: 'error',
            commandChain: [],
            result: null,
            commandArguments: []
        };

        let currentCommand: Undefinable<CliCoreCommand> = options.commands;

        for (const flag of options.arguments.flags.helpFlags) {
            // If a help flag is found, we set the status to 'help' immediately.
            if (flag in flags) {
                result.status = 'help';
                break;
            }
        }

        for (let i = 0; i < args.length; i++) {
            // If at any point we reach an endpoint (a function) or an undefined command,
            // we stop processing further arguments.
            if (_isEndpoint(i)) return result as RoutingResult;

            const arg = args[i];

            // We push the argument to the command chain and move deeper into the command structure.
            result.commandChain.push(arg);

            currentCommand = (currentCommand as CliCoreCommandGroup)[arg];
        }

        // If at this point the user do not hit a endpoint, it means that the route
        // is incomplete and we should show the help message to show the available options
        // from this point onwards
        if (!_isEndpoint()) {
            result.status = 'help';
            // Signal that the process should exit with an error code
            process.exitCode = 1;
        }

        return result as RoutingResult;

        /**
         * Checks if the current command is an endpoint (a function) or if it is undefined.
         * Mutates the result object accordingly.
         * @param index The current index in the arguments array, if applicable
         * @returns `true` if the current command is an endpoint or undefined, `false` otherwise
         */
        function _isEndpoint(index?: number): boolean {
            // We reached a dead end in the command structure, so we return an error
            if (typeof currentCommand === 'undefined') {
                result.status = 'error';
                result.result = new Error(
                    `Command "${result.commandChain.join(' ')}" not found${result.commandChain.length > 1 ? `. There is no "${result.commandChain[result.commandChain.length - 1]}" branch` : ''}`
                );

                return true;
            }

            // Endpoint is found, however, if the status is already 'help' (from a help flag),
            // we keep it as 'help' to show the help message for this command.
            if (typeof currentCommand === 'function') {
                result.status = result.status === 'help' ? 'help' : 'callback';
                // The remaining arguments are considered as arguments to the command
                // being executed.
                result.commandArguments = index ? args.slice(index) : args;
                result.result = currentCommand;

                return true;
            }

            return false;
        }
    }

    return {
        navigate
    };
}
