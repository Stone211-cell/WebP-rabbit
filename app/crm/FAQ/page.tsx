'use client';

import FAQ from '@/components/pagecomponents/FAQ/FAQ';
import { useStores, useIssues } from '@/components/hooks/useCRMHooks';
import { useCRMSession } from '@/components/hooks/useCRMSession';

export default function FAQPage() {
    const { stores, isLoading: storesLoading } = useStores();
    const { issues, fetchIssues, createIssue, updateIssue, deleteIssue, isLoading: issuesLoading } = useIssues();
    const { profiles, isAdmin, currentUserProfile, isLoaded } = useCRMSession();

    const loading = storesLoading || issuesLoading || !isLoaded;

    if (loading) {
        return (
            <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดคำถามที่พบบ่อย...</p>
                </div>
            </div>
        );
    }

    return (
        <FAQ
            stores={stores}
            issues={issues}
            profiles={profiles}
            onRefresh={fetchIssues}
            onCreate={createIssue}
            onUpdate={updateIssue}
            onDelete={deleteIssue}
            isAdmin={isAdmin}
            currentUserProfile={currentUserProfile}
        />
    );
}
