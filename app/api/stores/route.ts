import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { storeSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

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
    });

    return NextResponse.json(stores, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('GET /api/stores error:', error);
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

// POST - สร้างร้านค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = storeSchema.parse(body);

    // ลองสร้างรหัสและบันทึก (Retry 3 ครั้งหากชน)
    let store = null;
    let retries = 3;
    while (retries > 0) {
      try {
        // สร้างรหัสอัตโนมัติ
        let code = validatedData.code;
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

        store = await prisma.store.create({
          data: {
            ...validatedData,
            code,
            payment: validatedData.payment || 'เงินสด',
            status: validatedData.status || 'เปิดการขาย',
          },
        });
        break; // สำเร็จ ออกจาก loop
      } catch (error: any) {
        // หากเป็น error Unique Constraint (code ซ้ำ) ให้ลองใหม่
        if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
          retries--;
          if (retries === 0) throw error;
          continue;
        }
        throw error; // Error อื่นโยนทิ้ง
      }
    }

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    return renderError(error);
  }
}
// DELETE - ลบร้านค้าทั้งหมด (bulk clear — ลบ visits+plans ก่อนเพราะมี FK)
export async function DELETE() {
  try {
    // Delete dependent records first
    const [visitResult, planResult, storeResult] = await Promise.all([
      prisma.visit.deleteMany({}),
      prisma.plan.deleteMany({}),
    ]).then(async ([visitResult, planResult]) => {
      const storeResult = await prisma.store.deleteMany({});
      return [visitResult, planResult, storeResult];
    });

    return NextResponse.json({
      deleted: { stores: storeResult.count, visits: visitResult.count, plans: planResult.count },
      message: `ลบข้อมูลทั้งหมดเรียบร้อยแล้ว (ร้านค้า ${storeResult.count}, เข้าพบ ${visitResult.count}, แผน ${planResult.count})`
    });
  } catch (error) {
    return renderError(error);
  }
}
