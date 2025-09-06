import type {TServiceFactory} from "./TServiceFactory";
import type {TAsyncServiceFactory} from "./TAsyncServiceFactory";

export type TServiceFactoryType<T> = TServiceFactory<T> | TAsyncServiceFactory<T>;
