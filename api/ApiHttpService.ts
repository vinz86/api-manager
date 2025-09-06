import type { IApiRequest } from "../models/interface/IApiRequest";
import type { IApiResponse } from "../models/interface/IApiResponse";
import type { THttpServiceConfig } from "../models/type/THttpServiceConfig";
import { Api, ApiClient } from "~/layers/api-manager";
import {serializeParams} from "./ApiUtils";

export class ApiHttpService {
    private readonly apiClient: ApiClient;

    constructor() {
        const currentInstanceKey = Api.getCurrentInstanceKey();
        this.apiClient = ApiClient.getInstanceWithKey(currentInstanceKey);
        console.log('currentInstanceKey', currentInstanceKey);
    }

    protected request<T>(config: IApiRequest, wrapped: boolean = true): Promise<T | IApiResponse<T>> {
        return this.apiClient.request<T>(config).then(response => wrapped ? response : response.data);
    }

    protected get<T>(endpoint: string, queryParams?: Record<string, any>, data?: any, useAuth: boolean = true, cached: boolean = false, wrapped: boolean = true): Promise<T | IApiResponse<T>> {
        return this._makeRequest<T>('GET', endpoint, queryParams, undefined, {cached, useAuth, wrapped});
    }

    protected post<T>(endpoint: string, data?: any, useAuth: boolean = true, cached: boolean = false): Promise<T> {
        return this._makeRequest<T>('POST', endpoint, undefined, data, { useAuth, cached, wrapped: false }) as Promise<T>;
    }

    protected put<T>(endpoint: string, data?: any, useAuth: boolean = true, cached: boolean = false): Promise<T> {
        return this._makeRequest<T>('PUT', endpoint, undefined, data, { useAuth, cached, wrapped: false }) as Promise<T>;
    }

    protected patch<T>(endpoint: string, data?: any, useAuth: boolean = true, cached: boolean = false): Promise<T> {
        return this._makeRequest<T>('PATCH', endpoint, undefined, data, { useAuth, cached, wrapped: false }) as Promise<T>;
    }

    protected delete<T>(endpoint: string, queryParams?: Record<string, any>, useAuth: boolean = true, cached: boolean = false): Promise<T> {
        return this._makeRequest<T>('DELETE', endpoint, queryParams, undefined, { useAuth, cached, wrapped: false }) as Promise<T>;
    }

    private _makeRequest<T>(
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        endpoint: string,
        queryParams?: Record<string, any>,
        data?: any,
        config: THttpServiceConfig = {}
    ): Promise<T | IApiResponse<T>> {
        const { useAuth = true, cached = false, wrapped = method === 'GET' } = config;

        const queryString = queryParams && typeof queryParams === 'object' && Object.keys(queryParams).length > 0
            ? serializeParams(queryParams)
            : queryParams && typeof queryParams === 'string'
                ? queryParams
                : '';

        return this.apiClient.request<T>({
            method,
            endpoint: `${endpoint}${queryString}`,
            data,
            cached,
            useAuth,
        }).then(response => wrapped ? response : (response as IApiResponse<T>).data);
    }
}
