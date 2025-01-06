import {HttpClientBase} from "./HttpClientBase";
import type {IApiRequest} from "~/services/api/models/interface/IApiRequest";
import type {IApiResponse} from "~/services/api/models/interface/IApiResponse";
import type {TApiError} from "~/services/api/models/type/TApiError";
import {ConfigurationManager} from "~/manager/ConfigurationManager/ConfigurationManager";
import {EApiResponseType} from "~/services/api/models/enum/EApiResponseType";

export class FetchClient extends HttpClientBase {
    protected convertToIApiError(error: {errorMessage: string, response: Response} ): TApiError {
        return {
            message: error?.errorMessage || 'Errore http generico',
            statusCode: error?.response.status,
            originalError: error?.response,
        };
    }

    protected async fetchData(config: IApiRequest): Promise<any> {
        const { method, endpoint, data, headers } = config;
        const apiUrl = ConfigurationManager.getInstance().getApiBase() + endpoint;
        const fetchConfig: RequestInit = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            ...(data && { body: JSON.stringify(data) })
        };
        return await fetch(apiUrl, fetchConfig);
    }

    override processResponse<T>(res: any, responseType: EApiResponseType): IApiResponse<T> {
        if (!res.ok) {
            const errorMessage = `${res.status} - ${res.statusText}: ${res.url}`;
            throw this.convertToIApiError({ errorMessage: errorMessage, response: res });
        }

        let responseData: any;

        switch (responseType) {
            case EApiResponseType.JSON:
                responseData = res.status !== 204 ? res.json().then((data: any) => data) : Promise.resolve({});
                break;
            case EApiResponseType.TEXT:
                responseData = res.text().then((data: string) => data);
                break;
            case EApiResponseType.BLOB:
                responseData = res.blob().then((data: Blob) => data);
                break;
            case EApiResponseType.FORMDATA:
                responseData = res.formData().then((data: FormData) => data);
                break;
            case EApiResponseType.ARRAY_BUFFER:
                responseData = res.arrayBuffer().then((data: ArrayBuffer) => data);
                break;
            default:
                responseData = res.status !== 204 ? res.json().then((data: any) => data) : Promise.resolve({});
                break;
        }

        return responseData.then((data: any) => ({
            data: data,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
        }));
    }

}