import type { CliCoreExtensionInterceptors } from './CliCoreExtension.js';

/**
 * Represents a map of all interceptors that can be used in the CLI Core,
 * coming from all extensions.
 */
type FlowInterceptors = {
    /**
     * The interceptors that can be used in the CLI Core.
     */
    [K in keyof CliCoreExtensionInterceptors]: CliCoreExtensionInterceptors[K][];
};

export default FlowInterceptors;
