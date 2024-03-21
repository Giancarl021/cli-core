import { describe, test, expect } from '@jest/globals';
import ExtensionBundler from '../../../src/services/ExtensionBundler.js';

import type { ExtensionBundlerInstance } from '../../../src/services/ExtensionBundler.js';
import constants from '../../util/constants.js';
import { CommandHelpersInstance } from '../../../src/services/CommandHelpers.js';

type FunctionMatcher = ReturnType<(typeof expect)['any']>;

const mockInstance: Record<keyof ExtensionBundlerInstance, FunctionMatcher> = {
    bundle: expect.any(Function)
};

const mockHelpers = {} as CommandHelpersInstance;

describe('[UNIT] services/ExtensionBundler', () => {
    test('No extensions', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: []
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(bundler.bundle(mockHelpers)).toEqual({});
    });

    test('Single extension', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(bundler.bundle(mockHelpers)).toMatchObject(
            expect.objectContaining({
                extensionA: {
                    methodA: expect.any(Function),
                    valueA: 'a'
                }
            })
        );
    });

    test('Multiple extensions', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a, constants.extensions.b]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(bundler.bundle(mockHelpers)).toMatchObject(
            expect.objectContaining({
                extensionA: {
                    methodA: expect.any(Function),
                    valueA: 'a'
                },
                extensionB: {
                    methodB: expect.any(Function),
                    valueB: 'b'
                }
            })
        );
    });

    test('Colliding extensions', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a, constants.extensions.a]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(() => bundler.bundle(mockHelpers)).toThrow(
            'Multiple extensions with name "extensionA" detected, please remove any collision or duplicates'
        );
    });

    test('Invalid extension name', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.invalidName]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(() => bundler.bundle(mockHelpers)).toThrow(
            'Invalid name for extension: "Invalid Name Extension". Extension names must follow this Regular Expression: /^[_A-Z]+[_A-Z0-9]*$/i'
        );
    });

    test('Invalid builder', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.invalidBuilder]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(() => bundler.bundle(mockHelpers)).toThrow(
            'Invalid extension build for "invalidBuilderExtension". The result is not an Object'
        );
    });
});
