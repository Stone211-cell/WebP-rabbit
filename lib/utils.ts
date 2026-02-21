import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatThaiDate(date: Date | string | number | undefined | null, formatStr: string = 'd MMM yyyy') {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"

  const thaiDate = new Date(d)
  if (thaiDate.getFullYear() < 2400) {
    thaiDate.setFullYear(thaiDate.getFullYear() + 543)
  }

  return format(thaiDate, formatStr, { locale: th })
}

export function normalizeName(s: string) {
  if (!s) return ""
  return s.replace(/\s*\(ยังไม่ลงทะเบียน\)\s*/g, '').toLowerCase().replace(/\s+/g, '')
}
