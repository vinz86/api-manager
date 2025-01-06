import type {TServiceFactory} from "~/services/api/models/type/TServiceFactory";
import type {TAsyncServiceFactory} from "~/services/api/models/type/TAsyncServiceFactory";

export type TServiceFactoryType<T> = TServiceFactory<T> | TAsyncServiceFactory<T>;
