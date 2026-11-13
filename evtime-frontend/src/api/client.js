import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
export const TOKEN_KEY = 'evtimes-auth'

const client = axios.create({ baseURL: API_URL, timeout: 15000 })

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)) || null
  } catch {
    return null
  }
}

client.interceptors.request.use((config) => {
  const auth = getStoredAuth()
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getStoredAuth()) {
      window.dispatchEvent(new Event('evtimes:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0]
    if (first) return String(first)
  }
  if (data?.message) return data.message
  if (error?.code === 'ERR_NETWORK') return 'Cannot reach the server. Please check your connection.'
  return fallback
}

export default client
