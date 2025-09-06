export type TServiceEntry = {
    key: string;
    service: new (...params: any) => any;
    params?: any[];
};