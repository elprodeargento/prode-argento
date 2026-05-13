import { createClient } from '@/utils/supabase/client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

async function getToken(): Promise<string | undefined> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken()
  const isFormData = options.body instanceof FormData

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    const msg = json?.message ?? `Error ${res.status}`
    const err = new Error(Array.isArray(msg) ? msg[0] : msg) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res.json()
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`PATCH ${path} failed: ${res.status}`)
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status}`)
  return res.json()
}
