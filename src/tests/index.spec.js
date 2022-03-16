const cliCore = require('../../index');

cliCore('cli-core-test', {
    behavior: {
        exitOnError: false,
        returnResult: true
    },
    context: {},
    commands: {
        math: {
            operations: {
                calculate(args, flags) {
                    const op = flags.O || flags.op || flags.operation;
                    let reducer,
                        startingPoint,
                        slicer = 0;

                    if (!args.length) return String(0);

                    switch(op) {
                        case 'sum':
                            reducer = (acc, curr) => acc + curr;
                            startingPoint = 0;
                            break;
                        case 'subtract':
                            reducer = (acc, curr) => acc - curr;
                            startingPoint = args[0];
                            slicer = 1;
                            break;
                        case 'multiply':
                            reducer = (acc, curr) => acc * curr;
                            startingPoint = 1;
                            break;
                        case 'divide':
                            reducer = (acc, curr) => acc / curr;
                            startingPoint = args[0];
                            slicer = 1;
                            break;
                        default:
                            throw new Error('Unsupported operation');
                    }

                    const results = args
                        .map(Number)
                        .slice(slicer)
                        .reduce(reducer, startingPoint);

                    return String(results);
                }
            }
        },
        print(args, flags) { return JSON.stringify({ context: this, args, flags }); }
    },
    help: {
        print: {
            description: '',
            // args: ['<...any>'],
            args: [{
                name: 'argument',
                optional: true
            }],
            flags: {
                '...any': {
                    alias: ['a'],
                    description: 'Any flag',
                    values: ['any-value']
                },
                'f': 'ads',

            }
        },
        math: {
            subcommands: {
                operations: {
                    subcommands: {
                        calculate: {
                            flags: {
                                operation: {
                                    description: 'Operation to perform',
                                    alias: ['op', 'O'],
                                    optional: false,
                                    values: ['sum', 'subtract', 'multiply', 'divide']
                                }
                            },
                            args: [{
                                name: 'number',
                                multiple: true,
                                optional: false
                            }],
                            description: ''
                        }
                    }
                }
            }
        }
    }
}).run()
    .then(console.log)
    .catch(console.error);