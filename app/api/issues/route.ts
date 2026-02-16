import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { renderError } from "@/lib/rendererror"
import { issueSchema } from "@/lib/validate/Zod"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get("search") || ""
        const type = searchParams.get("type") || "all"
        const status = searchParams.get("status") || "all"

        const issues = await prisma.issue.findMany({
            where: {
                AND: [
                    type !== "all" ? { type } : {},
                    status !== "all" ? { status } : {},
                    search ? {
                        OR: [
                            { detail: { contains: search, mode: "insensitive" } },
                            { recorder: { contains: search, mode: "insensitive" } },
                            { store: { name: { contains: search, mode: "insensitive" } } },
                            { store: { code: { contains: search, mode: "insensitive" } } },
                        ]
                    } : {}
                ]
            },
            include: {
                store: true
            },
            orderBy: {
                date: "desc"
            }
        })

        return NextResponse.json(issues)
    } catch (error) {
        return renderError(error)
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const validatedData = issueSchema.parse(body)

        const issue = await prisma.issue.create({
            data: validatedData, // Date is already a Date object from Zod
            include: {
                store: true
            }
        })

        return NextResponse.json(issue)
    } catch (error) {
        return renderError(error)
    }
}
