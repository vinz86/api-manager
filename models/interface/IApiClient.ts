import type { IApiRequest } from "./IApiRequest";
import type { IApiResponse } from "./IApiResponse";

export interface IApiClient {
    request<T>(config: IApiRequest): Promise<IApiResponse<T>>;
}