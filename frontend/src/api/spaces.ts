import { apiFetch } from './client'
import type { KnowledgeSpace } from '../types'

export const listSpaces = () => apiFetch<KnowledgeSpace[]>('/spaces')
export const createSpace = (name: string, description: string) =>
  apiFetch<KnowledgeSpace>('/spaces', { method: 'POST', body: JSON.stringify({ name, description }) })
export const deleteSpace = (id: string) => apiFetch<void>(`/spaces/${id}`, { method: 'DELETE' })