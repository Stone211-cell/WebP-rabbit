import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forecastSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

// GET - โหลดคาดการณ์
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    let where: any = {};

    if (weekStart) {
      const start = new Date(weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      where.weekStart = {
        gte: start,
        lte: end,
      };
    }

    const forecasts = await prisma.forecast.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
  try {
    const body = await request.json();
    const validatedData = forecastSchema.parse(body);

    const forecast = await prisma.forecast.create({
      data: {
        ...validatedData,
        forecast: body.forecast ? parseFloat(body.forecast) : null,
        actual: body.actual ? parseFloat(body.actual) : null,
        weekStart: new Date(validatedData.weekStart),
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
