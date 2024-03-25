import type Args from './Args.js';
import type Flags from './Flags.js';

interface ParsedArguments {
    args: Args;
    flags: Flags;
}

export default ParsedArguments;
