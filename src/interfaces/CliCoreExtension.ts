import { CliCoreCommandThis } from './CliCoreCommand.js';

interface CliCoreExtension {
    name: string;
    build: (
        options: Pick<CliCoreCommandThis, 'appName' | 'helpers'>
    ) => Record<string, unknown>;
}

export default CliCoreExtension;
