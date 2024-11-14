import { concat } from '../util/array.js';

import type Nullable from '../interfaces/Nullable.js';
import type Undefinable from '../interfaces/Undefinable.js';
import type Maybe from '../interfaces/Maybe.js';
import type Arguments from '../interfaces/Arguments.js';
import type Flags from '../interfaces/Flags.js';
import type { Argument } from '../interfaces/Arguments.js';
import type { Flag } from '../interfaces/Flags.js';

export type CommandHelpersInstance = ReturnType<typeof CommandHelpers>;

export default function CommandHelpers(args: Arguments, flags: Flags) {
    function _flagsHas(string: string): boolean {
        return string in flags;
    }

    function whichFlag(string: string, ...aliases: string[]): Nullable<string> {
        const key = concat(string, aliases).find(_flagsHas);

        return key ?? null;
    }

    function hasFlag(string: string, ...aliases: string[]): boolean {
        return concat(string, aliases).some(_flagsHas);
    }

    function getFlag(string: string, ...aliases: string[]): Undefinable<Flag> {
        const key = whichFlag(string, ...aliases);

        if (!key) return undefined;

        return flags[key];
    }

    function hasArgAt(index: number): boolean {
        return args.length > index;
    }

    function getArgAt(index: number): Nullable<Argument> {
        if (!hasArgAt(index)) return null;

        return args[index];
    }

    function cloneArgs(): Arguments {
        return structuredClone(args);
    }

    function requireArgs<const T extends string[]>(
        ...argNames: T
    ): Record<T[number], Argument> {
        const result = {} as Record<T[number], Argument>;

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
        string: string,
        ...aliases: string[]
    ): Flag {
        return valueOrDefault(getFlag(string, ...aliases), defaultValue);
    }

    function getArgOrDefault(defaultValue: Argument, index: number): Argument {
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
