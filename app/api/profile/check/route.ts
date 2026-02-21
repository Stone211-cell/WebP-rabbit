import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// Server-side endpoint: checks privateMetadata.hasProfile
// (Client components cannot read privateMetadata directly)
export async function GET() {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ hasProfile: false });

        const hasProfile = !!user.privateMetadata?.hasProfile;
        return NextResponse.json({ hasProfile });
    } catch {
        return NextResponse.json({ hasProfile: false });
    }
}
