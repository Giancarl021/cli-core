import { describe, test, expect, jest } from '@jest/globals';
import ExtensionBundler from '../../../src/services/ExtensionBundler.js';
import constants from '../../util/constants.js';

import type { CommandHelpersInstance } from '../../../src/services/CommandHelpers.js';
import type { MockService } from '../../util/types.js';
import CliCoreExtension from '../../../src/interfaces/CliCoreExtension.js';

const mockInstance: MockService<typeof ExtensionBundler> = {
    bundle: expect.any(Function),
    getInterceptors: expect.any(Function)
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
        const interceptors = bundler.getInterceptors();

        expect(bundle).toEqual({});

        expect(interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforePrinting: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(interceptors.beforeParsing).toHaveLength(0);
        expect(interceptors.beforeRouting).toHaveLength(0);
        expect(interceptors.beforeRunning).toHaveLength(0);
        expect(interceptors.beforePrinting).toHaveLength(0);
        expect(interceptors.beforeEnding).toHaveLength(0);
    });

    test('Single extension with only command addons', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.a]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);
        const interceptors = bundler.getInterceptors();

        expect(bundle).toEqual({
            extensionA: {
                methodA: expect.any(Function),
                valueA: 'a'
            }
        });

        expect(interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforePrinting: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(interceptors.beforeParsing).toHaveLength(0);
        expect(interceptors.beforeRouting).toHaveLength(0);
        expect(interceptors.beforeRunning).toHaveLength(0);
        expect(interceptors.beforePrinting).toHaveLength(0);
        expect(interceptors.beforeEnding).toHaveLength(0);
    });

    test('Single extension with only interceptors', () => {
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [constants.extensions.b]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);
        const interceptors = bundler.getInterceptors();

        expect(bundle).toEqual({});

        expect(interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforePrinting: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(interceptors.beforeParsing).toHaveLength(1);
        expect(interceptors.beforeRouting).toHaveLength(1);
        expect(interceptors.beforeRunning).toHaveLength(1);
        expect(interceptors.beforePrinting).toHaveLength(1);
        expect(interceptors.beforeEnding).toHaveLength(1);

        expect(interceptors.beforeParsing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeParsing
        );
        expect(interceptors.beforeRouting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRouting
        );
        expect(interceptors.beforeRunning[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRunning
        );
        expect(interceptors.beforePrinting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforePrinting
        );
        expect(interceptors.beforeEnding[0]).toEqual(
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
        const interceptors = bundler.getInterceptors();

        expect(bundle).toEqual({
            extensionA: {
                methodA: expect.any(Function),
                valueA: 'a'
            }
        });

        expect(interceptors).toMatchObject({
            beforeParsing: expect.anything(),
            beforeRouting: expect.anything(),
            beforeRunning: expect.anything(),
            beforePrinting: expect.anything(),
            beforeEnding: expect.anything()
        });

        expect(interceptors.beforeParsing).toHaveLength(1);
        expect(interceptors.beforeParsing).toHaveLength(1);
        expect(interceptors.beforeRouting).toHaveLength(1);
        expect(interceptors.beforeRunning).toHaveLength(1);
        expect(interceptors.beforePrinting).toHaveLength(1);
        expect(interceptors.beforeEnding).toHaveLength(1);

        expect(interceptors.beforeParsing[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeParsing
        );
        expect(interceptors.beforeRouting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRouting
        );
        expect(interceptors.beforeRunning[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeRunning
        );
        expect(interceptors.beforePrinting[0]).toEqual(
            constants.extensions.b?.interceptors?.beforePrinting
        );
        expect(interceptors.beforeEnding[0]).toEqual(
            constants.extensions.b?.interceptors?.beforeEnding
        );
    });

    test('Multiple interceptors', () => {
        const ext1 = {
            name: 'ext1',
            interceptors: {
                beforeParsing: jest.fn()
            }
        } as CliCoreExtension;
        const ext2 = {
            name: 'ext2',
            interceptors: {
                beforeRunning: jest.fn()
            }
        } as CliCoreExtension;
        const ext3 = {
            name: 'ext3',
            interceptors: {
                beforePrinting: jest.fn()
            }
        } as CliCoreExtension;
        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [ext1, ext2, ext3]
        });
        const interceptors = bundler.getInterceptors();
        expect(interceptors.beforeParsing).toEqual([
            ext1.interceptors!.beforeParsing
        ]);
        expect(interceptors.beforeRunning).toEqual([
            ext2.interceptors!.beforeRunning
        ]);
        expect(interceptors.beforePrinting).toEqual([
            ext3.interceptors!.beforePrinting
        ]);
        expect(interceptors.beforeRouting).toEqual([]);
        expect(interceptors.beforeEnding).toEqual([]);
    });

    test('Accessing previous mounted extension context during build', () => {
        const ext1 = {
            name: 'EXT1',
            buildCommandAddons: jest.fn(({ appName, helpers, addons }) => {
                expect(appName).toBe(constants.appName);
                expect(helpers).toBe(mockHelpers);
                expect(addons).toEqual({});
                return { value1: 'value1' };
            })
        } as CliCoreExtension;

        const ext2 = {
            name: 'EXT2',
            buildCommandAddons: jest.fn(({ appName, helpers, addons }) => {
                expect(appName).toBe(constants.appName);
                expect(helpers).toBe(mockHelpers);
                expect(addons).toEqual({
                    EXT1: { value1: 'value1' }
                });
                return { value2: 'value2' };
            })
        } as CliCoreExtension;

        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [ext1, ext2]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle).toEqual({
            EXT1: { value1: 'value1' },
            EXT2: { value2: 'value2' }
        });

        expect(ext1.buildCommandAddons).toHaveBeenCalledTimes(1);
        expect(ext2.buildCommandAddons).toHaveBeenCalledTimes(1);
    });

    test('Accessing later mounted extension context at runtime', () => {
        const ext1 = {
            name: 'EXT1',
            buildCommandAddons: jest.fn(({ appName, helpers, addons }) => {
                return {
                    getExt2Value: () => {
                        // This function is called at runtime, so EXT2 should be available
                        return addons.EXT2.value2;
                    },
                    addons
                };
            })
        } as CliCoreExtension;

        const ext2 = {
            name: 'EXT2',
            buildCommandAddons: jest.fn(() => {
                return { value2: 'value2' };
            })
        } as CliCoreExtension;

        const bundler = ExtensionBundler({
            appName: constants.appName,
            extensions: [ext1, ext2]
        });

        expect(bundler).toMatchObject(expect.objectContaining(mockInstance));

        const bundle = bundler.bundle(mockHelpers);

        expect(bundle).toEqual({
            EXT1: {
                getExt2Value: expect.any(Function),
                addons: expect.any(Object)
            },
            EXT2: { value2: 'value2' }
        });

        expect((bundle as any).EXT1.getExt2Value()).toBe('value2');

        expect(ext1.buildCommandAddons).toHaveBeenCalledTimes(1);
        expect(ext2.buildCommandAddons).toHaveBeenCalledTimes(1);
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
