'use client';

import JobCard from '@/components/pagecomponents/JobCard/JobCard';
import { useVisits, usePlans } from '@/components/hooks/useCRM';
import { useCRMSession } from '@/components/hooks/useCRMSession';

export default function JobCardPage() {
    const { visits, isLoading: visitsLoading } = useVisits();
    const { plans, isLoading: plansLoading } = usePlans();
    const { isLoaded } = useCRMSession();

    const loading = visitsLoading || plansLoading || !isLoaded;

    if (loading) {
        return (
            <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลด Job Card...</p>
                </div>
            </div>
        );
    }

    return (
        <JobCard
            plans={plans}
            visits={visits}
        />
    );
}
