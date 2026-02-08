// lib/api/forecasts.ts
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const api = axios.create({ baseURL: API_URL })

export async function fetchForecasts(weekStart?: string) {
  const { data } = await api.get('/api/forecasts', {
    params: { weekStart },
  })
  return data
}

export async function createForecast(data: any) {
  const { data: response } = await api.post('/api/forecasts', data)
  return response
}

export async function updateForecast(id: string, data: any) {
  const { data: response } = await api.put(`/api/forecasts/${id}`, data)
  return response
}

export async function deleteForecast(id: string) {
  const { data } = await api.delete(`/api/forecasts/${id}`)
  return data
}
