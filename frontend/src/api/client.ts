const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function authHeaders(json = true): HeadersInit {
  const token = localStorage.getItem('recall-token')
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(!(init.body instanceof FormData)), ...init.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.message ?? 'Request failed')
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export { API_BASE }