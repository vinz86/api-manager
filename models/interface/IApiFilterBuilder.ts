import type { EApiFilters} from "~/services/api/models/enum/EApiFilters";
import type { TApiFilters } from "~/services/api/models/type/TApiFilters";

export interface IApiFilterBuilder<T = Record<string, any>> {
    addFilter<K extends keyof T>(key: K, value: boolean, operator: EApiFilters.SPECIFIED): this;
    addFilter<K extends keyof T>(key: K, value: T[K], operator?: EApiFilters): this;
    addFilter<K extends keyof T>(key: K, value: T[K], operator: EApiFilters): this;
    addFilters(filters: Array<{ key: keyof T; value: T[keyof T]; filter: EApiFilters }>): this;
    addKeyValueFilters(
        params: Record<string, any>,
        removeEmpty?: boolean,
        defaultFilter?: EApiFilters,
        arrayFilter?: EApiFilters
    ): this;
    addSorter(field: string, order?: 'asc' | 'desc'): this;
    build(autoReset?: boolean): TApiFilters<T>;
    buildString(autoReset?: boolean): string;
    buildFromUrlParams(hashMode?: boolean, autoReset?: boolean, defaultFilter?: EApiFilters): Partial<TApiFilters<T>>;
    reset(): this;

    // statici
    //static serializeParams(filters: Record<string, any>): string;
    //static removeJHipsterStringSuffix(filterKey: string): string;
    //static removeJHipsterObjectSuffix(parsedParams: Record<string, any>): Record<string, any>;
}
