import {HttpClientBase} from "./HttpClientBase";
import type {IApiRequest} from "~/services/api/models/interface/IApiRequest";
import type {TApiError} from "~/services/api/models/type/TApiError";
import {ConfigurationManager} from "~/manager/ConfigurationManager/ConfigurationManager";
import axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";

export class AxiosClient extends HttpClientBase {

    protected convertToIApiError(error: any): TApiError {
        const statusCode = error?.response?.status || 500;
        const message = error?.response?.statusText || 'Errore http generico';
        const originalError = error?.response?.data || error;

        return {
            message: message,
            statusCode: statusCode,
            originalError: originalError,
        };
    }

    protected async fetchData(config: IApiRequest): Promise<any> {
        const { method, endpoint, data, headers, responseType } = config;
        const apiUrl = ConfigurationManager.getInstance().getApiBase() + endpoint;
        const axiosConfig: AxiosRequestConfig = {
            method: method as AxiosRequestConfig['method'],
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                ...headers  as AxiosRequestConfig['headers'],
            },
            data: data,
            responseType: responseType as AxiosRequestConfig['responseType']
        };

        return await axios(axiosConfig) as AxiosResponse;
    }
}