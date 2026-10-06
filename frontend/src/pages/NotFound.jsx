import { Link } from 'react-router-dom'

export default function NotFound() {
return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFBF7' }}>
      <div className="text-center">
        <p className="text-6xl font-extrabold" style={{ color: '#F97316' }}>404</p>
        <p className="mt-3" style={{ color: '#78716C' }}>Page not found</p>
        <Link
          to="/"
          className="mt-4 inline-block underline"
          style={{ color: '#F97316' }}
          onMouseEnter={(e) => e.target.style.color = '#EA580C'}
          onMouseLeave={(e) => e.target.style.color = '#F97316'}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}