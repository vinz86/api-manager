import { useFilterBuilder } from './useFilterBuilder'
import { useJhipsterFilterBuilder } from './useJhipsterFilterBuilder'

export const useFilters = <T = Record<string, any>>(jhipsterMode = false) => {
    return jhipsterMode
        ? useJhipsterFilterBuilder<T>()
        : useFilterBuilder<T>()
}