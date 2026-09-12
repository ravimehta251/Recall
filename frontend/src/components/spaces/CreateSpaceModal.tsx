import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

type Props = {
  saving: boolean
  onClose: () => void
  onCreate: (name: string, description: string) => Promise<void>
}

export function CreateSpaceModal({ saving, onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    await onCreate(name.trim(), description.trim())
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="space-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div><span className="eyebrow">New collection</span><h2 id="space-dialog-title">Create a knowledge space</h2></div>
          <button className="icon-button" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="form-stack">
          <label>Name<input autoFocus required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Product research" /></label>
          <label>Description<textarea rows={3} maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Notes, briefs, and customer interviews" /></label>
          <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" disabled={saving || !name.trim()}>{saving ? 'Creating...' : 'Create space'}</button></div>
        </form>
      </section>
    </div>
  )
}