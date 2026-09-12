import { ArrowLeft, Files, Menu, PanelRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { createSession, getMessages, listSessions, streamMessage } from '../api/chat'
import { deleteDocument, getDocumentStatus, listDocuments, uploadDocument } from '../api/documents'
import { listSpaces } from '../api/spaces'
import { ChatWindow } from '../components/chat/ChatWindow'
import { DocumentList } from '../components/documents/DocumentList'
import { DocumentUploader } from '../components/documents/DocumentUploader'
import { Sidebar } from '../components/layout/Sidebar'
import type { ChatMessage, ChatSession, KnowledgeSpace, RecallDocument } from '../types'

export function SpacePage() {
  const { spaceId = '' } = useParams()
  const location = useLocation()
  const [space, setSpace] = useState<KnowledgeSpace | null>(location.state?.space ?? null)
  const [documents, setDocuments] = useState<RecallDocument[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [documentsOpen, setDocumentsOpen] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([listDocuments(spaceId), listSessions(spaceId), space ? Promise.resolve(null) : listSpaces()])
      .then(([nextDocuments, nextSessions, spaces]) => {
        if (!alive) return
        setDocuments(nextDocuments)
        setSessions(nextSessions)
        if (spaces) setSpace(spaces.find((item) => item.id === spaceId) ?? null)
        if (nextSessions[0]) void selectSession(nextSessions[0].id)
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load this space'))
    return () => { alive = false }
  }, [spaceId])

  useEffect(() => {
    const pending = documents.filter((document) => document.status === 'PENDING' || document.status === 'PROCESSING')
    if (!pending.length) return
    const timer = window.setInterval(async () => {
      const statuses = await Promise.all(pending.map(async (document) => ({ id: document.id, ...(await getDocumentStatus(spaceId, document.id)) })))
      setDocuments((current) => current.map((document) => ({ ...document, ...statuses.find((status) => status.id === document.id) })))
    }, 2000)
    return () => window.clearInterval(timer)
  }, [documents, spaceId])

  const selectSession = async (id: string) => {
    setActiveId(id)
    setLoadingMessages(true)
    setError('')
    try { setMessages(await getMessages(id)); setSidebarOpen(false) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load messages') }
    finally { setLoadingMessages(false) }
  }

  const startSession = async () => {
    try {
      const session = await createSession(spaceId)
      setSessions((current) => [session, ...current])
      setActiveId(session.id)
      setMessages([])
      setSidebarOpen(false)
      return session.id
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start a conversation')
      return null
    }
  }

  const send = async (content: string) => {
    const sessionId = activeId ?? await startSession()
    if (!sessionId) return
    setError('')
    setStreaming(true)
    setMessages((current) => [...current, { role: 'USER', content }, { role: 'ASSISTANT', content: '' }])
    try {
      await streamMessage(sessionId, content, {
        onToken: (text) => setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, content: message.content + text } : message)),
        onCitations: (citations) => setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, citations } : message)),
        onDone: () => setStreaming(false),
      })
      setSessions(await listSessions(spaceId))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The response stream was interrupted')
    } finally { setStreaming(false) }
  }

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const uploaded = await uploadDocument(spaceId, file)
      setDocuments((current) => [uploaded, ...current])
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not upload document') }
    finally { setUploading(false) }
  }

  const removeDocument = async (document: RecallDocument) => {
    if (!window.confirm(`Delete ${document.filename}?`)) return
    try { await deleteDocument(spaceId, document.id); setDocuments((current) => current.filter((item) => item.id !== document.id)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not delete document') }
  }

  return (
    <div className="workspace page-enter">
      <header className="workspace-header">
        <div className="workspace-title"><Link className="icon-button" to="/" aria-label="Back to spaces"><ArrowLeft size={18} /></Link><div><span className="eyebrow">Knowledge space</span><h1>{space?.name ?? 'Loading space...'}</h1></div></div>
        <div className="workspace-tools"><button className="icon-button bordered" title="Conversations" aria-label="Show conversations" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={18} /></button><button className="icon-button bordered" title="Documents" aria-label="Show documents" onClick={() => setDocumentsOpen(!documentsOpen)}><PanelRight size={18} /></button></div>
      </header>
      <div className={`workspace-grid ${sidebarOpen ? '' : 'sidebar-hidden'} ${documentsOpen ? '' : 'documents-hidden'}`}>
        {sidebarOpen && <Sidebar sessions={sessions} activeId={activeId} onSelect={(id) => void selectSession(id)} onCreate={() => void startSession()} onClose={() => setSidebarOpen(false)} />}
        <div className="chat-column">
          <div className="chat-context"><Sparkles size={15} /><span>{activeId ? sessions.find((session) => session.id === activeId)?.title ?? 'Conversation' : 'New conversation'}</span></div>
          <ChatWindow messages={messages} loading={loadingMessages} streaming={streaming} error={error} onSend={send} />
        </div>
        {documentsOpen && <aside className="documents-panel"><div className="panel-heading"><div><Files size={17} /><span>Sources</span></div><span>{documents.length}</span></div><DocumentUploader busy={uploading} onUpload={(file) => void upload(file)} /><DocumentList documents={documents} onDelete={(document) => void removeDocument(document)} /></aside>}
      </div>
    </div>
  )
}