import { describe, test, expect } from '@jest/globals';
import Parser from '../../../src/services/Parser.js';
import constants from '../../util/constants.js';

import type { ParserOptions } from '../../../src/services/Parser.js';
import type { MockService } from '../../util/types.js';

const mockInstance: MockService<typeof Parser> = {
    parse: expect.any(Function)
};

function options(
    args: string[] = [],
    flags: Partial<ParserOptions['flags']> = {}
): ParserOptions {
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
        const parser = Parser(options());

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: [],
            flags: {}
        });
    });

    test('Only arguments', () => {
        const parser = Parser(options(['a', 'b', 'c']));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c'],
            flags: {}
        });
    });

    test('Flags without values', () => {
        const parser = Parser(options(['--a', '-b', '-C']));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: [],
            flags: {
                a: null,
                b: null,
                C: null
            }
        });
    });

    test('Flags with values', () => {
        const parser = Parser(
            options(['--a', '1', '-b', 'false', '-C', 'text'])
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: [],
            flags: {
                a: 1,
                b: false,
                C: 'text'
            }
        });
    });

    test('Mixed values', () => {
        const parser = Parser(options(['a', 'b', '-a', '1', '-C']));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b'],
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

        const parser = Parser(_options);

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c'],
            flags: {
                c: 1,
                k: null
            }
        });
    });

    test('No flags parsing', () => {
        const parser = Parser(
            options(['a', 'b', 'c', '-d', '1', '-e'], {
                parse: false
            })
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c', '-d', '1', '-e'],
            flags: {}
        });
    });

    test('No empty flags', () => {
        const parser = Parser(
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

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c'],
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
        const parser = Parser(
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

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c'],
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
        const parser = Parser(
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

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse()).toMatchObject({
            args: ['a', 'b', 'c'],
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
