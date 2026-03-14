'use client';

import { useState } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import ForecastFormStore from '@/components/pagecomponents/ForecastFormStore/ForecastForm';
import { useForecasts, useStores } from '@/components/hooks/useCRM';
import { useCRMSession } from '@/components/hooks/useCRMSession';

export default function ForecastStorePage() {
    const [date, setDate] = useState<Date>(new Date());

    // Calculate week bounds for the list view
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

    // Calculate month bounds for the summary banner
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const monthStartStr = monthStart.toISOString();
    const monthEndStr = monthEnd.toISOString();

    const { stores, isLoading: storesLoading } = useStores();
    // Fetch the entire month by setting weekStart to monthStart and endDate to monthEnd
    const { forecasts, fetchForecasts, createForecast, updateForecast, deleteForecast, isLoading: forecastsLoading } = useForecasts({
        weekStart: monthStartStr,
        endDate: monthEndStr
    });
    const { isAdmin, isLoaded } = useCRMSession();

    const loading = storesLoading || forecastsLoading || !isLoaded;

    if (loading) {
        return (
            <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem]">
                <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดคาดการณ์รายสัปดาห์ร้านค้า...</p>
                </div>
            </div>
        );
    }

    return (
        <ForecastFormStore
            stores={stores}
            forecasts={forecasts}
            date={date}
            setDate={setDate}
            weekStart={weekStart}
            weekEnd={weekEnd}
            onRefresh={fetchForecasts}
            onCreate={createForecast}
            onUpdate={updateForecast}
            onDelete={deleteForecast}
            isAdmin={isAdmin}
        />
    );
}
