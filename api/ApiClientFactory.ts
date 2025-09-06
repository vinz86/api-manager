import type {IHttpClient} from "~/layers/api-manager";
import {EApiHttpClientType} from "~/layers/api-manager";
import {FetchClient} from "./clients/FetchClient";
import {OFetchClient} from "./clients/OFetch";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ApiClientFactory {
    static createClient(type: EApiHttpClientType, apiBaseUrl?: string): IHttpClient {
        let client: IHttpClient;

        switch (type) {
            case EApiHttpClientType.Axios:
                client = new OFetchClient(apiBaseUrl);
                break;
            case EApiHttpClientType.OFetch:
                client = new OFetchClient(apiBaseUrl);
                break;
            case EApiHttpClientType.Fetch:
            default:
                client = new FetchClient(apiBaseUrl);
        }
        return client;
    }
}