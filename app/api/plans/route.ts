import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { planSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

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

    return NextResponse.json(plans, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    return renderError(error);
  }
}

// POST - สร้างแผน
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = planSchema.parse(body);

    const plan = await prisma.plan.create({
      data: validatedData,
      include: {
        store: true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return renderError(error);
  }
}

// DELETE - ลบแผนงานทั้งหมด (bulk clear)
export async function DELETE() {
  try {
    const result = await prisma.plan.deleteMany({});
    return NextResponse.json({
      deleted: result.count,
      message: `ลบแผนงานทั้งหมด ${result.count} รายการเรียบร้อยแล้ว`
    });
  } catch (error) {
    return renderError(error);
  }
}
