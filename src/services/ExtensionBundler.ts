import constants from '../util/constants.js';
import { isEmpty } from '../util/object.js';

import type CliCoreCommandAddons from '../interfaces/CliCoreCommandAddons.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type { CommandHelpersInstance } from './CommandHelpers.js';
import type FlowInterceptors from '../interfaces/FlowInterceptors.js';

export type ExtensionBundlerOptions = Pick<
    CliCoreOptions,
    'appName' | 'extensions'
>;

export type ExtensionBundlerInstance = ReturnType<typeof ExtensionBundler>;

export default function ExtensionBundler(options: ExtensionBundlerOptions) {
    function getInterceptors(): FlowInterceptors {
        const interceptors: FlowInterceptors = {
            beforeParsing: [],
            beforeRouting: [],
            beforeRunning: [],
            beforePrinting: [],
            beforeEnding: []
        };

        for (const extension of options.extensions) {
            if (extension.interceptors) {
                if (extension.interceptors.beforeParsing)
                    interceptors.beforeParsing.push(
                        extension.interceptors.beforeParsing
                    );

                if (extension.interceptors.beforeRouting)
                    interceptors.beforeRouting.push(
                        extension.interceptors.beforeRouting
                    );

                if (extension.interceptors.beforeRunning)
                    interceptors.beforeRunning.push(
                        extension.interceptors.beforeRunning
                    );

                if (extension.interceptors.beforePrinting)
                    interceptors.beforePrinting.push(
                        extension.interceptors.beforePrinting
                    );

                if (extension.interceptors.beforeEnding)
                    interceptors.beforeEnding.push(
                        extension.interceptors.beforeEnding
                    );
            }
        }

        return interceptors;
    }

    function bundle(helpers: CommandHelpersInstance): CliCoreCommandAddons {
        const commandAddons: CliCoreCommandAddons = {};

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
                      helpers
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
        bundle,
        getInterceptors
    };
}
