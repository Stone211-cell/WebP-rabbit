import { axiosInstance } from "@/lib/axios"
import type { Plan } from "@/lib/types/crm" // Ensure this type exists or use any

/**
 * Fetch list of plans (filter by week range usually)
 */
export async function fetchPlans(weekStart?: string, weekEnd?: string): Promise<Plan[]> {
  const params: Record<string, string> = {}
  if (weekStart) params.weekStart = weekStart
  if (weekEnd) params.weekEnd = weekEnd

  const res = await axiosInstance.get('/plans', { params })
  return res.data
}

/**
 * Create a new plan
 */
export async function createPlan(payload: any): Promise<Plan> {
  const res = await axiosInstance.post('/plans', payload)
  return res.data
}

/**
 * Update an existing plan
 */
export async function updatePlan(id: string, payload: any): Promise<Plan> {
  const res = await axiosInstance.put(`/plans/${id}`, payload)
  return res.data
}

/**
 * Delete a plan
 */
export async function deletePlan(id: string): Promise<void> {
  await axiosInstance.delete(`/plans/${id}`)
}