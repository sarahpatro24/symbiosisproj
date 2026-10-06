import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import MainPage from './pages/MainPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, adminOnly = false }) {
  const { session, role, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  if (!session) return <Navigate to="/login" replace />
  if (adminOnly && role !== 'admin') return <Navigate to="/" replace />
  if (!adminOnly && role === 'admin') return <Navigate to="/admin" replace />
  return children
}

function PublicRoute({ children }) {
  const { session, role, loading, accessDenied, clearAccessDenied } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-muted">Loading...</div>

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-10 text-center max-w-sm">
          <p className="text-2xl font-bold text-danger mb-2">Access Denied</p>
          <p className="text-muted text-sm mb-6">This Google account is not authorized as an admin.</p>
          <button
            onClick={clearAccessDenied}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (session) return <Navigate to={role === 'admin' ? '/admin' : '/'} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}