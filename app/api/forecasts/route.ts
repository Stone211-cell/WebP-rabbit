import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forecastSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';
import { checkIsAdmin } from '@/lib/auth';

// GET - โหลดคาดการณ์
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');
    const endDateParam = searchParams.get('endDate');

    let where: any = {};

    if (weekStart) {
      const start = new Date(weekStart);
      start.setHours(0, 0, 0, 0);

      const end = endDateParam ? new Date(endDateParam) : new Date(start);
      if (!endDateParam) {
        end.setDate(start.getDate() + 6);
      }
      end.setHours(23, 59, 59, 999);

      where.weekStart = {
        gte: start,
        lte: end,
      };
    }

    const forecasts = await prisma.forecast.findMany({
      where,
      orderBy: [{ store: { code: 'asc' } }, { weekStart: 'asc' }],
      include: {
        store: true,
      },
    });

    return NextResponse.json(forecasts);
  } catch (error) {
    return renderError(error);
  }
}

// POST - สร้างคาดการณ์
export async function POST(request: NextRequest) {
  if (!await checkIsAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }
  try {
    const body = await request.json();
    console.log(body)
    const validatedData = forecastSchema.parse(body);

    const forecast = await prisma.forecast.create({
      data: {
        ...validatedData,
        forcedSales: body.forcedSales ? parseFloat(body.forcedSales) : null,
        forecast: body.forecast ? parseFloat(body.forecast) : null,
        actual: body.actual ? parseFloat(body.actual) : null,
        weekStart: validatedData.weekStart, // Date is already a Date object from Zod
      },
      include: {
        store: true,
      },
    });

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    return renderError(error);
  }
}
