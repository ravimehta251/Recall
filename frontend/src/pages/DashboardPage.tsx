import { BookOpen, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createSpace, deleteSpace, listSpaces } from '../api/spaces'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { CreateSpaceModal } from '../components/spaces/CreateSpaceModal'
import { SpaceCard } from '../components/spaces/SpaceCard'
import type { KnowledgeSpace } from '../types'

export function DashboardPage() {
  const [spaces, setSpaces] = useState<KnowledgeSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { listSpaces().then(setSpaces).catch((err) => setError(err.message)).finally(() => setLoading(false)) }, [])

  const addSpace = async (name: string, description: string) => {
    setCreating(true)
    try {
      const created = await createSpace(name, description)
      setSpaces((current) => [created, ...current])
      setModalOpen(false)
    }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not create space') }
    finally { setCreating(false) }
  }

  const removeSpace = async (space: KnowledgeSpace) => {
    if (!window.confirm(`Delete “${space.name}” and all of its documents and conversations?`)) return
    try { await deleteSpace(space.id); setSpaces((current) => current.filter((item) => item.id !== space.id)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete space') }
  }

  return (
    <div className="dashboard page-enter">
      <header className="page-heading"><div><span className="eyebrow">Knowledge library</span><h1>Your spaces</h1><p>Keep each body of work focused. Recall searches only the documents inside the space you open.</p></div><button className="button primary" onClick={() => setModalOpen(true)}><Plus size={17} /> New space</button></header>
      {error && <p className="form-error inline-error">{error}</p>}
      {loading ? <div className="center-state"><Spinner label="Loading spaces" /></div> : spaces.length ? <section className="space-grid">{spaces.map((space) => <SpaceCard key={space.id} space={space} onDelete={() => removeSpace(space)} />)}</section> : <EmptyState icon={<BookOpen size={24} />} title="No spaces yet" detail="Create one to collect documents and start a grounded conversation." />}
      {modalOpen && <CreateSpaceModal saving={creating} onClose={() => setModalOpen(false)} onCreate={addSpace} />}
    </div>
  )
}