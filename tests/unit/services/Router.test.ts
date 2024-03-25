import { describe, test, expect } from '@jest/globals';
import Router from '../../../src/services/Router.js';
import constants from '../../util/constants.js';

import type { RouterOptions } from '../../../src/services/Router.js';
import { MockService } from 'tests/util/types.js';

const mockInstance: MockService<typeof Router> = {
    navigate: expect.any(Function)
};

function options(
    commands: RouterOptions['commands'] = {},
    helpFlags: RouterOptions['arguments']['flags']['help'] = ['h', 'help']
): RouterOptions {
    return {
        appName: constants.appName,
        commands,
        arguments: {
            flags: {
                help: helpFlags
            }
        }
    };
}

describe('[UNIT] services/Router', () => {
    test('Empty execution parameters', () => {
        const router = Router(options());

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(router.navigate([], {})).toMatchObject({
            status: 'help',
            commandChain: [],
            result: null,
            actualArgs: []
        });
    });

    test('Help at root', () => {
        const router = Router(options());

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(router.navigate([], { help: true })).toMatchObject({
            status: 'help',
            commandChain: [],
            result: null,
            actualArgs: []
        });

        expect(router.navigate([], { h: true })).toMatchObject({
            status: 'help',
            commandChain: [],
            result: null,
            actualArgs: []
        });

        expect(router.navigate([], { help: true, h: true })).toMatchObject({
            status: 'help',
            commandChain: [],
            result: null,
            actualArgs: []
        });
    });

    test('Invalid route at root', () => {
        const router = Router(options());

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(router.navigate([], {})).toMatchObject({
            status: 'help',
            commandChain: [],
            result: null,
            actualArgs: []
        });

        expect(router.navigate(['invalid', 'route'], {})).toMatchObject({
            status: 'error',
            commandChain: ['invalid'],
            result: new Error('Command "invalid" not found'),
            actualArgs: []
        });

        expect(
            router.navigate(['invalid', 'route'], { help: true })
        ).toMatchObject({
            status: 'error',
            commandChain: ['invalid'],
            result: new Error('Command "invalid" not found'),
            actualArgs: []
        });
    });

    test('Invalid route at branch', () => {
        const commands = {
            a: {
                b() {
                    return String();
                },
                c: {
                    d: {
                        e() {
                            return String();
                        }
                    }
                }
            }
        };
        const router = Router(options(commands));

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(router.navigate(['a', 'd'], {})).toMatchObject({
            status: 'error',
            commandChain: ['a', 'd'],
            result: new Error(
                'Command "a d" not found. There is no "d" branch'
            ),
            actualArgs: []
        });

        expect(router.navigate(['a', 'c', 'd', 'f'], {})).toMatchObject({
            status: 'error',
            commandChain: ['a', 'c', 'd', 'f'],
            result: new Error(
                'Command "a c d f" not found. There is no "f" branch'
            ),
            actualArgs: []
        });
    });

    test('Valid route at root', () => {
        const commands = () => {
            return String();
        };
        const router = Router(options(commands));

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(router.navigate(['a', 'b', 'c'], {})).toMatchObject({
            status: 'callback',
            commandChain: [],
            result: commands,
            actualArgs: ['a', 'b', 'c']
        });

        expect(router.navigate([], { help: true })).toMatchObject({
            status: 'help',
            commandChain: [],
            result: commands,
            actualArgs: []
        });

        expect(router.navigate(['a', 'b', 'c'], { help: true })).toMatchObject({
            status: 'help',
            commandChain: [],
            result: commands,
            actualArgs: ['a', 'b', 'c']
        });
    });

    test('Valid route at branch', () => {
        const commands = {
            a: {
                b() {
                    return String();
                },
                c: {
                    d: {
                        e() {
                            return String();
                        }
                    }
                }
            }
        };

        const router = Router(options(commands));

        expect(router).toMatchObject(expect.objectContaining(mockInstance));

        expect(
            router.navigate(['a', 'b', 'arg1', 'arg2', 'arg3'], {})
        ).toMatchObject({
            status: 'callback',
            commandChain: ['a', 'b'],
            result: commands.a.b,
            actualArgs: ['arg1', 'arg2', 'arg3']
        });

        expect(
            router.navigate(['a', 'c', 'd', 'e', 'arg1', 'arg2', 'arg3'], {})
        ).toMatchObject({
            status: 'callback',
            commandChain: ['a', 'c', 'd', 'e'],
            result: commands.a.c.d.e,
            actualArgs: ['arg1', 'arg2', 'arg3']
        });
    });
});
