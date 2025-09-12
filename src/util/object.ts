/**
 * Returns the number of own enumerable properties in an object.
 * @param object The object to evaluate
 * @returns The number of own enumerable properties in the object
 */
export function size<T extends object>(object: T): number {
    return Object.keys(object).length;
}

/**
 * Checks if an object has no own enumerable properties.
 * @param object The object to evaluate
 * @returns `true` if the object has no own enumerable properties, `false` otherwise
 */
export function isEmpty<T extends object>(object: T): boolean {
    return size(object) === 0;
}
