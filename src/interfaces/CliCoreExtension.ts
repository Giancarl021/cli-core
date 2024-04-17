import type CliCoreOptions from './CliCoreOptions.js';
import type { CliCoreCommandThis } from './CliCoreCommand.js';
import type Awaitable from './Awaitable.js';
import type RoutingResult from './RoutingResult.js';
import type ArgsAndFlags from './ArgsAndFlags.js';

export interface CliCoreExtensionInterceptors {
    beforeParsing(
        options: CliCoreOptions,
        rawArgs: string[]
    ): Awaitable<string[]>;
    beforeRouting(
        options: CliCoreOptions,
        input: ArgsAndFlags
    ): Awaitable<ArgsAndFlags>;
    beforeRunning(
        options: CliCoreOptions,
        route: RoutingResult
    ): Awaitable<RoutingResult>;
    beforeOutputing(options: CliCoreOptions, output: string): Awaitable<string>;
    beforeEnding(options: CliCoreOptions): Awaitable;
}

interface CliCoreExtension {
    name: string;
    buildCommandAddons?: (
        options: Pick<CliCoreCommandThis, 'appName' | 'helpers'>
    ) => Record<string, unknown>;
    interceptors?: Partial<CliCoreExtensionInterceptors>;
}

export default CliCoreExtension;
