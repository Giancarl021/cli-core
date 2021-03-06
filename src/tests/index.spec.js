const cliCore = require('../../index');

throw new Error('Tests not implemented yet');

cliCore('cli-core', {
    appDescription: 'A tool to make CLI tools easier to make',
    behavior: {
        exitOnError: false,
        returnResult: true
    },
    context: {
        number: 10
    },
    commands: {
        math: {
            operations: {
                calculate(args, flags) {
                    console.log(this.extensions.myExtension.myMethod(2, 2));
                    const op = this.helpers.getFlag('O', 'op', 'operation'); // == flags.O || flags.op || flags.operation
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
            description: 'Prints this, arguments and flags',
            args: [{
                name: 'argument',
                optional: true,
                multiple: true
            }],
            flags: {
                'any': {
                    aliases: ['a'],
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
                                    aliases: ['op', 'O'],
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
    },
    extensions: [ {
        name: 'myExtension',
        builder() {
            return {
                myMethod(a, b) {
                    return a + b + this.context.number;
                }
            }
        }
    } ]
}).run()
    .then(console.log)
    .catch(console.error);