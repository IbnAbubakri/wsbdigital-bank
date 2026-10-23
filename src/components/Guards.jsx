import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Loader() {
  return (
    <div className="page-loader">
      <span className="spinner spinner-lg" />
      <p>Loading your secure session…</p>
    </div>
  )
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (user.status === 'pending') return <Navigate to="/pending-approval" replace />
  if (user.status === 'rejected') return <Navigate to="/login" replace />

  return children
}

export function RequireAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}
