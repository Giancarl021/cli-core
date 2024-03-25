import type { expect } from '@jest/globals';
import AnyCallback from '../../src/interfaces/AnyCallback.js';

export type FunctionMatcher = ReturnType<(typeof expect)['any']>;

export type MockInstance<T extends Record<string, AnyCallback>> = Record<
    keyof T,
    FunctionMatcher
>;

export type MockService<
    T extends (..._args: Parameters<AnyCallback>) => Record<string, AnyCallback>
> = Record<keyof ReturnType<T>, FunctionMatcher>;
