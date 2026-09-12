import { apiFetch } from './client'
import type { RecallDocument } from '../types'

export const listDocuments = (spaceId: string) =>
  apiFetch<RecallDocument[]>(`/spaces/${spaceId}/documents`)

export const uploadDocument = (spaceId: string, file: File) => {
  const body = new FormData()
  body.append('file', file)
  return apiFetch<RecallDocument>(`/spaces/${spaceId}/documents`, { method: 'POST', body })
}

export const getDocumentStatus = (spaceId: string, documentId: string) =>
  apiFetch<Pick<RecallDocument, 'status' | 'errorMessage'>>(
    `/spaces/${spaceId}/documents/${documentId}/status`,
  )

export const deleteDocument = (spaceId: string, documentId: string) =>
  apiFetch<void>(`/spaces/${spaceId}/documents/${documentId}`, { method: 'DELETE' })