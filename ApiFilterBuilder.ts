import type {IApiFilterBuilder} from "~/services/api/models/interface/IApiFilterBuilder";
import {EApiFilters} from "~/services/api/models/enum/EApiFilters";
import type {TApiFilters} from "~/services/api/models/type/TApiFilters";
import type {TApiSorters} from "~/services/api/models/type/TApiSorters";

export class ApiFilterBuilder<T = Record<string, any>> implements IApiFilterBuilder<T>{
    private filters: Partial<Record<`${keyof T & string}.${EApiFilters}`, any>> = {};
    private sorters: Array<{ field: string; order: TApiSorters }> = [];

    static serializeParams(filters: Record<string, any>): string {
        const queryParams: string[] = [];

        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'sort' && Array.isArray(value)) { //sorters
                value.forEach((sort: string) => {
                    queryParams.push(`sort=${encodeURIComponent(sort)}`);
                });
            } else { // altri parametri
                if (Array.isArray(value)) {
                    queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
                } else if (value !== null && value !== undefined) {
                    queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
                }
            }
        });

        return queryParams?.length ? `?${queryParams.join('&')}` : '';
    }

    static removeJHipsterStringSuffix (filterKey: string): string {
        const filterTypes = Object.values(EApiFilters);
        const regex = new RegExp(`\\.(${filterTypes.join('|')})$`);
        return filterKey.replace(regex, '');
    };

    static removeJHipsterObjectSuffix(parsedParams: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        Object.keys(parsedParams).forEach((key) => {
            const newKey = ApiFilterBuilder.removeJHipsterStringSuffix(key);
            result[newKey] = parsedParams[key];
        });

        return result;
    };


/*    addFilter<K extends keyof T>(key: K, value: T[K], operator: EApiFilters = EApiFilters.NONE): this {
        let nKey = String(key) as `${keyof T & string}.${EApiFilters}`;

        if (operator !== EApiFilters.NONE) {
            nKey = `${String(key)}.${operator}` as `${keyof T & string}.${EApiFilters}`;
        }
        this.filters[nKey] = value;

        return this;
    }*/

    //overload: se è SPEcIFIED il value è bolean
    addFilter<K extends keyof T>(key: K, value: boolean, operator: EApiFilters.SPECIFIED): this;
    addFilter<K extends keyof T>(key: K, value: T[K], operator?: EApiFilters): this;
    addFilter<K extends keyof T>(key: 'page' | 'size', value: T[K], operator?: EApiFilters.NONE): this;
    addFilter<K extends keyof T>(key: K, value: T[K] | boolean, operator: EApiFilters = EApiFilters.NONE): this {
        // se sono parametri di paginazione non deve esserci l'operatore
        if (key === 'page' || key === 'size') {
            operator = EApiFilters.NONE;
        }

        if (key === 'sort') {
            console.error('usare .addSorter per aggiungere un sorter');
            return this;
        }

        let nKey = String(key) as `${keyof T & string}.${EApiFilters}`;
        if (operator !== EApiFilters.NONE) {
            nKey = `${String(key)}.${operator}` as `${keyof T & string}.${EApiFilters}`;
        }
        this.filters[nKey] = value;
        return this;
    }

    addFilters(filters: Array<{ key: keyof T; value: T[keyof T]; filter: EApiFilters }>): this {
        filters.forEach(({ key, value, filter }) => {
            this.addFilter(key, value, filter);
        });
        return this;
    }

    addKeyValueFilters(
        params: Record<string, any>,
        removeEmpty: boolean = true,
        defaultFilter: EApiFilters = EApiFilters.EQUALS,
        arrayFilter: EApiFilters = EApiFilters.IN
    ): this {
        const filters = Object.entries(params)
            .filter(([_k, value]) => removeEmpty ? value !== null && value !== undefined : value)
            .map(([key, value]) => {
                return  {
                    key: key as keyof T,
                    value: value,
                    filter: Array.isArray(value) ? arrayFilter: defaultFilter
                };
            });
        return this.addFilters(filters);
    }

/*    addSorter(field: string, order: 'asc' | 'desc' = 'asc'): this {
        this.sorters.push({ field, order });
        return this;
    }*/

    // addSorter('field,desc') || addSorter('field','desc')
    addSorter(field: string, order?: TApiSorters): this {
        const nOrder: TApiSorters = order ? order : 'asc';
        if (field.includes(',')) {
            const [fieldName, fieldOrder] = field.split(',');
            this.sorters.push({ field: fieldName, order: order ? nOrder : fieldOrder as TApiSorters });
        } else {
            this.sorters.push({ field:field, order: nOrder });
        }

        return this;
    }

    build(autoReset: boolean = true): TApiFilters<T> {
        const sortersArray = this.sorters.map(({ field, order }) => `${field},${order}`);

        const built = {
            ...this.filters,
            ...sortersArray?.length ? { sort: sortersArray } : {}
        };

        if (autoReset) {
            this.reset();
        }

        return built;
    }

    buildString(autoReset: boolean = true): string {
        const built = this.build(autoReset);
        return ApiFilterBuilder.serializeParams(built);
    }

    buildFromUrlParams(hashMode: boolean = false, autoReset: boolean = true, defaultFilter: EApiFilters = EApiFilters.EQUALS): Partial<TApiFilters<T>> {
        const params = hashMode ? window.location.hash.substring(1) : window.location.search; // Rimuove il simbolo #
        const routeParams: URLSearchParams = new URLSearchParams(params);
        const paramsObj: Record<string, any> = {};

        for (const [key, value] of routeParams.entries()) {
            paramsObj[key] = value;
        }

        this.addKeyValueFilters(paramsObj, false, defaultFilter);

        return this.build(autoReset);
    }

    reset(): this {
        this.filters = {};
        this.sorters = [];
        return this;
    }
}

/* Esempio di utilizzo

const filterBuilder = new ApiFilterBuilder<criteria>();

// ------------------- stringa
const queryString = filterBuilder
	.addFilter('id', 1)
	.addFilter('roles', ['admin', 'user'], EApiFilters.IN)
	.addSorter('id')
	.addSorter('altroSorter', 'desc')
	.buildString();

// --------AsyncData----------- oggetto
const jsonFilters = filterBuilder.addFilters([
	{ key: 'id', value: 2, filter: EApiFilters.EQUALS },
	{ key: 'roles', value: ['editor', 'user'], filter: EApiFilters.IN },
]).build();

// ------------------- KeyValue
const keyValueFilters = filterBuilder.addKeyValueFilters({id: 1, nome: 'Vincenzo'}).build()
const keyValueFilters = filterBuilder.buildFromUrlParams()

// ------------------- reset
filterBuilder.reset(); // per reset dopo aver generato i filtri con filterBuilder.build(autoReset: false)

// ------------------- metodi statici
const obj = {id:1, sort:['id,desc','nome,asc']} //output di filterBuilder.build()
ApiFilterBuilder.serializeParams(obj); // return '?id=1&sort=id,desc&sort=nome,asc'

const str = 'id.equals=1'
ApiFilterBuilder.removeJHipsterStringSuffix(str) // return 'id=1'

const obj = {id.equals:1, sort:['id,desc','nome,asc']}
ApiFilterBuilder.removeJHipsterObjectSuffix(obj) // return '?id=1&sort=id,desc&sort=nome,asc'

*/