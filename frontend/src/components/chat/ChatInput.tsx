import { ArrowUp } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (content: string) => Promise<void> }) {
  const [content, setContent] = useState('')
  const submit = async (event?: FormEvent) => { event?.preventDefault(); const value = content.trim(); if (!value || disabled) return; setContent(''); await onSend(value) }
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submit() } }
  return <form className="chat-input" onSubmit={submit}><textarea rows={1} value={content} onChange={(event) => setContent(event.target.value)} onKeyDown={keyDown} placeholder="Ask about your documents..." disabled={disabled} /><button className="send-button" disabled={disabled || !content.trim()} aria-label="Send message"><ArrowUp size={18} /></button></form>
}