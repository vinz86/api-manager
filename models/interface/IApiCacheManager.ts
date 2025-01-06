export interface IApiCacheManager {
    get(key: string): any | null;
    set(key: string, data: any, ttl?: number): void;
    clear(): void;
    remove(key: string): void;
    removeKeys(prefix: string): void;
    invalidate(): void;
}
