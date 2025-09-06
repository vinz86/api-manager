# API Client e Service Layer

Libreria che fornisce un client HTTP e un service layer per gestire le chiamate API nelle applicazioni.

## Caratteristiche Principali

- Astrazione del Client HTTP: Interfaccia comune per diversi client HTTP (Fetch, OFetch)
- Service Layer: Registrazione e gestione di servizi specifici per endpoint API
- Gestione della Cache: Supporto integrato per cache delle risposte
- Autenticazione: Supporto per diverse strategie (LocalStorage, Cookie)
- Gestione Errori Centralizzata: Meccanismo unificato per errori API
- Multi-Istanza: Configurazioni multiple di client API

## Installazione

1. Copiare la cartella `api-manager` nella cartella `layers`.
2. Aggiungere le interfacce `es. services/interfaces`.
3. Aggiungere le implementazioni `es. services/implementations`.
4. Creare un plugin Nuxt chiamato `plugins/api.init.ts` per inizializzare l'API client.

---

## Inizializzazione (Plugin Nuxt)

Esempio del plugin Nuxt:

```typescript
// plugins/api.init.ts
import {defineNuxtPlugin} from '#app';
// import layer
import {ApiInit} from "~/layers/api-manager/services/api/ApiInit";
import {EApiHttpClientType} from "~/layers/api-manager/models/enum/EApiHttpClientType";
import {EApiAuthType} from "~/layers/api-manager/models/enum/EApiAuthType";
import type {TServiceEntry} from "~/layers/api-manager/models/type/TServiceEntry";
//import app
import {ApiKeys} from "~/services/ApiKeys";
import {useConfig} from "~/composables/useConfig/useConfig";
import {PostService} from "~/services/implementations/PostService";
import {MockPostService} from "~/services/implementations/MockPostService";
import {AuthService} from "~/services/implementations/AuthService";

export default defineNuxtPlugin(nuxtApp => {

  const serviceKeys: TServiceEntry[] = [
    { key: ApiKeys.PostService, service: PostService },
    { key: ApiKeys.MockPostService, service: MockPostService },
    { key: ApiKeys.AuthService, service: AuthService },
  ]

  const config = useConfig();
  const instanceKey: string | undefined = undefined; // se c'è una sola istanza ed è undefied si chiamerà 'default'
  const client: EApiHttpClientType = EApiHttpClientType.Fetch;
  const timeout: number = 1000*60*5;
  const authType: EApiAuthType = EApiAuthType.LOCALSTORAGE
  const apiBaseUrl: string = config.getApiBase();
  const apiInstance = new ApiInit(client, timeout, authType, serviceKeys, instanceKey, apiBaseUrl);

  // per esporre l'istanza di ApiInit all'interno dell'applicazione
  nuxtApp.provide('api', apiInstance);
});
```

## Aggiungere un nuovo servizio API

### 1. Creare l'interfaccia

Creare interfaccia (es. `IExampleService.ts`):

```typescript
export interface IExampleService {
    getData(): Promise<string>;
    // ...
}
```

### 2. Creare l'implementazione

Creare l'implementazione (es. `ExampleService.ts`):

```typescript
import { ApiHttpService } from '~/layers/api-manager';
import type { IExampleService } from "~/services/interfaces/IExampleService";

export class ExampleService extends ApiHttpService implements IExampleService {
    async getData(): Promise<string> {
        return await this.get<string>('example-endpoint');
    }
    // ...
}
```

### 3. Aggiungere la key univoca

Aggiungere la chiave nel file `services/ApiKeys.ts`:

```typescript
export const ApiKeys = {
    // ...altre key
    ExampleService: 'ExampleService',
} as const;
```

### 4. Registrare il servizio

Aggiungere i services nel plugin (`plugins/api.init.ts`):

```typescript
import { ExampleService } from "~/services/implementations/ExampleService";

const serviceKeys = [
    { key: ApiKeys.ExampleService, service: ExampleService },
    // ...altri servizi registrati
];
```

## Utilizzo dei servizi

Una volta registrati i servizi, si possono utilizzare nel seguente modo:

```typescript
import { Api } from "~/layers/api-manager";
import { ApiKeys } from "~/services/ApiKeys";
import type { IPostService } from "~/services/implementations/PostService";

// recupero istanza del servizio
const postService = Api.getService<IPostService>(ApiKeys.PostService);

// uso i metodi del servizio
const result = await postService.getPosts();
```
oppure se è esposta l'istanza dell' api layer
```typescript
import { ApiKeys } from "~/services/ApiKeys";
import type { IPostService } from "~/services/implementations/PostService";

const { $api } = useNuxtApp()
const postService = $api.getService<IPostService>(ApiKeys.PostService);

// uso i metodi del servizio
const result = await postService.getPosts();
```

## useApiClient

Un composable che fornisce un accesso semplice, diretto e tipizzato all'ApiClient, con gestione automatica degli errori.

Permette di effettuare chiamate HTTP (GET, POST, PUT, PATCH, DELETE) senza dover creare un servizio dedicato.

### Caratteristiche principali

- Gestione centralizzata degli errori tramite `useApiErrorHandler`
- Supporto per istanze multiple di ApiClient tramite `instanceKey`
- API semplificate per le chiamate HTTP (`get`, `post`, `put`, `patch`, `delete`)
- Pieno supporto TypeScript con tipi generici
- Accesso al `rawClient` per configurazioni avanzate
- Gestione automatica degli errori e delle risposte API

### Importazione

```typescript
import { useApiClient } from '~/layers/api-manager';
```

### Utilizzo
```typescript
const { get, post } = useApiClient();

const posts = await get<PostDTO[]>('/posts');

const newPost = await post<PostDTO>('/posts', { 
  title: 'Nuovo Post', 
  content: 'Contenuto...' 
});

const updatedPost = await put<PostDTO>(`/posts/${id}`, {
  title: 'Titolo modificato'
});

await delete(`/posts/${id}`);
```