import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
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
                const storeNameField = row["ร้านค้า"] || row["ชื่อร้าน"] || row["name"] || row["store_name"];
                const storeCodeField = row["รหัสร้านค้า"] || row["รหัสร้าน"] || row["code"] || row["store_code"];
                if (!storeNameField && !storeCodeField) {
                    errors.push(`Row ${i + 2}: Missing store information`);
                    continue;
                }

                let store = await prisma.store.findFirst({
                    where: {
                        OR: [
                            { name: { equals: String(storeNameField || "").trim(), mode: "insensitive" } },
                            { code: String(storeCodeField || "").trim() }
                        ]
                    }
                });

                if (!store) {
                    // สร้างร้านใหม่ให้ ถ้าไม่มีจริงๆ
                    const newName = String(storeNameField || storeCodeField || "ไม่ทราบชื่อร้าน").trim();
                    store = await prisma.store.create({
                        data: {
                            code: String(storeCodeField || storeNameField || Date.now().toString()).trim(),
                            name: newName,
                            status: "เปิดการขาย"
                        }
                    });
                }

                let finalDate = new Date();
                const rawDate = row["วันที่"] || row["date"];
                if (rawDate && !isNaN(new Date(rawDate).getTime())) {
                    finalDate = new Date(rawDate);
                }

                // แปลงสถานะ
                let status = "pending";
                const rowStatus = String(row["สถานะ"] || row["status"] || "").trim().toLowerCase();
                if (rowStatus.includes("ดำเนินการแล้ว") || rowStatus === "done") {
                    status = "done";
                } else if (rowStatus.includes("กำลังแก้ไข") || rowStatus === "fixing") {
                    status = "fixing";
                } else {
                    status = "pending";
                }

                const type = String(row["ประเภท"] || row["type"] || "อื่นๆ").trim();
                const details = String(row["รายละเอียด"] || row["detail"] || "-").trim();
                const recorder = String(row["ผู้บันทึก"] || row["recorder"] || "ไม่ระบุ").trim();

                await prisma.issue.create({
                    data: {
                        date: finalDate,
                        type: type,
                        detail: details,
                        recorder: recorder,
                        status: status,
                        masterId: store.id
                    }
                });

                successCount++;
            } catch (err: any) {
                console.error(`Error processing Issue row ${i + 2}:`, err);
                errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        return NextResponse.json({
            message: `Imported ${successCount} issues successfully`,
            successCount,
            errors
        });

    } catch (error: any) {
        console.error("Issue Import API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to import issues" }, { status: 500 });
    }
}
