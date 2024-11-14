import type Nullable from './Nullable.js';
import type Undefinable from './Undefinable.js';

/**
 * Represents a value that can be either null, undefined or a value of type T.
 */
type Maybe<T> = Nullable<T> | Undefinable<T>;

export default Maybe;
