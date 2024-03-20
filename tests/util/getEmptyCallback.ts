import type AnyCallback from '../../src/interfaces/AnyCallback.js';

const EMPTY_CALLBACK = () => {};

export default function getEmptyCallback<T extends AnyCallback>(): T {
    return EMPTY_CALLBACK as T;
}
