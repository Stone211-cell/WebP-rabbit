import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';

// GET - Get all products with optional search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(products);
    } catch (error) {
        return renderError(error);
    }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = productSchema.parse(body);

        const newProduct = await prisma.product.create({
            data: {
                ...validatedData,
                status: body.status || 'active',
            },
        });

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'Product code already exists.' },
                { status: 409 }
            );
        }
        return renderError(error);
    }
}
