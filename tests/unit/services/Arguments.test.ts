import { describe, test, expect } from '@jest/globals';
import Arguments from '../../../src/services/Arguments.js';
import constants from '../../util/constants.js';

import type { ArgumentsOptions } from '../../../src/services/Arguments.js';
import type { MockService } from '../../util/types.js';

const mockInstance: MockService<typeof Arguments> = {
    parse: expect.any(Function)
};

function options(
    args: string[] = [],
    flags: Partial<ArgumentsOptions['flags']> = {}
): ArgumentsOptions {
    return {
        origin: ['node', constants.appName, ...args],
        ignoreFirst: 2,
        flags: {
            parse: true,
            prefixes: ['-', '--'],
            ignoreEmptyFlags: false,
            inferTypes: true,
            helpFlags: [],
            ...flags
        }
    };
}

describe('[UNIT] services/Arguments', () => {
    test('Empty origin', () => {
        const args = Arguments(options());

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: [],
            flags: {}
        });
    });

    test('Only arguments', () => {
        const args = Arguments(options(['a', 'b', 'c']));

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c'],
            flags: {}
        });
    });

    test('Flags without values', () => {
        const args = Arguments(options(['--a', '-b', '-C']));

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: [],
            flags: {
                a: null,
                b: null,
                C: null
            }
        });
    });

    test('Flags with values', () => {
        const args = Arguments(
            options(['--a', '1', '-b', 'false', '-C', 'text'])
        );

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: [],
            flags: {
                a: 1,
                b: false,
                C: 'text'
            }
        });
    });

    test('Mixed values', () => {
        const args = Arguments(options(['a', 'b', '-a', '1', '-C']));

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b'],
            flags: {
                a: 1,
                C: null
            }
        });
    });

    test('Single binary arguments', () => {
        const _options = options(['a', 'b', 'c', '-c', '1', '-k']);

        _options.ignoreFirst = 1;
        _options.origin.shift();

        const args = Arguments(_options);

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c'],
            flags: {
                c: 1,
                k: null
            }
        });
    });

    test('No flags parsing', () => {
        const args = Arguments(
            options(['a', 'b', 'c', '-d', '1', '-e'], {
                parse: false
            })
        );

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c', '-d', '1', '-e'],
            flags: {}
        });
    });

    test('No empty flags', () => {
        const args = Arguments(
            options(
                [
                    'a',
                    'b',
                    'c',
                    '-d',
                    '1',
                    '-e',
                    '-f',
                    'true',
                    '-g',
                    'null',
                    '-h',
                    'undefined',
                    '-i',
                    'abc'
                ],
                {
                    ignoreEmptyFlags: true
                }
            )
        );

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c'],
            flags: {
                d: 1,
                f: true,
                g: null,
                h: 'undefined',
                i: 'abc'
            }
        });
    });

    test('No flag type inference', () => {
        const args = Arguments(
            options(
                [
                    'a',
                    'b',
                    'c',
                    '-d',
                    '1',
                    '-e',
                    '-f',
                    'true',
                    '-g',
                    'null',
                    '-h',
                    'undefined',
                    '-i',
                    'abc'
                ],
                {
                    inferTypes: false
                }
            )
        );

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c'],
            flags: {
                d: '1',
                e: null,
                f: 'true',
                g: 'null',
                h: 'undefined',
                i: 'abc'
            }
        });
    });

    test('Different prefixes', () => {
        const args = Arguments(
            options(
                [
                    'a',
                    'b',
                    'c',
                    '#d',
                    '1',
                    '@@e',
                    '#f',
                    'true',
                    '#g',
                    'null',
                    '@@h',
                    'undefined',
                    '#i',
                    'abc'
                ],
                {
                    prefixes: ['#', '@@']
                }
            )
        );

        expect(args).toMatchObject(mockInstance);

        expect(args.parse()).toMatchObject({
            arguments: ['a', 'b', 'c'],
            flags: {
                d: 1,
                e: null,
                f: true,
                g: null,
                h: 'undefined',
                i: 'abc'
            }
        });
    });
});
