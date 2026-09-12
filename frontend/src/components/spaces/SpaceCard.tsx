import { ArrowUpRight, FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { KnowledgeSpace } from '../../types'

export function SpaceCard({ space, onDelete }: { space: KnowledgeSpace; onDelete: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <article className="space-card">
      <div className="space-card-top">
        <span className="space-index">{space.name.slice(0, 2).toUpperCase()}</span>
        <div className="menu-wrap">
          <button className="icon-button subtle" aria-label={`Actions for ${space.name}`} onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={18} /></button>
          {menuOpen && <button className="danger-menu" onClick={onDelete}><Trash2 size={15} /> Delete</button>}
        </div>
      </div>
      <div><h2>{space.name}</h2><p>{space.description || 'A focused collection of documents and conversations.'}</p></div>
      <div className="space-card-footer">
        <span><FileText size={15} /> {space.documentCount} {space.documentCount === 1 ? 'document' : 'documents'}</span>
        <Link to={`/spaces/${space.id}`} state={{ space }} aria-label={`Open ${space.name}`}><ArrowUpRight size={18} /></Link>
      </div>
    </article>
  )
}