import { axiosInstance } from "@/lib/axios"
import type { Store } from "@/lib/types/crm"

/**
 * Fetch list of stores
 */
export async function fetchStores(search?: string, type?: string, status?: string): Promise<Store[]> {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (type) params.type = type
  if (status) params.status = status

  const res = await axiosInstance.get('/stores', { params })
  return res.data
}

/**
 * Fetch single store by id
 */
export async function fetchStoreById(id: string): Promise<Store> {
  const res = await axiosInstance.get(`/stores/${encodeURIComponent(id)}`)
  return res.data
}

/**
 * Create store
 */
export async function createStore(payload: Partial<Store> | Record<string, any>): Promise<Store> {
  const res = await axiosInstance.post('/stores', payload)
  return res.data
}

/**
 * Update store
 */
export async function updateStore(id: string, payload: Partial<Store> | Record<string, any>): Promise<Store> {
  const res = await axiosInstance.put(`/stores/${encodeURIComponent(id)}`, payload)
  return res.data
}

/**
 * Delete store
 */
export async function deleteStore(id: string): Promise<any> {
  const res = await axiosInstance.delete(`/stores/${encodeURIComponent(id)}`)
  return res.data
}