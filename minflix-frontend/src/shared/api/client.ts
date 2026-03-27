import axios from 'axios'

/**
 * Cliente HTTP centralizado para consumir la API del backend.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 10000,
})
