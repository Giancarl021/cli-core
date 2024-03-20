export function concat<T>(...items: (T | T[])[]): T[] {
    return items.flat() as T[];
}
