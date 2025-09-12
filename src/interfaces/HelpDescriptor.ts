import type constants from '../util/constants.js';

/**
 * A descriptor for a command argument
 */
export interface ArgDescriptor {
    /**
     * The name of the argument
     */
    name: string;
    /**
     * If the argument is optional, default is `false`
     */
    optional?: boolean;
    /**
     * If the argument can be repeated, default is `false`
     * This type of argument must be the last one in the list
     */
    multiple?: boolean;
}

/**
 * A descriptor for a flag
 */
export interface FlagDescriptor {
    /**
     * The description of the flag
     */
    description: string;
    /**
     * If the flag has aliases, default is `[]`
     */
    aliases?: string[];
    /**
     * If the flag is optional, default is `true`
     */
    optional?: boolean;
    /**
     * The values that the flag can have, default is none
     */
    values?: string[];
}

/**
 * A Record of flag descriptors
 */
export interface FlagsDescriptor {
    [flagName: string]: FlagDescriptor | string;
}

/**
 * A descriptor for standard IO usage
 */
export interface StdioDescriptor {
    /**
     * The stdin usage description for the command
     */
    stdin?: string;
    /**
     * The stdout usage description for the command
     */
    stdout?: string;
    /**
     * The stderr usage description for the command
     */
    stderr?: string;
}

/**
 * A descriptor for a command
 */
export interface CommandDescriptor {
    /**
     * The description of the command
     */
    description: string;
    /**
     * The arguments that the command can receive
     */
    args?: (string | ArgDescriptor)[];
    /**
     * The flags that the command can receive
     */
    flags?: FlagsDescriptor;
    /**
     * The standard IO usage for the command
     */
    stdio?: StdioDescriptor;
}

/**
 * A descriptor for a command group
 */
export interface CommandGroupDescriptor {
    /**
     * The description of the command group
     */
    description?: string;
    /**
     * The subcommands that the group can have
     */
    subcommands: {
        [commandName: string]:
            | CommandGroupDescriptor
            | CommandDescriptor
            | string;
    };
}

/**
 * A descriptor for a single command application.
 */
export type SingleCommandHelpDescriptor = CommandDescriptor & {
    $schema: typeof constants.singleCommandHelpDescriptorSchema;
};

/**
 * A help descriptor for a CLI Core application. Can be a single-command or multi-command application.
 * There are two JSON schema files available for the help descriptor objects:
 * 
 * - [Single-command applications](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/6e7845f843c76cd46c7cc03a1a3dc44de889a01f/single-command-help-descriptor.schema.json)
 * - [Multi-command applications](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/6e7845f843c76cd46c7cc03a1a3dc44de889a01f/multi-command-help-descriptor.schema.json)
 */
type HelpDescriptor =
    | SingleCommandHelpDescriptor
    | {
          [commandName: string]:
              | CommandGroupDescriptor
              | CommandDescriptor
              | string;
      };

export default HelpDescriptor;
