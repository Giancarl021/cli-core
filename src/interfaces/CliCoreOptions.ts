import type HelpDescriptor from './HelpDescriptor.js';
import type CliCoreCommand from './CliCoreCommand.js';
import type CliCoreExtension from './CliCoreExtension.js';
import type DeepPartial from './DeepPartial.js';
import type Nullable from './Nullable.js';
import type chalk from 'chalk';

/**
 * The options used to create a CLI Core instance
 */
export type PartialCliCoreOptions = DeepPartial<
    Exclude<CliCoreOptions, 'appName' | 'commands'>
> &
    Pick<CliCoreOptions, 'appName' | 'commands'>;

/**
 * The options used by a CLI Core instance,
 * can be derived from `PartialCliCoreOptions`
 */
interface CliCoreOptions {
    /**
     * The name of the application used in the terminal
     */
    appName: string;
    /**
     * The description of the application, used in the help command
     */
    appDescription: Nullable<string>;
    /**
     * Configuration for the argument processing of the application
     */
    arguments: {
        /**
         * The origin of the arguments, by default it's `process.argv`,
         * but can be changed to any array of strings
         */
        origin: string[];
        /**
         * The index to start parsing the arguments, by default it's `2`, considering
         * that on `process.argv` the first argument is `node` and the second argument
         * is the command itself
         */
        ignoreFirst: number;
        /**
         * Configuration on flags parsing
         */
        flags: {
            /**
             * Whether to parse the flags or not, by default it's `true`, if
             * false everything will be passed as-is to the arguments
             */
            parse: boolean;
            /**
             * The prefixes used to identify flags, by default it's `['-', '--']`
             */
            prefixes: string[];
            /**
             * Whether to infer the types of the flags or not, by default it's `true`
             * If `false`, all flags will be treated as strings
             */
            inferTypes: boolean;
            /**
             * Whether to ignore empty flags or not, by default it's `false`
             */
            ignoreEmptyFlags: boolean;
            /**
             * The flags that will trigger the help command, by default it's `['h', 'help', '?']`
             */
            helpFlags: string[];
        };
    };
    /**
     * Configuration for the behavior of the application
     */
    behavior: {
        /**
         * Whether to enable the debug mode or not, by default it's `false`
         * If `true`, the application will output more information when an
         * error occurs, and will not call `process.exit` on errors
         */
        debugMode: boolean;
        /**
         * Whether to enable logging for extensions, by default it's `false`.
         */
        extensionLogging: boolean;
        /**
         * Whether to enable colorful output using `chalk`, by default it's `true`.
         * It can also be set to a specific `chalk.level` to force a specific color level
         */
        colorfulOutput: boolean | typeof chalk.level;
    };
    /**
     * The extensions to be used by the application, for more information
     * check the [library documentation](https://github.com/Giancarl021/cli-core/blob/master/.github/docs/extensions.md)
     */
    extensions: CliCoreExtension[];
    /**
     * The commands to be used by the application, the key is the name of the command
     * and the value is the command itself, or an object with subcommands
     */
    commands: CliCoreCommand;
    /**
     * The help configuration for the application, describing how the help command
     * should behave on each command. This property can be a JSON object with [this `$schema`](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/af14cd087c7f3f2f1b1d6a6daec6f82699a44973/@giancarl021__cli-core__help-descriptor.schema.json)
     */
    help: HelpDescriptor;
}

export default CliCoreOptions;
