import {
    describe,
    test,
    expect,
    beforeEach,
    jest,
    afterAll
} from '@jest/globals';
import index, {
    type PartialCliCoreOptions,
    type CliCoreInstance,
    defineCommand,
    defineMultiCommandHelpDescriptor,
    defineSingleCommandHelpDescriptor
} from '../../index.js';
import type { MockInstance } from '../util/types.js';
import constants from '../util/constants.js';
import RoutingResult from '../../src/interfaces/RoutingResult.js';
import { CliCoreCommandCallback } from '../../src/interfaces/CliCoreCommand.js';

const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
const processExitSpy = jest
    .spyOn(process, 'exit')
    .mockImplementation((() => {}) as any);

beforeEach(() => {
    process.exitCode = undefined;
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

const defaultOptions: PartialCliCoreOptions = {
    appName: constants.appName,
    commands: {},
    help: {},
    extensions: [],
    appDescription: 'Test Application',
    arguments: {
        origin: [],
        ignoreFirst: 0,
        flags: {
            helpFlags: ['help', 'h', '?'],
            ignoreEmptyFlags: true,
            inferTypes: true,
            parse: true,
            prefixes: ['--', '-']
        }
    },
    behavior: {
        debugMode: true,
        colorfulOutput: false
    }
};

const mockInstance: MockInstance<CliCoreInstance> = {
    run: expect.any(Function)
};

describe('[UNIT] index/run', () => {
    test('Empty run', async () => {
        const cli = index(defaultOptions);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).rejects.toThrow(
            'No help found for command ' + constants.appName
        );
    });

    test('Error run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test'];
        (options.commands as Record<string, any>).test = defineCommand(() => {
            throw new Error('Test error');
        });

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).rejects.toThrow('Test error');
    });

    test('Successful run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test'];
        (options.commands as Record<string, any>).test = defineCommand(() => {
            return 'Test successful';
        });

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBe('Test successful');
    });

    test('No output run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test'];
        (options.commands as Record<string, any>).test = defineCommand(
            function () {
                return this.NO_OUTPUT;
            }
        );

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
    });

    test('Single command app run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = [];
        options.commands = defineCommand(() => 'Single command app');

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBe('Single command app');
    });

    test('Navigation error', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['nonexistent'];

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).rejects.toThrow(
            'Command "nonexistent" not found'
        );
    });

    test('Command error', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test'];
        (options.commands as Record<string, any>).test = defineCommand(() => {
            throw 'This is a string error';
        });

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).rejects.toThrow('This is a string error');
    });

    test('Run with interceptors', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['dynamic-command'];
        options.extensions = [
            {
                name: 'test_extension',
                interceptors: {
                    beforeParsing(opts, input) {
                        input.push('--testFlag');
                        return input;
                    },
                    beforeRouting(opts, parsed) {
                        parsed.flags['testFlag'] = true;
                        return parsed;
                    },
                    beforeRunning(opts, navigation) {
                        if (navigation.commandChain[0] === 'dynamic-command') {
                            const navigation: RoutingResult = {
                                commandArguments: [],
                                commandChain: ['dynamic-command'],
                                result: defineCommand((args, flags) => {
                                    if (flags['testFlag']) {
                                        return 'Test successful with flag';
                                    }

                                    throw new Error('Flag not found');
                                }) as CliCoreCommandCallback,
                                status: 'callback'
                            };

                            return navigation;
                        }

                        return navigation;
                    },
                    beforePrinting(opts, result) {
                        return (result as string).toUpperCase();
                    },
                    async beforeEnding(opts) {
                        await new Promise(resolve => resolve(null));
                        return;
                    }
                }
            }
        ];

        const cli = index(options);
        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBe('TEST SUCCESSFUL WITH FLAG');
    });

    test('Command this', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test', '0', '--flag', '1'];

        (options.commands as Record<string, any>).test = defineCommand(
            function (args, flags) {
                expect(this).toMatchObject(
                    expect.objectContaining({
                        NO_OUTPUT: expect.any(Symbol),
                        appName: constants.appName,
                        extensions: expect.any(Object),
                        helpers: expect.any(Object),
                        logger: expect.any(Object),
                        stdio: expect.any(Object)
                    })
                );

                expect(this.helpers).toMatchObject({
                    getArgAt: expect.any(Function),
                    hasFlag: expect.any(Function),
                    getFlag: expect.any(Function),
                    hasArgAt: expect.any(Function),
                    cloneArgs: expect.any(Function),
                    whichFlag: expect.any(Function),
                    requireArgs: expect.any(Function),
                    valueOrDefault: expect.any(Function),
                    getArgOrDefault: expect.any(Function),
                    getFlagOrDefault: expect.any(Function),
                    getStderr: expect.any(Function),
                    getStdout: expect.any(Function),
                    getStdin: expect.any(Function),
                    noOutput: expect.any(Function),
                    readJsonFromStdin: expect.any(Function),
                    writeJsonToStdout: expect.any(Function),
                    writeJsonToStderr: expect.any(Function)
                });

                expect(this.logger).toMatchObject({
                    debug: expect.any(Function),
                    info: expect.any(Function),
                    warning: expect.any(Function),
                    error: expect.any(Function),
                    json: expect.any(Function),
                    format: expect.any(Object),
                    colors: expect.any(Function)
                });

                expect(this.logger.format).toMatchObject({
                    debug: expect.any(Function),
                    info: expect.any(Function),
                    warning: expect.any(Function),
                    error: expect.any(Function),
                    json: expect.any(Function),
                    join: expect.any(Function)
                });

                expect(this.stdio).toMatchObject({
                    stdin: expect.any(Object),
                    stdout: expect.any(Object),
                    stderr: expect.any(Object)
                });

                expect(args).toEqual(['0']);
                expect(flags).toMatchObject({ flag: 1 });

                return this.NO_OUTPUT;
            }
        );

        const cli = index(options);
        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
    });

    test('Normal mode successful run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['test'];
        options.behavior!.debugMode = false;

        (options.commands as Record<string, any>).test = defineCommand(() => {
            return 'Test successful';
        });

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
        expect(consoleLogSpy).toHaveBeenCalledWith('Test successful');
    });

    test('Normal mode single command successul run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = [];
        options.behavior!.debugMode = false;
        options.commands = defineCommand(() => 'Single command app');

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
        expect(consoleLogSpy).toHaveBeenCalledWith('Single command app');
    });

    test('Normal mode error run', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['error'];
        options.behavior!.debugMode = false;

        (options.commands as Record<string, any>).error = defineCommand(() => {
            throw new Error('Test error');
        });

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('Normal mode navigation error', async () => {
        const options = structuredClone(defaultOptions);

        options.arguments!.origin = ['nonexistent'];
        options.behavior!.debugMode = false;

        const cli = index(options);

        expect(cli).toMatchObject(expect.objectContaining(mockInstance));

        await expect(cli.run()).resolves.toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Command "nonexistent" not found'
        );
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });
});

