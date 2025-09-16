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

/**
 * Provides helper functions for command implementations,
 * such as argument and flag retrieval, default values,
 * and standard input/output handling.
 * @param args The parsed command-line arguments
 * @param flags The parsed command-line flags
 * @param stdio The standard input/output/error streams
 * @returns An object with various helper methods for command implementations
 */
export default function CommandHelpers(
    args: Arguments,
    flags: Flags,
    stdio: Stdio
) {
    /**
     * Checks if a flag exists in the parsed flags.
     * @param string The flag name to check
     * @returns True if the flag exists, false otherwise
     */
    function _flagsHas(string: string): boolean {
        return string in flags;
    }

    /**
     * Finds the first matching flag from a list of possible names.
     * @param string The primary flag name to check
     * @param aliases Additional alias names for the flag
     * @returns The first matching flag name if found, otherwise null
     */
    function whichFlag(string: string, ...aliases: string[]): Nullable<string> {
        const key = concat(string, aliases).find(_flagsHas);

        return key ?? null;
    }

    /**
     * Checks if any of the provided flag names exist in the parsed flags.
     * @param string The primary flag name to check
     * @param aliases Additional alias names for the flag
     * @returns True if any of the flags exist, false otherwise
     */
    function hasFlag(string: string, ...aliases: string[]): boolean {
        return concat(string, aliases).some(_flagsHas);
    }

    /**
     * Retrieves the value of a flag by its name or aliases.
     * @param string The primary flag name to retrieve
     * @param aliases Additional alias names for the flag
     * @returns The value of the flag if found, otherwise undefined
     */
    function getFlag(string: string, ...aliases: string[]): Undefinable<Flag> {
        const key = whichFlag(string, ...aliases);

        if (!key) return undefined;

        return flags[key];
    }

    /**
     * Checks if there is an argument at the specified index.
     * @param index The index to check
     * @returns True if an argument exists at the index, false otherwise
     */
    function hasArgAt(index: number): boolean {
        return args.length > index;
    }

    /**
     * Retrieves the argument at the specified index, or null if it doesn't exist.
     * @param index The index of the argument to retrieve
     * @returns The argument at the index, or null if it doesn't exist
     */
    function getArgAt(index: number): Nullable<Argument> {
        if (!hasArgAt(index)) return null;

        return args[index];
    }

    /**
     * Creates a shallow clone of the arguments array.
     * @returns A shallow clone of the arguments array
     */
    function cloneArgs(): Arguments {
        return structuredClone(args);
    }

    /**
     * Ensures that the specified arguments are present, throwing an error if any are missing.
     * @param argNames The names of the required arguments
     * @returns An object mapping argument names to their values
     */
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

    /**
     * Returns the provided value if it's defined and not null; otherwise, returns the default value.
     * @param value The value to check
     * @param defaultValue The default value to return if the first value is undefined or null
     * @returns The original value or the default value
     */
    function valueOrDefault<T>(value: Maybe<T>, defaultValue: T): T {
        if (typeof value === 'undefined' || value === null) return defaultValue;

        return value;
    }

    /**
     * Retrieves the value of a flag by its name or aliases, returning a default value if the flag is not set.
     * @param defaultValue The default value to return if the flag is not set
     * @param string The primary flag name to retrieve
     * @param aliases Additional alias names for the flag
     * @returns The value of the flag if found, otherwise the default value
     */
    function getFlagOrDefault(
        defaultValue: Flag,
        string: string,
        ...aliases: string[]
    ): Flag {
        return valueOrDefault(getFlag(string, ...aliases), defaultValue);
    }

    /**
     * Retrieves the argument at the specified index, returning a default value if the argument is not present.
     * @param defaultValue The default value to return if the argument is not present
     * @param index The index of the argument to retrieve
     * @returns The argument at the index if present, otherwise the default value
     */
    function getArgOrDefault(defaultValue: Argument, index: number): Argument {
        return valueOrDefault(getArgAt(index), defaultValue);
    }

    /**
     * Signals that no output should be produced.
     * @returns A unique symbol indicating no output
     */
    function noOutput(): symbol {
        return constants.noOutputSymbol;
    }

    /**
     * Retrieves the standard input stream.
     * @returns The standard input stream
     */
    function getStdin(): Stdio['stdin'] {
        return stdio.stdin;
    }

    /**
     * Retrieves the standard output stream.
     * @returns The standard output stream
     */
    function getStdout(): Stdio['stdout'] {
        return stdio.stdout;
    }

    /**
     * Retrieves the standard error stream.
     * @returns The standard error stream
     */
    function getStderr(): Stdio['stderr'] {
        return stdio.stderr;
    }

    /**
     * Reads JSON data from the standard input stream.
     *
     * **Important:** Will block execution until the input stream is closed (e.g., EOF).
     * @returns A promise that resolves to the parsed JSON data
     */
    async function readJsonFromStdin<T = unknown>(): Promise<T> {
        const chunks: Buffer[] = [];

        for await (const chunk of stdio.stdin) {
            chunks.push(Buffer.from(chunk, 'utf8'));
        }

        const jsonString = Buffer.concat(chunks).toString('utf-8');

        return JSON.parse(jsonString) as T;
    }

    /**
     * Writes JSON data to the standard output stream.
     * @param data The data to write as JSON
     */
    function writeJsonToStdout<T = unknown>(data: T): void {
        const jsonString = JSON.stringify(data, null, 2);
        stdio.stdout.write(jsonString + '\n');
    }

    /** * Writes JSON data to the standard error stream.
     * @param data The data to write as JSON
     */
    function writeJsonToStderr<T = unknown>(data: T): void {
        const jsonString = JSON.stringify(data, null, 2);
        stdio.stderr.write(jsonString + '\n');
    }

    return {
        /**
         * Finds the first matching flag from a list of possible names.
         * @param string The primary flag name to check
         * @param aliases Additional alias names for the flag
         * @returns The first matching flag name if found, otherwise null
         */
        whichFlag,
        /**
         * Checks if any of the provided flag names exist in the parsed flags.
         * @param string The primary flag name to check
         * @param aliases Additional alias names for the flag
         * @returns True if any of the flags exist, false otherwise
         */
        hasFlag,
        /**
         * Retrieves the value of a flag by its name or aliases.
         * @param string The primary flag name to retrieve
         * @param aliases Additional alias names for the flag
         * @returns The value of the flag if found, otherwise undefined
         */
        getFlag,
        /**
         * Checks if there is an argument at the specified index.
         * @param index The index to check
         * @returns True if an argument exists at the index, false otherwise
         */
        hasArgAt,
        /**
         * Retrieves the argument at the specified index, or null if it doesn't exist.
         * @param index The index of the argument to retrieve
         * @returns The argument at the index, or null if it doesn't exist
         */
        getArgAt,
        /**
         * Creates a shallow clone of the arguments array.
         * @returns A shallow clone of the arguments array
         */
        cloneArgs,
        /**
         * Ensures that the specified arguments are present, throwing an error if any are missing.
         * @param argNames The names of the required arguments
         * @returns An object mapping argument names to their values
         */
        requireArgs,
        /**
         * Returns the provided value if it's defined and not null; otherwise, returns the default value.
         * @param value The value to check
         * @param defaultValue The default value to return if the first value is undefined or null
         * @returns The original value or the default value
         */
        valueOrDefault,
        /**
         * Retrieves the value of a flag by its name or aliases, returning a default value if the flag is not set.
         * @param defaultValue The default value to return if the flag is not set
         * @param string The primary flag name to retrieve
         * @param aliases Additional alias names for the flag
         * @returns The value of the flag if found, otherwise the default value
         */
        getFlagOrDefault,
        /**
         * Retrieves the argument at the specified index, returning a default value if the argument is not present.
         * @param defaultValue The default value to return if the argument is not present
         * @param index The index of the argument to retrieve
         * @returns The argument at the index if present, otherwise the default value
         */
        getArgOrDefault,
        /**
         * Signals that no output should be produced.
         * @returns A unique symbol indicating no output
         */
        noOutput,
        /**
         * Retrieves the standard input stream.
         * @returns The standard input stream
         */
        getStdin,
        /**
         * Retrieves the standard output stream.
         * @returns The standard output stream
         */
        getStdout,
        /**
         * Retrieves the standard error stream.
         * @returns The standard error stream
         */
        getStderr,
        /**
         * Reads JSON data from the standard input stream.
         *
         * **Important:** Will block execution until the input stream is closed (e.g., EOF).
         * @returns A promise that resolves to the parsed JSON data
         */
        readJsonFromStdin,
        /**
         * Writes JSON data to the standard output stream.
         * @param data The data to write as JSON
         */
        writeJsonToStdout,
        /** * Writes JSON data to the standard error stream.
         * @param data The data to write as JSON
         */
        writeJsonToStderr
    };
}
