import { EApiFilters } from '~/layers/api-manager'
import {serializeParams} from "~/layers/api-manager/api/ApiUtils";

type TAddFilter<T> = {
    <K extends keyof T>(key: K, value: boolean, operator: EApiFilters.SPECIFIED): JhipsterQueryBuilder<T>;
    <K extends keyof T>(key: K, value: T[K], operator?: EApiFilters): JhipsterQueryBuilder<T>;
    <K extends 'page' | 'size'>(key: K, value: string | number, operator?: EApiFilters.NONE): JhipsterQueryBuilder<T>;
    (key: keyof T, value: any, operator?: EApiFilters): JhipsterQueryBuilder<T>;
};

type TApiSorters = 'asc' | 'desc';

interface JhipsterQueryBuilder<T = Record<string, any>> {
    filters: Partial<Record<`${keyof T & string}.${EApiFilters}`, any>>
    sorters: Array<{ field: string; order: TApiSorters }>
    addFilter: TAddFilter<T>
    addSorter: (field: string, order?: TApiSorters) => JhipsterQueryBuilder<T>
    build: () => Record<string, any>
    buildString: () => string
    removeSuffixes: (params: Record<string, any>) => Record<string, any>
    reset: () => void
}

export const useJhipsterFilterBuilder = <T = Record<string, any>>(): JhipsterQueryBuilder<T> => {
    const filters = ref<Partial<Record<`${keyof T & string}.${EApiFilters}`, any>>>({})
    const sorters = ref<Array<{ field: string; order: TApiSorters }>>([])

    // const addFilter = (key: keyof T, value: any, operator: EApiFilters = EApiFilters.NONE): JhipsterQueryBuilder<T> => {
    const addFilter: JhipsterQueryBuilder<T>['addFilter'] =
        (key: any, value: any, operator = EApiFilters.NONE): JhipsterQueryBuilder<T> => {

        if (key === 'page' || key === 'size') {
            operator = EApiFilters.NONE
        }

        if (key === 'sort') {
            console.error('Usa addSorter per aggiungere i sorters')
            return instance
        }

        let nKey = String(key) as `${keyof T & string}.${EApiFilters}`
        if (operator !== EApiFilters.NONE) {
            nKey = `${String(key)}.${operator}` as `${keyof T & string}.${EApiFilters}`
        }

        filters.value[nKey] = value
        return instance
    }

    const addSorter = (field: string, order?: TApiSorters): JhipsterQueryBuilder<T> => {
        const nOrder: TApiSorters = order ? order : 'asc'

        if (field.includes(',')) {
            const [fieldName, fieldOrder] = field.split(',')
            sorters.value.push({ field: fieldName, order: order ? nOrder : fieldOrder as TApiSorters })
        } else {
            sorters.value.push({ field, order: nOrder })
        }

        return instance
    }

    const build = (autoReset = true): Record<string, any> => {
        const sortParams = sorters.value.map(s => `${s.field},${s.order}`)
        const result = { ...filters.value }

        if (sortParams.length) {
            result.sort = sortParams
        }

        if (autoReset) {
            reset()
        }

        return result
    }

    const buildString = (autoReset = true): string => {
        const params = build(autoReset)
        return serializeParams(params)
    }

    const removeSuffixes = (params: Record<string, any>): Record<string, any> => {
        const result: Record<string, any> = {}

        Object.keys(params).forEach((key) => {
            const newKey = removeSuffix(key)
            result[newKey] = params[key]
        })

        return result
    }

    const removeSuffix = (key: string): string => {
        const filterTypes = Object.values(EApiFilters)
        const regex = new RegExp(`\\.(${filterTypes.join('|')})$`)
        return key.replace(regex, '')
    }

    const reset = (): void => {
        filters.value = {}
        sorters.value = []
    }

    const instance: JhipsterQueryBuilder<T> = {
        filters: filters.value,
        sorters: sorters.value,
        addFilter,
        addSorter,
        build,
        buildString,
        removeSuffixes,
        reset
    }

    return instance
}