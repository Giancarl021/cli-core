import { describe, test, expect } from '@jest/globals';
import Router from '../../../src/services/Router.js';

import type {
    RouterOptions,
    RouterInstance
} from '../../../src/services/Router.js';
import constants from '../../util/constants.js';

type FunctionMatcher = ReturnType<(typeof expect)['any']>;

const mockInstance: Record<keyof RouterInstance, FunctionMatcher> = {
    navigate: expect.any(Function)
};

describe('[UNIT] services/Router', () => {
    const options: RouterOptions = {
        appName: constants.appName,
        commands: {},
        arguments: {
            flags: {
                help: ['help']
            }
        }
    };

    test('Empty execution', () => {
        const router = Router(options);

        expect(router).toMatchObject(expect.objectContaining(mockInstance));
    });
});
