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
 * A descriptor for the entire application.
 * If follows this [JSON Schema](https://gist.githubusercontent.com/Giancarl021/127020c9cecb032beff587e308bec4ca/raw/af14cd087c7f3f2f1b1d6a6daec6f82699a44973/@giancarl021__cli-core__help-descriptor.schema.json)
 */
interface HelpDescriptor {
    [commandName: string]: CommandGroupDescriptor | CommandDescriptor | string;
}

export default HelpDescriptor;
