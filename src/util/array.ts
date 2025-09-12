/**
 * Flattens and concatenates arrays and items into a single array.
 * @param items The items and/or arrays to concatenate
 * @returns A single flattened array containing all items
 */
export function concat<T>(...items: (T | T[])[]): T[] {
    return items.flat() as T[];
}
