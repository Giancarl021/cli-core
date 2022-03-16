module.exports = {
    defaultOptions: {
        args: {
            origin: process.argv,
            flags: {
                flagPrefix: '--',
                singleCharacterFlagPrefix: '-',
                singleCharacterFlagOnlyUppercase: false,
                tryTypeInference: true,
                parseFlags: true,
                parseEmptyFlags: false,
                helpFlags: ['help', '?']
            }
        },
        behavior: {
            keepArgsStartingFromIndex: 2,
            exitOnError: true,
            returnResult: false,
            logger: async message => console.log(message)
        },
        context: {},
        commands: {},
        help: {}
    },

    routerMeta: {
        help: false,
        error: null,
        chain: []
    }
}