// Demo plugin da inserire nell'app principale

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
