// types/crm.ts

// ฐานข้อมูลร้านค้า
export interface Store {
  id: string;
  code: string;
  name: string;
  owner: string | null;
  type: string | null;
  grade: string | null;
  phone: string | null;
  location: string | null;
  products: string | null;
  quantity: string | null;
  freq: string | null;
  supplier: string | null;
  payment: string | null;
  paymentScore: string | null;
  status: string;
  closeReason: string | null;
  visitHistory?: Visit[];
  plans?: Plan[];
  forecasts?: Forecast[];
  createdAt: Date;
  updatedAt: Date;
}

// บันทึกการเข้าพบ
export interface Visit {
  id: string;
  date: Date | string;
  sales: string;
  storeRef: string | null;
  masterId: string | null;
  store?: Store | null;
  visitCat: string | null;
  visitType: string;
  dealStatus: string;
  closeReason: string | null;
  notes: Record<number, string> | null;
  order: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// แผนสัปดาห์
export interface Plan {
  id: string;
  date: Date | string;
  sales: string;
  storeRef: string | null;
  masterId: string | null;
  store?: Store | null;
  visitCat: string | null;
  notes: string | null;
  order: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// คาดการณ์รายสัปดาห์
export interface Forecast {
  id: string;
  masterId: string;
  store?: Store;
  product: string;
  targetWeek: number;
  targetMonth: number;
  forecast: number | null;
  actual: number | null;
  notes: string | null;
  weekStart: Date | string;
  createdAt: Date;
  updatedAt: Date;
}