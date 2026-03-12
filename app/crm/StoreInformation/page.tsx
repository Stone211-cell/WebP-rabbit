'use client';

import StoreInformation from '@/components/pagecomponents/StoreInformation/StoreInformation';
import { useStores, useVisits, useIssues } from '@/components/hooks/useCRMHooks';
import { useCRMSession } from '@/components/hooks/useCRMSession';


export default function StoreInformationPage() {
    const { stores, fetchStores, createStore, updateStore, deleteStore, isLoading: storesLoading } = useStores();
    const { visits, isLoading: visitsLoading } = useVisits();
    const { issues, isLoading: issuesLoading } = useIssues();
    const { isAdmin, isLoaded } = useCRMSession();

    const loading = storesLoading || visitsLoading || issuesLoading || !isLoaded;

    if (loading) {
        return (
            <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดข้อมูลร้านค้า...</p>
                </div>
            </div>
        );
    }

    return (
        <StoreInformation
            stores={stores}
            visits={visits}
            issues={issues}
            onRefresh={fetchStores}
            onCreate={createStore}
            onUpdate={updateStore}
            onDelete={deleteStore}
            isAdmin={isAdmin}
        />
    );
}