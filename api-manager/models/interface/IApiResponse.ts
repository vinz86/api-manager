export interface IApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string> | Headers | undefined;
}
