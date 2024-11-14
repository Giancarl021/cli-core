import inferType from '@giancarl021/type-inference';
import { isEmpty } from '../util/string.js';

import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type ParsedArguments from '../interfaces/ParsedArguments.js';
import type Flags from '../interfaces/Flags.js';
import type Arguments from '../interfaces/Arguments.js';
import type Nullable from '../interfaces/Nullable.js';

export type ArgumentsOptions = Omit<CliCoreOptions['arguments'], 'flags'> & {
    flags: Omit<CliCoreOptions['arguments']['flags'], 'help'>;
};
export type ArgumentsInstance = ReturnType<typeof Arguments>;

export default function Arguments(options: ArgumentsOptions) {
    const prefixes = options.flags.prefixes
        .filter(prefix => !isEmpty(prefix))
        .sort((a, b) => b.length - a.length);

    const formatArgument = options.flags.inferTypes
        ? (argument: string) => {
              const inference = inferType(argument);
              if (typeof inference === 'undefined') return 'undefined';
              return inference;
          }
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
                arguments: rawArgs,
                flags: {}
            };
        }

        const args: Arguments = [];
        const flags: Flags = {};

        let currentFlagName: Nullable<string> = null;
        const explicitNullFlags: string[] = [];

        for (const arg of rawArgs) {
            const flagName = _matchFlag(arg);

            if (flagName) {
                flags[flagName] = null;
                currentFlagName = flagName;
                continue;
            }

            if (currentFlagName) {
                const flagValue = formatArgument(arg);
                flags[currentFlagName] = flagValue;
                if (options.flags.ignoreEmptyFlags && flagValue === null)
                    explicitNullFlags.push(currentFlagName);

                currentFlagName = null;
                continue;
            }

            args.push(arg);
        }

        if (options.flags.ignoreEmptyFlags) {
            const toDelete: string[] = [];
            for (const flag in flags) {
                if (flags[flag] === null && !explicitNullFlags.includes(flag))
                    toDelete.push(flag);

                for (const flag of toDelete) delete flags[flag];
            }
        }

        return { arguments: args, flags };
    }

    return {
        parse
    };
}
