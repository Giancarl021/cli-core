import type CliCoreOptions from './CliCoreOptions.js';
import type { CliCoreCommandThis } from './CliCoreCommand.js';
import type Awaitable from './Awaitable.js';
import type RoutingResult from './RoutingResult.js';
import type ParsedArguments from './ParsedArguments.js';
import type constants from '../util/constants.js';

/**
 * Represents the interceptors that can be used in a CLI Core extension.
 * They are called at different points of the CLI Core lifecycle.
 */
export interface CliCoreExtensionInterceptors {
    /**
     * Called before the arguments are parsed. This interceptor can
     * be called to change the arguments before they are parsed.
     * @param options The CLI Core options passed by the user
     * @param rawArgs The raw arguments passed to the application, before parsing
     * to arguments and flags
     * @returns A list of raw args to be used in the parsing
     */
    beforeParsing(
        options: CliCoreOptions,
        rawArgs: string[]
    ): Awaitable<string[]>;
    /**
     * Called before the routing of the command. This interceptor can
     * be called to change the arguments and flags before the routing
     * to a specific command.
     * @param options The CLI Core options passed by the user
     * @param input The arguments and flags that before the routing
     * @returns The arguments and flags to be used in the routing
     */
    beforeRouting(
        options: CliCoreOptions,
        input: ParsedArguments
    ): Awaitable<ParsedArguments>;
    /**
     * Called before running the command. This interceptor can be called
     * to change the routing result before running the command, such as
     * changing the command to be run.
     * @param options The CLI Core options passed by the user
     * @param route The routing result before running
     * @returns The routing result to be used in the running
     */
    beforeRunning(
        options: CliCoreOptions,
        route: RoutingResult
    ): Awaitable<RoutingResult>;
    /**
     * Called before printing the command output. This interceptor can be called
     * to change the output of the command before it's printed to the terminal.
     * @param options The CLI Core options passed by the user
     * @param output The output of the command before printing
     * @returns The output to be used in the printing
     */
    beforePrinting(
        options: CliCoreOptions,
        output: string | typeof constants.noOutputSymbol
    ): Awaitable<string | typeof constants.noOutputSymbol>;
    /**
     * Called before ending the CLI Core instance. This interceptor can be called
     * to do some cleanup before the CLI Core instance ends, such as closing files
     * or connections.
     * @param options The CLI Core options passed by the user
     * @returns A `Promise<void>` that resolves when the cleanup is done or `void`
     * if the interceptor is synchronous
     */
    beforeEnding(options: CliCoreOptions): Awaitable;
}

/**
 * Represents a CLI Core extension. It can be used to add new
 * features to the CLI Core instance, such as command addons or
 * flow interceptors.
 */
interface CliCoreExtension {
    /**
     * The name of the extension. It's used to identify the extension
     * in the CLI Core instance and avoid conflicts.
     */
    name: string;
    /**
     * The
     * @param options A subset of the CLI Core options passed by the user,
     * containing the application name and the helpers
     * @returns A record of command addons to be added to the CLI Core instance.
     * To better support TypeScript types, the record specific type information
     * of the command addons should be added to the `CliCoreCommandAddons` interface
     * by augmenting it.
     */
    buildCommandAddons?: (
        options: Pick<CliCoreCommandThis, 'appName' | 'helpers'>
    ) => Record<string, unknown>;
    /**
     * The interceptors used by the extension. They are called at different
     * points of the CLI Core lifecycle, allowing the extension to change the
     * flow of the CLI Core instance.
     */
    interceptors?: Partial<CliCoreExtensionInterceptors>;
}

export default CliCoreExtension;
