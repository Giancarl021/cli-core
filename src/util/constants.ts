import CliCoreOptions from 'src/interfaces/CliCoreOptions.js';

const defaultOptions: CliCoreOptions = {
    appName: 'cli-core-application',
    appDescription: null,
    context: {},
    behavior: {
        debugMode: false
    },
    commands: {},
    extensions: [],
    arguments: {
        origin: process.argv,
        ignoreFirst: 2,
        flags: {
            help: ['h', 'help', '?'],
            parse: true,
            inferTypes: true,
            flagPrefix: '--',
            parseEmptyFlags: false,
            singleCharacterFlags: {
                prefix: '-',
                onlyUppercase: false
            }
        }
    }
};

export default {
    defaultOptions
} as const;
