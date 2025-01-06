/*export type TApiError = [string, {
    message: string;
    statusCode: number;
    originalError: any;
}];*/

export type TApiError =
    | string
    | {
        message: string;
        statusCode: number;
        originalError: any
    };