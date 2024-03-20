import { describe, test, expect } from '@jest/globals';

import * as ARRAY from '../../../src/util/array.js';

describe('[UNIT] (util/array)', () => {
    test('concat function', () => {
        expect(ARRAY.concat()).toEqual([]);
        expect(ARRAY.concat([])).toEqual([]);
        expect(ARRAY.concat([], [])).toEqual([]);
        expect(ARRAY.concat([], [], [])).toEqual([]);
        expect(ARRAY.concat(1, 2, 3)).toEqual([1, 2, 3]);
        expect(ARRAY.concat([1, 2, 3])).toEqual([1, 2, 3]);
        expect(ARRAY.concat([1], 2, 3)).toEqual([1, 2, 3]);
        expect(ARRAY.concat(1, [2, 3])).toEqual([1, 2, 3]);
        expect(ARRAY.concat([1, 2], 3)).toEqual([1, 2, 3]);
    });
});
