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

        const validOperations = operations.filter((op: any) => 
            op.type === 'create' || 
            (op.type === 'update' && op.id) || 
            (op.type === 'delete' && op.id)
        );

        const opResults = await prisma.$transaction(
            validOperations.map((op: any) => {
                if (op.type === 'create') {
                    return prisma.forecast.create({
                        data: {
                            ...op.data,
                            weekStart: new Date(op.data.weekStart)
                        }
                    });
                } else if (op.type === 'update' && op.id) {
                    return prisma.forecast.update({
                        where: { id: op.id },
                        data: {
                            ...op.data,
                            weekStart: op.data.weekStart ? new Date(op.data.weekStart) : undefined
                        }
                    });
                } else { // op.type === 'delete' && op.id
                    return prisma.forecast.delete({
                        where: { id: op.id }
                    });
                }
            })
        );

        return NextResponse.json({ success: true, results: opResults });
    } catch (error) {
        console.error("Batch operation error:", error);
        return renderError(error);
    }
}
