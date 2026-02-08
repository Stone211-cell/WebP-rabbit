import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const api = axios.create({ baseURL: API_URL })

export async function fetchVisits(search?: string, sales?: string, startDate?: string, endDate?: string) {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (sales) params.sales = sales
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const { data } = await api.get('/api/visits', { params })
  return data
}

export async function createVisit(payload: any) {
  const { data } = await api.post('/api/visits', payload)
  return data
}

export async function deleteVisit(id: string) {
  const { data } = await api.delete(`/api/visits/${id}`)
  return data
}
