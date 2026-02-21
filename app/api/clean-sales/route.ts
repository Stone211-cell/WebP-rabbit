import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const visits = await prisma.visit.findMany({
            where: { sales: { contains: '(ยังไม่ลงทะเบียน)' } }
        });

        let visitsCount = 0;
        for (const v of visits) {
            const cleanName = v.sales.replace('(ยังไม่ลงทะเบียน)', '').trim();
            await prisma.visit.update({
                where: { id: v.id },
                data: { sales: cleanName }
            });
            visitsCount++;
        }

        const plans = await prisma.plan.findMany({
            where: { sales: { contains: '(ยังไม่ลงทะเบียน)' } }
        });

        let plansCount = 0;
        for (const p of plans) {
            const cleanName = p.sales.replace('(ยังไม่ลงทะเบียน)', '').trim();
            await prisma.plan.update({
                where: { id: p.id },
                data: { sales: cleanName }
            });
            plansCount++;
        }

        return NextResponse.json({ success: true, visitsCleaned: visitsCount, plansCleaned: plansCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
