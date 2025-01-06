import type { IHttpClient} from "~/models/interfaces/IHttpClient";
import { FetchClient} from "~/services/api/clients/FetchClient";
import {EApiHttpClientType} from "~/services/api/models/enum/EApiHttpClientType";
import {AsyncDataClient} from "~/services/api/clients/AsyncDataClient";
import {OFetchClient} from "~/services/api/clients/OFetch";
import {AxiosClient} from "~/services/api/clients/AxiosClient";

export class ApiClientFactory{
    static createClient(type: EApiHttpClientType): IHttpClient {
        let client: IHttpClient;
        switch (type) {
            case EApiHttpClientType.Axios:
                client = new AxiosClient();
                break;
            case EApiHttpClientType.AsyncData:
                client = new AsyncDataClient();
                break;
            case EApiHttpClientType.OFetch:
                client = new OFetchClient();
                break;
            case EApiHttpClientType.Fetch:
            default:
                client = new FetchClient();
        }
        return client;
    }
}