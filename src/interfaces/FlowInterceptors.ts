import type { CliCoreExtensionInterceptors } from './CliCoreExtension.js';

type FlowInterceptors = {
    [K in keyof CliCoreExtensionInterceptors]: CliCoreExtensionInterceptors[K][];
};

export default FlowInterceptors;
