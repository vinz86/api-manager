import type { FetchError, FetchResponse } from 'ofetch';
import { ofetch } from 'ofetch';
import { HttpClientBase } from './HttpClientBase';
import { EApiAuthType } from '../models/enum/EApiAuthType';
import type { IApiRequest } from '../models/interface/IApiRequest';
import type { IApiResponse } from '../models/interface/IApiResponse';
import type { TApiError } from '../models/type/TApiError';
import type { EApiResponseType} from "../models/enum/EApiResponseType";
import {useAuthStore} from "~/stores/authStore";

export class OFetchClient extends HttpClientBase {

    protected convertToIApiError(error: FetchError): TApiError {
        return {
            message: error.message || 'Errore generico di ofetch',
            statusCode: error.response?.status || 500,
            originalError: error,
        };
    }

    protected async fetchData(config: IApiRequest): Promise<FetchResponse<any>> {
        const { method, endpoint, data, headers, responseType } = config;
        let apiUrl = endpoint;
        if (!endpoint.startsWith('http') && this.apiBaseUrl) {
            apiUrl = this.apiBaseUrl + (endpoint.startsWith('/') ? endpoint.substring(1) : endpoint);
        }

        const fetchConfig: any = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            responseType: responseType ? responseType.toLowerCase() : 'json',
        };

        if(useAuthStore().getAuthType() === EApiAuthType.COOKIE)
            fetchConfig['credentials'] = 'include';

        const methodsWithBody = ['POST', 'PUT', 'PATCH'];
        if (data && methodsWithBody.includes(fetchConfig.method as string)) {
            fetchConfig.body = JSON.stringify(data);
        }

        try {
            return await ofetch(apiUrl, fetchConfig);
        } catch (error) {
            throw this.convertToIApiError(error as FetchError);
        }
    }

    protected async processResponse<T>(response: FetchResponse<T>, responseType: EApiResponseType): Promise<IApiResponse<T>> {
            return {
                data: response as T,
                status: response?.status,
                statusText: response?.statusText,
                headers: response?.headers,
            };
    }
}