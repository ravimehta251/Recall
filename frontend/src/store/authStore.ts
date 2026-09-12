import { create } from 'zustand'
import type { AuthResponse, User } from '../types'

type AuthState = {
  token: string | null
  user: User | null
  authenticate: (response: AuthResponse) => void
  logout: () => void
}

const storedUser = localStorage.getItem('recall-user')

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('recall-token'),
  user: storedUser ? JSON.parse(storedUser) : null,
  authenticate: ({ token, user }) => {
    localStorage.setItem('recall-token', token)
    localStorage.setItem('recall-user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('recall-token')
    localStorage.removeItem('recall-user')
    set({ token: null, user: null })
  },
}))