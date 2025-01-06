import type {EApiResponseType} from "~/services/api/models/enum/EApiResponseType";

export interface IApiRequest {
    method: string;
    endpoint: string;
    data?: any;
    queryParams?: Record<string, any>;
    pathParams?: Record<string, any>;
    headers?: HeadersInit;
    responseType?: EApiResponseType;
    cached?: boolean | number;
    useAuth?: boolean;
}