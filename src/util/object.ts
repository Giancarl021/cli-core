export function size<T extends object>(object: T): number {
    return Object.keys(object).length;
}

export function isEmpty<T extends object>(object: T): boolean {
    return size(object) === 0;
}
