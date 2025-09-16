import { describe, test, expect } from '@jest/globals';
import Descriptor, {
    type DescriptorOptions,
    type DescriptorInstance
} from '../../../src/services/Descriptor.js';
import type { MockInstance } from '../../util/types.js';
import constants from '../../util/constants.js';

const mockInstance: MockInstance<DescriptorInstance> = {
    render: expect.any(Function)
};

const baseOptions: DescriptorOptions = {
    appName: constants.appName,
    appDescription: 'App description',
    behavior: {
        colorfulOutput: false,
        debugMode: false,
        extensionLogging: false
    },
    arguments: {
        flags: {
            prefixes: ['--', '-'],
            ignoreEmptyFlags: false,
            helpFlags: ['help', 'h', '?'],
            inferTypes: true,
            parse: true
        },
        ignoreFirst: 0,
        origin: process.argv
    },
    help: {
        main: {
            description: 'Main command',
            args: ['input'],
            flags: {
                v: 'Version',
                f: {
                    description: 'Required flag',
                    optional: false,
                    aliases: ['force']
                }
            },
            stdio: {
                stdin: 'Standard input',
                stdout: 'Standard output',
                stderr: 'Standard error'
            }
        },
        sub: {
            description: 'Subcommand',
            args: [{ name: 'file', optional: true }],
            flags: {},
            stdio: {}
        },
        onlyString: 'Simple description'
    }
};

