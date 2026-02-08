import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RouteParams } from '@/lib/types/typehelper';


// DELETE - ลบการเข้าพบ
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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