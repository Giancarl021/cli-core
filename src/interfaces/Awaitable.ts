/**
 * Represents a value that can be wrapped in a `Promise` or not.
 */
type Awaitable<T = void> = T | Promise<T>;

export default Awaitable;
