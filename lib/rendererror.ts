import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * 🎯 ตัวจัดการ Error ใน API Routes - ทำงานอัตโนมัติ
 * 
 * ใช้ใน API catch block:
 * ```typescript
 * try {
 *   const data = schema.parse(body); // Zod validation
 *   // ... logic
 * } catch (error) {
 *   return renderError(error); // 👈 เสร็จแค่นี้!
 * }
 * ```
 */
export const renderError = (error: unknown) => {
    console.error("Server Error:", error);

    // 🔴 Zod validation errors → ส่ง errors array
    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                message: "ข้อมูลไม่ถูกต้อง",
                errors: error.issues.map((err) => ({
                    path: err.path,
                    message: err.message,
                })),
            },
            { status: 400 }
        );
    }

    // 🔴 Error ทั่วไป → ส่ง message เดียว
    return NextResponse.json(
        {
            message: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
        },
        { status: 500 }
    );
}