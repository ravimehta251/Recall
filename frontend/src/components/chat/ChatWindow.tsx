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
  
  useEffect(() => { 
    endRef.current?.scrollIntoView({ behavior: streaming ? 'auto' : 'smooth' }) 
  }, [messages, streaming])

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12 lg:px-20">
        {loading ? (
          <div className="grid min-h-[220px] place-items-center">
            <Spinner label="Loading messages" />
          </div>
        ) : messages.length ? (
          <div className="mx-auto max-w-3xl">
            {messages.map((message, index) => (
              <MessageBubble 
                key={`${message.createdAt}-${index}`} 
                message={message} 
                streaming={streaming && index === messages.length - 1} 
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState 
              icon={<MessagesSquare size={24} />} 
              title="Start with a question" 
              detail="Recall will search this space and cite the passages behind its answer." 
            />
          </div>
        )}
        {error && <p className="mx-auto mt-4 max-w-3xl rounded-md border-l-4 border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>
      
      <div className="shrink-0 bg-gradient-to-t from-background via-background pt-2 pb-6 px-4 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl">
          <ChatInput disabled={streaming} onSend={onSend} />
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Recall can make mistakes. Verify important details in the cited source.
          </p>
        </div>
      </div>
    </section>
  )
}