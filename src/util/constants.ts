import type CliCoreOptions from '../interfaces/CliCoreOptions.js';

const defaultOptions: CliCoreOptions = {
    appName: 'cli-core-application',
    appDescription: null,
    behavior: {
        debugMode: false,
        colorfulOutput: false
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
    defaultOptions,
    extensions: {
        nameRegex: /^[_A-Z]+[_A-Z0-9]*$/i
    }
} as const;
