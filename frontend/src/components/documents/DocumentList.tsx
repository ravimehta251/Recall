import { File, FileX2, Trash2 } from 'lucide-react'
import type { RecallDocument } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { DocumentStatusBadge } from './DocumentStatusBadge'

export function DocumentList({ documents, onDelete }: { documents: RecallDocument[]; onDelete: (document: RecallDocument) => void }) {
  if (!documents.length) return <EmptyState icon={<FileX2 size={22} />} title="No documents" detail="Upload source material to ground this space." />
  return <div className="document-list">{documents.map((document) => <article className="document-row" key={document.id}><span className="file-icon"><File size={17} /></span><div className="document-copy"><strong title={document.filename}>{document.filename}</strong>{document.errorMessage && <span className="document-error">{document.errorMessage}</span>}<DocumentStatusBadge status={document.status} /></div><button className="icon-button subtle" title="Delete document" aria-label={`Delete ${document.filename}`} onClick={() => onDelete(document)}><Trash2 size={16} /></button></article>)}</div>
}