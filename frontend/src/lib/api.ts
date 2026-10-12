
import type {
    LoginFormData,
    RegisterFormData,
} from '@/schemas/auth.schema';

import type {
    Area,
    AuthUser,
    LoginResponse,
} from '@/types/auth.types';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:3000/api';

interface ApiRequestOptions extends RequestInit {
    authenticated?: boolean;
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return localStorage.getItem('access_token');
}

export function saveAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
}

export function clearAccessToken(): void {
    localStorage.removeItem('access_token');
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const {
        authenticated = true,
        headers,
        ...requestOptions
    } = options;

    const token = authenticated ? getAccessToken() : null;
    const requestHeaders = new Headers(headers);

    if (
        requestOptions.body &&
        !requestHeaders.has('Content-Type')
    ) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    if (token) {
        requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    let response: Response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            ...requestOptions,
            headers: requestHeaders,
            cache: 'no-store',
        });
    } catch {
        throw new Error(
            'Não foi possível conectar à API. Verifique se o backend está em execução.',
        );
    }

    const responseText = await response.text();
    let responseBody: unknown = null;

    if (responseText) {
        try {
            responseBody = JSON.parse(responseText);
        } catch {
            responseBody = responseText;
        }
    }

    if (!response.ok) {
        const body = responseBody as {
            message?: string | string[];
        } | null;

        const message =
            body &&
                typeof body === 'object' &&
                'message' in body
                ? body.message
                : `A requisição falhou (${response.status}).`;

        throw new Error(
            Array.isArray(message)
                ? message.join(', ')
                : typeof message === 'string'
                    ? message
                    : `A requisição falhou (${response.status}).`,
        );
    }

    return responseBody as T;
}

export async function login(
    payload: LoginFormData,
): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        authenticated: false,
        body: JSON.stringify(payload),
    });
}

export async function register(
    payload: RegisterFormData,
): Promise<unknown> {
    return apiRequest<unknown>('/auth/register', {
        method: 'POST',
        authenticated: false,
        body: JSON.stringify(payload),
    });
}

export async function getCurrentUser(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/auth/me');
}

export async function getAreas(): Promise<Area[]> {
    const result = await apiRequest<Area[]>('/areas');

    if (!Array.isArray(result)) {
        throw new Error(
            'A API retornou um formato inesperado ao consultar as áreas.',
        );
    }

    return result.filter((area) => area.isActive);
}

export interface RequestStats {
    total: number;
    open: number;
    inAnalysis: number;
    approved: number;
    rejected: number;
    byPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
    };
}

export async function getRequestStats(): Promise<RequestStats> {
    return apiRequest<RequestStats>('/requests/stats');
}
