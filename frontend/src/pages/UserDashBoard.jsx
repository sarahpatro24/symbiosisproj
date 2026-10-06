import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { fetchUserHistory } from '../utils/api'
import { Link } from 'react-router-dom'

export default function UserDashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserHistory()
      .then((res) => setHistory(res.data.history))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

return (
    <div className="min-h-screen bg-cream text-ink flex flex-col">
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">My Videos</h1>
        {loading && <p className="text-muted">Loading...</p>}
        {!loading && history.length === 0 && (
          <p className="text-muted">No videos yet. <Link to="/" className="text-primary underline">Load one!</Link></p>
        )}
        <div className="flex flex-col gap-4">
          {history.map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 flex gap-4 items-center">
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt="" className="w-28 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{item.video_title || 'Untitled'}</p>
                <a href={item.youtube_url} target="_blank" rel="noreferrer"
                  className="text-primary text-xs truncate hover:underline block"
                >
                  {item.youtube_url}
                </a>
                <p className="text-faint text-xs mt-1">
                  Last viewed: {new Date(item.last_viewed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                {item.quiz_attempted ? (
                  <>
                    <span className="bg-green-100 text-success text-xs px-2 py-1 rounded-full">Attempted</span>
                    <p className="text-ink font-bold mt-1">{item.latest_score}/10</p>
                  </>
                ) : (
                  <span className="bg-peach text-muted text-xs px-2 py-1 rounded-full">Not Attempted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}