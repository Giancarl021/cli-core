import { describe, test, expect } from '@jest/globals';

import * as OBJECT from '../../../src/util/object.js';

describe('[UNIT] (util/object)', () => {
    test('size function', () => {
        expect(OBJECT.size({})).toEqual(0);
        expect(OBJECT.size([])).toEqual(0);
        expect(OBJECT.size({ a: 1, b: 2 })).toEqual(2);
        expect(OBJECT.size([1, 2])).toEqual(2);
    });

    test('isEmpty function', () => {
        expect(OBJECT.isEmpty({})).toEqual(true);
        expect(OBJECT.isEmpty([])).toEqual(true);
        expect(OBJECT.isEmpty({ a: 1, b: 2 })).toEqual(false);
        expect(OBJECT.isEmpty([1, 2])).toEqual(false);
    });
});
