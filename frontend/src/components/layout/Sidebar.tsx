import { MessageSquare, PanelLeftClose, Plus } from 'lucide-react'
import type { ChatSession } from '../../types'

type Props = { sessions: ChatSession[]; activeId: string | null; onSelect: (id: string) => void; onCreate: () => void; onClose: () => void }
export function Sidebar({ sessions, activeId, onSelect, onCreate, onClose }: Props) {
  return <aside className="session-sidebar"><div className="sidebar-heading"><span>Conversations</span><button className="icon-button" title="Close conversations" aria-label="Close conversations" onClick={onClose}><PanelLeftClose size={17} /></button></div><button className="new-chat" onClick={onCreate}><Plus size={16} /> New conversation</button><nav className="session-list" aria-label="Chat history">{sessions.map((session) => <button key={session.id} className={session.id === activeId ? 'active' : ''} onClick={() => onSelect(session.id)}><MessageSquare size={15} /><span>{session.title}</span></button>)}</nav></aside>
}