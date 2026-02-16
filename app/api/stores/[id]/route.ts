import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storeSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

/* =========================
   GET - ดูร้านค้าเดียว พร้อมประวัติ
========================= */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        visitHistory: {
          orderBy: { createdAt: 'desc' },
        },
        plans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        forecasts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    return renderError(error);
  }
}

/* =========================
   PUT - แก้ไขร้านค้า
========================= */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // ใช้ storeSchema.partial() สำหรับการอัปเดต (อนุญาตให้ส่งบางฟิลด์ได้)
    const validatedData = storeSchema.partial().parse(body);

    const store = await prisma.store.update({
      where: { id },
      data: {
        ...validatedData as any,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    return renderError(error);
  }
}

/* =========================
   DELETE - ลบร้านค้า
========================= */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return renderError(error);
  }
}