import { describe, test, expect } from '@jest/globals';
import ExtensionBundler from '../../../src/services/ExtensionBundler.js';
import constants from '../../util/constants.js';

import type { CommandHelpersInstance } from '../../../src/services/CommandHelpers.js';
import type { MockService } from '../../util/types.js';

const mockInstance: MockService<typeof ExtensionBundler> = {
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

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle.commandAddons).toEqual({});

        expect(bundle.interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforeOutputing: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(bundle.interceptors.beforeParsing).toHaveLength(0);
        expect(bundle.interceptors.beforeRouting).toHaveLength(0);
        expect(bundle.interceptors.beforeRunning).toHaveLength(0);
        expect(bundle.interceptors.beforeOutputing).toHaveLength(0);
        expect(bundle.interceptors.beforeEnding).toHaveLength(0);
    });

    test('Single extension with only command addons', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle.commandAddons).toEqual({
            extensionA: {
                methodA: expect.any(Function),
                valueA: 'a'
            }
        });

        expect(bundle.interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforeOutputing: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(bundle.interceptors.beforeParsing).toHaveLength(0);
        expect(bundle.interceptors.beforeRouting).toHaveLength(0);
        expect(bundle.interceptors.beforeRunning).toHaveLength(0);
        expect(bundle.interceptors.beforeOutputing).toHaveLength(0);
        expect(bundle.interceptors.beforeEnding).toHaveLength(0);
    });

    test('Single extension with only interceptors', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.b]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle.commandAddons).toEqual({});

        expect(bundle.interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforeOutputing: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(bundle.interceptors.beforeParsing).toHaveLength(1);
        expect(bundle.interceptors.beforeRouting).toHaveLength(1);
        expect(bundle.interceptors.beforeRunning).toHaveLength(1);
        expect(bundle.interceptors.beforeOutputing).toHaveLength(1);
        expect(bundle.interceptors.beforeEnding).toHaveLength(1);

        expect(bundle.interceptors.beforeParsing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeParsing
        );
        expect(bundle.interceptors.beforeRouting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRouting
        );
        expect(bundle.interceptors.beforeRunning[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRunning
        );
        expect(bundle.interceptors.beforeOutputing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeOutputing
        );
        expect(bundle.interceptors.beforeEnding[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeEnding
        );
    });

    test('Multiple extensions', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a, constants.extensions.b]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle.commandAddons).toEqual({
            extensionA: {
                methodA: expect.any(Function),
                valueA: 'a'
            }
        });

        expect(bundle.interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforeOutputing: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(bundle.interceptors.beforeParsing).toHaveLength(1);
        expect(bundle.interceptors.beforeRouting).toHaveLength(1);
        expect(bundle.interceptors.beforeRunning).toHaveLength(1);
        expect(bundle.interceptors.beforeOutputing).toHaveLength(1);
        expect(bundle.interceptors.beforeEnding).toHaveLength(1);

        expect(bundle.interceptors.beforeParsing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeParsing
        );
        expect(bundle.interceptors.beforeRouting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRouting
        );
        expect(bundle.interceptors.beforeRunning[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRunning
        );
        expect(bundle.interceptors.beforeOutputing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeOutputing
        );
        expect(bundle.interceptors.beforeEnding[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeEnding
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

    test('Empty extension', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.empty]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        expect(() => bundler.bundle(mockHelpers)).toThrow(
            'Extension "empty" does not have any command bundle nor flow interceptors'
        );
    });
});
