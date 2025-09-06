import type {IServiceConfig, TServiceFactoryType, TAsyncServiceFactory} from "~/layers/api-manager";

interface ServiceEntry {
  factory: TServiceFactoryType<any>;
  instance: any;
  config: IServiceConfig;
}

type ServiceIdentifierMap = Map<string, ServiceEntry>;

type ScopedServiceRegistry = Map<string, ServiceIdentifierMap>;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Api {
  // private static services: Map<string, Map<string, { factory: TServiceFactoryType<any>, instance: any, config: IServiceConfig }>> = new Map();
  private static services: ScopedServiceRegistry = new Map();
   static currentInstanceKey: string = 'default'; // Chiave di default

  public static setCurrentInstanceKey(instanceKey: string): void {
    this.currentInstanceKey = instanceKey || this.currentInstanceKey;
  }

  public static getCurrentInstanceKey(): string {
    return this.currentInstanceKey;
  }

  public static registerService<T>(
      key: string,
      factory: TServiceFactoryType<T>,
      config: IServiceConfig = { singleton: false, replace: false },
      instanceKey: string = "default"
  ): void {
    if (!Api.services.has(instanceKey)) {
      Api.services.set(instanceKey, new Map());
    }

    const serviceMap = Api.services.get(instanceKey)!;

    if (serviceMap.has(key)) {
      if (config.replace) {
        console.warn(`Il servizio ${key} è già registrato per l'istanza ${instanceKey}. Sovrascrittura in corso.`);
      } else {
        console.warn(`Il servizio ${key} è già registrato per l'istanza ${instanceKey}.`);
        return;
      }
    }

    serviceMap.set(key, { factory, instance: null, config });
  }

  public static getService<T>(key: string, instanceKey: string = "default"): T {
    this.setCurrentInstanceKey(instanceKey); // aggiorno il contesto

    const serviceMap = Api.services.get(instanceKey);

    if (!serviceMap) {
      throw new Error(`Nessun servizio trovato per l'istanza ${instanceKey}.`);
    }

    const currentService = serviceMap.get(key);

    if (!currentService) {
      throw new Error(`Servizio ${key} non trovato per l'istanza ${instanceKey}.`);
    }

    if (currentService.config.singleton) {
      if (!currentService.instance) {
        currentService.instance = currentService.factory();
        if (currentService.instance instanceof Promise) {
          throw new Error(`Servizio ${key} è stato registrato come asincrono. Utilizzare getServiceAsync.`);
        }
      }
      return currentService.instance;
    } else {
      const instance = currentService.factory();
      if (instance instanceof Promise) {
        throw new Error(`Servizio ${key} è stato registrato come asincrono. Utilizzare getServiceAsync.`);
      }
      return instance;
    }
  }

  public static async getServiceAsync<T>(
      key: string,
      instanceKey: string = "default"
  ): Promise<TAsyncServiceFactory<T>> {
    const serviceMap = Api.services.get(instanceKey);

    if (!serviceMap) {
      throw new Error(`Nessun servizio trovato per l'istanza ${instanceKey}.`);
    }

    const currentService = serviceMap.get(key);

    if (!currentService) {
      throw new Error(`Servizio ${key} non trovato per l'istanza ${instanceKey}.`);
    }

    if (currentService.config.singleton) {
      if (!currentService.instance) {
        currentService.instance = await currentService.factory();
      }
      return currentService.instance;
    } else {
      return await currentService.factory() as TAsyncServiceFactory<T>;
    }
  }

  public static removeService(key: string, instanceKey: string = "default"): void {
    const serviceMap = Api.services.get(instanceKey);

    if (serviceMap && serviceMap.has(key)) {
      serviceMap.delete(key);
    } else {
      console.warn(`Il servizio ${key} non è registrato per l'istanza ${instanceKey}.`);
    }
  }

  public static clearServices(instanceKey?: string): void {
    if (instanceKey) {
      Api.services.delete(instanceKey);
    } else {
      Api.services.clear();
    }
  }
}
