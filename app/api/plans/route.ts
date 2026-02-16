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

    return NextResponse.json(plans);
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
      data: validatedData, // Date is already a Date object from Zod
      include: {
        store: true,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return renderError(error);
  }
}
