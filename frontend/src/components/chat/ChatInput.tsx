import { ArrowUp } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (content: string) => Promise<void> }) {
  const [content, setContent] = useState('')
  const submit = async (event?: FormEvent) => { 
    event?.preventDefault(); 
    const value = content.trim(); 
    if (!value || disabled) return; 
    setContent(''); 
    await onSend(value) 
  }
  const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => { 
    if (event.key === 'Enter' && !event.shiftKey) { 
      event.preventDefault(); 
      void submit() 
    } 
  }
  return (
    <form 
      className="relative flex w-full items-end overflow-hidden rounded-3xl border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 shadow-sm transition-shadow" 
      onSubmit={submit}
    >
      <Textarea 
        rows={1} 
        value={content} 
        onChange={(event) => setContent(event.target.value)} 
        onKeyDown={keyDown} 
        placeholder="Ask about your documents..." 
        disabled={disabled}
        className="min-h-[52px] w-full resize-none border-0 bg-transparent py-4 pl-5 pr-12 focus-visible:ring-0 shadow-none text-[15px]"
      />
      <div className="absolute bottom-2 right-2">
        <Button 
          type="submit"
          size="icon"
          className="h-9 w-9 rounded-full" 
          disabled={disabled || !content.trim()} 
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </Button>
      </div>
    </form>
  )
}