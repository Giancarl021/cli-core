/**
 * Represents the value type a flag can have.
 */
export type Flag = boolean | string | number | null;

/**
 * Represents a Record of flags in a command.
 * The key is the flag name and the value is the flag value.
 */
type Flags = Record<string, Flag>;

export default Flags;
