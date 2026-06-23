const BASE_URL = "http://localhost:3333/api"
const TOKEN_KEY = "auth_token"

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function hasToken(): boolean {
    return getToken() !== null
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken()

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? "erro inesperado no servidor")
    }

    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
}

export function get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" })
}

export function post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, { method: "POST", body: JSON.stringify(body) })
}

export function del<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" })
}