import { ref } from 'vue'

export interface ApiCacheEntry {
    timestamp: number
    data: any
    ttl: number
}

export const useApiCache = (instanceKey: string = 'default', defaultTtl: number = 300000) => {
    const cache = ref(new Map<string, ApiCacheEntry>())

    const get = (key: string): any | null => {
        const entry = cache.value.get(key)
        if (entry && (Date.now() - entry.timestamp) < entry.ttl) {
            return entry.data
        }
        if (entry) cache.value.delete(key)
        return null
    }

    const set = (key: string, data: any, ttl?: number): void => {
        cache.value.set(key, {
            timestamp: Date.now(),
            data,
            ttl: ttl || defaultTtl
        })
    }

    const clear = (): void => {
        cache.value.clear()
    }

    const remove = (key: string): void => {
        cache.value.delete(key)
    }

    const removeKeys = (prefix: string): void => {
        const keys = Array.from(cache.value.keys())
            .filter(key => key.startsWith(prefix))
        keys.forEach(key => cache.value.delete(key))
    }

    const invalidate = (): void => {
        const now = Date.now()
        Array.from(cache.value.entries()).forEach(([key, entry]) => {
            if ((now - entry.timestamp) >= entry.ttl) {
                cache.value.delete(key)
            }
        })
    }

    return {
        get,
        set,
        clear,
        remove,
        removeKeys,
        invalidate
    }
}