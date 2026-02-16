import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { purchaseSchema } from "@/lib/validate/Zod"
import { renderError } from "@/lib/rendererror"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const status = searchParams.get("status") || "all"

        let where: any = {}
        if (search) {
            where.OR = [
                { round: { contains: search, mode: "insensitive" } },
            ]
        }
        if (status !== "all") {
            where.status = status
        }

        const data = await prisma.purchase.findMany({
            where,
            orderBy: { date: "desc" },
        })
        return NextResponse.json(data)
    } catch (error) {
        return renderError(error)
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const validatedData = purchaseSchema.parse(body)

        const res = await prisma.purchase.create({
            data: {
                ...validatedData,
                date: new Date(validatedData.date),
            },
        })
        return NextResponse.json(res)
    } catch (error) {
        return renderError(error)
    }
}
