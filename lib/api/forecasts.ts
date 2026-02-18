import { axiosInstance } from "@/lib/axios"

export async function fetchForecasts(weekStart?: string) {
  const { data } = await axiosInstance.get('/forecasts', {
    params: { weekStart },
  })
  return data
}

export async function createForecast(payload: any) {
  const { data } = await axiosInstance.post('/forecasts', payload)
  return data
}

export async function updateForecast(id: string, payload: any) {
  const { data } = await axiosInstance.put(`/forecasts/${id}`, payload)
  return data
}

export async function deleteForecast(id: string) {
  const { data } = await axiosInstance.delete(`/forecasts/${id}`)
  return data
}
