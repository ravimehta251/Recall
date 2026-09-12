import { BookOpen, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createSpace, deleteSpace, listSpaces } from '../api/spaces'
import { EmptyState } from '../components/common/EmptyState'
import { Spinner } from '../components/common/Spinner'
import { CreateSpaceModal } from '../components/spaces/CreateSpaceModal'
import { SpaceCard } from '../components/spaces/SpaceCard'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import type { KnowledgeSpace } from '../types'

export function DashboardPage() {
  const [spaces, setSpaces] = useState<KnowledgeSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => { 
    listSpaces()
      .then(setSpaces)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false)) 
  }, [])

  const addSpace = async (name: string, description: string) => {
    setCreating(true)
    try {
      const created = await createSpace(name, description)
      setSpaces((current) => [created, ...current])
      setModalOpen(false)
      toast.success('Space created successfully')
    }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not create space') }
    finally { setCreating(false) }
  }

  const removeSpace = async (space: KnowledgeSpace) => {
    if (!window.confirm(`Delete “${space.name}” and all of its documents and conversations?`)) return
    try { 
      await deleteSpace(space.id)
      setSpaces((current) => current.filter((item) => item.id !== space.id)) 
      toast.success('Space deleted')
    }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Could not delete space') }
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-10 lg:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-8">
        <div className="max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Knowledge library</span>
          <h1 className="mb-3 mt-2 font-serif text-4xl font-semibold tracking-tight md:text-5xl lg:text-[58px] leading-tight">Your spaces</h1>
          <p className="text-muted-foreground text-base leading-relaxed md:text-[17px]">
            Keep each body of work focused. Recall searches only the documents inside the space you open.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="lg" className="w-full shrink-0 md:w-auto md:min-w-[140px]">
          <Plus className="mr-2 h-5 w-5" /> New space
        </Button>
      </header>
      
      {loading ? (
        <div className="grid min-h-[220px] place-items-center">
          <Spinner label="Loading spaces" />
        </div>
      ) : spaces.length ? (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {spaces.map((space) => (
            <SpaceCard key={space.id} space={space} onDelete={() => removeSpace(space)} />
          ))}
        </section>
      ) : (
        <EmptyState 
          icon={<BookOpen size={24} />} 
          title="No spaces yet" 
          detail="Create one to collect documents and start a grounded conversation." 
        />
      )}
      
      {modalOpen && (
        <CreateSpaceModal 
          saving={creating} 
          onClose={() => setModalOpen(false)} 
          onCreate={addSpace} 
        />
      )}
    </div>
  )
}