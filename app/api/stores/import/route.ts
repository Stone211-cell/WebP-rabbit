import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderError } from '@/lib/rendererror';
import { checkIsAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    try {
        const { stores } = await request.json();

        if (!Array.isArray(stores) || stores.length === 0) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Get the last code once
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

        for (let i = 0; i < stores.length; i++) {
            let storeData = stores[i];
            try {
                // Generate code if missing
                if (!storeData.code) {
                    storeData.code = `KHN-C${String(nextNum).padStart(4, '0')}`;
                    nextNum++;
                }

                await prisma.store.create({
                    data: {
                        name: storeData.name || 'ไม่มีชื่อร้าน',
                        code: storeData.code,
                        owner: storeData.owner || null,
                        type: storeData.type || null,
                        customerType: storeData.customerType || null,
                        phone: storeData.phone || null,
                        address: storeData.address || null,
                        productUsed: storeData.productUsed || null,
                        quantity: String(storeData.quantity || ''),
                        orderPeriod: storeData.orderPeriod || null,
                        supplier: storeData.supplier || null,
                        payment: storeData.payment || 'เงินสด',
                        paymentScore: storeData.paymentScore || null,
                        status: storeData.status || 'เปิดการขาย',
                        closeReason: storeData.closeReason || null,
                    }
                });
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({ index: i, name: storeData.name, error: error.message || 'Unknown error' });
            }
        }

        return NextResponse.json(results, { status: 201 });

    } catch (error) {
        return renderError(error);
    }
}
