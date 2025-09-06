interface QueryBuilder<T = Record<string, any>> {
    filters: Record<string, any>
    addFilter: (key: keyof T, value: any) => QueryBuilder<T>
    build: () => Record<string, any>
    buildString: () => string
    reset: () => void
}

export const useFilterBuilder = <T = Record<string, any>>(): QueryBuilder<T> => {
    const filters = ref<Record<string, any>>({})

    const addFilter = (key: keyof T, value: any): QueryBuilder<T> => {
        filters.value[key as string] = value
        return instance
    }

    const build = (autoReset = true): Record<string, any> => {
        const result = { ...filters.value }

        if (autoReset)
            reset();

        return result
    }

    const buildString = (autoReset = true): string => {
        const params = build(autoReset)
        const queryParams: string[] = []

        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`)
            } else if (value !== null && value !== undefined) {
                queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            }
        })

        return queryParams.length ? `?${queryParams.join('&')}` : ''
    }

    const reset = (): void => {
        filters.value = {}
    }

    const instance: QueryBuilder<T> = {
        filters: filters.value,
        addFilter,
        build,
        buildString,
        reset
    }

    return instance
}