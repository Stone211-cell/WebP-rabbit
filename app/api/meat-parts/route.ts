import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderError } from '@/lib/rendererror';
import { checkIsAdmin } from '@/lib/auth';

// GET - โหลดชิ้นส่วนเนื้อทั้งหมด (ทุก role ดูได้)
export async function GET() {
    try {
        const parts = await prisma.meatPart.findMany({
            orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        });
        return NextResponse.json(parts);
    } catch (error) {
        return renderError(error);
    }
}

// POST - เพิ่มชิ้นส่วนเนื้อ (admin only)
export async function POST(request: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const { name, category, sortOrder } = body;

        if (!name || !category) {
            return NextResponse.json({ error: 'name และ category จำเป็นต้องระบุ' }, { status: 400 });
        }

        const part = await prisma.meatPart.create({
            data: { name: name.trim(), category, sortOrder: sortOrder ?? 0 },
        });
        return NextResponse.json(part, { status: 201 });
    } catch (error) {
        return renderError(error);
    }
}
