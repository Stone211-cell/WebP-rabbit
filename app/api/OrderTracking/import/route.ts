import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        let successCount = 0;
        const errors: any[] = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // ค้นหาร้านจากชื่อให้ตรงกับหน้า UI
                const storeNameField = row["ชื่อร้าน"] || row["name"] || row["store_name"] || row["ชื่อ"];
                if (!storeNameField) {
                    errors.push(`Row ${i + 2}: Missing store name`);
                    continue;
                }

                let store = await prisma.store.findFirst({
                    where: { name: { equals: String(storeNameField).trim(), mode: "insensitive" } }
                });

                // Fallback ถอดเป็นรหัสร้านถ้าใส่รหัสมาแทน
                if (!store) {
                    store = await prisma.store.findFirst({
                        where: { code: String(storeNameField).trim() }
                    });
                }

                if (!store) {
                    // สร้างร้านใหม่ให้ ถ้าไม่มีจริงๆ แจ้งเตือนใน dashboard/visits ได้แล้ว เลยสร้างให้เลยเพื่อความไหลลื่น
                    store = await prisma.store.create({
                        data: {
                            code: String(storeNameField).trim(),
                            name: String(storeNameField).trim(),
                            status: "เปิดการขาย"
                        }
                    });
                }

                let finalDate = new Date();
                const rawDate = row["วันที่"] || row["date"];
                if (rawDate && !isNaN(new Date(rawDate).getTime())) {
                    finalDate = new Date(rawDate);
                }

                const rawAmount = row["ยอดซื้อ"] || row["amount"] || row["total"] || 0;
                const amount = typeof rawAmount === 'string' ? parseFloat(rawAmount.replace(/,/g, '')) : parseFloat(rawAmount);

                let status = "pending";
                const rowStatus = String(row["สถานะ"] || row["status"] || "").trim().toLowerCase();
                if (rowStatus.includes("ซื้อแล้ว") || rowStatus === "paid" || rowStatus.includes("✅")) {
                    status = "paid";
                } else if (rowStatus.includes("ไม่ซื้อ") || rowStatus === "pending" || rowStatus.includes("⌛")) {
                    status = "pending";
                }

                await prisma.purchase.create({
                    data: {
                        round: String(row["รอบบิล"] || row["round"] || "-").trim(),
                        date: finalDate,
                        amount: isNaN(amount) ? 0 : amount,
                        status: status,
                        storeId: store.id
                    }
                });

                successCount++;
            } catch (err: any) {
                console.error(`Error processing OrderTracking row ${i + 2}:`, err);
                errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Imported ${successCount} order tracking items successfully`,
            successCount,
            errors
        });

    } catch (error: any) {
        console.error("OrderTracking Import API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to import order tracking items" }, { status: 500 });
    }
}
