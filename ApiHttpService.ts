import { ApiClient} from "~/services/api/ApiClient";
import {ApiFilterBuilder} from "~/services/api/ApiFilterBuilder";
import type {IApiRequest} from "~/services/api/models/interface/IApiRequest";
import type {IApiResponse} from "~/services/api/models/interface/IApiResponse";
import type {THttpServiceConfig} from "~/services/api/models/type/THttpServiceConfig";
import {Api} from "~/services/api/Api";

export class ApiHttpService {















    private readonly apiClient: ApiClient;

    constructor() {
        const currentInstanceKey = Api.getCurrentInstanceKey();
        this.apiClient = ApiClient.getInstanceWithKey(currentInstanceKey);
        console.log('currentInstanceKey', currentInstanceKey)
        console.log('this.apiClient', this.apiClient)
    }

    protected request<T>(config: IApiRequest, wrapped: boolean = true): Promise<T | IApiResponse<T>> {
        return this.apiClient.request<T>(config).then(response => wrapped ? response : response.data);
    }

   protected get<T>(endpoint: string, queryParams?: Record<string, any>, config: THttpServiceConfig = {}): Promise<T | IApiResponse<T>> {
        config.useAuth = config?.useAuth || true
        config.cached = config?.cached || false
        config.wrapped = config?.wrapped || false

        const queryString = queryParams ? ApiFilterBuilder.serializeParams(queryParams) : '';
        return this.apiClient.request<T>({
            method: 'GET',
            endpoint: `${endpoint}${queryString}`,
            cached: config.cached,
            useAuth: config.useAuth
        }).then(response => config.wrapped ? response : response.data);
    }

    protected post<T>(endpoint: string, data?: any, useAuth: boolean = true): Promise<T> {
        return this.apiClient.request<T>({
            method: 'POST',
            endpoint: endpoint,
            data: data,
            useAuth: useAuth
        }).then(response => response.data);
    }

    protected put<T>(endpoint: string, data?: any, useAuth: boolean = true): Promise<T> {
        return this.apiClient.request<T>({
            method: 'PUT',
            endpoint: endpoint,
            data: data,
            useAuth: useAuth
        }).then(response => response.data);
    }

    protected patch<T>(endpoint: string, data?: any, useAuth: boolean = true): Promise<T> {
        return this.apiClient.request<T>({
            method: 'PATCH',
            endpoint: endpoint,
            data: data,
            useAuth: useAuth
        }).then(response => response.data);
    }

    protected delete<T>(endpoint: string, useAuth: boolean = true): Promise<T> {
        return this.apiClient.request<T>({
            method: 'DELETE',
            endpoint: endpoint,
            useAuth: useAuth
        }).then(response => response.data);
    }
}