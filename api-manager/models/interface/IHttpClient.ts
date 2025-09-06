import type {IApiRequest} from "./../interface/IApiRequest";
import type {IApiResponse} from "./../interface/IApiResponse";
import type {TApiError} from "./../type/TApiError";

export interface IHttpClient {
    request<T>(config: IApiRequest): Promise<IApiResponse<T> | TApiError>;
}