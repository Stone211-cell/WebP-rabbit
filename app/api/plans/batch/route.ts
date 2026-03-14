import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIsAdmin } from '@/lib/auth';
import { renderError } from '@/lib/rendererror';

export async function POST(request: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { operations } = body; // Array of { type: 'create' | 'update' | 'delete', id?: string, data?: any }

        if (!Array.isArray(operations)) {
            return NextResponse.json({ error: 'Invalid payload: operations must be an array' }, { status: 400 });
        }

        const results = await prisma.$transaction(async (tx) => {
            const opResults = [];
            for (const op of operations) {
                if (op.type === 'create') {
                    const res = await tx.plan.create({
                        data: {
                            ...op.data,
                            date: new Date(op.data.date)
                        }
                    });
                    opResults.push({ type: 'create', status: 'success', id: res.id });
                } else if (op.type === 'update' && op.id) {
                    const res = await tx.plan.update({
                        where: { id: op.id },
                        data: {
                            ...op.data,
                            date: op.data.date ? new Date(op.data.date) : undefined
                        }
                    });
                    opResults.push({ type: 'update', status: 'success', id: res.id });
                } else if (op.type === 'delete' && op.id) {
                    await tx.plan.delete({
                        where: { id: op.id }
                    });
                    opResults.push({ type: 'delete', status: 'success', id: op.id });
                }
            }
            return opResults;
        });

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Plan batch operation error:", error);
        return renderError(error);
    }
}
