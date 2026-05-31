import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Show nothing while checking auth status
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary, #0a0a0f)',
        color: 'var(--text-secondary)',
        fontSize: '1.1rem',
        gap: '0.75rem',
      }}>
        <span className="auth-spinner" style={{
          width: 24, height: 24,
          border: '2px solid rgba(255,255,255,0.2)',
          borderTopColor: 'var(--color-primary, #8b5cf6)',
          borderRadius: '50%',
          animation: 'auth-spin 0.6s linear infinite',
        }} />
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
