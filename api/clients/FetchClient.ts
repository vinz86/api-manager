import {HttpClientBase} from "./HttpClientBase";
import { EApiAuthType } from "../../models/enum/EApiAuthType";
import { EApiResponseType } from "../../models/enum/EApiResponseType";
import type { IApiRequest } from "../../models/interface/IApiRequest";
import type { IApiResponse } from "../../models/interface/IApiResponse";
import type { TApiError } from "../../models/type/TApiError";
import {useAuthStore} from "~/stores/authStore";

export class FetchClient extends HttpClientBase {
    protected convertToIApiError(error: {errorMessage: string, response: Response} ): TApiError {
        return {
            message: error?.errorMessage || 'Errore http generico',
            statusCode: error?.response.status,
            originalError: error?.response,
        };
    }

    protected async fetchData(config: IApiRequest): Promise<Response> {
        const { method, endpoint, data, headers } = config;
        let fullUrl = endpoint;
        if (!endpoint.startsWith('http') && this.apiBaseUrl) {
            fullUrl = this.apiBaseUrl + (endpoint.startsWith('/') ? endpoint.substring(1) : endpoint);
        }

        const fetchConfig: RequestInit = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            }
        };

        if(useAuthStore().getAuthType() === EApiAuthType.COOKIE)
            fetchConfig['credentials'] = 'include' as RequestCredentials;

        const methodsWithBody = ['POST', 'PUT', 'PATCH'];
        if (data && methodsWithBody.includes(fetchConfig.method as string)) {
            fetchConfig.body = JSON.stringify(data);
        }

        return await fetch(fullUrl, fetchConfig);
    }

    override async processResponse<T>(res: Response, responseType: EApiResponseType): Promise<IApiResponse<T>> {
        if (!res.ok) {
            const errorMessage = `${res.status} - ${res.statusText}: ${res.url}`;
            throw this.convertToIApiError({ errorMessage: errorMessage, response: res });
        }

        let responseData: any;
        switch (responseType) {
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
            case EApiResponseType.JSON:
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
