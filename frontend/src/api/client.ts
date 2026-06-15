import { useAuthStore } from '@/store/useAuthStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, { headers: authHeaders() })
  if (!response.ok) {
    throw new Error(`API hatası: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = new Error(`API hatası: ${response.status}`)
    Object.assign(error, { status: response.status })
    throw error
  }
  return response.json() as Promise<T>
}
