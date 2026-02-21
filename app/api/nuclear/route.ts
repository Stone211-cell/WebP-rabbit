import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderError } from '@/lib/rendererror';

export async function DELETE() {
    try {
        // Nuclear Reset: Delete everything except Profile
        // We do it in an order that respects foreign keys
        const [
            issueCount,
            forecastCount,
            visitCount,
            planCount,
            purchaseCount
        ] = await Promise.all([
            prisma.issue.deleteMany({}),
            prisma.forecast.deleteMany({}),
            prisma.visit.deleteMany({}),
            prisma.plan.deleteMany({}),
            prisma.purchase.deleteMany({}),
        ]);

        // Now delete stores and products (no longer have children)
        const [storeCount, productCount] = await Promise.all([
            prisma.store.deleteMany({}),
            prisma.product.deleteMany({}),
        ]);

        return NextResponse.json({
            deleted: {
                stores: storeCount.count,
                visits: visitCount.count,
                plans: planCount.count,
                forecasts: forecastCount.count,
                issues: issueCount.count,
                products: productCount.count,
                purchases: purchaseCount.count
            },
            message: "ล้างข้อมูลโครงการทั้งหมดเรียบร้อยแล้ว (ยกเว้นรายชื่อผู้ใช้งาน)"
        });
    } catch (error) {
        return renderError(error);
    }
}
