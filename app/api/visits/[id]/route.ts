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