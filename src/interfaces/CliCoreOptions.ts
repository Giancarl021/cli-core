import type Nullable from './Nullable.js';

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
    context: Record<string, object>;
    extensions: object[];
    commands: Record<string, object>;
}

export default CliCoreOptions;
