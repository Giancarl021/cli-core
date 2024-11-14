import type CliCoreOptions from '../interfaces/CliCoreOptions.js';

const defaultOptions: CliCoreOptions = {
    appName: 'cli-core-application',
    appDescription: null,
    behavior: {
        debugMode: false,
        colorfulOutput: false
    },
    help: {},
    commands: {},
    extensions: [],
    arguments: {
        origin: process.argv,
        ignoreFirst: 2,
        flags: {
            helpFlags: ['h', 'help', '?'],
            parse: true,
            inferTypes: true,
            prefixes: ['-', '--'],
            ignoreEmptyFlags: false
        }
    }
};

export default {
    defaultOptions,
    extensions: {
        nameRegex: /^[_A-Z]+[_A-Z0-9]*$/i
    }
} as const;
