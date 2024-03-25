import inferType from '@giancarl021/type-inference';
import { isEmpty } from '../util/string.js';

import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type ParsedArguments from '../interfaces/ParsedArguments.js';
import type Flags from '../interfaces/Flags.js';
import type Args from '../interfaces/Args.js';
import type Nullable from 'src/interfaces/Nullable.js';

export type ArgumentsInstance = ReturnType<typeof Arguments>;

export default function Arguments(options: CliCoreOptions['arguments']) {
    const prefixes = options.flags.prefixes.filter(prefix => !isEmpty(prefix));

    const formatArgument = options.flags.inferTypes
        ? (argument: string) => inferType(argument)
        : (argument: string) => argument;

    function _matchFlag(argument: string): Nullable<string> {
        for (const prefix of prefixes) {
            if (argument.startsWith(prefix)) {
                return argument.slice(prefix.length);
            }
        }

        return null;
    }

    function parse(): ParsedArguments {
        const rawArgs = options.origin.slice(options.ignoreFirst);

        if (!options.flags.parse || !prefixes.length) {
            return {
                args: rawArgs,
                flags: {}
            };
        }

        const args: Args = [];
        const flags: Flags = {};

        let currentFlagName: Nullable<string> = null;

        for (const arg of rawArgs) {
            const flagName = _matchFlag(arg);

            if (flagName) {
                flags[flagName] = null;
                currentFlagName = flagName;
                continue;
            }

            if (currentFlagName) {
                flags[currentFlagName] = formatArgument(arg);
                currentFlagName = null;
                continue;
            }

            args.push(arg);
        }

        return { args, flags };
    }

    return {
        parse
    };
}
