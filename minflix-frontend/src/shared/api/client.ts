import axios from 'axios'

/**
 * Cliente HTTP centralizado para consumir la API del backend.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = window.localStorage.getItem('minflix_access_token')

  if (accessToken) {
    if (config.headers && 'set' in config.headers) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    } else {
      config.headers = config.headers ?? {}
      ;(config.headers as Record<string, string>).Authorization =
        `Bearer ${accessToken}`
    }
  }

  return config
})
