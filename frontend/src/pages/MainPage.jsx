import { useState } from 'react'
import Navbar from '../components/Navbar'
import VideoEmbed from '../components/VideoEmbed'
import SynopsisPanel from '../components/SynopsisPanel'
import CaptionsPanel from '../components/CaptionsPanel'
import { loadVideoSession } from '../utils/api'

function extractVideoId(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    return u.searchParams.get('v') || null
  } catch { return null }
}

export default function MainPage() {
  const [input, setInput] = useState('')
  const [videoId, setVideoId] = useState(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    const vid = extractVideoId(input)
    console.log("VID EXTRACTED:", vid)
    if (!vid) { setError('Please enter a valid YouTube URL.'); return }
    setError('')
    setLoading(true)
    try {
      const url = `https://www.youtube.com/watch?v=${vid}`
      console.log("CALLING loadVideoSession with:", url)
      const result = await loadVideoSession(url)
      console.log("SUCCESS:", result)
      setVideoId(vid)
      setYoutubeUrl(url)
    } catch (e) {
      console.log("ERROR OBJECT:", e)
      console.log("ERROR RESPONSE:", e.response)
      console.log("ERROR MESSAGE:", e.message)
      setError(e.response?.data?.detail || 'Failed to load video. Please try again.')
    } finally { setLoading(false) }
  }
  

 return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFBF7', color: '#292524' }}>
      <Navbar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">

        {/* URL Input */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
            placeholder="Paste a YouTube URL..."
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={{
              background: '#FFFFFF',
              border: '1px solid #F0E4D8',
              color: '#292524',
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #F97316'}
            onBlur={(e) => e.target.style.boxShadow = 'none'}
          />
          <button
            onClick={handleLoad}
            disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 text-white"
            style={{ background: '#F97316' }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#EA580C')}
            onMouseLeave={(e) => e.target.style.background = '#F97316'}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {error && <p className="text-sm -mt-2" style={{ color: '#DC2626' }}>{error}</p>}

        {/* Video + Panels */}
        {videoId && (
          <>
            <VideoEmbed videoId={videoId} />
            <div className="grid grid-cols-2 gap-6 flex-1" style={{ minHeight: '500px' }}>
              <SynopsisPanel youtubeUrl={youtubeUrl} />
              <CaptionsPanel videoId={videoId} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}