import type { IApiRequest } from "./../interface/IApiRequest";
import type { IApiResponse } from "./../interface/IApiResponse";

export interface IApiClient {
    request<T>(config: IApiRequest): Promise<IApiResponse<T>>;
}