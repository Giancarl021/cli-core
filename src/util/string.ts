import type Maybe from '../interfaces/Maybe.js';

export function isEmpty<T extends Maybe<string>>(value: T): boolean {
    if (value === null || value === undefined) return true;

    if (typeof value !== 'string')
        throw new Error('Value is not a string nor null or undefined');

    return value === '';
}
