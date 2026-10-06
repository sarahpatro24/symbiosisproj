import { useState } from 'react'
import { fetchSynopsis, fetchQuiz, submitScore } from '../utils/api'

export default function SynopsisPanel({ youtubeUrl }) {
  const [view, setView] = useState('idle') // idle | synopsis | quiz | result
  const [synopsis, setSynopsis] = useState('')
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSynopsis() {
    setLoading(true); setError('')
    try {
      const res = await fetchSynopsis(youtubeUrl)
      setSynopsis(res.data.synopsis)
      setView('synopsis')
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load synopsis')
    } finally { setLoading(false) }
  }

  async function handleQuiz() {
    setLoading(true); setError('')
    try {
      const res = await fetchQuiz(youtubeUrl)
      setQuiz(res.data.quiz)
      setAnswers({})
      setScore(null)
      setView('quiz')
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load quiz')
    } finally { setLoading(false) }
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < quiz.length) {
      setError('Please answer all questions before submitting.')
      return
    }
    setSubmitting(true)
    const calc = quiz.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
    try {
      await submitScore(youtubeUrl, calc)
      setScore(calc)
      setView('result')
    } catch (e) {
      setError('Failed to submit score. Please try again.')
    } finally { setSubmitting(false) }
  }

return (
    <div className="rounded-xl p-5 h-full flex flex-col gap-4 overflow-y-auto border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
      <h2 className="text-lg font-semibold" style={{ color: '#292524' }}>Synopsis & Quiz</h2>

      <div className="flex gap-3">
        <button
          onClick={handleSynopsis}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 text-white"
          style={{ background: '#F97316' }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#EA580C')}
          onMouseLeave={(e) => e.target.style.background = '#F97316'}
        >
          {loading && view !== 'quiz' ? 'Loading...' : 'Synopsis'}
        </button>
        <button
          onClick={handleQuiz}
          disabled={loading}
          className="flex-1 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 text-white"
          style={{ background: '#FB923C' }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#F97316')}
          onMouseLeave={(e) => e.target.style.background = '#FB923C'}
        >
          {loading && view === 'quiz' ? 'Loading...' : 'Take Quiz'}
        </button>
      </div>

      {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

      {view === 'synopsis' && (
        <p className="text-sm leading-relaxed" style={{ color: '#44403C' }}>{synopsis}</p>
      )}

      {view === 'quiz' && (
        <div className="flex flex-col gap-5">
          {quiz.map((q, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: '#FFF8F2' }}>
              <p className="text-sm font-medium mb-3" style={{ color: '#292524' }}>{i + 1}. {q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${i}`}
                      value={opt.key}
                      checked={answers[i] === opt.key}
                      onChange={() => setAnswers((prev) => ({ ...prev, [i]: opt.key }))}
                      style={{ accentColor: '#F97316' }}
                    />
                    <span className="text-sm" style={{ color: '#44403C' }}>{opt.key}. {opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 text-white"
            style={{ background: '#16A34A' }}
            onMouseEnter={(e) => !submitting && (e.target.style.background = '#15803D')}
            onMouseLeave={(e) => e.target.style.background = '#16A34A'}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}

      {view === 'result' && (
        <div className="text-center py-8">
          <p className="text-4xl font-bold" style={{ color: '#F97316' }}>{score}/10</p>
          <p className="mt-2" style={{ color: '#78716C' }}>Quiz Complete!</p>
          <button
            onClick={handleQuiz}
            className="mt-4 text-sm underline"
            style={{ color: '#F97316' }}
          >
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  )
}