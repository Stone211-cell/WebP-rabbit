import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        console.error('GET /api/products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.code || !body.name) {
            return NextResponse.json(
                { error: 'Code and Name are required.' },
                { status: 400 }
            );
        }

        const newProduct = await prisma.product.create({
            data: {
                code: body.code,
                name: body.name,
                category: body.category || null,
                price: parseFloat(body.price) || 0,
                unit: body.unit || null,
                description: body.description || null,
                image: body.image || null,
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
        console.error('POST /api/products error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
