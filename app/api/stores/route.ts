import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - โหลดทุกร้านค้า
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    let where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        visitHistory: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('GET /api/stores error:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

// POST - สร้างร้านค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // สร้างรหัสอัตโนมัติ
    let code = body.code;
    if (!code) {
      const lastStore = await prisma.store.findFirst({
        where: { code: { startsWith: 'KHN-C' } },
        orderBy: { code: 'desc' },
      });

      const nextNum = lastStore
        ? parseInt(lastStore.code.replace('KHN-C', '')) + 1
        : 1;

      code = `KHN-C${String(nextNum).padStart(4, '0')}`;
    }

    const store = await prisma.store.create({
      data: {
        code,
        name: body.name,
        owner: body.owner || null,
        type: body.type || null,
        grade: body.grade || null,
        phone: body.phone || null,
        location: body.location || null,
        products: body.products || null,
        quantity: body.quantity || null,
        freq: body.freq || null,
        supplier: body.supplier || null,
        payment: body.payment || 'เงินสด',
        paymentScore: body.paymentScore || null,
        status: body.status || 'เปิดการขาย',
        closeReason: body.closeReason || null,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('POST /api/stores error:', error);
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 });
  }
}
