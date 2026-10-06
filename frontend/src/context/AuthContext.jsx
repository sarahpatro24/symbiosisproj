import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchRoleAndValidate(session.access_token)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchRoleAndValidate(session.access_token)
      else { setRole(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

async function fetchRoleAndValidate(token) {
    try {
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      console.log("ME RESPONSE:", data)
      const actualRole = data.role

      const intent = sessionStorage.getItem('login_intent')
      console.log("LOGIN INTENT:", intent, "ACTUAL ROLE:", actualRole)

      if (intent === 'admin' && actualRole !== 'admin') {
        setAccessDenied(true)
        await supabase.auth.signOut()
        setSession(null)
        setRole(null)
        sessionStorage.removeItem('login_intent')
        setLoading(false)
        return
      }

      setRole(actualRole)
      sessionStorage.removeItem('login_intent')
    } catch (e) {
      console.log("FETCH ROLE ERROR:", e)
      setRole('user')
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  const signOut = () => supabase.auth.signOut()

  const clearAccessDenied = () => setAccessDenied(false)

  return (
    <AuthContext.Provider value={{ session, role, loading, signInWithGoogle, signOut, accessDenied, clearAccessDenied }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)