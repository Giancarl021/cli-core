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

export default function Router(options: RouterOptions) {
    function navigate(args: Arguments, flags: Flags): RoutingResult {
        const result: InternalRoutingResult = {
            status: 'error',
            commandChain: [],
            result: null,
            commandArguments: []
        };

        let currentCommand: Undefinable<CliCoreCommand> = options.commands;

        for (const flag of options.arguments.flags.helpFlags) {
            if (flag in flags) {
                result.status = 'help';
                break;
            }
        }

        for (let i = 0; i < args.length; i++) {
            if (_isEndpoint(i)) return result as RoutingResult;

            const arg = args[i];

            result.commandChain.push(arg);

            currentCommand = (currentCommand as CliCoreCommandGroup)[arg];
        }

        if (!_isEndpoint()) {
            result.status = 'help';
        }

        return result as RoutingResult;

        function _isEndpoint(index?: number): boolean {
            if (typeof currentCommand === 'undefined') {
                result.status = 'error';
                result.result = new Error(
                    `Command "${result.commandChain.join(' ')}" not found${result.commandChain.length > 1 ? `. There is no "${result.commandChain[result.commandChain.length - 1]}" branch` : ''}`
                );

                return true;
            }

            if (typeof currentCommand === 'function') {
                result.status = result.status === 'help' ? 'help' : 'callback';
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
