export type Flag = boolean | string | number | null;

export type FlagName = keyof Flags;

type Flags = Record<string, Flag>;

export default Flags;
