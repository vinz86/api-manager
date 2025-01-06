Ricordarsi di aggiungere le Keys in ApiKeys, i servizi in ApiInit ed infine di creare il plugin per registrare i servizi,

```vue
export default defineNuxtPlugin(nuxtApp => {
    ApiInit.getInstance(EApiHttpClientType.AsyncData, 10000, EApiAuthType.LOCALSTORAGE);
});
```

Per importare i servizi:
```vue

Api.getService<T>(ApiKeys);
```