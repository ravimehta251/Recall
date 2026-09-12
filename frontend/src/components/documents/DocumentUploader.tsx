import { FileUp, Upload } from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'

export function DocumentUploader({ busy, onUpload }: { busy: boolean; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const select = (files: FileList | null) => files?.[0] && onUpload(files[0])
  const drop = (event: DragEvent) => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files) }
  return (
    <div className={`upload-zone ${dragging ? 'dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={drop}>
      <input ref={inputRef} hidden type="file" accept=".pdf,.docx,.txt" onChange={(event) => select(event.target.files)} />
      <FileUp size={22} />
      <div><strong>{busy ? 'Uploading...' : 'Drop a document here'}</strong><span>PDF, DOCX, or TXT up to 20 MB</span></div>
      <button className="icon-button bordered" title="Choose file" aria-label="Choose file" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={17} /></button>
    </div>
  )
}