import {Api} from "~/layers/api-manager";

export const serializeParams = (params: Record<string, any>): string => {
    const queryParams: string[] = []

    Object.entries(params).forEach(([key, value]) => {
        if (key === 'sort' && Array.isArray(value)) {
            value.forEach((sort: string) => {
                queryParams.push(`sort=${encodeURIComponent(sort)}`)
            })
        } else if (Array.isArray(value)) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`)
        } else if (value !== null && value !== undefined) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        }
    })

    return queryParams.length ? `?${queryParams.join('&')}` : ''
}

const getStorageKey = (type: "refresh" | "access" = "access") => type === 'access' ? `at_${Api.getCurrentInstanceKey()}` : `rt_${Api.getCurrentInstanceKey()}`;

export const setApiToken = (token: string, refreshToken?: string): void => {
    try {
        // useCrypto().crypt(token,'vinz').then(encryptedToken=> {
        //     localStorage.setItem(getStorageKey(), encryptedToken);
        // })
        localStorage.setItem(getStorageKey(), token);

        if (refreshToken) {
            // useCrypto().crypt(token,'vinz').then(encryptedRefreshToken=> {
            //     localStorage.setItem(getStorageKey('refresh'), encryptedRefreshToken);
            // })
            localStorage.setItem(getStorageKey('refresh'), refreshToken);
        }

    } catch (error) {
        console.error('Errore nel salvataggio dei token criptati su localStorage:', error);
    }
};

export const getApiToken = (type: 'access' | 'refresh' = 'access'): string | null => {
    try {
        const token = type === 'access'
            ? localStorage.getItem(getStorageKey())
            : localStorage.getItem(getStorageKey('refresh'));

        if (token) {
            // return useCrypto().decrypt(token, 'vinz')
            //     .then(decryptedToken => decryptedToken)
            //     .catch(error => {
            //         console.error('Errore nella decrittazione del token:', error);
            //         return null;
            //     });
            return token;
        }

        return null;
    } catch (error) {
        console.error('Errore nel recupero dei token da localStorage:', error);
        return null;
    }
};


export const removeApiToken = (): void => {
    try {
        localStorage.removeItem(getStorageKey());
        localStorage.removeItem(getStorageKey('refresh'));
    } catch (error) {
        console.error('Errore durante la rimozione del token dal localStorage:', error);
    }
};

export const getApiCookie = (): string | null => {
    try {
        const key = 'authToken';
        const matches = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
        return matches ? decodeURIComponent(matches[1]) : null;
    }
    catch (e) {
        console.error(`Errore nel recupero del cookie:`, e);
        return null;
    }
}