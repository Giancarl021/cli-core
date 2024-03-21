import type CliCoreCommand from './CliCoreCommand.js';
import type CliCoreExtension from './CliCoreExtension.js';
import type DeepPartial from './DeepPartial.js';
import type Nullable from './Nullable.js';

export type PartialCliCoreOptions = DeepPartial<
    Exclude<CliCoreOptions, 'appName'>
> &
    Pick<CliCoreOptions, 'appName'>;

interface CliCoreOptions {
    appName: string;
    appDescription: Nullable<string>;
    arguments: {
        origin: string[];
        ignoreFirst: number;
        flags: {
            parse: boolean;
            flagPrefix: string;
            singleCharacterFlags: {
                prefix: '-';
                onlyUppercase: boolean;
            };
            inferTypes: boolean;
            parseEmptyFlags: boolean;
            help: string[];
        };
    };
    behavior: {
        debugMode: boolean;
    };
    extensions: CliCoreExtension[];
    commands: CliCoreCommand;
}

export default CliCoreOptions;
