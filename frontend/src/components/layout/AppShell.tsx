import { BrainCircuit, LogOut } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function AppShell() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Recall home">
          <span className="brand-mark"><BrainCircuit size={19} /></span>
          <span>Recall</span>
        </Link>
        <div className="account">
          <span className="account-email">{user?.email}</span>
          <button
            className="icon-button"
            title="Sign out"
            aria-label="Sign out"
            onClick={() => { logout(); navigate('/login') }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="app-main"><Outlet /></main>
    </div>
  )
}