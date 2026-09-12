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
import { Button, buttonVariants } from '../components/ui/button'
import { toast } from 'sonner'
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
      .catch((caught) => toast.error(caught instanceof Error ? caught.message : 'Could not load this space'))
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
    try { 
      setMessages(await getMessages(id))
      if (window.innerWidth < 768) setSidebarOpen(false) 
    }
    catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not load messages') }
    finally { setLoadingMessages(false) }
  }

  const startSession = async () => {
    try {
      const session = await createSession(spaceId)
      setSessions((current) => [session, ...current])
      setActiveId(session.id)
      setMessages([])
      if (window.innerWidth < 768) setSidebarOpen(false)
      return session.id
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : 'Could not start a conversation')
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
        onError: (message) => setError(message),
      })
      setSessions(await listSessions(spaceId))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The response stream was interrupted')
    } finally { setStreaming(false) }
  }

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const uploaded = await uploadDocument(spaceId, file)
      setDocuments((current) => [uploaded, ...current])
      toast.success('Document uploaded')
    }
    catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not upload document') }
    finally { setUploading(false) }
  }

  const removeDocument = async (document: RecallDocument) => {
    if (!window.confirm(`Delete ${document.filename}?`)) return
    try { 
      await deleteDocument(spaceId, document.id); 
      setDocuments((current) => current.filter((item) => item.id !== document.id)) 
      toast.success('Document deleted')
    }
    catch (caught) { toast.error(caught instanceof Error ? caught.message : 'Could not delete document') }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-background animate-in fade-in duration-300">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6 z-10 relative">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Back to spaces" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-9 w-9 text-muted-foreground hover:bg-muted' })}>
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary leading-tight">Knowledge space</span>
            <h1 className="text-base font-semibold leading-tight font-serif mt-0.5">{space?.name ?? 'Loading space...'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={sidebarOpen ? 'secondary' : 'outline'} size="icon" className="h-9 w-9 text-muted-foreground" title="Conversations" aria-label="Show conversations" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={16} />
          </Button>
          <Button variant={documentsOpen ? 'secondary' : 'outline'} size="icon" className="h-9 w-9 text-muted-foreground" title="Documents" aria-label="Show documents" onClick={() => setDocumentsOpen(!documentsOpen)}>
            <PanelRight size={16} />
          </Button>
        </div>
      </header>
      
      <div className="flex min-h-0 flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <div className="absolute inset-y-0 left-0 z-30 w-[85vw] max-w-[320px] shrink-0 shadow-2xl md:relative md:w-[260px] md:shadow-none bg-background transition-transform">
            <Sidebar sessions={sessions} activeId={activeId} onSelect={(id) => void selectSession(id)} onCreate={() => void startSession()} onClose={() => setSidebarOpen(false)} />
          </div>
        )}
        
        <div className="flex min-w-0 flex-1 flex-col relative z-0">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border/50 bg-muted/10 px-6 text-xs font-medium text-muted-foreground">
            <Sparkles size={14} className="text-primary" />
            <span>{activeId ? sessions.find((session) => session.id === activeId)?.title ?? 'Conversation' : 'New conversation'}</span>
          </div>
          <ChatWindow messages={messages} loading={loadingMessages} streaming={streaming} error={error} onSend={send} />
        </div>
        
        {documentsOpen && (
          <aside className="absolute inset-y-0 right-0 z-30 flex w-[85vw] max-w-[340px] shrink-0 flex-col border-l border-border bg-muted/20 p-4 shadow-2xl md:relative md:w-[320px] md:shadow-none transition-transform">
            <div className="mb-4 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <Files size={16} />
                <span>Sources</span>
              </div>
              <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-border/50 px-1 text-[10px]">
                {documents.length}
              </span>
            </div>
            <DocumentUploader busy={uploading} onUpload={(file) => void upload(file)} />
            <DocumentList documents={documents} onDelete={(document) => void removeDocument(document)} />
          </aside>
        )}
      </div>
    </div>
  )
}