import type { TApiError } from "~/services/api/models/type/TApiError";
import type { IHttpClient } from "~/models/interfaces/IHttpClient";
import type { IApiRequest } from "~/services/api/models/interface/IApiRequest";
import type { IApiResponse } from "~/services/api/models/interface/IApiResponse";
import type {EApiResponseType} from "~/services/api/models/enum/EApiResponseType";

export abstract class HttpClientBase implements IHttpClient {

    protected abstract convertToIApiError(error: any): TApiError;

    async request<T>(config: IApiRequest): Promise<IApiResponse<T> | TApiError> {
        try {
            const response = await this.fetchData(config);
            return this.processResponse<T>(response, config.responseType as EApiResponseType);
        } catch (error) {
            return this.convertToIApiError(error);
        }
    }

    protected abstract fetchData(config: IApiRequest): Promise<any>;

    protected processResponse<T>(response: any, responseType: EApiResponseType): IApiResponse<T> {
        let responseData: any;

        switch (responseType) {
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
