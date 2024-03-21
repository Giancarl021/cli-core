import { describe, test, expect } from '@jest/globals';
import Helpers from '../../../src/services/CommandHelpers.js';
import constants from '../../util/constants.js';

import type { CommandHelpersInstance } from '../../../src/services/CommandHelpers.js';

type FunctionMatcher = ReturnType<(typeof expect)['any']>;

const mockInstance: Record<keyof CommandHelpersInstance, FunctionMatcher> = {
    getArgAt: expect.any(Function),
    hasFlag: expect.any(Function),
    getFlag: expect.any(Function),
    hasArgAt: expect.any(Function),
    cloneArgs: expect.any(Function),
    whichFlag: expect.any(Function),
    requireArgs: expect.any(Function),
    valueOrDefault: expect.any(Function),
    getArgOrDefault: expect.any(Function),
    getFlagOrDefault: expect.any(Function)
};

describe('[UNIT] services/CommandHelpers', () => {
    test('Empty execution parameters', () => {
        const helpers = Helpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags
        );

        expect(helpers).toMatchObject(expect.objectContaining(mockInstance));

        expect(helpers.getArgAt(0)).toBeNull();
        expect(helpers.hasFlag('a')).toBe(false);
        expect(helpers.getFlag('a')).toBeUndefined();
        expect(helpers.hasArgAt(0)).toBe(false);
        expect(helpers.cloneArgs()).toEqual([]);
        expect(helpers.whichFlag('A', 'a')).toBeNull();
        expect(() => helpers.requireArgs('first', 'second')).toThrow(
            'Missing required <first> argument'
        );
        expect(helpers.valueOrDefault(1, 10)).toBe(1);
        expect(helpers.valueOrDefault(null, 10)).toBe(10);
        expect(helpers.valueOrDefault(undefined, 10)).toBe(10);
        expect(helpers.getArgOrDefault('defaultValue', 0)).toBe('defaultValue');
        expect(helpers.getArgOrDefault('defaultValue', 1)).toBe('defaultValue');
        expect(helpers.getFlagOrDefault('defaultValue', 'a')).toBe(
            'defaultValue'
        );
    });

    test('Single argument execution parameters', () => {
        const helpers = Helpers(
            constants.executionParameters.singleArgument.args,
            constants.executionParameters.singleArgument.flags
        );

        expect(helpers).toMatchObject(expect.objectContaining(mockInstance));

        expect(helpers.getArgAt(0)).toBe('0');
        expect(helpers.hasFlag('a')).toBe(false);
        expect(helpers.getFlag('a')).toBeUndefined();
        expect(helpers.hasArgAt(0)).toBe(true);
        expect(helpers.cloneArgs()).toEqual(['0']);
        expect(helpers.whichFlag('A', 'a')).toBeNull();
        expect(() => helpers.requireArgs('first', 'second')).toThrow(
            'Missing required <second> argument'
        );
        expect(helpers.valueOrDefault(1, 10)).toBe(1);
        expect(helpers.valueOrDefault(null, 10)).toBe(10);
        expect(helpers.valueOrDefault(undefined, 10)).toBe(10);
        expect(helpers.getArgOrDefault('defaultValue', 0)).toBe('0');
        expect(helpers.getArgOrDefault('defaultValue', 1)).toBe('defaultValue');
        expect(helpers.getFlagOrDefault('defaultValue', 'a')).toBe(
            'defaultValue'
        );
    });

    test('Single flag execution parameters', () => {
        const helpers = Helpers(
            constants.executionParameters.singleFlag.args,
            constants.executionParameters.singleFlag.flags
        );

        expect(helpers).toMatchObject(expect.objectContaining(mockInstance));

        expect(helpers.getArgAt(0)).toBeNull();
        expect(helpers.hasFlag('a')).toBe(true);
        expect(helpers.getFlag('a')).toBe(0);
        expect(helpers.hasArgAt(0)).toBe(false);
        expect(helpers.cloneArgs()).toEqual([]);
        expect(helpers.whichFlag('A', 'a')).toBe('a');
        expect(() => helpers.requireArgs('first', 'second')).toThrow(
            'Missing required <first> argument'
        );
        expect(helpers.valueOrDefault(1, 10)).toBe(1);
        expect(helpers.valueOrDefault(null, 10)).toBe(10);
        expect(helpers.valueOrDefault(undefined, 10)).toBe(10);
        expect(helpers.getArgOrDefault('defaultValue', 0)).toBe('defaultValue');
        expect(helpers.getArgOrDefault('defaultValue', 1)).toBe('defaultValue');
        expect(helpers.getFlagOrDefault('defaultValue', 'a')).toBe(0);
    });
});
