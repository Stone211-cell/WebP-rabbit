import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderError } from '@/lib/rendererror';
import { checkIsAdmin } from '@/lib/auth';

// DELETE - ลบชิ้นส่วนเนื้อ (admin only)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    try {
        const { id } = await params;
        await prisma.meatPart.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return renderError(error);
    }
}

// PATCH - แก้ไขชิ้นส่วนเนื้อ (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    try {
        const { id } = await params;
        const body = await request.json();
        const part = await prisma.meatPart.update({
            where: { id },
            data: body,
        });
        return NextResponse.json(part);
    } catch (error) {
        return renderError(error);
    }
}
