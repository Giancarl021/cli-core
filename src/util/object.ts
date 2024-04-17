import AnyRecord from '../interfaces/AnyRecord.js';

export function size<T extends AnyRecord>(object: T): number {
    return Object.keys(object).length;
}

export function isEmpty<T extends AnyRecord>(object: T): boolean {
    return size(object) === 0;
}
