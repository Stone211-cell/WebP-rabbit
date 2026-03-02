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

  const christianYear = d.getFullYear()
  const buddhistYear = christianYear < 2400 ? christianYear + 543 : christianYear

  // We format normally to get the right Day, Leap Year, and Day of Week
  let formatted = format(d, formatStr, { locale: th })

  // Then we swap out the Christian year for Buddhist year globally in the formatted string
  if (christianYear !== buddhistYear) {
    formatted = formatted.replace(new RegExp(christianYear.toString(), 'g'), buddhistYear.toString())
  }

  return formatted
}

export function normalizeName(s: string) {
  if (!s) return ""
  return s.replace(/\s*\(ยังไม่ลงทะเบียน\)\s*/g, '').toLowerCase().replace(/\s+/g, '')
}

/** แสดง confirm dialog ก่อนลบ — คืน true ถ้าผู้ใช้ยืนยัน */
export function confirmDelete(label = "รายการนี้"): boolean {
  return confirm(`คุณต้องการลบ "${label}" ใช่หรือไม่?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)
}

/** แสดง confirm dialog ก่อนลบข้อมูลทั้งหมด */
export function confirmClearAll(dataLabel = "ข้อมูลทั้งหมด"): boolean {
  return confirm(`⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบ "${dataLabel}"?\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้`)
}
