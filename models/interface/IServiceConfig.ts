export interface IServiceConfig {
    singleton?: boolean; // il servizio deve essere trattato come singleton?
    replace?: boolean; // se il servizio è gia registrato lo sovrascrive?
}
