import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useAuthStore } from './store/authStore'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignupPage } from './pages/SignupPage'
import { SpacePage } from './pages/SpacePage'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'

function ProtectedRoute() {
  return useAuthStore((state) => state.token) ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const token = useAuthStore((state) => state.token)
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={token ? <Navigate to="/" replace /> : <SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="spaces/:spaceId" element={<SpacePage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </TooltipProvider>
  )
}