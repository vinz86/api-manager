import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'axios';
import { HttpClientBase } from './HttpClientBase';
import type { IApiRequest, IApiResponse, TApiError, EApiResponseType } from '~/layers/api-manager';

export class AxiosClient extends HttpClientBase {
    private axiosInstance: AxiosInstance;

    constructor(apiBaseUrl?: string) {
        super(apiBaseUrl);
        this.axiosInstance = axios.create({
            baseURL: this.apiBaseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // pe inviare credenziali cookie httpOnly
        });
    }

    protected convertToIApiError(error: AxiosError): TApiError {
        return {
            message: error.message || 'Errore Axios generico',
            statusCode: error.response?.status || 500,
            originalError: error,
        };
    }

    private convertHeadersForAxios(headers: HeadersInit | Record<string, string> | any): Record<string, string> | undefined {
        if(!headers) return {}
        // converte headers in oggetto compatibile con Axios
        return headers instanceof Headers
            ? Object.fromEntries(headers.entries())
            : headers as Record<string, string> | undefined;
    }

    protected async fetchData(config: IApiRequest): Promise<AxiosResponse> {
        const { method, endpoint, data, headers } = config;
        const axiosConfig: AxiosRequestConfig = {
            method: method.toLowerCase(),
            url: endpoint,
            data: data,
            headers: this.convertHeadersForAxios(headers),
        };

        try {
            return await this.axiosInstance.request(axiosConfig);
        } catch (error) {
            throw this.convertToIApiError(error as AxiosError);
        }
    }

    protected async processResponse<T>(response: AxiosResponse<T>, responseType: EApiResponseType): Promise<IApiResponse<T>> {
        return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: this.convertHeadersForAxios(response.headers),
        };
    }
}