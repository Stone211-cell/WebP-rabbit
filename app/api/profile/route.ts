import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const profiles = await prisma.profile.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(profiles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Please Login!!!");
        if (user.privateMetadata?.hasProfile) {
            return NextResponse.json({ hasProfile: true });
        }

        const body = await request.json();
        const data = profileSchema.parse(body);

        const newProfile = await prisma.profile.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress ?? "",
                profileImage: user.imageUrl ?? "",
                ...data,
            },
        });

        // Auto-merge: Transfer data from any variations of this name (including "(ยังไม่ลงทะเบียน)")
        if (data.name) {
            const { normalizeName } = await import('@/lib/utils');
            const targetNorm = normalizeName(data.name);

            // Find all unique sales names in Visits and Plans
            const [uniqueVisitSales, uniquePlanSales] = await Promise.all([
                prisma.visit.findMany({ select: { sales: true }, distinct: ['sales'] }),
                prisma.plan.findMany({ select: { sales: true }, distinct: ['sales'] })
            ]);

            const allUniqueNames = new Set([
                ...uniqueVisitSales.map(v => v.sales),
                ...uniquePlanSales.map(p => p.sales)
            ].filter(Boolean) as string[]);

            // Find names that normalize to the same string as the new profile
            const matchingNames = Array.from(allUniqueNames).filter(name => normalizeName(name) === targetNorm);

            if (matchingNames.length > 0) {
                await Promise.all([
                    prisma.visit.updateMany({
                        where: { sales: { in: matchingNames } },
                        data: { sales: data.name }
                    }),
                    prisma.plan.updateMany({
                        where: { sales: { in: matchingNames } },
                        data: { sales: data.name }
                    })
                ]);
            }
        }

        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
            privateMetadata: { hasProfile: true },
        });

        return NextResponse.json({ success: true, profile: newProfile });
    } catch (error) {
        return renderError(error);
    }
}
