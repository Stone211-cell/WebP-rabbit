'use server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

/**
 * Checks if the current user has the 'admin' role.
 * Standard users have no specific role or a different one.
 */
export async function checkIsAdmin() {
    try {
        const user = await currentUser();
        // รองรับทั้งแบบที่กำหนดเป็น IsAdmin: true หรือ role: "admin"
        if (user?.privateMetadata?.role === 'admin') {
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

/**
 * Helper to check if user is logged in and has a profile.
 * Use this in API routes where profile is required.
 */
export async function checkHasProfile() {
    try {
        const { sessionClaims } = await auth();
        return !!(sessionClaims?.metadata as any)?.hasProfile;
    } catch (e) {
        return false;
    }
}
/**
 * Server Action for client components to check admin status
 */
export async function getIsAdminAction() {
    return await checkIsAdmin();
}

/**
 * Gets the database profile for the current user.
 */
export async function getUserProfile() {
    try {
        const user = await currentUser();
        if (!user) return null;

        return await prisma.profile.findUnique({
            where: { clerkId: user.id }
        });
    } catch (e) {
        return null;
    }
}
