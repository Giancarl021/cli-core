const cliCore = require('../../index');

cliCore('cli-core', {
    behavior: {
        exitOnError: false,
        returnResult: true
    },
    context: {
        platform: process.platform,
        cwd: process.cwd()
    },
    commands: {
        math: {
            operations: {
                calculate(args, flags) {
                    const op = flags.O || flags.op || flags.operation;
                    let reducer,
                        startingPoint,
                        slicer = 0;

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

                    if (!args.length) return String(0);

                    const results = args
                        .map(Number)
                        .slice(slicer)
                        .reduce(reducer, startingPoint);

                    return String(results);
                }
            }
        },
        print(args, flags) { return JSON.stringify({ context: this.context, args, flags }, null, 4); }
    },
    help: {
        print: {
            description: 'Prints the context and arguments',
            args: [{
                name: 'argument',
                optional: true,
                multiple: true
            }],
            flags: {
                'any': {
                    alias: ['a'],
                    description: 'Any flag',
                    values: ['any-value'],
                    optional: true
                }
            }
        },
        math: {
            description: 'Math commands',
            subcommands: {
                operations: {
                    description: 'Math operations commands',
                    subcommands: {
                        calculate: {
                            description: 'Make simple arithmetic operations',
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
                            }]
                        }
                    }
                }
            }
        }
    }
}).run()
    .then(console.log)
    .catch(console.error);