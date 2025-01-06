import {ofetch} from 'ofetch';
import {HttpClientBase} from "./HttpClientBase";
import type {IApiRequest} from "~/services/api/models/interface/IApiRequest";
import type {IApiResponse} from "~/services/api/models/interface/IApiResponse";
import type {TApiError} from "~/services/api/models/type/TApiError";
import {ConfigurationManager} from "~/manager/ConfigurationManager/ConfigurationManager";

export class OFetchClient extends HttpClientBase {

    protected convertToIApiError(error: any): TApiError {
        return {
            message: error?.message || 'Errore generico',
            statusCode: error?.response?.status || 500,
            originalError: error,
        };
    }

    protected async fetchData(config: IApiRequest): Promise<any> {
        const { method, endpoint, data, headers } = config;
        const apiUrl = ConfigurationManager.getInstance().getApiBase() + endpoint;

        return await ofetch(apiUrl, {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: data,
        });
    }

    override processResponse<T>(response: any): IApiResponse<T> {
        return {
            data: response,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }
}
