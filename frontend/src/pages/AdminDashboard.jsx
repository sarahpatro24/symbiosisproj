import { useEffect, useState } from 'react'
import { fetchAdminUsers, fetchAdminUserHistory, fetchAdminStats } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#06b6d4']

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const [users, setUsers] = useState([])
  const [expanded, setExpanded] = useState({})
  const [histories, setHistories] = useState({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchAdminUsers()
      .then((res) => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false))

    fetchAdminStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  async function toggleUser(userId) {
    if (expanded[userId]) {
      setExpanded((p) => ({ ...p, [userId]: false }))
      return
    }
    if (!histories[userId]) {
      try {
        const res = await fetchAdminUserHistory(userId)
        setHistories((p) => ({ ...p, [userId]: res.data }))
      } catch (e) { console.error(e) }
    }
    setExpanded((p) => ({ ...p, [userId]: true }))
  }

  const distributionData = stats
    ? Object.entries(stats.score_distribution).map(([range, count]) => ({ range, count }))
    : []

  const languageData = stats
    ? Object.entries(stats.language_usage).map(([lang, count]) => ({ name: lang, value: count }))
    : []

return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFBF7', color: '#292524' }}>
      <nav className="px-6 py-3 flex items-center justify-between border-b" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
        <span className="text-xl font-bold" style={{ color: '#F97316' }}>VidLearn Admin</span>
        <button
          onClick={signOut}
          className="text-sm px-3 py-1 rounded transition text-white"
          style={{ background: '#DC2626' }}
          onMouseEnter={(e) => e.target.style.background = '#B91C1C'}
          onMouseLeave={(e) => e.target.style.background = '#DC2626'}
        >
          Sign Out
        </button>
      </nav>

      <main className="p-6 max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#292524' }}>Platform Overview</h1>

        {statsLoading && <p className="mb-6" style={{ color: '#78716C' }}>Loading analytics...</p>}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Users" value={stats.total_users} />
              <StatCard label="Total Video Views" value={stats.total_video_views} />
              <StatCard label="Unique Videos" value={stats.unique_videos} />
              <StatCard label="Platform Avg Score" value={`${stats.platform_average_score}/10`} />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* Score distribution */}
              <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#78716C' }}>Score Distribution</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                    <XAxis dataKey="range" stroke="#78716C" fontSize={12} />
                    <YAxis stroke="#78716C" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #F0E4D8', borderRadius: 8, color: '#292524' }} />
                    <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Caption language usage */}
              <div className="rounded-xl p-5 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#78716C' }}>Caption Language Usage</h2>
                {languageData.length === 0 ? (
                  <p className="text-sm" style={{ color: '#78716C' }}>No caption usage yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={languageData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {languageData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #F0E4D8', borderRadius: 8, color: '#292524' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Trend line — last 7 days */}
            <div className="rounded-xl p-5 mb-10 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#78716C' }}>Videos Watched — Last 7 Days</h2>
              {stats.daily_trend.length === 0 ? (
                <p className="text-sm" style={{ color: '#78716C' }}>No activity in the last 7 days.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={stats.daily_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0E4D8" />
                    <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                    <YAxis stroke="#78716C" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #F0E4D8', borderRadius: 8, color: '#292524' }} />
                    <Line type="monotone" dataKey="count" stroke="#F97316" strokeWidth={2} dot={{ r: 3, fill: '#F97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Per-user leaderboard */}
            {stats.per_user_stats && stats.per_user_stats.length > 0 && (
              <div className="rounded-xl p-5 mb-10 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#78716C' }}>User Performance Leaderboard</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b" style={{ borderColor: '#F0E4D8', color: '#78716C' }}>
                        <th className="pb-2 pr-4">User</th>
                        <th className="pb-2 pr-4">Avg Score</th>
                        <th className="pb-2">Quiz Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.per_user_stats
                        .slice()
                        .sort((a, b) => b.avg_score - a.avg_score)
                        .map((row) => {
                          const matchedUser = users.find((u) => u.user_id === row._id)
                          return (
                            <tr key={row._id} className="border-b" style={{ borderColor: '#FFF1E6' }}>
                              <td className="py-2 pr-4" style={{ color: '#292524' }}>{matchedUser ? matchedUser.name : row._id}</td>
                              <td className="py-2 pr-4 font-medium" style={{ color: '#F97316' }}>{row.avg_score.toFixed(1)}/10</td>
                              <td className="py-2" style={{ color: '#78716C' }}>{row.attempts}</td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Per-user expandable list */}
        <h2 className="text-xl font-bold mb-4" style={{ color: '#292524' }}>All Users</h2>
        {loading && <p style={{ color: '#78716C' }}>Loading...</p>}
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.user_id} className="rounded-xl overflow-hidden border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
              <button
                onClick={() => toggleUser(user.user_id)}
                className="w-full flex items-center justify-between px-5 py-4 transition text-left"
                style={{ background: '#FFFFFF' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#FFF8F2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <div>
                  <p className="font-semibold" style={{ color: '#292524' }}>{user.name}</p>
                  <p className="text-sm" style={{ color: '#78716C' }}>{user.email}</p>
                </div>
                <span className="text-lg" style={{ color: '#F97316' }}>{expanded[user.user_id] ? '▲' : '▼'}</span>
              </button>

              {expanded[user.user_id] && histories[user.user_id] && (
                <div className="px-5 pb-5 pt-4 border-t" style={{ borderColor: '#F0E4D8' }}>
                  {typeof histories[user.user_id].average_score === 'number' && (
                    <p className="text-sm mb-3" style={{ color: '#F97316' }}>
                      Average Score: <strong>{histories[user.user_id].average_score.toFixed(1)}/10</strong>
                    </p>
                  )}
                  <div className="flex flex-col gap-3">
                    {histories[user.user_id].history.map((item, i) => (
                      <div key={i} className="rounded-lg p-3 flex gap-3 items-center border" style={{ background: '#FFF8F2', borderColor: '#F0E4D8' }}>
                        {item.thumbnail_url && (
                          <img src={item.thumbnail_url} alt="" className="w-20 h-12 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#292524' }}>{item.video_title}</p>
                          <p className="text-xs truncate" style={{ color: '#78716C' }}>{item.youtube_url}</p>
                          <p className="text-xs" style={{ color: '#A8A29E' }}>
                            {new Date(item.last_viewed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right text-sm shrink-0">
                          {item.quiz_attempted
                            ? <span style={{ color: '#16A34A' }}>{item.latest_score}/10</span>
                            : <span style={{ color: '#A8A29E' }}>—</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: '#FFFFFF', borderColor: '#F0E4D8' }}>
      <p className="text-xs mb-1" style={{ color: '#78716C' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: '#F97316' }}>{value}</p>
    </div>
  )
}