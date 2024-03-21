import type CliCoreBundledExtensions from '../interfaces/CliCoreBundledExtensions.js';
import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type { CommandHelpersInstance } from './CommandHelpers.js';
import constants from '../util/constants.js';

export type ExtensionBundlerOptions = Pick<
    CliCoreOptions,
    'appName' | 'extensions'
>;

export type ExtensionBundlerInstance = ReturnType<typeof ExtensionBundler>;

export default function ExtensionBundler(options: ExtensionBundlerOptions) {
    function bundle(helpers: CommandHelpersInstance) {
        const bundledExtensions: CliCoreBundledExtensions = {};

        for (const extension of options.extensions) {
            const bundle = extension.build({
                appName: options.appName,
                helpers
            });

            const name = extension.name as keyof CliCoreBundledExtensions;

            if (!constants.extensions.nameRegex.test(name))
                throw new Error(
                    `Invalid name for extension: "${name}". Extension names must follow this Regular Expression: ${constants.extensions.nameRegex}`
                );

            if (name in bundledExtensions)
                throw new Error(
                    `Multiple extensions with name "${extension.name}" detected, please remove any collision or duplicates`
                );

            if (!(bundle instanceof Object) || bundle.constructor !== Object)
                throw new Error(
                    `Invalid extension build for "${name}". The result is not an Object`
                );

            bundledExtensions[name] =
                bundle as CliCoreBundledExtensions[typeof name];
        }

        return bundledExtensions;
    }

    return {
        bundle
    };
}
