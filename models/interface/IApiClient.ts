import type { IApiRequest } from "~/services/api/models/interface/IApiRequest";
import type { IApiResponse } from "~/services/api/models/interface/IApiResponse";

export interface IApiClient {
    request<T>(config: IApiRequest): Promise<IApiResponse<T>>;
}