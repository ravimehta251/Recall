import { BrainCircuit, LogOut, User } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { buttonVariants } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'

export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 md:px-10 lg:px-14 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg" aria-label="Recall home">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <BrainCircuit size={19} />
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight">Recall</span>
        </Link>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', className: 'relative h-10 w-10 rounded-full border border-border/50 hover:bg-muted' })}>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-transparent text-primary">
                  <User size={18} />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="px-2 py-1.5 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate('/login') }} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1"><Outlet /></main>
    </div>
  )
}