import { describe, test, expect } from '@jest/globals';

import * as STRING from '../../../src/util/string.js';

describe('[UNIT] (util/string)', () => {
    test('isEmpty function', () => {
        expect(STRING.isEmpty(undefined)).toBe(true);
        expect(STRING.isEmpty(null)).toBe(true);
        expect(STRING.isEmpty('')).toBe(true);
        expect(STRING.isEmpty('a')).toBe(false);

        expect(() => STRING.isEmpty({} as any)).toThrow(
            'Value is not a string nor null or undefined'
        );
        expect(() => STRING.isEmpty([] as any)).toThrow(
            'Value is not a string nor null or undefined'
        );
        expect(() => STRING.isEmpty(1 as any)).toThrow(
            'Value is not a string nor null or undefined'
        );
    });
});
