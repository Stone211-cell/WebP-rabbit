import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - แก้ไขแผน
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate data (allow partial updates if needed, but for simplicity we might want full update)
    // For now, let's assume we send the full payload or validate what's sent.
    // Using simple update here as we trust the frontend to send correct data structure matching schema

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        date: new Date(body.date),
        sales: body.sales,
        masterId: body.masterId,
        visitCat: body.visitCat,
        notes: body.notes,
        order: body.order
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('PUT /api/plans/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE - ลบแผน
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.plan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/plans/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}