import type Arguments from './Arguments.js';
import type Flags from './Flags.js';

/**
 * Represents a combination of arguments and flags.
 * All the inputs that a command can receive.
 */
interface ParsedArguments {
    /**
     * The arguments that the command received.
     */
    args: Arguments;
    /**
     * The flags that the command received.
     */
    flags: Flags;
}

export default ParsedArguments;
