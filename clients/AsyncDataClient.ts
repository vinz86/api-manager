import { ConfigurationManager } from "~/manager/ConfigurationManager/ConfigurationManager";
import { HttpClientBase } from "./HttpClientBase";
import type { IApiRequest } from "~/services/api/models/interface/IApiRequest";
import type { IApiResponse } from "~/services/api/models/interface/IApiResponse";
import type { TApiError } from "~/services/api/models/type/TApiError";
import { EApiResponseType } from "~/services/api/models/enum/EApiResponseType";

export class AsyncDataClient extends HttpClientBase {

    protected convertToIApiError(errorObject: any): TApiError {
        if (errorObject && errorObject._key && errorObject._object) {
            const errorKey = errorObject._key;
            const errorDetails = errorObject._object[errorKey];

            if (!errorKey || !errorDetails) return {
                message: 'Errore sconosciuto',
                statusCode: 500,
                originalError: errorObject,
            };

            return {
                message: errorDetails?.message || 'Errore HTTP generico',
                statusCode: errorDetails?.statusCode || 500,
                originalError: errorObject || {},
            };
        }

        return {
            message: errorObject?.message || 'Errore sconosciuto',
            statusCode: errorObject?.statusCode || 500,
            originalError: errorObject || {},
        };
    }

    protected async fetchData<T>(config: IApiRequest): Promise<any> {
        const { method, endpoint, data, headers, responseType } = config;
        const apiUrl = ConfigurationManager.getInstance().getApiBase() + endpoint;

        const fetchConfig: RequestInit = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            ...(data && { body: JSON.stringify(data) })
        };

        try {
            const { data: responseData, error } = await useAsyncData<T>(
                apiUrl,
                () => fetch(apiUrl, fetchConfig).then(async (res) => {
                    if (res.ok) {
                        switch (responseType) {
                            case EApiResponseType.JSON:
                                return res.status !== 204 ? await res.json() : {};
                            case EApiResponseType.TEXT:
                                return await res.text();
                            case EApiResponseType.BLOB:
                                return await res.blob();
                            case EApiResponseType.FORMDATA:
                                return await res.formData();
                            case EApiResponseType.ARRAY_BUFFER:
                                return await res.arrayBuffer();
                            default:
                                return res.status !== 204 ? await res.json() : {};
                        }
                    } else {
                        throw createError({
                            statusCode: res?.status,
                            statusMessage: `${res?.status} - ${res?.statusText}: ${res?.url}`,
                        });
                    }
                })
            );

            if (error)
                throw error;

            return responseData.value;
        } catch (e) {
            throw this.convertToIApiError(e);
        }
    }

    override processResponse<T>(response: any, responseType: EApiResponseType): IApiResponse<T> {
        let responseData: any;

        switch (responseType) {
            case EApiResponseType.JSON:
                responseData = response;
                break;
            case EApiResponseType.TEXT:
                responseData = response;
                break;
            case EApiResponseType.BLOB:
                responseData = response;
                break;
            case EApiResponseType.FORMDATA:
                responseData = response;
                break;
            case EApiResponseType.ARRAY_BUFFER:
                responseData = response;
                break;
            default:
                responseData = response;
                break;
        }

        return {
            data: responseData,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };
    }
}
