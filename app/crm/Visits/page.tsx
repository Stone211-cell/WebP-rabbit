'use client';

import VisitForm from '@/components/pagecomponents/VisitForm/VisitForm';
import { useCRM } from '@/components/hooks/useCRM';
import { useCRMSession } from '@/components/hooks/useCRMSession';

export default function VisitsPage() {
    const { stores, visits, fetchVisits, createVisit, updateVisit, deleteVisit, isLoading: crmLoading, isValidating } = useCRM();
    const { profiles, isAdmin, hasProfile, currentUserProfile, isLoaded } = useCRMSession();

    const isInitialLoading = (crmLoading && visits.length === 0) || !isLoaded;

    return (
        <div className="relative">
            {isInitialLoading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem] min-h-[400px]">
                    <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดบันทึกเข้าพบ...</p>
                    </div>
                </div>
            )}

            {/* Syncing indicator */}
            {isValidating && !isInitialLoading && (
                <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Syncing...</span>
                    </div>
                </div>
            )}

            <VisitForm
                stores={stores}
                visits={visits}
                profiles={profiles}
                onRefresh={fetchVisits}
                onCreate={createVisit}
                onUpdate={updateVisit}
                onDelete={deleteVisit}
                isAdmin={isAdmin}
                hasProfile={hasProfile}
                currentUserProfile={currentUserProfile}
            />
        </div>
    );
}
