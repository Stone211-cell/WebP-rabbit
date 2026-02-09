import axios from 'axios'
import type { Visit } from '@/lib/types/crm'

// baseURL (ใช้ env ถ้ามี ไม่มีก็ localhost)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// axios instance
const api = axios.create({
  baseURL: API_URL,
})

/**
 * ดึงข้อมูลการเข้าพบ (filter ได้)
 */
export async function fetchVisits(
  search?: string,
  sales?: string,
  startDate?: string,
  endDate?: string
): Promise<Visit[]> {
  const params: Record<string, string> = {}

  if (search) params.search = search
  if (sales) params.sales = sales
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const res = await api.get<Visit[]>('/api/visits', { params })
  return res.data
}

/**
 * สร้างการเข้าพบ
 */
export async function createVisit(
  payload: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Visit> {
  const res = await api.post<Visit>('/api/visits', payload)
  return res.data
}

/**
 * ลบการเข้าพบ
 */
export async function deleteVisit(id: string): Promise<void> {
  await api.delete(`/api/visits/${id}`)
}