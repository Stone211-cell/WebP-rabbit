// lib/api/stores.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { Store } from '@/lib/types/crm';

/**
 * ApiError - ใช้โยน error ที่มีข้อมูลสถานะและ payload จาก response
 */
export class ApiError extends Error {
  status?: number;
  data?: any;
  config?: AxiosRequestConfig;

  constructor(message: string, status?: number, data?: any, config?: AxiosRequestConfig) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.config = config;
  }
}

/**
 * สร้าง axios instance
 * - ถ้ามี NEXT_PUBLIC_API_URL จะใช้ full baseURL (ใช้ในกรณีเรียก service ต่างโดเมน)
 * - ถ้าไม่มี จะใช้ relative path (ปลอดภัยกับ Next.js dev/prod)
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api: AxiosInstance = axios.create({
  baseURL: API_URL || undefined, // undefined => ใช้ relative URLs
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * ตัวอย่าง request interceptor: ใส่ Authorization header จาก localStorage (ถ้ามี)
 * ถ้าคุณไม่ได้ใช้ token แบบนี้ ให้ลบส่วนนี้ออก
 */
import type { InternalAxiosRequestConfig } from 'axios';

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        // ✅ วิธีที่ถูกกับ axios v1+
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor: จับ error คร่าว ๆ ก่อนส่งออก
 */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    // ถ้ามี response หมายความว่า server ตอบมา (4xx/5xx)
    const status = error.response?.status;
    const data = error.response?.data;
    const message = error.message || 'API request error';
    console.error('API response error', { status, data, message, url: error.config?.url });
    // แปลงเป็น ApiError เพื่อให้ caller จัดการได้ง่าย
    throw new ApiError(message, status, data, error.config);
  }
);

/**
 * Helper wrapper เพื่อคืนค่า data หรือโยน ApiError
 */
async function requestData<T>(promise: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const res = await promise;
    return res.data;
  } catch (err: any) {
    // ถ้าเป็น ApiError ที่เราสร้างจาก interceptor ก็โยนต่อ
    if (err instanceof ApiError) throw err;

    // กรณีอื่นๆ ของ axios
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data;
      const message = err.message || 'Network or Axios error';
      throw new ApiError(message, status, data, err.config);
    }

    // non-axios error
    throw err;
  }
}

/* ================== exported API functions ================== */

/**
 * Fetch list of stores
 */
export async function fetchStores(search?: string, type?: string, status?: string): Promise<Store[]> {
  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (type) params.type = type;
  if (status) params.status = status;

  return await requestData<Store[]>(api.get('/api/stores', { params }));
}

/**
 * Fetch single store by id
 */
export async function fetchStoreById(id: string): Promise<Store> {
  if (!id) throw new ApiError('Missing id', 400);
  return await requestData<Store>(api.get(`/api/stores/${encodeURIComponent(id)}`));
}

/**
 * Create store
 */
export async function createStore(payload: Partial<Store> | Record<string, any>): Promise<Store> {
  return await requestData<Store>(api.post('/api/stores', payload));
}

/**
 * Update store
 */
export async function updateStore(id: string, payload: Partial<Store> | Record<string, any>): Promise<Store> {
  if (!id) throw new ApiError('Missing id', 400);
  return await requestData<Store>(api.put(`/api/stores/${encodeURIComponent(id)}`, payload));
}

/**
 * Delete store
 * returns the server response payload (if any)
 */
export async function deleteStore(id: string): Promise<any> {
  if (!id) throw new ApiError('Missing id', 400);
  return await requestData<any>(api.delete(`/api/stores/${encodeURIComponent(id)}`));
}

/* optional: export axios instance for other uses (e.g., uploads) */
export { api as axiosInstance };