import { ApiClient } from "~/layers/api-manager/api/ApiClient";
import { useApiErrorHandler} from "#layers/api-manager/composables/useApiErrorHandler";
import type { IApiRequest } from "../models/interface/IApiRequest";

export const useApiClient = (instanceKey: string = 'default') => {
    const { handleError } = useApiErrorHandler();
    const apiClient = ApiClient.getInstanceWithKey(instanceKey);

    const request = async <T>(config: IApiRequest): Promise<T> => {
        try {
            const response = await apiClient.request<T>(config);
            return response.data;
        } catch (error) {
            handleError(error);
            throw error;
        }
    }

    const get = async <T>(endpoint: string, params?: Record<string, any>, config: Partial<IApiRequest> = {}): Promise<T> => {
        return request<T>({
            method: 'GET',
            endpoint,
            queryParams: params,
            cached: true,
            ...config
        });
    }

    const post = async <T>(endpoint: string, data?: any, config: Partial<IApiRequest> = {}): Promise<T> => {
        return request<T>({
            method: 'POST',
            endpoint,
            data,
            ...config
        });
    }

    const put = async <T>(endpoint: string, data?: any, config: Partial<IApiRequest> = {}): Promise<T> => {
        return request<T>({
            method: 'PUT',
            endpoint,
            data,
            ...config
        });
    }

    const patch = async <T>(endpoint: string, data?: any, config: Partial<IApiRequest> = {}): Promise<T> => {
        return request<T>({
            method: 'PATCH',
            endpoint,
            data,
            ...config
        });
    }

    const del = async <T>(endpoint: string, config: Partial<IApiRequest> = {}): Promise<T> => {
        return request<T>({
            method: 'DELETE',
            endpoint,
            ...config
        });
    }

    return {
        request,
        get,
        post,
        put,
        patch,
        delete: del,
        rawClient: apiClient
    };
}
