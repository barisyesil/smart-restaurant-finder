import { apiGet, apiPost } from '@/api/client'
import type { AuthUser } from '@/store/useAuthStore'

interface TokenResponse {
  access_token: string
  token_type: string
}

export function register(email: string, password: string): Promise<TokenResponse> {
  return apiPost<TokenResponse>('/auth/register', { email, password })
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiPost<TokenResponse>('/auth/login', { email, password })
}

export function getMe(): Promise<AuthUser> {
  return apiGet<AuthUser>('/auth/me')
}
