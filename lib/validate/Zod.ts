import z from "zod";

/**
 * 🎯 Zod Schema สำหรับ Profile
 * 
 * แค่กำหนด validation rules ที่นี่ - ที่เหลือทำอัตโนมัติ!
 */
export const profileSchema = z.object({
    name: z.string().min(3, "ชื่อต้องมีอย่างน้อย 3 ตัวอักษร"),
    phone: z.string()
        .min(10, "เบอร์โทรต้องมีอย่างน้อย 10 หลัก")
        .regex(/^[0-9]+$/, "เบอร์โทรต้องเป็นตัวเลขเท่านั้น"),
})

/**
 * 🎯 Zod Schema สำหรับ ร้านค้า (Store)
 */
export const storeSchema = z.object({
    code: z.string().optional(),
    name: z.string().min(1, "กรุณากรอกชื่อร้าน"),
    owner: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    customerType: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    productUsed: z.string().optional().nullable(),
    quantity: z.string().optional().nullable(),
    orderPeriod: z.string().optional().nullable(),
    supplier: z.string().optional().nullable(),
    payment: z.string().optional().nullable(),
    paymentScore: z.string().optional().nullable(),
    status: z.string().default("เปิดการขาย"),
    closeReason: z.string().optional().nullable(),
})