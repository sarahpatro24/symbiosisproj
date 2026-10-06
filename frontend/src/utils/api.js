import axios from 'axios'
import { supabase } from '../lib/supabase'

const api = axios.create({ baseURL: '/api' })

// Attach JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = '/login'
    return Promise.reject(err)
  }
)

export const loadVideoSession = (youtube_url) =>
  api.post('/video-session', { youtube_url })

export const fetchSynopsis = (youtube_url) =>
  api.post('/synopsis', { youtube_url })

export const fetchQuiz = (youtube_url) =>
  api.post('/quiz', { youtube_url })

export const submitScore = (youtube_url, score) =>
  api.post('/submit-score', { youtube_url, score })

export const fetchCaptions = (youtube_url, language) =>
  api.post('/captions', { youtube_url, language })

export const fetchUserHistory = () =>
  api.get('/user/history')

export const fetchAdminUsers = () =>
  api.get('/admin/users')

export const fetchAdminUserHistory = (userId) =>
  api.get(`/admin/user/${userId}/history`)

export const fetchAdminStats = () => 
  api.get('/admin/stats')

export default api