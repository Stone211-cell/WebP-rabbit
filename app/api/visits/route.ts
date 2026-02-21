import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { visitSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

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

    return NextResponse.json(visits, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    return renderError(error);
  }
}

// POST - เพิ่มการเข้าพบ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = visitSchema.parse(body);

    const visit = await prisma.visit.create({
      data: validatedData,
      include: {
        store: true,
      },
    });

    return NextResponse.json(visit, { status: 201 });
  } catch (error) {
    return renderError(error);
  }
}

// DELETE - ลบการเข้าพบทั้งหมด (bulk clear)
export async function DELETE() {
  try {
    const result = await prisma.visit.deleteMany({});
    return NextResponse.json({
      deleted: result.count,
      message: `ลบการเข้าพบทั้งหมด ${result.count} รายการเรียบร้อยแล้ว`
    });
  } catch (error) {
    return renderError(error);
  }
}
