export const useApiErrorHandler = () => {
    const analyzeError = (error: any) => {
        const statusCode = error.statusCode || error.response?.status || 500;
        const message = error.message || 'API Error';
        let errorType = 'generic';

        if (statusCode === 401) errorType = 'unauthenticated';
        else if (statusCode === 403) errorType = 'unauthorized';
        else if (statusCode >= 500) errorType = 'server';

        return { statusCode, message, errorType, originalError: error };
    };

    const handleError = (errorInfo: any) => {
        throw createError({
            statusCode: errorInfo.statusCode,
            statusMessage: errorInfo.message,
            fatal: errorInfo.statusCode >= 500,
        });
    }

    return { analyzeError, handleError };
}