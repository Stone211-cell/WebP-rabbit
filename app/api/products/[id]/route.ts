import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderError } from "@/lib/rendererror";
import { checkIsAdmin } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized: Admin only" }, { status: 403 });
    }
    try {
        const { id } = await context.params;
        await prisma.product.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return renderError(error);
    }
}
