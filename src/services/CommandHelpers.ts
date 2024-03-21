import { concat } from '../util/array.js';

import type Nullable from '../interfaces/Nullable.js';
import type Undefinable from 'src/interfaces/Undefinable.js';
import type Maybe from 'src/interfaces/Maybe.js';
import type Args from '../interfaces/Args.js';
import type Flags from '../interfaces/Flags.js';
import type { Arg, ArgsKey } from '../interfaces/Args.js';
import type { Flag, FlagName } from '../interfaces/Flags.js';

export type CommandHelpersInstance = ReturnType<typeof CommandHelpers>;

export default function CommandHelpers(args: Args, flags: Flags) {
    function _flagsHas(flagName: FlagName): boolean {
        return flagName in flags;
    }

    function whichFlag(
        flagName: FlagName,
        ...aliases: FlagName[]
    ): Nullable<string> {
        const key = concat(flagName, aliases).find(_flagsHas);

        return key ?? null;
    }

    function hasFlag(flagName: FlagName, ...aliases: FlagName[]): boolean {
        return concat(flagName, aliases).some(_flagsHas);
    }

    function getFlag(
        flagName: FlagName,
        ...aliases: FlagName[]
    ): Undefinable<Flag> {
        const key = whichFlag(flagName, ...aliases);

        if (!key) return undefined;

        return flags[key];
    }

    function hasArgAt(index: ArgsKey): boolean {
        return args.length > index;
    }

    function getArgAt(index: ArgsKey): Nullable<Arg> {
        if (!hasArgAt(index)) return null;

        return args[index];
    }

    function cloneArgs(): Args {
        return structuredClone(args);
    }

    function requireArgs<const T extends string[]>(
        ...argNames: T
    ): Record<T[number], Arg> {
        const result = {} as Record<T[number], Arg>;

        for (let index = 0; index < argNames.length; index++) {
            const argName = argNames[index] as T[number];
            const arg = getArgAt(index);
            if (arg === null)
                throw new Error(`Missing required <${argName}> argument`);

            result[argName] = arg;
        }

        return result;
    }

    function valueOrDefault<T>(value: Maybe<T>, defaultValue: T): T {
        if (typeof value === 'undefined' || value === null) return defaultValue;

        return value;
    }

    function getFlagOrDefault(
        defaultValue: Flag,
        flagName: FlagName,
        ...aliases: FlagName[]
    ): Flag {
        return valueOrDefault(getFlag(flagName, ...aliases), defaultValue);
    }

    function getArgOrDefault(defaultValue: Arg, index: ArgsKey): Arg {
        return valueOrDefault(getArgAt(index), defaultValue);
    }

    return {
        whichFlag,
        hasFlag,
        getFlag,
        hasArgAt,
        getArgAt,
        cloneArgs,
        requireArgs,
        valueOrDefault,
        getFlagOrDefault,
        getArgOrDefault
    };
}
