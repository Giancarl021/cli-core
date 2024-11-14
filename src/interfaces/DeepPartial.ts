/**
 * Represents a deeply partial object, with all
 * nested properties being optional.
 */
type DeepPartial<T extends object> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export default DeepPartial;
