import AnyCallback from './AnyCallback.js';
import type { CliCoreCommandThis } from './CliCoreCommand.js';

export type BundledExtensionCallback = (
    this: Pick<CliCoreCommandThis, 'appName' | 'helpers'>,
    ...args: Parameters<AnyCallback>
) => ReturnType<AnyCallback>;

interface CliCoreBundledExtensions {}

export default CliCoreBundledExtensions;
