import type Maybe from '../interfaces/Maybe.js';

/**
 * Checks if a string is empty, null, or undefined.
 * @param value The string to evaluate
 * @returns `true` if the string is empty, null, or undefined; `false` otherwise
 */
export function isEmpty<T extends Maybe<string>>(value: T): boolean {
    if (value === null || value === undefined) return true;

    if (typeof value !== 'string')
        throw new Error('Value is not a string nor null or undefined');

    return value === '';
}
