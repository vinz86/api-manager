import type {EApiCacheEntry} from "~/services/api/models/enum/EApiCacheEntry";
import type {IApiCacheManager} from "~/services/api/models/interface/IApiCacheManager";

export class ApiCacheManager implements IApiCacheManager {
    private static instances: Map<string, ApiCacheManager> = new Map();
    private cache: Map<string, EApiCacheEntry> = new Map();
    private readonly defaultCacheDuration: number = 5 * 60 * 1000; // 5 minuti

    private constructor(cacheDuration?: number) {
        if (cacheDuration) this.defaultCacheDuration = cacheDuration;
    }

    public static getInstance(instanceKey: string, cacheDuration?: number): ApiCacheManager {
        if (!ApiCacheManager.instances.has(instanceKey)) {
            ApiCacheManager.instances.set(instanceKey, new ApiCacheManager(cacheDuration));
        }
        return ApiCacheManager.instances.get(instanceKey)!;
    }

    public get(key: string): any | null {
        const entry = this.cache.get(key);
        if (entry) {
            const ttl = entry.ttl || this.defaultCacheDuration;
            if ((Date.now() - entry.timestamp) < ttl) {
                return entry.data;
            } else {
                this.cache.delete(key);
            }
        }
        return null;
    }

    public set(key: string, data: any, ttl?: number): void {
        this.cache.set(key, {
            timestamp: Date.now(),
            data: data,
            ttl: ttl || this.defaultCacheDuration
        });
    }

    public clear(): void {
        this.cache.clear();
    }

    public remove(key: string): void {
        this.cache.delete(key);
    }

    //rimuove tutte le chiavi che iniziano con un certo prefisso.
    public removeKeys(prefix: string): void {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    // cancella tutte le chiavi scadute
    public invalidate(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            const ttl = entry.ttl ?? this.defaultCacheDuration;
            if ((now - entry.timestamp) >= ttl) {
                this.cache.delete(key);
            }
        }
    }
}

