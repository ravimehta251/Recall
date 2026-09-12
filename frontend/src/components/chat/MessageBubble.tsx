import { BrainCircuit, UserRound } from 'lucide-react'
import type { ChatMessage } from '../../types'
import { CitationCard } from './CitationCard'

export function MessageBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const assistant = message.role === 'ASSISTANT'
  return <article className={`message ${assistant ? 'assistant' : 'user'}`}><span className="message-avatar">{assistant ? <BrainCircuit size={17} /> : <UserRound size={17} />}</span><div className="message-content"><p>{message.content}{streaming && <span className="typing-cursor" />}</p>{message.citations?.length ? <div className="citations">{message.citations.map((citation, index) => <CitationCard citation={citation} key={`${citation.documentId}-${index}`} />)}</div> : null}</div></article>
}