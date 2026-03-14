'use client';
import { useState } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import ForecastForm from '@/components/pagecomponents/ForecastForm/ForecastForm';
import { useCRM } from '@/components/hooks/useCRM';
import { useCRMSession } from '@/components/hooks/useCRMSession';

export default function ForecastPage() {
    const [date, setDate] = useState<Date>(new Date());
    
    // Calculate week bounds
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
    const weekStartStr = weekStart.toISOString();

    const { stores, forecasts, fetchForecasts, createForecast, updateForecast, deleteForecast, isLoading: crmLoading, isValidating } = useCRM({ 
        forecastWeekStart: weekStartStr 
    });
    const { isAdmin, isLoaded } = useCRMSession();

    const isInitialLoading = (crmLoading && forecasts.length === 0) || !isLoaded;

    return (
        <div className="relative">
            {isInitialLoading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem] min-h-[400px]">
                    <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดคาดการณ์รายสัปดาห์...</p>
                    </div>
                </div>
            )}
            
            {/* Subtle background sync indicator */}
            {isValidating && !isInitialLoading && (
                <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Syncing...</span>
                    </div>
                </div>
            )}

            <ForecastForm
                stores={stores}
                forecasts={forecasts}
                date={date}
                setDate={setDate}
                weekStart={weekStart}
                weekEnd={weekEnd}
                onRefresh={() => fetchForecasts()}
                onCreate={createForecast}
                onUpdate={updateForecast}
                onDelete={deleteForecast}
                isAdmin={isAdmin}
            />
        </div>
    );
}
