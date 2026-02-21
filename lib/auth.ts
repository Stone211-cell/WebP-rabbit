import { auth } from '@clerk/nextjs/server';

/**
 * Checks if the current user has the 'admin' role.
 * Standard users have no specific role or a different one.
 */
export async function checkIsAdmin() {
    try {
        const { sessionClaims } = await auth();
        // Assuming role is stored in publicMetadata of the user, 
        // which is available in sessionClaims if configured in Clerk Dashboard.
        // If not, we might need to fetch the user object.
        const role = (sessionClaims?.metadata as any)?.role;
        return role === 'admin';
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
