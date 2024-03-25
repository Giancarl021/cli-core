import { describe, test, expect } from '@jest/globals';
import Arguments from '../../../src/services/Arguments.js';
import constants from '../../util/constants.js';

import type { MockService } from '../../util/types.js';
import type CliCoreOptions from '../../../src/interfaces/CliCoreOptions.js';

const mockInstance: MockService<typeof Arguments> = {
    parse: expect.any(Function)
};

function options(args: string[] = []): CliCoreOptions['arguments'] {
    return {
        origin: ['node', constants.appName, ...args],
        ignoreFirst: 2,
        flags: {
            parse: true,
            prefixes: ['--', '-'],
            ignoreEmptyFlags: false,
            help: ['h', 'help'],
            inferTypes: true
        }
    };
}

describe('[UNIT] services/Arguments', () => {
    test('Empty origin', () => {
        const args = Arguments(options());

        expect(args).toMatchObject(mockInstance);
    });
});
