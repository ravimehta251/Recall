import { MessageSquare, PanelLeftClose, Plus } from 'lucide-react'
import type { ChatSession } from '../../types'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'

type Props = { sessions: ChatSession[]; activeId: string | null; onSelect: (id: string) => void; onCreate: () => void; onClose: () => void }
export function Sidebar({ sessions, activeId, onSelect, onCreate, onClose }: Props) {
  return (
    <aside className="flex flex-col h-full w-[260px] border-r border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversations</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground md:hidden" onClick={onClose}>
          <PanelLeftClose size={16} />
          <span className="sr-only">Close conversations</span>
        </Button>
      </div>
      <div className="px-3 pb-3">
        <Button onClick={onCreate} className="w-full justify-start border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> New conversation
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-1 pb-4" aria-label="Chat history">
          {sessions.map((session) => (
            <Button
              key={session.id}
              variant={session.id === activeId ? 'secondary' : 'ghost'}
              className={`w-full justify-start font-normal ${session.id === activeId ? 'bg-background shadow-sm border-l-2 border-l-primary rounded-l-none' : ''}`}
              onClick={() => onSelect(session.id)}
            >
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{session.title}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}