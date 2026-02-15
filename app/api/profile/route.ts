import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { profileSchema } from '@/lib/validate/Zod';
import { renderError } from '@/lib/rendererror';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser();
        if (!user) throw new Error("Please Login!!!");
        if (user.privateMetadata?.hasProfile) {
            return NextResponse.json({ hasProfile: true });
        }

        const body = await request.json();
        const data = profileSchema.parse(body);

        await prisma.profile.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress ?? "",
                profileImage: user.imageUrl ?? "",
                ...data,
            },
        });

        const client = await clerkClient();
        await client.users.updateUserMetadata(user.id, {
            publicMetadata: { profileCreated: true },
            privateMetadata: { hasProfile: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return renderError(error);
    }
}
