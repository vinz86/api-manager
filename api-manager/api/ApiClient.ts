import { useApiCache } from "../composables/useApiCache";
import type { IHttpClient, IApiResponse, IApiClient, EApiEnvironment, EApiHttpClientType, IApiRequest } from '~/layers/api-manager';
import { ApiClientFactory, EApiAuthType } from '~/layers/api-manager';
import { getApiToken } from "./ApiUtils";

export class ApiClient implements IApiClient {
    private static instances: Map<string, ApiClient> = new Map();
    private cacheManager: ReturnType<typeof useApiCache>;
    private httpClient: IHttpClient;
    readonly authType: EApiAuthType;
    private readonly apiBaseUrl: string;

    private constructor(
        clientType: EApiHttpClientType,
        instanceKey: string,
        cacheDuration: number,
        authType: EApiAuthType = EApiAuthType.LOCALSTORAGE,
        apiBaseUrl?: string
    ) {
        this.cacheManager = useApiCache(instanceKey, cacheDuration);
        this.httpClient = ApiClientFactory.createClient(clientType, apiBaseUrl);
        this.authType = authType;
        this.apiBaseUrl = apiBaseUrl || '';
    }

    public static getInstance(
        instanceKey: string,
        clientType: EApiHttpClientType,
        cacheDuration: number,
        authType: EApiAuthType = EApiAuthType.LOCALSTORAGE,
        apiBaseUrl?: string
    ): ApiClient | undefined {
        if (!ApiClient.instances.has(instanceKey)) {
            ApiClient.instances.set(
                instanceKey,
                new ApiClient(clientType, instanceKey, cacheDuration, authType, apiBaseUrl)
            );
        }
        return ApiClient.instances.get(instanceKey);
    }

    public static getInstanceWithKey(key: EApiEnvironment | string = 'default'): ApiClient {
        if (ApiClient.instances.size < 1 || !ApiClient.instances.has(key)) {
            throw new Error(`L'istanza di ApiClient '${key}' non è inizializzata.`);
        }
        return ApiClient.instances.get(key) as ApiClient;
    }

    public static hasInstances(): boolean {
        return ApiClient.instances.size > 0;
    }

    public static hasInstance(key: EApiEnvironment | string): boolean {
        return this.instances.has(key);
    }

    public static deleteInstance(key: EApiEnvironment | string): void {
        ApiClient.instances.delete(key);
    }

    public async request<T>(config: IApiRequest): Promise<IApiResponse<T>> {
        const { method, endpoint, data, headers, responseType, cached, useAuth } = config;
        if (cached) {
            const cacheKey = this.createCacheKey(config);
            if (cacheKey) {
                const cachedData = this.cacheManager.get(cacheKey);
                if (cachedData) {
                    return Promise.resolve({
                        data: cachedData,
                        status: 200,
                        statusText: 'OK (Cached)',
                        headers: new Headers()
                    });
                }
            }
        }

        const authHeader = await this.prepareAuthHeader(useAuth);
        const requestHeaders = {
            'Content-Type': 'application/json',
            ...authHeader,
            ...headers
        };

        try{
            const params = {
                method,
                endpoint: this.prepareEndpoint(endpoint),
                data,
                headers: requestHeaders,
                responseType
            }

            const response: IApiResponse<T> = await this.httpClient.request<T>(params) as IApiResponse<T>;


            if (cached && response?.data !== undefined && response?.data !== null) {
                const cacheKey = this.createCacheKey(config);
                if (cacheKey) {
                    this.cacheManager.set(
                        cacheKey,
                        response.data,
                        typeof cached === "number" ? cached : undefined
                    );
                }
            }

            return response;
        } catch (error: any) {
            throw error;
        }
    }

    private prepareEndpoint(endpoint: string): string {
        if (endpoint.startsWith('http') || !this.apiBaseUrl) {
            return endpoint;
        }
        return this.apiBaseUrl + (endpoint.startsWith('/') ? endpoint.substring(1) : endpoint);
    }
    private async prepareAuthHeader(useAuth?: boolean): Promise<Record<string, string>> {
        if (useAuth === false) return {};

        if (this.authType === EApiAuthType.COOKIE) {
            return {};
        } else {
            const token = getApiToken();
            return token ? { 'Authorization': `Bearer ${token}` } : {};
        }
    }

    private createCacheKey(config: IApiRequest): string | null {
        if (!config?.endpoint) return null;

        try {
            const url = new URL(this.prepareEndpoint(config.endpoint));
            url.searchParams.sort();

            let key = url.toString();

            //includo body per put, postt, patch, ecc.
            if (config.data !== undefined && config.data !== null && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
                try {
                    key += `:${JSON.stringify(config.data)}`;
                } catch (e) {
                    console.error("Errore nella serializzazione dei dati per la cache key:", e);
                    return null;
                }
            }

            return key;

        } catch (e) {
            console.error("Errore nella creazione della cache key:", e);
            return null;
        }
    }
}