import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderError } from "@/lib/rendererror";
import { checkIsAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        return renderError(error);
    }
}

export async function POST(req: NextRequest) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const body = await req.json();
        const product = await prisma.product.create({
            data: {
                code: body.code,
                name: body.name,
                price: parseFloat(body.price),
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        return renderError(error);
    }
}
