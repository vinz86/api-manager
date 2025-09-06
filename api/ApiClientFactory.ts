import type { IHttpClient } from "../models/interface/IHttpClient";
import { EApiHttpClientType } from "../models/enum/EApiHttpClientType";
import { FetchClient } from "./clients/FetchClient";
import { OFetchClient } from "./clients/OFetch";
import { AxiosClient } from './clients/AxiosClient';

type ClientConstructor = { new (apiBaseUrl?: string): IHttpClient; }

const clientMap: Record<EApiHttpClientType, IClientConstructor> = {
    [EApiHttpClientType.Fetch]: FetchClient,
    [EApiHttpClientType.OFetch]: OFetchClient,
    [EApiHttpClientType.Axios]: AxiosClient,
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApiClientFactory {
    static createClient(type: EApiHttpClientType, apiBaseUrl?: string): IHttpClient {
        const ClientConstructor = clientMap[type] || FetchClient; // Fallback a FetchClient
        return new ClientConstructor(apiBaseUrl);
    }
}