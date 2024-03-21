import type Args from '../interfaces/Args.js';
import type Flags from '../interfaces/Flags.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type RoutingResult from '../interfaces/RoutingResult.js';
import type Undefinable from 'src/interfaces/Undefinable.js';
import type CliCoreCommand from 'src/interfaces/CliCoreCommand.js';
import type { CliCoreCommandGroup } from 'src/interfaces/CliCoreCommand.js';

export type RouterInstance = ReturnType<typeof Router>;

export type RouterOptions = Pick<CliCoreOptions, 'appName' | 'commands'> & {
    arguments: {
        flags: {
            help: CliCoreOptions['arguments']['flags']['help'];
        };
    };
};

export default function Router(options: RouterOptions) {
    function navigate(args: Args, flags: Flags): RoutingResult {
        const result: RoutingResult = {
            status: 'error',
            commandChain: [],
            result: null,
            actualArgs: []
        };

        let currentCommand: Undefinable<CliCoreCommand> = structuredClone(
            options.commands
        );

        for (const flag of options.arguments.flags.help) {
            if (flag in flags) {
                result.status = 'help';
                break;
            }
        }

        for (let i = 0; i < args.length; i++) {
            if (_isEndpoint(i)) return result;

            const arg = args[i];

            result.commandChain.push(arg);

            currentCommand = (currentCommand as CliCoreCommandGroup)[arg];
        }

        if (!_isEndpoint()) {
            result.status = 'help';
        }

        return result;

        function _isEndpoint(index?: number): boolean {
            if (typeof currentCommand === 'undefined') {
                result.status = 'error';
                result.result = new Error(
                    `Command "${index ? args.slice(0, index + 1) : args} not found"`
                );

                return true;
            }

            if (typeof currentCommand === 'function') {
                result.actualArgs = index ? args.slice(index) : args;
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
