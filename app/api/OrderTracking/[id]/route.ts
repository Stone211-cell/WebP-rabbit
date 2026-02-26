import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkIsAdmin } from "@/lib/auth"
import { renderError } from "@/lib/rendererror"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const body = await req.json()
        const resolvedParams = await params
        const { id } = resolvedParams

        // Allowed update fields
        const { round, date, amount, status, storeId } = body

        const updated = await prisma.purchase.update({
            where: { id },
            data: {
                ...(round !== undefined && { round }),
                ...(date && { date: new Date(date) }),
                ...(amount !== undefined && { amount: parseFloat(amount) }),
                ...(status && { status }),
                ...(storeId && { storeId }),
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        return renderError(error)
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const resolvedParams = await params
        const { id } = resolvedParams
        await prisma.purchase.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return renderError(error)
    }
}
