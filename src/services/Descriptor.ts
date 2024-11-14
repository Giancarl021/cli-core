import CliCoreOptions from '../interfaces/CliCoreOptions.js';

export type DescriptorOptions = Pick<
    CliCoreOptions,
    'appName' | 'appDescription' | 'behavior' | 'arguments' | 'help'
>;

export type DescriptorInstance = ReturnType<typeof Descriptor>;

export default function Descriptor(_options: DescriptorOptions) {}
