import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const visits = await prisma.visit.findMany();
        let visitCount = 0;
        for (const v of visits) {
            if (v.date.getFullYear() > 2400) {
                const newDate = new Date(v.date);
                newDate.setFullYear(newDate.getFullYear() - 543);
                await prisma.visit.update({ where: { id: v.id }, data: { date: newDate } });
                visitCount++;
            }
        }

        const plans = await prisma.plan.findMany();
        let planCount = 0;
        for (const p of plans) {
            if (p.date.getFullYear() > 2400) {
                const newDate = new Date(p.date);
                newDate.setFullYear(newDate.getFullYear() - 543);
                await prisma.plan.update({ where: { id: p.id }, data: { date: newDate } });
                planCount++;
            }
        }

        return NextResponse.json({ success: true, visitCount, planCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
