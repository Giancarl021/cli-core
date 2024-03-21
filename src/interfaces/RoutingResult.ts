import type Nullable from './Nullable.js';
import type { CliCoreCommandCallback } from './CliCoreCommand.js';
import type Args from './Args.js';

interface RoutingResult {
    status: 'error' | 'help' | 'callback';
    commandChain: string[];
    result: Nullable<Error | CliCoreCommandCallback>;
    actualArgs: Args;
}

export default RoutingResult;
