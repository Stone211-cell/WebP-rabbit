import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 

// GET - โหลดแผน
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        store: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('GET /api/plans error:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

// POST - สร้างแผน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const plan = await prisma.plan.create({
      data: {
        date: new Date(body.date),
        sales: body.sales,
        storeRef: body.storeRef || null,
        masterId: body.masterId || null,
        visitCat: body.visitCat || null,
        notes: body.notes || null,
        order: body.order || null,
      },
      include: {
        store: true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('POST /api/plans error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
