import type {IApiRequest} from "./IApiRequest";
import type {IApiResponse} from "./IApiResponse";
import type {TApiError} from "../type/TApiError";

export interface IHttpClient {
    request<T>(config: IApiRequest): Promise<IApiResponse<T> | TApiError>;
}