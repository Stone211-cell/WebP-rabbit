import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('GET /api/stores/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    );
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

    const store = await prisma.store.update({
      where: { id },
      data: {
        name: body.name,
        owner: body.owner ?? null,
        type: body.type ?? null,
        grade: body.grade ?? null,
        phone: body.phone ?? null,
        location: body.location ?? null,
        products: body.products ?? null,
        quantity: body.quantity ?? null,
        freq: body.freq ?? null,
        supplier: body.supplier ?? null,
        payment: body.payment ?? null,
        paymentScore: body.paymentScore ?? null,
        status: body.status ?? 'เปิดการขาย',
        closeReason: body.closeReason ?? null,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('PUT /api/stores/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update store' },
      { status: 500 }
    );
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
    console.error('DELETE /api/stores/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    );
  }
}