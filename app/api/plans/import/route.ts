import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const body = await request.json();
        const data = body.plans;
        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: "No data provided" }, { status: 400 });
        }

        let successCount = 0;
        const errors: any[] = [];

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                const storeCode = (row.storeCode || "").trim();
                const storeName = (row.storeName || "").trim();

                if (!storeCode) {
                    errors.push(`Row ${i + 2}: Missing store code`);
                    continue;
                }

                // หาลูกค้าในระบบ
                let master = await prisma.store.findFirst({
                    where: { code: storeCode }
                });

                // ถ้าไม่มีลูกค้า ให้สร้างใหม่เลย
                if (!master) {
                    master = await prisma.store.create({
                        data: {
                            code: storeCode,
                            name: storeName || storeCode,
                            status: "เปิดการขาย"
                        }
                    });
                }

                // จัดการชื่อเซลล์ (Remove auto-suffixing as per plan)
                let salesName = (row.sales || "ไม่ระบุ").trim();

                // จัดการวันที่จาก client-side parsing
                let finalDate = new Date(row.date);
                if (isNaN(finalDate.getTime())) {
                    finalDate = new Date();
                }
                finalDate.setHours(0, 0, 0, 0);

                // ดึงลำดับล่าสุดของเซลล์ในวันนั้น
                const relevantPlans = await prisma.plan.findMany({
                    where: {
                        sales: salesName,
                        date: {
                            gte: new Date(new Date(finalDate).setHours(0, 0, 0, 0)),
                            lte: new Date(new Date(finalDate).setHours(23, 59, 59, 999))
                        }
                    }
                });
                const nextOrder = relevantPlans.length > 0 ? Math.max(...relevantPlans.map(p => parseInt(p.order) || 0)) + 1 : 1;

                // จัดการข้อความโน้ต
                const notesStr = String(row.notes || "-").trim();

                // สร้าง Plan
                await prisma.plan.create({
                    data: {
                        date: finalDate,
                        sales: salesName,
                        masterId: master.id,
                        visitCat: row.visitCat || "ตรวจเยี่ยมประจำเดือน",
                        notes: notesStr,
                        order: String(nextOrder)
                    }
                });

                successCount++;
            } catch (err: any) {
                console.error(`Error processing Plan row ${i + 2}:`, err);
                errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Imported ${successCount} plans successfully`,
            successCount,
            errors
        });

    } catch (error: any) {
        console.error("Plan Import API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to import plans" }, { status: 500 });
    }
}
