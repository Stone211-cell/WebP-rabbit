import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('GET /api/forecasts error:', error);
    return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 });
  }
}

// POST - สร้างคาดการณ์
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const forecast = await prisma.forecast.create({
      data: {
        masterId: body.masterId,
        product: body.product,
        targetWeek: parseFloat(body.targetWeek),
        targetMonth: parseFloat(body.targetMonth),
        forecast: body.forecast ? parseFloat(body.forecast) : null,
        actual: body.actual ? parseFloat(body.actual) : null,
        notes: body.notes || null,
        weekStart: new Date(body.weekStart),
      },
      include: {
        store: true,
      },
    });

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    console.error('POST /api/forecasts error:', error);
    return NextResponse.json({ error: 'Failed to create forecast' }, { status: 500 });
  }
}
