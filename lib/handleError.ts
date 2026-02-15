import { toast } from "sonner";

/**
 * 🎯 ตัวจัดการ Error อัตโนมัติ - ใช้กับทุก API call
 * 
 * แค่เรียกใน catch block:
 * ```typescript
 * try {
 *   await api.post("/profile", data);
 * } catch (error) {
 *   handleApiError(error); // 👈 เสร็จแค่นี้!
 * }
 * ```
 */
export const handleApiError = (error: any) => {
    console.error("API Error:", error);

    // 🔴 จัดการ Zod validation errors (จาก API)
    if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
            if (err.message) {
                toast.error(err.message, {
                    style: {
                        background: '#a70909a9',
                        color: '#fff',
                        border: 'none',
                    }
                });
            }
        });
        return;
    }

    // 🔴 จัดการ error ทั่วไป
    const message = error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    toast.error(message, {
        style: {
            background: '#a70909a9',
            color: '#fff',
            border: 'none',
        }
    });
};  
