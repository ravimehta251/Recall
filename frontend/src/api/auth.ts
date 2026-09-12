import { apiFetch } from './client'
import type { AuthResponse } from '../types'

export const login = (email: string, password: string) =>
  apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const signup = (email: string, password: string) =>
  apiFetch<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) })