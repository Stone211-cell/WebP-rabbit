import z from "zod";

/**
 * 🎯 Zod Schema สำหรับ Profile
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

/**
 * 🎯 Zod Schema สำหรับ การเข้าพบ (Visit)
 */
export const visitSchema = z.object({
    date: z.coerce.date(), // Auto convert string/number to Date
    sales: z.string().min(1, "กรุณาเลือกชื่อผู้แทนขาย"),
    visitType: z.string().min(1, "กรุณาเลือกประเภทการเยี่ยม"),
    masterId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    visitCat: z.string().optional().nullable(),
    dealStatus: z.string().optional().default("เปิดการขาย"),
    notes: z.any().optional().nullable(),
    order: z.any().optional().nullable(),
})

/**
 * 🎯 Zod Schema สำหรับ แผนงาน (Plan)
 */
export const planSchema = z.object({
    date: z.coerce.date(), // Auto convert
    sales: z.string().min(1, "กรุณาสระบุชื่อผู้แทนขาย"),
    masterId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    visitCat: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    order: z.string().optional().nullable(),
})

/**
 * 🎯 Zod Schema สำหรับ การคาดการณ์ (Forecast)
 */
export const forecastSchema = z.object({
    masterId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    product: z.string().min(1, "กรุณาระบุสินค้า"),
    targetWeek: z.number().min(0, "เป้าหมายรายสัปดาห์ต้องมากกว่า 0"),
    targetMonth: z.number().min(0, "เป้าหมายรายเดือนต้องมากกว่า 0"),
    weekStart: z.coerce.date(), // Auto convert string/number to Date
    notes: z.string().optional().nullable(),
})

/**
 * 🎯 Zod Schema สำหรับ สินค้า (Product)
 */
export const productSchema = z.object({
    code: z.string().min(1, "กรุณาระบุรหัสสินค้า"),
    name: z.string().min(1, "กรุณาระบุชื่อสินค้า"),
    category: z.string().optional().nullable(),
    price: z.number().min(0, "ราคาต้องมีค่ามากกว่าหรือเท่ากับ 0"),
    unit: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
})

/**
 * 🎯 Zod Schema สำหรับ รายการซื้อ (Purchase)
 */
export const purchaseSchema = z.object({
    round: z.string().min(1, "กรุณาระบุรอบบิล"),
    date: z.coerce.date(), // Auto convert
    storeId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    amount: z.union([z.number(), z.string()]).transform((val) => Number(val) || 0),
    status: z.string().default("pending"),
})

/**
 * 🎯 Zod Schema สำหรับ ปัญหา/คำร้องเรียน (Issue)
 */
export const issueSchema = z.object({
    date: z.coerce.date(), // Auto convert
    masterId: z.string().min(1, "กรุณาเลือกร้านค้า"),
    type: z.string().min(1, "กรุณาเลือกประเภทปัญหา"),
    detail: z.string().min(1, "กรุณากรอกรายละเอียดปัญหา"),
    recorder: z.string().min(1, "กรุณาระบุผู้บันทึก"),
    status: z.string().default("pending"),
    notes: z.string().optional().nullable(),
})
