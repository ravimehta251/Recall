import { BrainCircuit, UserRound } from 'lucide-react'
import type { ChatMessage } from '../../types'
import { CitationCard } from './CitationCard'
import { Avatar, AvatarFallback } from '../ui/avatar'

export function MessageBubble({ message, streaming }: { message: ChatMessage; streaming?: boolean }) {
  const assistant = message.role === 'ASSISTANT'
  return (
    <article className="group relative mb-8 flex items-start gap-4">
      <Avatar className={`mt-0.5 h-8 w-8 shrink-0 rounded-md ${assistant ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
        <AvatarFallback className="bg-transparent">
          {assistant ? <BrainCircuit size={16} /> : <UserRound size={16} />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className={`text-[15px] break-words ${!assistant ? 'font-medium text-foreground' : 'text-foreground/90'}`}>
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
            {streaming && <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary align-middle" />}
          </p>
        </div>
        
        {message.citations?.length ? (
          <div className="mt-3 flex flex-col gap-2">
            {message.citations.map((citation, index) => (
              <CitationCard citation={citation} key={`${citation.documentId}-${index}`} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}