import inferType from '@giancarl021/type-inference';
import { isEmpty } from '../util/string.js';

import type CliCoreOptions from '../interfaces/CliCoreOptions.js';
import type ParsedArguments from '../interfaces/ParsedArguments.js';
import type Flags from '../interfaces/Flags.js';
import type Arguments from '../interfaces/Arguments.js';
import type Nullable from '../interfaces/Nullable.js';

export type ParserOptions = CliCoreOptions['arguments'];

export type ParserInstance = ReturnType<typeof Parser>;

/**
 * Parses raw command-line arguments into structured arguments and flags.
 * @param options The parser options, including flag prefixes and type inference settings
 * @returns An object with a `parse` method to process raw arguments
 */
export default function Parser(options: ParserOptions) {
    const prefixes = options.flags.prefixes
        .filter(prefix => !isEmpty(prefix))
        .sort((a, b) => b.length - a.length);

    /**
     * Formats an argument based on the `inferTypes` option. If `inferTypes` is true,
     * it attempts to infer the type of the argument (e.g., number, boolean, null).
     * If `inferTypes` is false, it returns the argument as a string.
     * @param argument The argument to format
     * @returns The formatted argument, either as its inferred type or as a string
     */
    const formatArgument = options.flags.inferTypes
        ? (argument: string) => {
              const inference = inferType(argument);
              if (typeof inference === 'undefined') return 'undefined';
              return inference;
          }
        : (argument: string) => argument;

    /**
     * Matches a given argument against the defined flag prefixes.
     * @param argument The argument to match
     * @returns The flag name if a prefix matches, otherwise null
     */
    function _matchFlag(argument: string): Nullable<string> {
        for (const prefix of prefixes) {
            if (argument.startsWith(prefix)) {
                return argument.slice(prefix.length);
            }
        }

        return null;
    }

    /**
     * Parses raw command-line arguments into structured arguments and flags.
     * @param rawArgs The raw command-line arguments to parse
     * @returns An object containing the parsed arguments and flags
     */
    function parse(rawArgs: string[]): ParsedArguments {
        if (!options.flags.parse || !prefixes.length) {
            return {
                args: rawArgs,
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

        return { args, flags };
    }

    return {
        /**
         * Parses raw command-line arguments into structured arguments and flags.
         * @param rawArgs The raw command-line arguments to parse
         * @returns An object containing the parsed arguments and flags
         */
        parse
    };
}
