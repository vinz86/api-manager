import type {EApiFilters} from "~/services/api/models/enum/EApiFilters";

// export type TApiFilters<T> = Record<`${keyof T & string}.${EApiFilters}`, any>;
// export type TApiFilters<T> = Record<`${keyof T & string}.${EApiFilters}`, any> | Record<`${keyof T & string}`, any>;

export type TApiFilters<T> = {
    [K in keyof T & string]?: T[K] | { [operator in EApiFilters]?: T[K] };
};

