/**
 * Thin HTTP client for future API integration.
 * Mock data stays in place; call these helpers when wiring real endpoints.
 */

function trimSlash(s: string): string {
    return s.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
    const raw = import.meta.env.VITE_API_URL as string | undefined;
    if (!raw) return '';
    return trimSlash(raw.trim());
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const base = getApiBaseUrl();
    const url = path.startsWith('http') ? path : `${base || ''}${path.startsWith('/') ? path : `/${path}`}`;
    if (!base && !path.startsWith('http')) {
        throw new Error('VITE_API_URL is not set; configure the base URL before calling the API.');
    }
    return fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers as Record<string, string>),
        },
    });
}
