import type {IApiRequest} from "~/services/api/models/interface/IApiRequest";
import type {TApiError} from "~/services/api/models/type/TApiError";
import type {EApiHttpClientType} from "~/services/api/models/enum/EApiHttpClientType";
import {ApiCacheManager} from "~/services/api/ApiCacheManager";
import {ApiClientFactory} from "~/services/api/ApiClientFactory";
import type {IHttpClient} from "~/models/interfaces/IHttpClient";
import type {IApiResponse} from "~/services/api/models/interface/IApiResponse";
import {EApiAuthType} from "~/services/api/models/enum/EApiAuthType";
import type {IApiClient} from "~/services/api/models/interface/IApiClient";
import type {EApiEnvironment} from "~/services/api/models/enum/EApiEnvironment";

export class ApiClient implements IApiClient {
    private static instances: Map<string, ApiClient> = new Map();
    private cacheManager: ApiCacheManager;
    private httpClient: IHttpClient;
    private readonly autType: EApiAuthType;

    private constructor(clientType: EApiHttpClientType, instanceKey: string, cacheDuration: number, autType: EApiAuthType = EApiAuthType.LOCALSTORAGE ) {
        this.cacheManager = ApiCacheManager.getInstance(instanceKey, cacheDuration);
        this.httpClient = ApiClientFactory.createClient(clientType);
        this.autType = autType;
    }

    public static getInstance(instanceKey: string, clientType: EApiHttpClientType, cacheDuration: number, authType: EApiAuthType = EApiAuthType.LOCALSTORAGE): ApiClient|undefined {
        if (!ApiClient.instances.has(instanceKey)) {
            ApiClient.instances.set(instanceKey, new ApiClient(clientType, instanceKey, cacheDuration, authType));
        }
        return ApiClient.instances.get(instanceKey);
    }

    public static getInstanceWithKey(key: EApiEnvironment | string = 'default'): ApiClient {
        if (ApiClient.instances.size < 1 || !ApiClient.instances.has(key)) {
            throw new Error(`L'istanza di ApiClient non è inizializzata.`);
        }
        return <ApiClient>ApiClient.instances.get(key);
    }

    public static hasInstances(): boolean {
        return !!ApiClient.instances.size;
    }


    public static deleteInstance(key: EApiEnvironment | string): void {
        ApiClient.instances.delete(key);
    }

    private getToken(){
        try{
            const _token = localStorage.getItem('authToken');
            return _token || null;
        }
        catch (e) {
            console.error(e);
        }
    }

    private getCookie(): string | null{
        try{
            const key = 'authToken';
            const matches = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
            return matches ? decodeURIComponent(matches[1]) : null;
        }
        catch (e) {
            console.error(`Errore nel recupero del cookie:`, e);
            return null;
        }
    }

    public async request<T>(config: IApiRequest): Promise<IApiResponse<T>> {
        const { method, endpoint, data, headers, responseType, cached, useAuth } = config;
        if (cached) {
            const cacheKey = this.createCacheKey(config);
            if(cacheKey) {
                const cachedData = this.cacheManager.get(cacheKey);
                if (cachedData) {
                    return {
                        data: cachedData,
                        status: 200,
                        statusText: 'OK',
                        headers: new Headers()
                    };
                }
            }
        }

        try {
            const newHeaders = (this.autType === EApiAuthType.COOKIE)
                ?  headers
                : {
                    ...headers,
                    'Authorization': this.getToken() && useAuth ? `Bearer ${this.getToken()}` : '',
                }

            const response: IApiResponse<T> = await this.httpClient.request<T>({ method, endpoint, data, headers: newHeaders, responseType }) as IApiResponse<T>;

            if (cached && response?.data!==undefined && response?.data!==null) {
                const cacheKey = this.createCacheKey(config);
                if(cacheKey)
                    this.cacheManager.set(cacheKey, response.data,  typeof cached === "number" ? cached : undefined);
            }

            return response;
        } catch (error) {
            this.handleError(error as TApiError);
            if( error && typeof error === 'object' && 'message' in error) {
                throw [error.message, error];
            }
            throw error;
        }
    }

    private handleError(error: TApiError): void {
        if(typeof error !== 'string' && 'statusCode' in error) {
            switch (error.statusCode) {
                case 401:
                    navigateTo('/login');
                    break;
                case 403:
                    navigateTo('/unauthorized');
                    break;
                case 500:
                    navigateTo('/error');
                    break;
                default:
            }
        }
    }

    private createCacheKey(config: IApiRequest): string|null {
        if(!config?.endpoint)
            return null;

        const endpoint = (typeof config.data !== 'object' && config.endpoint?.endsWith('?')) ? config.endpoint.substring(0, config.endpoint.length -1) : config.endpoint;
        const data = (typeof config.data === 'object') ? `:${JSON.stringify(config.data)}` : '';

        return `${endpoint}${data}`;
    }
}