describe('[UNIT] services/Descriptor', () => {
    test('Instance and interface', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        expect(typeof descriptor.render).toBe('function');
    });

    test('Render default help', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render([]);
        expect(output).toContain(constants.appName);
        expect(output).toContain('App description');
        expect(output).toContain('Commands:');
        expect(output).toContain('main');
        expect(output).toContain('sub');
        expect(output).toContain('onlyString');
    });

    test('Render default help without description', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        delete options.appDescription;
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render([]);
        expect(output).toContain(constants.appName);
        expect(output).not.toContain('App description');
        expect(output).toContain('Commands:');
        expect(output).toContain('main');
        expect(output).toContain('sub');
        expect(output).toContain('onlyString');
    });

    test('Render main command', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain(constants.appName);
        expect(output).toContain('main');
        expect(output).toContain('Main command');
        expect(output).toContain('<input>');
        expect(output).toContain('Flags:');
        expect(output).toContain('Version');
        expect(output).toContain('Required flag');
        expect(output).toContain('STDIO:');
        expect(output).toContain('Standard input');
        expect(output).toContain('Standard output');
        expect(output).toContain('Standard error');
    });

    test('Render subcommand', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['sub']);
        expect(output).toContain('Subcommand');
        expect(output).toContain('[<file>]');
    });

    test('Render single-command descriptor', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help = {
            $schema: '#SingleCommandHelpDescriptor',
            description: 'Single command description',
            args: ['input'],
            flags: {
                v: 'Version',
                f: {
                    description: 'Required flag',
                    optional: false,
                    aliases: ['force']
                }
            },
            stdio: {
                stdin: 'Standard input',
                stdout: 'Standard output',
                stderr: 'Standard error'
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render([]);
        expect(output).toContain(constants.appName);
        expect(output).toContain('Single command description');
        expect(output).toContain('<input>');
        expect(output).toContain('Flags:');
        expect(output).toContain('Version');
        expect(output).toContain('Required flag');
        expect(output).toContain('STDIO:');
        expect(output).toContain('Standard input');
        expect(output).toContain('Standard output');
        expect(output).toContain('Standard error');
    });

    test('Render subcommand with only description', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        delete options.help.sub.args;
        delete options.help.sub.flags;
        delete options.help.sub.stdio;
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));

        const output = descriptor.render(['sub']);
        expect(output).toContain('Subcommand');
    });

    test('Render simple string command', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['onlyString']);
        expect(output).toContain('Simple description');
    });

    test('Render nonexistent subcommand', () => {
        const descriptor = Descriptor(baseOptions);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['inexistente']);
        expect(output).toContain('No help found for command');
    });

    test('Render nested subcommand', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.subcommands = {
            deep: {
                description: 'Deep subcommand',
                args: ['deepArg'],
                flags: {},
                stdio: {}
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main', 'deep']);
        expect(output).toContain('Deep subcommand');
        expect(output).toContain('<deepArg>');
    });

    test('Render with empty help', () => {
        const options = { ...baseOptions, help: {} };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('No help found for command');
    });

    test('Render nonexistent nested subcommand', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.subcommands = {
            deep: {
                description: 'Deep subcommand',
                args: ['deepArg'],
                flags: {},
                stdio: {}
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main', 'notfound']);
        expect(output).toContain('No help found for command');
    });

    test('Render complex arguments', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.args = [
            { name: 'c1', multiple: true, optional: false },
            { name: 'c2', multiple: false, optional: true },
            { name: 'c3', multiple: true, optional: true }
        ];
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('<c1>[, <c1>[, ...]]');
        expect(output).toContain('[<c2>]');
        expect(output).toContain('[<c3>[, <c3>[, ...]]]');
    });

    test('Render complex flags', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.flags = {
            f: {
                description: 'Required flag',
                optional: false,
                aliases: ['force', 'f2']
            },
            f2: {
                description: 'Flag 2',
                optional: true
            },
            s: 'Simple'
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('Required flag');
        expect(output).toContain('Simple');
        expect(output).toContain('--f');
        expect(output).toContain('--force');
        expect(output).toContain('--f2');
    });

    test('Render with ignored empty flags', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.arguments.flags.ignoreEmptyFlags = true;
        options.help.main.flags = {
            '': 'Empty flag',
            v: 'Version'
        };

        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        // Should not contain the empty flag
        expect(output).not.toContain('Empty flag');
        // Should contain the normal flag
        expect(output).toContain('Version');
    });

    test('Render with non-ignored empty flags', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.arguments.flags.ignoreEmptyFlags = false;
        options.help.main.flags = {
            '': 'Empty flag',
            v: 'Version'
        };

        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        // Should contain the empty flag
        expect(output).toContain('Empty flag');
        // Should contain the normal flag
        expect(output).toContain('Version');
    });

    test('Render command with subcommands', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.subcommands = {
            sub1: {
                description: 'Subcommand 1',
                args: ['arg1'],
                flags: {},
                stdio: {}
            },
            sub2: {
                description: 'Subcommand 2',
                args: ['arg2'],
                flags: {},
                stdio: {}
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        // Should list the subcommands
        expect(output).toContain('Description: Main command');
        expect(output).toContain('Subcommands:');
        expect(output).toContain('sub1');
        expect(output).toContain('sub2');
        expect(output).toContain('Subcommand 1');
        expect(output).toContain('Subcommand 2');
    });

    test('Render command with subcommands without group description', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        delete options.help.main.description;
        options.help.main.subcommands = {
            sub1: {
                description: 'Subcommand 1',
                args: ['arg1'],
                flags: {},
                stdio: {}
            },
            sub2: {
                description: 'Subcommand 2',
                args: ['arg2'],
                flags: {},
                stdio: {}
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        // Should list the subcommands
        expect(output).not.toContain('Description: Main command');
        expect(output).toContain('Subcommands:');
        expect(output).toContain('sub1');
        expect(output).toContain('sub2');
        expect(output).toContain('Subcommand 1');
        expect(output).toContain('Subcommand 2');
    });

    test('Render flags with possible values', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.help.main.flags = {
            mode: {
                description: 'Operation mode',
                optional: true,
                values: ['auto', 'manual', 'semi-auto'],
                aliases: ['m']
            },
            level: {
                description: 'Detail level',
                optional: true,
                values: ['low', 'medium', 'high'],
                aliases: []
            }
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('Operation mode');
        expect(output).toContain('Detail level');
        expect(output).toContain('Values: auto | manual | semi-auto');
        expect(output).toContain('Values: low | medium | high');
    });

    test('Render with invalid prefixes', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.arguments.flags.prefixes = ['', '', ''];
        options.help.main.flags = {
            f: {
                description: 'Required flag',
                optional: false,
                aliases: ['force', 'f2']
            },
            s: 'Simple'
        };
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).not.toContain('Required flag');
        expect(output).not.toContain('Simple');
        // Should not contain the flags
        expect(output).not.toContain('f');
        expect(output).not.toContain('force');
        expect(output).not.toContain('f2');
    });

    test('Render with forced colorful output', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.behavior.colorfulOutput = 1;
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('main');
        expect(output).toContain('Main command');
        expect(output).toContain('<input>');
        expect(output).toContain('Flags:');
        expect(output).toContain('Version');
        expect(output).toContain('Required flag');
        expect(output).toContain('STDIO:');
        expect(output).toContain('Standard input');
        expect(output).toContain('Standard output');
        expect(output).toContain('Standard error');
        // Should contain ANSI color codes
        expect(output).toMatch(/\x1B\[\d+m/);
    });

    test('Render with automatic colorful output', () => {
        const options = JSON.parse(JSON.stringify(baseOptions));
        options.behavior.colorfulOutput = true;
        const descriptor = Descriptor(options);
        expect(descriptor).toMatchObject(expect.objectContaining(mockInstance));
        const output = descriptor.render(['main']);
        expect(output).toContain('main');
        expect(output).toContain('Main command');
        expect(output).toContain('<input>');
        expect(output).toContain('Flags:');
        expect(output).toContain('Version');
        expect(output).toContain('Required flag');
        expect(output).toContain('STDIO:');
        expect(output).toContain('Standard input');
        expect(output).toContain('Standard output');
        expect(output).toContain('Standard error');
    });
});
