import { concat } from '../util/array.js';
import constants from '../util/constants.js';

import type Nullable from '../interfaces/Nullable.js';
import type Undefinable from '../interfaces/Undefinable.js';
import type Maybe from '../interfaces/Maybe.js';
import type Arguments from '../interfaces/Arguments.js';
import type Flags from '../interfaces/Flags.js';
import type { Argument } from '../interfaces/Arguments.js';
import type { Flag } from '../interfaces/Flags.js';
import type { Stdio } from '../interfaces/CliCoreCommand.js';

export type CommandHelpersInstance = ReturnType<typeof CommandHelpers>;

export default function CommandHelpers(
    args: Arguments,
    flags: Flags,
    stdio: Stdio
) {
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

    function noOutput(): typeof constants.noOutputSymbol {
        return constants.noOutputSymbol;
    }

    function getStdin(): Stdio['stdin'] {
        return stdio.stdin;
    }

    function getStdout(): Stdio['stdout'] {
        return stdio.stdout;
    }

    function getStderr(): Stdio['stderr'] {
        return stdio.stderr;
    }

    async function readJsonFromStdin<T = unknown>(): Promise<T> {
        const chunks: Buffer[] = [];

        for await (const chunk of stdio.stdin) {
            chunks.push(Buffer.from(chunk, 'utf8'));
        }

        const jsonString = Buffer.concat(chunks).toString('utf-8');

        return JSON.parse(jsonString) as T;
    }

    function writeJsonToStdout<T = unknown>(data: T): void {
        const jsonString = JSON.stringify(data, null, 2);
        stdio.stdout.write(jsonString + '\n');
    }

    function writeJsonToStderr<T = unknown>(data: T): void {
        const jsonString = JSON.stringify(data, null, 2);
        stdio.stderr.write(jsonString + '\n');
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
        getArgOrDefault,
        noOutput,
        getStdin,
        getStdout,
        getStderr,
        readJsonFromStdin,
        writeJsonToStdout,
        writeJsonToStderr
    };
}
