import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useAuthStore } from './store/authStore'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignupPage } from './pages/SignupPage'
import { SpacePage } from './pages/SpacePage'

function ProtectedRoute() {
  return useAuthStore((state) => state.token) ? <Outlet /> : <Navigate to="/login" replace />
}

export default function App() {
  const token = useAuthStore((state) => state.token)
  return (
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
  )
}