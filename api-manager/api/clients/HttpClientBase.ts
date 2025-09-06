import type { IHttpClient, IApiRequest, IApiResponse, TApiError, EApiResponseType  } from '~/layers/api-manager';

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