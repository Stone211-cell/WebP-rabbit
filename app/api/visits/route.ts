import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - โหลดทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sales = searchParams.get('sales') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let where: any = {};

    if (search) {
      where.OR = [
        { storeRef: { contains: search, mode: 'insensitive' } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
        { store: { code: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (sales) {
      where.sales = sales;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        store: true,
      },
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('GET /api/visits error:', error);
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 });
  }
}

// POST - เพิ่มการเข้าพบ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const visit = await prisma.visit.create({
      data: {
        date: new Date(body.date),
        sales: body.sales,
        storeRef: body.storeRef || null,
        masterId: body.masterId || null,
        visitCat: body.visitCat || null,
        visitType: body.visitType,
        dealStatus: body.dealStatus || 'เปิดการขาย',
        closeReason: body.closeReason || null,
        notes: body.notes || null,
        order: body.order || null,
      },
      include: {
        store: true,
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    console.error('POST /api/visits error:', error);
    return NextResponse.json({ error: 'Failed to create visit' }, { status: 500 });
  }
}
