import { File, FileX2, Trash2 } from 'lucide-react'
import type { RecallDocument } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'

export function DocumentList({ documents, onDelete }: { documents: RecallDocument[]; onDelete: (document: RecallDocument) => void }) {
  if (!documents.length) return <EmptyState icon={<FileX2 size={22} />} title="No documents" detail="Upload source material to ground this space." />
  return (
    <ScrollArea className="flex-1 -mx-4 px-4">
      <div className="flex flex-col gap-2 pb-4">
        {documents.map((document) => (
          <Card key={document.id} className="flex items-start gap-3 p-3 shadow-none">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted/50 text-muted-foreground">
              <File size={16} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
              <strong className="w-full truncate text-sm font-medium" title={document.filename}>
                {document.filename}
              </strong>
              {document.errorMessage && <span className="text-[10px] leading-tight text-destructive">{document.errorMessage}</span>}
              <DocumentStatusBadge status={document.status} />
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onDelete(document)}>
              <Trash2 size={16} />
              <span className="sr-only">Delete {document.filename}</span>
            </Button>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}