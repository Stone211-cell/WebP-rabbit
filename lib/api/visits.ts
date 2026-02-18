import { axiosInstance } from "@/lib/axios"
import type { Visit } from "@/lib/types/crm" // Ensure this type exists or use any

/**
 * Fetch list of visits (filter by various criteria)
 */
export async function fetchVisits(params: {
  search?: string,
  sales?: string,
  startDate?: string,
  endDate?: string
} = {}): Promise<Visit[]> {
  const res = await axiosInstance.get('/visits', { params })
  return res.data
}

/**
 * Create a new visit
 */
export async function createVisit(payload: any): Promise<Visit> {
  const res = await axiosInstance.post('/visits', payload)
  return res.data
}

/**
 * Update an existing visit
 */
export async function updateVisit(id: string, payload: any): Promise<Visit> {
  const res = await axiosInstance.put(`/visits/${id}`, payload)
  return res.data
}

/**
 * Delete a visit
 */
export async function deleteVisit(id: string): Promise<void> {
  await axiosInstance.delete(`/visits/${id}`)
}