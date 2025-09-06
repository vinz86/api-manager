import type { IHttpClient } from '../models/interface/IHttpClient';
import type { IApiRequest } from '../models/interface/IApiRequest';
import type { IApiResponse } from '../models/interface/IApiResponse';
import type { TApiError } from '../models/type/TApiError';
import { EApiResponseType } from '../models/enum/EApiResponseType';

export abstract class HttpClientBase implements IHttpClient {
    protected apiBaseUrl: string;

    public constructor(apiBaseUrl?: string) {
        this.apiBaseUrl = apiBaseUrl || '';

        if (this.apiBaseUrl && !this.apiBaseUrl.endsWith('/')) {
            this.apiBaseUrl += '/';
        }
    }
    
    async request<T>(config: IApiRequest): Promise<IApiResponse<T>> {
        try {
            const response = await this.fetchData(config);
            return this.processResponse<T>(response, config.responseType as EApiResponseType);
        } catch (error) {
            throw this.convertToIApiError(error);
        }
    }


    protected abstract convertToIApiError(error: any): TApiError;

    protected abstract fetchData(config: IApiRequest): Promise<any>;

    protected abstract processResponse<T>(response: any, responseType: EApiResponseType): Promise<IApiResponse<T>>;
}