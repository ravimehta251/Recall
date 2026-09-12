import { ChevronDown, FileSearch } from 'lucide-react'
import { useState } from 'react'
import type { Citation } from '../../types'

export function CitationCard({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false)
  return <button className={`citation ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}><span className="citation-title"><FileSearch size={15} /><span>{citation.filename}</span><ChevronDown size={15} /></span>{open && <span className="citation-snippet">{citation.snippet}</span>}</button>
}