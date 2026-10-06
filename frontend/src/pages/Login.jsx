import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signInWithGoogle } = useAuth()
  const [mode, setMode] = useState(null) // null | 'user' | 'admin'

  function handleGoogleSignIn() {
    // Store intended mode so AuthContext can validate after redirect
    sessionStorage.setItem('login_intent', mode)
    signInWithGoogle()
  }

return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFBF7' }}>
      <div className="rounded-2xl shadow-lg p-10 flex flex-col items-center gap-8 w-96 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold" style={{ color: '#F97316' }}>VidLearn</h1>
          <p className="mt-2 text-sm" style={{ color: '#78716C' }}>Turn any YouTube video into a learning experience</p>
        </div>

        {!mode && (
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => setMode('user')}
              className="w-full font-semibold py-3 rounded-xl transition text-white"
              style={{ background: '#F97316' }}
              onMouseEnter={(e) => e.target.style.background = '#EA580C'}
              onMouseLeave={(e) => e.target.style.background = '#F97316'}
            >
              Continue as User
            </button>
            <button
              onClick={() => setMode('admin')}
              className="w-full font-semibold py-3 rounded-xl transition"
              style={{ background: '#FFF1E6', color: '#78716C', border: '1px solid #F0E4D8' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFE8D6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFF1E6'}
            >
              Continue as Admin
            </button>
          </div>
        )}

        {mode && (
          <div className="w-full flex flex-col gap-4">
            <p className="text-center text-sm" style={{ color: '#78716C' }}>
              Signing in as{' '}
              <span className="font-medium" style={{ color: '#F97316' }}>
                {mode === 'admin' ? 'Admin' : 'User'}
              </span>
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-6 rounded-xl transition shadow border"
              style={{ background: '#FFFFFF', color: '#292524', borderColor: '#F0E4D8' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFF8F2'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
              Sign in with Google
            </button>
            <button
              onClick={() => setMode(null)}
              className="text-xs underline"
              style={{ color: '#A8A29E' }}
              onMouseEnter={(e) => e.target.style.color = '#78716C'}
              onMouseLeave={(e) => e.target.style.color = '#A8A29E'}
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}