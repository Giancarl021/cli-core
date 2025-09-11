import type CliCoreOptions from '../interfaces/CliCoreOptions.js';

/**
 * A unique symbol used to indicate that no output should be produced
 * by a command or operation.
 */
const noOutputSymbol: unique symbol = Symbol('no-output');

/**
 * The default options for the CLI Core application.
 */
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
    noOutputSymbol,
    defaultOptions,
    /**
     * The default configuration for extensions.
     */
    extensions: {
        /**
         * A regular expression to validate extension names.
         */
        nameRegex: /^[_A-Z]+[_A-Z0-9]*$/i
    }
} as const;
