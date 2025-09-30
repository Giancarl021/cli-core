import {
    describe,
    test,
    expect,
    jest,
    beforeEach,
    afterAll,
    afterEach
} from '@jest/globals';
import CommandHelpers from '../../../src/services/CommandHelpers.js';
import constants from '../../util/constants.js';
import type { MockService } from '../../util/types.js';
import { Readable } from 'stream';

const stdout = jest
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
const stderr = jest
    .spyOn(process.stderr, 'write')
    .mockImplementation(() => true);

let stdin: typeof process.stdin;

beforeEach(() => {
    stdin = new Readable({
        read() {
            this.push(`{ "test": true }\n`);
            this.push(null);
        }
    }) as unknown as typeof process.stdin;
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    jest.restoreAllMocks();
});

const mockInstance: MockService<typeof CommandHelpers> = {
    getArgAt: expect.any(Function),
    hasFlag: expect.any(Function),
    getFlag: expect.any(Function),
    hasArgAt: expect.any(Function),
    cloneArgs: expect.any(Function),
    whichFlag: expect.any(Function),
    requireArgs: expect.any(Function),
    valueOrDefault: expect.any(Function),
    getArgOrDefault: expect.any(Function),
    getFlagOrDefault: expect.any(Function),
    getStderr: expect.any(Function),
    getStdout: expect.any(Function),
    getStdin: expect.any(Function),
    noOutput: expect.any(Function),
    readBufferFromStdin: expect.any(Function),
    readTextFromStdin: expect.any(Function),
    readJsonFromStdin: expect.any(Function),
    writeJsonToStdout: expect.any(Function),
    writeJsonToStderr: expect.any(Function)
};

describe('[UNIT] services/CommandHelpers', () => {
    test('Empty execution parameters', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
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
        expect(helpers.noOutput()).toEqual(expect.any(Symbol));
        expect(helpers.getStdin()).toBeTruthy();
        expect(helpers.getStdout()).toBe(process.stdout);
        expect(helpers.getStderr()).toBe(process.stderr);

        helpers.writeJsonToStdout({ test: true });
        expect(stdout).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );
        helpers.writeJsonToStderr({ test: true });
        expect(stderr).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );

        await expect(helpers.readJsonFromStdin()).resolves.toEqual({
            test: true
        });
    });

    test('Single argument execution parameters', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.singleArgument.args,
            constants.executionParameters.singleArgument.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
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
        expect(helpers.requireArgs('first')).toMatchObject({
            first: '0'
        });
        expect(helpers.valueOrDefault(1, 10)).toBe(1);
        expect(helpers.valueOrDefault(null, 10)).toBe(10);
        expect(helpers.valueOrDefault(undefined, 10)).toBe(10);
        expect(helpers.getArgOrDefault('defaultValue', 0)).toBe('0');
        expect(helpers.getArgOrDefault('defaultValue', 1)).toBe('defaultValue');
        expect(helpers.getFlagOrDefault('defaultValue', 'a')).toBe(
            'defaultValue'
        );
        expect(helpers.noOutput()).toEqual(expect.any(Symbol));
        expect(helpers.getStdin()).toBeTruthy();
        expect(helpers.getStdout()).toBe(process.stdout);
        expect(helpers.getStderr()).toBe(process.stderr);
        helpers.writeJsonToStdout({ test: true });
        expect(stdout).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );
        helpers.writeJsonToStderr({ test: true });
        expect(stderr).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );

        await expect(helpers.readJsonFromStdin()).resolves.toEqual({
            test: true
        });
    });

    test('Single flag execution parameters', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.singleFlag.args,
            constants.executionParameters.singleFlag.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
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
        expect(helpers.noOutput()).toEqual(expect.any(Symbol));
        expect(helpers.getStdin()).toBeTruthy();
        expect(helpers.getStdout()).toBe(process.stdout);
        expect(helpers.getStderr()).toBe(process.stderr);
        helpers.writeJsonToStdout({ test: true });
        expect(stdout).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );
        helpers.writeJsonToStderr({ test: true });
        expect(stderr).toHaveBeenCalledWith(
            JSON.stringify({ test: true }, null, 2) + '\n'
        );

        await expect(helpers.readJsonFromStdin()).resolves.toEqual({
            test: true
        });
    });

    test('Stdin reading as buffer', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
        );

        const buffer = await helpers.readBufferFromStdin();
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.toString('utf8')).toBe('{ "test": true }\n');
    });

    test('Stdin reading as text', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
        );

        const text = await helpers.readTextFromStdin();
        expect(text).toBe('{ "test": true }\n');
    });

    test('Stdin reading as JSON', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
        );

        const json = await helpers.readJsonFromStdin<{ test: boolean }>();
        expect(json).toEqual({ test: true });
    });

    test('Stdin reading as text with different encoding', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
        );

        const text = await helpers.readTextFromStdin('binary');
        expect(text).toBe('{ "test": true }\n');
    });

    test('Stdin reading as JSON with different encoding', async () => {
        const helpers = CommandHelpers(
            constants.executionParameters.empty.args,
            constants.executionParameters.empty.flags,
            {
                stdin,
                stdout: process.stdout,
                stderr: process.stderr
            }
        );

        const json = await helpers.readJsonFromStdin<{ test: boolean }>(
            'binary'
        );
        expect(json).toEqual({ test: true });
    });
});
