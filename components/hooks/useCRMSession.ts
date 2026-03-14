import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { getIsAdminAction } from '@/lib/auth';
import { useProfiles } from './useCRM';

export function useCRMSession() {
  const { user, isLoaded: userLoaded } = useUser();
  const { profiles, isLoading: profilesLoading, fetchProfiles } = useProfiles();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        try {
          const adminStatus = await getIsAdminAction();
          setIsAdmin(adminStatus);
        } catch (e) {
          console.error('Failed to check admin status', e);
        }
      }
      setAdminChecked(true);
    };
    if (userLoaded) {
      checkAdmin();
    }
  }, [user, userLoaded]);

  const currentUserProfile = useMemo(() => {
    return profiles.find((p: any) => p.clerkId === user?.id);
  }, [profiles, user]);

  const hasProfile = !!currentUserProfile;
  const isLoaded = userLoaded && adminChecked && !profilesLoading;

  return { user, isLoaded, isAdmin, profiles, currentUserProfile, hasProfile, fetchProfiles };
}
