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

        expect(parser.parse([])).toMatchObject({
            args: [],
            flags: {}
        });
    });

    test('Only arguments', () => {
        const rawArgs = ['a', 'b', 'c'];
        const parser = Parser(options(rawArgs));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: ['a', 'b', 'c'],
            flags: {}
        });
    });

    test('Flags without values', () => {
        const rawArgs = ['--a', '-b', '-C'];
        const parser = Parser(options(rawArgs));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: [],
            flags: {
                a: null,
                b: null,
                C: null
            }
        });
    });

    test('Flags with values', () => {
        const rawArgs = ['--a', '1', '-b', 'false', '-C', 'text'];
        const parser = Parser(options(rawArgs));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: [],
            flags: {
                a: 1,
                b: false,
                C: 'text'
            }
        });
    });

    test('Mixed values', () => {
        const rawArgs = ['a', 'b', '-a', '1', '-C'];
        const parser = Parser(options(rawArgs));

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: ['a', 'b'],
            flags: {
                a: 1,
                C: null
            }
        });
    });

    test('Single binary arguments', () => {
        const rawArgs = ['a', 'b', 'c', '-c', '1', '-k'];
        const _options = options(rawArgs);

        _options.ignoreFirst = 1;
        _options.origin.shift();

        const parser = Parser(_options);

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: ['a', 'b', 'c'],
            flags: {
                c: 1,
                k: null
            }
        });
    });

    test('No flags parsing', () => {
        const rawArgs = ['a', 'b', 'c', '-d', '1', '-e'];
        const parser = Parser(
            options(rawArgs, {
                parse: false
            })
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
            args: ['a', 'b', 'c', '-d', '1', '-e'],
            flags: {}
        });
    });

    test('No empty flags', () => {
        const rawArgs = [
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
        ];
        const parser = Parser(
            options(rawArgs, {
                ignoreEmptyFlags: true
            })
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
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
        const rawArgs = [
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
        ];
        const parser = Parser(
            options(rawArgs, {
                inferTypes: false
            })
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
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
        const rawArgs = [
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
        ];
        const parser = Parser(
            options(rawArgs, {
                prefixes: ['#', '@@']
            })
        );

        expect(parser).toMatchObject(mockInstance);

        expect(parser.parse(rawArgs)).toMatchObject({
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
