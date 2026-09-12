import { MessagesSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Spinner } from '../common/Spinner'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'

type Props = { messages: ChatMessage[]; loading: boolean; streaming: boolean; error: string; onSend: (content: string) => Promise<void> }
export function ChatWindow({ messages, loading, streaming, error, onSend }: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth' }) }, [messages, streaming])
  return <section className="chat-panel"><div className="message-list">{loading ? <div className="center-state"><Spinner label="Loading messages" /></div> : messages.length ? messages.map((message, index) => <MessageBubble key={`${message.createdAt}-${index}`} message={message} streaming={streaming && index === messages.length - 1} />) : <EmptyState icon={<MessagesSquare size={24} />} title="Start with a question" detail="Recall will search this space and cite the passages behind its answer." />}{error && <p className="form-error inline-error">{error}</p>}<div ref={endRef} /></div><div className="composer-wrap"><ChatInput disabled={streaming} onSend={onSend} /><p>Recall can make mistakes. Verify important details in the cited source.</p></div></section>
}