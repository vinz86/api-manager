import type { EApiHttpClientType, EApiAuthType, TServiceEntry, EApiEnvironment} from "~/layers/api-manager";
import { Api, ApiClient, ApiHttpService } from "~/layers/api-manager";

export class ApiInit {
    private readonly client: EApiHttpClientType;
    private readonly cacheTimeout: number;
    private readonly authType: EApiAuthType;
    private readonly serviceEntry: TServiceEntry[]
    private readonly instanceKey: string;
    private readonly apiBaseUrl?: string;

    constructor(
        client: EApiHttpClientType,
        cacheTimeout: number,
        authType: EApiAuthType,
        serviceEntry: TServiceEntry[],
        instanceKey?: EApiEnvironment | string,
        apiBaseUrl?: string
    ) {
        this.client = client;
        this.cacheTimeout = cacheTimeout;
        this.authType = authType;
        this.serviceEntry = serviceEntry;
        this.apiBaseUrl = apiBaseUrl;

        if (instanceKey) {
            if (ApiClient.hasInstance(instanceKey)) {
                throw new Error(`L'istanza con chiave '${instanceKey}' è già registrata.`);
            }
            this.instanceKey = instanceKey;
        } else {
            if(!ApiClient.hasInstances()) {
                this.instanceKey = "default"
            } else {
                throw new Error(`L'istanza "default" esiste già.\n Se vuoi creare una nuova istanza, devi specificare un' instanceKey.`);
            }
        }

        const clientInstance = ApiClient.getInstance(this.instanceKey, this.client, this.cacheTimeout, this.authType, this.apiBaseUrl);
        if (!clientInstance) {
            throw new Error(`Impossibile ottenere l'istanza di ApiClient con la chiave ${this.instanceKey}`);
        }
        this.registerServices();
    }

    private registerServices(): void {
        try {
            // Registra il servizio HttpClient per tutte le istanze
            //Api.registerService('http', () => new ApiHttpService(), {}, this.instanceKey);

            //registro i servizi definiti in serviceEntry
            for (const entry of this.serviceEntry) {
                if (!entry.key || !entry.service) {
                    console.error(`Errore: manca key o service`);
                    continue;
                }
                Api.registerService(entry.key, () => new entry.service(this.client, ...(entry.params || [])), {}, this.instanceKey);
            }
        } catch (e) {
            console.error(`Errore durante l'inizializzazione dei servizi:`, e);
            throw e;
        }
    }
}
