import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RouteParams } from '@/lib/types/typehelper';
import { checkIsAdmin, checkHasProfile, getUserProfile } from '@/lib/auth';


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

// PATCH - แก้ไขการเข้าพบ
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  const isAdmin = await checkIsAdmin();

  try {
    const data = await request.json();

    // BOLA Protection: Check if user owns this visit
    if (!isAdmin) {
      const profile = await getUserProfile();
      const existingVisit = await prisma.visit.findUnique({
        where: { id },
        select: { sales: true }
      });

      if (!existingVisit || existingVisit.sales !== profile?.name) {
        return NextResponse.json({ error: 'Forbidden: You do not own this record' }, { status: 403 });
      }
    }

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