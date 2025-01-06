import type { EApiHttpClientType } from "~/services/api/models/enum/EApiHttpClientType";
import type { EApiAuthType } from "~/services/api/models/enum/EApiAuthType";
import { ApiClient } from "~/services/api/ApiClient";
import { Api } from "~/services/api/Api";
import { ApiHttpService } from "~/services/api/ApiHttpService";
import type { TServiceEntry } from "~/services/api/models/type/TServiceEntry";
import {EApiKeys} from "~/services/api/models/enum/EApiKeys";
import type {EApiEnvironment} from "~/services/api/models/enum/EApiEnvironment";

export class ApiInit {
    private readonly client: EApiHttpClientType;
    private readonly cacheTimeout: number;
    private readonly authType: EApiAuthType;
    private readonly serviceEntry: TServiceEntry[]
    private readonly instanceKey: string;

    constructor(client: EApiHttpClientType, cacheTimeout: number, authType: EApiAuthType, serviceEntry: TServiceEntry[], instanceKey?: EApiEnvironment | string) {
        this.client = client;
        this.cacheTimeout = cacheTimeout;
        this.authType = authType;
        this.serviceEntry = serviceEntry;

        if (!instanceKey) {
            this.instanceKey = !ApiClient.hasInstances() ? "default" : `${client}_${cacheTimeout}_${authType}`.toLowerCase().replace(/\s+/g, "_");
        } else {
            this.instanceKey = instanceKey
        }

        ApiClient.getInstance(this.instanceKey, this.client, this.cacheTimeout, this.authType);

        this.registerServices();
    }

    private registerServices(): void {
        try {
            // Registra il servizio HttpClient per tutte le istanze
            Api.registerService(EApiKeys.HttpClient, () => new ApiHttpService(), {}, this.instanceKey);

            // Registra i servizi definiti in serviceEntry
            for (const { key, service, params } of this.serviceEntry) {
                Api.registerService(key, () => new service(this.client, ...(params || [])), {}, this.instanceKey);
            }
        } catch (e) {
            console.error(`Errore durante l'inizializzazione dei servizi:`, e);
            throw e;
        }
    }
}
