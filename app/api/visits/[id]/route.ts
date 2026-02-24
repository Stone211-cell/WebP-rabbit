import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RouteParams } from '@/lib/types/typehelper';
import { checkIsAdmin } from '@/lib/auth';


// DELETE - ลบการเข้าพบ
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkIsAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }
  const { id } = await params;

  try {
    await prisma.visit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/visits/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete visit' },
      { status: 500 }
    );
  }
}

// PUT - แก้ไขการเข้าพบ
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  if (!await checkIsAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await request.json();

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: {
        date: data.date,
        sales: data.sales,
        storeRef: data.storeRef, // optional
        masterId: data.masterId,
        visitCat: data.visitCat,
        visitType: data.visitType,
        dealStatus: data.dealStatus,
        closeReason: data.closeReason,
        notes: data.notes,
      },
      include: {
        store: true,
      }
    });

    return NextResponse.json(updatedVisit);
  } catch (error) {
    console.error('PUT /api/visits/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update visit' },
      { status: 500 }
    );
  }
}