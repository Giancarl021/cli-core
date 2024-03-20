import type Nullable from './Nullable.js';
import type Undefinable from './Undefinable.js';

type Maybe<T> = Nullable<T> | Undefinable<T>;

export default Maybe;
