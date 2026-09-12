import { ArrowUpRight, FileText, MoreHorizontal, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { KnowledgeSpace } from '../../types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { buttonVariants } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

export function SpaceCard({ space, onDelete }: { space: KnowledgeSpace; onDelete: () => void }) {
  return (
    <Card className="flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md hover:border-border/80">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary text-xs font-bold text-secondary-foreground">
          {space.name.slice(0, 2).toUpperCase()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-muted-foreground hover:bg-muted' })}>
            <MoreHorizontal size={18} />
            <span className="sr-only">Actions for {space.name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete space
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <CardTitle className="mb-2 text-xl font-serif">{space.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm text-muted-foreground/80 leading-relaxed">
          {space.description || 'A focused collection of documents and conversations.'}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4 mt-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText size={15} />
          <span>{space.documentCount} {space.documentCount === 1 ? 'document' : 'documents'}</span>
        </div>
        <Link 
          to={`/spaces/${space.id}`} 
          state={{ space }} 
          aria-label={`Open ${space.name}`}
          className="text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowUpRight size={18} />
        </Link>
      </CardFooter>
    </Card>
  )
}