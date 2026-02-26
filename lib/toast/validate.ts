/**
 * 🔔 Toast Validation Utility
 *
 * Use `validateFields` before any form submission to guard required inputs.
 * Shows a toast with the field label name when a value is missing or empty.
 *
 * Usage:
 *   import { validateFields } from "@/lib/toast/validate"
 *   import { toast } from "sonner"
 *
 *   const ok = validateFields([
 *     { label: "ร้านค้า", value: selectedStore },
 *     { label: "ชิ้นส่วนเนื้อ", value: selectedMeatPart },
 *     { label: "เป้าหมายสัปดาห์", value: formData.targetWeek },
 *   ], toast.error)
 *   if (!ok) return
 */

export type FieldCheck = {
    /** ชื่อ field ที่จะแสดงใน toast */
    label: string
    /** ค่าที่ต้องการตรวจสอบ (string, number, null, object, etc.) */
    value: unknown
    /** กำหนด condition เองถ้า logic ซับซ้อน (ถ้าไม่ส่งจะใช้ค่า falsy check) */
    invalid?: boolean
}

/**
 * ตรวจสอบ fields ทั้งหมด
 * @returns true ถ้าทุก field ผ่าน, false ถ้ามีอย่างน้อย 1 field ที่ไม่ผ่าน
 */
export function validateFields(
    fields: FieldCheck[],
    showError: (message: string) => void
): boolean {
    for (const field of fields) {
        const isEmpty =
            field.invalid !== undefined
                ? field.invalid
                : !field.value && field.value !== 0

        if (isEmpty) {
            showError(`โปรดกรอกข้อมูล: ${field.label}`)
            return false
        }
    }
    return true
}

/**
 * ตรวจสอบ fields แล้ว return list ของ errors (ทั้งหมดพร้อมกัน)
 */
export function getFieldErrors(fields: FieldCheck[]): string[] {
    return fields
        .filter(f =>
            f.invalid !== undefined ? f.invalid : (!f.value && f.value !== 0)
        )
        .map(f => `โปรดกรอกข้อมูล: ${f.label}`)
}
