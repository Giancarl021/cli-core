import type AnyRecord from './AnyRecord.js';

type DeepPartial<T extends AnyRecord> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export default DeepPartial;
