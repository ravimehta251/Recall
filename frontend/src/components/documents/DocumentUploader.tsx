import { FileUp, Upload } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import { Button } from '../ui/button'

export function DocumentUploader({ busy, onUpload }: { busy: boolean; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const select = (files: FileList | null) => files?.[0] && onUpload(files[0])
  const drop = (event: DragEvent) => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files) }
  
  return (
    <div 
      className={`mb-4 flex items-center gap-3 rounded-lg border border-dashed p-4 transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-border bg-background'}`} 
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }} 
      onDragLeave={() => setDragging(false)} 
      onDrop={drop}
    >
      <input ref={inputRef} hidden type="file" accept=".pdf,.docx,.txt" onChange={(event) => select(event.target.files)} />
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <FileUp size={20} />
      </div>
      <div className="flex-1">
        <strong className="block text-sm font-medium">{busy ? 'Uploading...' : 'Drop a document here'}</strong>
        <span className="block text-xs text-muted-foreground mt-0.5">PDF, DOCX, or TXT up to 20 MB</span>
      </div>
      <Button variant="secondary" size="icon" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={16} />
        <span className="sr-only">Choose file</span>
      </Button>
    </div>
  )
}