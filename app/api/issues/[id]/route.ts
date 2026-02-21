import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderError } from "@/lib/rendererror"
import { issueSchema } from "@/lib/validate/Zod"
import { checkIsAdmin } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const { id } = await params
        const body = await req.json()
        const validatedData = issueSchema.parse(body)

        const issue = await prisma.issue.update({
            where: { id },
            data: {
                ...validatedData,
                date: new Date(validatedData.date),
            },
            include: {
                store: true
            }
        })

        return NextResponse.json(issue)
    } catch (error) {
        return renderError(error)
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const { id } = await params
        await prisma.issue.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return renderError(error)
    }
}
