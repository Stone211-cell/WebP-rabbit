import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderError } from '@/lib/rendererror';

export async function POST(request: NextRequest) {
    try {
        const { visits } = await request.json();

        if (!Array.isArray(visits) || visits.length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        const lastStore = await prisma.store.findFirst({
            where: { code: { startsWith: 'KHN-C' } },
            orderBy: { code: 'desc' },
        });

        let nextNum = lastStore
            ? parseInt(lastStore.code.replace('KHN-C', '')) + 1
            : 1;

        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        for (let i = 0; i < visits.length; i++) {
            let visitData = visits[i];
            try {
                let storeId = null;

                // Try to find the store by code or name
                if (visitData.storeCode && visitData.storeCode !== "-") {
                    const existingStore = await prisma.store.findUnique({
                        where: { code: visitData.storeCode }
                    });
                    if (existingStore) {
                        storeId = existingStore.id;
                    }
                }

                if (!storeId && visitData.storeName && visitData.storeName !== "-") {
                    // Try by name if code wasn't found or wasn't provided
                    const existingStoreByName = await prisma.store.findFirst({
                        where: { name: visitData.storeName }
                    });
                    if (existingStoreByName) {
                        storeId = existingStoreByName.id;
                    }
                }

                // Create the store if it doesn't exist
                if (!storeId) {
                    const newCode = `KHN-C${String(nextNum).padStart(4, '0')}`;
                    nextNum++;

                    const newStore = await prisma.store.create({
                        data: {
                            name: visitData.storeName || 'ไม่มีชื่อร้าน',
                            code: visitData.storeCode && visitData.storeCode !== "-" ? visitData.storeCode : newCode,
                            owner: visitData.owner || null,
                            type: visitData.storeType || null,
                            customerType: visitData.customerType || null,
                            phone: visitData.phone || null,
                            address: visitData.address || null,
                            productUsed: visitData.productUsed || null,
                            quantity: visitData.quantity || null,
                            orderPeriod: visitData.orderPeriod || null,
                            supplier: visitData.supplier || null,
                            payment: visitData.payment || 'เงินสด',
                            status: 'เปิดการขาย',
                        }
                    });
                    storeId = newStore.id;
                }

                // Determine correct deal status based on string matching or fallback
                let dealStatus = visitData.status || "เปิดการขาย";

                // Map notes securely
                let notesJSON: any = null;
                if (visitData.notes) {
                    notesJSON = { text: visitData.notes };
                }

                // Verify Date is valid
                let visitDate = new Date();
                if (visitData.date) {
                    const parsedDate = new Date(visitData.date);
                    if (!isNaN(parsedDate.getTime())) {
                        visitDate = parsedDate;
                    }
                }

                // Create the Visit
                await prisma.visit.create({
                    data: {
                        date: visitDate,
                        sales: visitData.sales || '-',
                        masterId: storeId,
                        visitCat: visitData.visitCat || 'ตรวจเยี่ยมประจำเดือน',
                        visitType: visitData.visitType || 'ร้านเดิม',
                        dealStatus: dealStatus,
                        closeReason: visitData.closeReason || null,
                        notes: notesJSON,
                    }
                });

                results.success++;
            } catch (error: any) {
                console.error("Visit import error:", error);
                results.failed++;
                results.errors.push({ index: i, name: visitData.storeName || 'Unknown', error: error.message || 'Unknown error' });
            }
        }

        return NextResponse.json(results, { status: 201 });

    } catch (error) {
        return renderError(error);
    }
}
