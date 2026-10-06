import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { session, signOut } = useAuth()
  const name = session?.user?.user_metadata?.full_name || session?.user?.email || ''

  return (
    <nav
      className="px-6 py-3 flex items-center justify-between border-b"
      style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}
    >
      <Link to="/" className="text-xl font-bold" style={{ color: '#F97316' }}>VidLearn</Link>
      <div className="flex items-center gap-6">
        <span className="text-sm" style={{ color: '#78716C' }}>{name}</span>
        <Link
          to="/dashboard"
          className="text-sm transition"
          style={{ color: '#292524' }}
          onMouseEnter={(e) => e.target.style.color = '#F97316'}
          onMouseLeave={(e) => e.target.style.color = '#292524'}
        >
          My Videos
        </Link>
        <button
          onClick={signOut}
          className="text-sm px-3 py-1 rounded transition text-white"
          style={{ background: '#DC2626' }}
          onMouseEnter={(e) => e.target.style.background = '#B91C1C'}
          onMouseLeave={(e) => e.target.style.background = '#DC2626'}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}