import type {EApiResponseType} from "../enum/EApiResponseType";

export interface IApiRequest {
    method: string;
    endpoint: string;
    data?: any;
    queryParams?: Record<string, any>;
    pathParams?: Record<string, any>;
    headers?: Record<string, string> | HeadersInit;
    responseType?: EApiResponseType;
    cached?: boolean | number;
    useAuth?: boolean;
}