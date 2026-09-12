export type User = { id: string; email: string }
export type AuthResponse = { token: string; user: User }

export type KnowledgeSpace = {
  id: string
  name: string
  description: string
  documentCount: number
  createdAt: string
}

export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED'
export type RecallDocument = {
  id: string
  filename: string
  contentType?: string
  sizeBytes?: number
  status: DocumentStatus
  errorMessage?: string | null
  uploadedAt?: string
}

export type ChatSession = { id: string; title: string; createdAt: string }
export type Citation = { documentId: string; filename: string; snippet: string }
export type ChatMessage = {
  role: 'USER' | 'ASSISTANT'
  content: string
  citations?: Citation[]
  createdAt?: string
}