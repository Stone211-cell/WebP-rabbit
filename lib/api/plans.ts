import axios from 'axios'
import type { Plan } from '@/lib/types/crm'

// baseURL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// axios instance
const api = axios.create({
  baseURL: API_URL,
})

/**
 * ดึงข้อมูลแผน (filter ตามช่วงวันที่)
 */
export async function fetchPlans(
  startDate?: string,
  endDate?: string
): Promise<Plan[]> {
  const params: Record<string, string> = {}

  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate

  const res = await api.get<Plan[]>('/api/plans', { params })
  return res.data
}

/**
 * สร้างแผนใหม่
 */
export async function createPlan(
  payload: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Plan> {
  const res = await api.post<Plan>('/api/plans', payload)
  return res.data
}

/**
 * ลบแผน
 */
export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/api/plans/${id}`)
}