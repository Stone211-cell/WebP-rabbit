import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';
import { renderError } from '@/lib/rendererror';

/* =========================
   GET - ดูคาดการณ์เดียว
========================= */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const forecast = await prisma.forecast.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!forecast) {
      return NextResponse.json({ error: 'Forecast not found' }, { status: 404 });
    }

    return NextResponse.json(forecast);
  } catch (error) {
    return renderError(error);
  }
}

/* =========================
   PUT - แก้ไขคาดการณ์
========================= */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkIsAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();

    const forecast = await prisma.forecast.update({
      where: { id },
      data: {
        product: body.product,
        targetWeek: body.targetWeek ? parseFloat(body.targetWeek) : undefined,
        targetMonth: body.targetMonth ? parseFloat(body.targetMonth) : undefined,
        forecast: body.forecast ? parseFloat(body.forecast) : undefined,
        actual: body.actual ? parseFloat(body.actual) : undefined,
        notes: body.notes,
        weekStart: body.weekStart ? new Date(body.weekStart) : undefined,
      },
    });

    return NextResponse.json(forecast);
  } catch (error) {
    return renderError(error);
  }
}

/* =========================
   DELETE - ลบคาดการณ์
========================= */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!await checkIsAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }
  try {
    const { id } = await context.params;

    await prisma.forecast.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return renderError(error);
  }
}
