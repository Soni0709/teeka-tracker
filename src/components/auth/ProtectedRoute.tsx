import { Navigate, Outlet } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  session: Session | null
  children?: React.ReactNode
}

export default function ProtectedRoute({ session, children }: ProtectedRouteProps) {
  // If no session, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />
  }

  // If has session, render children or Outlet (for nested routes)
  return children ? <>{children}</> : <Outlet />
}