describe('[UNIT] index/defineCommand', () => {
    test('Define command must have type inference', () => {
        expect(defineCommand).toBeInstanceOf(Function);

        const cmd = defineCommand(function (args, flags) {
            const argsCopy = args.slice(0);
            const testFlag = flags['test'];

            console.log(argsCopy, testFlag);

            return this.NO_OUTPUT;
        });

        expect(cmd).toBeInstanceOf(Function);
    });
});

describe('[UNIT] index/defineSingleCommandHelpDescriptor', () => {
    test('Define single command help descriptor must return the same object with $schema', () => {
        expect(defineSingleCommandHelpDescriptor).toBeInstanceOf(Function);

        const helpObject = {
            description: 'Test command',
            args: ['arg1', 'arg2'],
            flags: {
                test: {
                    type: 'boolean',
                    description: 'Test flag'
                }
            },
            stdio: {
                stdin: 'Reads from stdin',
                stdout: 'Writes to stdout',
                stderr: 'Writes to stderr'
            }
        };
        const help = defineSingleCommandHelpDescriptor(helpObject);

        expect(help).toMatchObject({
            $schema: '#SingleCommandHelpDescriptor',
            ...helpObject
        });
    });
});

describe('[UNIT] index/defineMultiCommandHelpDescriptor', () => {
    test('Define multi command help descriptor must return the same object with $schema', () => {
        expect(defineMultiCommandHelpDescriptor).toBeInstanceOf(Function);

        const helpObject = {
            command1: {
                description: 'Test command 1',
                args: ['arg1', 'arg2'],
                flags: {
                    test: {
                        type: 'boolean',       
                        description: 'Test flag'
                    }
                },
                stdio: {
                    stdin: 'Reads from stdin',
                    stdout: 'Writes to stdout',
                    stderr: 'Writes to stderr'
                }
            },
            command2: {
                description: 'Test command 2',
                subcommands: {
                    subcommand1: 'Just a string description',
                    subcommand2: {
                        description: 'Test subcommand 2',
                        args: ['arg1'],
                        flags: {
                            test: {
                                type: 'string',
                                description: 'Test flag'
                            }
                        },
                        stdio: {
                            stdin: 'Reads from stdin',
                            stdout: 'Writes to stdout',
                            stderr: 'Writes to stderr'
                        }
                    }
                }
            }
        };

        const help = defineMultiCommandHelpDescriptor(helpObject);

        expect(help).toMatchObject(helpObject);
    });
});
