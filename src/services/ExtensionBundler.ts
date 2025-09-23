import constants from '../util/constants.js';
import { ExtensionLoggerFactory } from './Logger.js';
import { isEmpty } from '../util/object.js';

import type CliCoreCommandAddons from '../interfaces/CliCoreCommandAddons.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type { CommandHelpersInstance } from './CommandHelpers.js';
import type FlowInterceptors from '../interfaces/FlowInterceptors.js';

export type ExtensionBundlerOptions = Pick<
    CliCoreOptions,
    'appName' | 'extensions' | 'behavior'
>;

export type ExtensionBundlerInstance = ReturnType<typeof ExtensionBundler>;

/**
 * Bundles extensions into command addons and collects flow interceptors.
 * @param options The extension bundler options, including the application name and extensions
 * @returns An object with `bundle` and `getInterceptors` methods
 */
export default function ExtensionBundler(options: ExtensionBundlerOptions) {
    /**
     * Collects flow interceptors from all extensions.
     * @returns An object containing arrays of interceptors for each flow stage alongside their extension names
     * to be bound in the logger instance later
     */
    function getInterceptors(): FlowInterceptors {
        const interceptors: FlowInterceptors = {
            beforeParsing: [],
            beforeRouting: [],
            beforeRunning: [],
            beforeError: [],
            beforePrinting: [],
            beforeEnding: []
        };

        for (const extension of options.extensions) {
            if (extension.interceptors) {
                if (extension.interceptors.beforeParsing)
                    interceptors.beforeParsing.push({
                        callback: extension.interceptors.beforeParsing,
                        extensionName: extension.name
                    });

                if (extension.interceptors.beforeRouting)
                    interceptors.beforeRouting.push({
                        callback: extension.interceptors.beforeRouting,
                        extensionName: extension.name
                    });

                if (extension.interceptors.beforeRunning)
                    interceptors.beforeRunning.push({
                        callback: extension.interceptors.beforeRunning,
                        extensionName: extension.name
                    });

                if (extension.interceptors.beforeError)
                    interceptors.beforeError.push({
                        callback: extension.interceptors.beforeError,
                        extensionName: extension.name
                    });

                if (extension.interceptors.beforePrinting)
                    interceptors.beforePrinting.push({
                        callback: extension.interceptors.beforePrinting,
                        extensionName: extension.name
                    });

                if (extension.interceptors.beforeEnding)
                    interceptors.beforeEnding.push({
                        callback: extension.interceptors.beforeEnding,
                        extensionName: extension.name
                    });
            }
        }

        return interceptors;
    }

    /**
     * Bundles extensions into command addons.
     * @param helpers The command helpers instance to pass to extensions
     * @returns The bundled command addons from all extensions
     */
    function bundle(helpers: CommandHelpersInstance): CliCoreCommandAddons {
        const commandAddons: CliCoreCommandAddons = {};
        const loggerFactory = ExtensionLoggerFactory(options);

        for (const extension of options.extensions) {
            const name = extension.name as keyof CliCoreCommandAddons;

            if (!constants.extensions.nameRegex.test(name))
                throw new Error(
                    `Invalid name for extension: "${name}". Extension names must follow this Regular Expression: ${constants.extensions.nameRegex}`
                );

            if (name in commandAddons)
                throw new Error(
                    `Multiple extensions with name "${extension.name}" detected, please remove any collision or duplicates`
                );

            const extensionBundle = extension.buildCommandAddons
                ? extension.buildCommandAddons({
                      appName: options.appName,
                      helpers,
                      addons: commandAddons,
                      logger: loggerFactory(
                          `${options.appName}::Extensions::${name}.addons`
                      )
                  })
                : {};

            if (
                !(extensionBundle instanceof Object) ||
                extensionBundle.constructor !== Object
            )
                throw new Error(
                    `Invalid extension build for "${name}". The result is not an Object`
                );

            if (
                isEmpty(extensionBundle) &&
                (!extension.interceptors || isEmpty(extension.interceptors))
            )
                throw new Error(
                    `Extension "${name}" does not have any command bundle nor flow interceptors`
                );

            if (!isEmpty(extensionBundle))
                commandAddons[name] =
                    extensionBundle as CliCoreCommandAddons[typeof name];
        }

        return commandAddons;
    }

    return {
        /**
         * Bundles extensions into command addons.
         * @param helpers The command helpers instance to pass to extensions
         * @returns The bundled command addons from all extensions
         */
        bundle,
        /**
         * Collects flow interceptors from all extensions.
         * @returns An object containing arrays of interceptors for each flow stage
         */
        getInterceptors
    };
}
