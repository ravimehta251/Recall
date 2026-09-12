import { API_BASE, ApiError, apiFetch, authHeaders } from './client'
import type { ChatMessage, ChatSession, Citation } from '../types'

export const listSessions = (spaceId: string) => apiFetch<ChatSession[]>(`/spaces/${spaceId}/sessions`)
export const createSession = (spaceId: string) =>
  apiFetch<ChatSession>(`/spaces/${spaceId}/sessions`, { method: 'POST' })
export const getMessages = (sessionId: string) =>
  apiFetch<ChatMessage[]>(`/sessions/${sessionId}/messages`)

export type StreamHandlers = {
  onToken: (text: string) => void
  onCitations: (citations: Citation[]) => void
  onDone: () => void
  onError?: (message: string) => void
}

export function parseSseBlock(block: string, handlers: StreamHandlers) {
  let event = 'message'
  const data: string[] = []
  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
  }
  if (!data.length) return
  const payload = JSON.parse(data.join('\n'))
  if (event === 'token') handlers.onToken(payload.text)
  if (event === 'citations') handlers.onCitations(payload)
  if (event === 'done') handlers.onDone()
  if (event === 'error') {
    handlers.onDone() // stop the spinner
    handlers.onError?.(payload.message ?? 'Stream error')
  }
}

export async function streamMessage(sessionId: string, content: string, handlers: StreamHandlers) {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.message ?? 'Could not send message')
  }
  if (!response.body) throw new Error('Streaming is not supported by this browser')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value, { stream: !done }).replaceAll('\r\n', '\n')
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() ?? ''
    blocks.filter(Boolean).forEach((block) => parseSseBlock(block, handlers))
    if (done) break
  }
  if (buffer.trim()) parseSseBlock(buffer, handlers)
}