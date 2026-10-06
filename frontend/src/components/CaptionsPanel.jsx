import { useState, useEffect, useRef } from 'react'
import { fetchCaptions } from '../utils/api'

const LANGUAGES = [
  { key: 'telugu', label: 'Telugu-English' },
  { key: 'hindi', label: 'Hindi-English' },
  { key: 'tamil', label: 'Tamil-English' },
]

export default function CaptionsPanel({ videoId }) {
  const [captions, setCaptions] = useState([])
  const [activeLang, setActiveLang] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const activeRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(() => {
    if (!videoId) return
    const interval = setInterval(() => {
      const iframe = document.querySelector('iframe[src*="youtube.com"]')
      if (iframe && window.YT && playerRef.current) {
        try {
          const t = playerRef.current.getCurrentTime()
          setCurrentTime(t)
        } catch {}
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [videoId])

  useEffect(() => {
    if (!videoId) return
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        events: { onReady: () => {} },
      })
    }
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('yt-player', {})
    }
  }, [videoId])

  useEffect(() => {
    if (!captions.length) return
    let idx = -1
    for (let i = captions.length - 1; i >= 0; i--) {
      if (currentTime >= captions[i].timestamp) { idx = i; break }
    }
    setActiveIndex(idx)
  }, [currentTime, captions])

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIndex])

async function loadCaptions(lang) {
    console.log("loadCaptions called, videoId:", videoId, "lang:", lang)
    if (!videoId) return
    setActiveLang(lang)
    setLoading(true)
    setError('')
    setCaptions([])
    const url = `https://www.youtube.com/watch?v=${videoId}`
    console.log("Calling fetchCaptions with url:", url, "lang:", lang)
    try {
      const res = await fetchCaptions(url, lang)
      console.log("Captions response:", res)
      setCaptions(res.data.captions)
    } catch (e) {
      console.log("Captions error:", e)
      setError(e.response?.data?.detail || 'Failed to load captions')
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-xl p-5 h-full flex flex-col gap-4 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
      <h2 className="text-lg font-semibold" style={{ color: '#292524' }}>Romanized Captions</h2>
      <div className="flex gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.key}
            onClick={() => loadCaptions(l.key)}
            disabled={loading}
            className="flex-1 text-xs py-2 rounded-lg font-medium transition disabled:opacity-50"
            style={
              activeLang === l.key
                ? { background: '#F97316', color: '#FFFFFF' }
                : { background: '#FFF1E6', color: '#78716C' }
            }
          >
            {l.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
      {loading && <p className="text-sm" style={{ color: '#78716C' }}>Processing captions...</p>}

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        {captions.map((c, i) => (
          <p
            key={i}
            ref={i === activeIndex ? activeRef : null}
            className="text-sm px-3 py-1.5 rounded transition-colors"
            style={
              i === activeIndex
                ? { background: '#F97316', color: '#FFFFFF', fontWeight: 500 }
                : { color: '#78716C' }
            }
          >
            {c.text}
          </p>
        ))}
      </div>
    </div>
  )
}