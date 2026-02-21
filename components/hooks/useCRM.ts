'use client';

import { useCallback } from 'react';
import { Store, Visit, Plan, Forecast } from '@/lib/types/crm';
import useSWR, { mutate } from 'swr';
import axios from 'axios';

// ─── Generic fetcher ──────────────────────────────────────────────────────────
const fetcher = (url: string) => axios.get(url).then(r => r.data);

// ─── SWR Cache Keys ───────────────────────────────────────────────────────────
export const KEYS = {
  stores: (search = '', type = '', status = '') =>
    `/api/stores?search=${search}&type=${type}&status=${status}`,
  visits: (search = '', sales = '', startDate = '', endDate = '') =>
    `/api/visits?search=${search}&sales=${sales}&startDate=${startDate}&endDate=${endDate}`,
  plans: (startDate = '', endDate = '') =>
    `/api/plans?startDate=${startDate}&endDate=${endDate}`,
  forecasts: (weekStart = '') => `/api/forecasts?weekStart=${weekStart}`,
  issues: (search = '', type = '', status = '') =>
    `/api/issues?search=${search}&type=${type}&status=${status}`,
  profiles: () => `/api/profile`,
};

// ─── SWR Config ───────────────────────────────────────────────────────────────
const SWR_CONFIG = {
  revalidateOnFocus: false,       // ไม่โหลดซ้ำทุกครั้งที่กด tab
  revalidateOnReconnect: true,    // โหลดใหม่เมื่อเน็ตกลับมา
  dedupingInterval: 30000,        // dedup requests ภายใน 30 วินาที
  errorRetryCount: 2,             // retry 2 ครั้งถ้า error
};

export function useCRM(filters?: {
  storeSearch?: string; storeType?: string; storeStatus?: string;
  visitSearch?: string; visitSales?: string; visitStartDate?: string; visitEndDate?: string;
  planStartDate?: string; planEndDate?: string;
  forecastWeekStart?: string;
  issueSearch?: string; issueType?: string; issueStatus?: string;
}) {
  const {
    storeSearch = '', storeType = '', storeStatus = '',
    visitSearch = '', visitSales = '', visitStartDate = '', visitEndDate = '',
    planStartDate = '', planEndDate = '',
    forecastWeekStart = '',
    issueSearch = '', issueType = '', issueStatus = '',
  } = filters || {};

  // ─── SWR Data hooks ───────────────────────────────────────────────────────
  const storeKey = KEYS.stores(storeSearch, storeType, storeStatus);
  const visitKey = KEYS.visits(visitSearch, visitSales, visitStartDate, visitEndDate);
  const planKey = KEYS.plans(planStartDate, planEndDate);
  const forecastKey = KEYS.forecasts(forecastWeekStart);
  const issueKey = KEYS.issues(issueSearch, issueType, issueStatus);

  const { data: stores = [], isLoading: storesLoading, mutate: mutateStores } =
    useSWR<Store[]>(storeKey, fetcher, SWR_CONFIG);

  const { data: visits = [], isLoading: visitsLoading, mutate: mutateVisits } =
    useSWR<Visit[]>(visitKey, fetcher, SWR_CONFIG);

  const { data: plans = [], isLoading: plansLoading, mutate: mutatePlans } =
    useSWR<Plan[]>(planKey, fetcher, SWR_CONFIG);

  const { data: forecasts = [], isLoading: forecastsLoading, mutate: mutateForecasts } =
    useSWR<Forecast[]>(forecastKey, fetcher, SWR_CONFIG);

  const { data: issues = [], isLoading: issuesLoading, mutate: mutateIssues } =
    useSWR<any[]>(issueKey, fetcher, SWR_CONFIG);

  const { data: profiles = [], isLoading: profilesLoading, mutate: mutateProfiles } =
    useSWR<any[]>(KEYS.profiles(), fetcher, SWR_CONFIG);

  const loading = storesLoading || visitsLoading || plansLoading || forecastsLoading || issuesLoading || profilesLoading;

  // ─── Manual refetch helpers ───────────────────────────────────────────────
  const fetchStores = useCallback((search?: string, type?: string, status?: string) =>
    mutate(KEYS.stores(search || storeSearch, type || storeType, status || storeStatus)), [storeSearch, storeType, storeStatus]);

  const fetchVisits = useCallback((search?: string, sales?: string, startDate?: string, endDate?: string) =>
    mutate(KEYS.visits(search || visitSearch, sales || visitSales, startDate || visitStartDate, endDate || visitEndDate)), [visitSearch, visitSales, visitStartDate, visitEndDate]);

  const fetchPlans = useCallback((startDate?: string, endDate?: string) =>
    mutate(KEYS.plans(startDate || planStartDate, endDate || planEndDate)), [planStartDate, planEndDate]);

  const fetchForecasts = useCallback((weekStart?: string) =>
    mutate(KEYS.forecasts(weekStart || forecastWeekStart)), [forecastWeekStart]);

  const fetchIssues = useCallback((search?: string, type?: string, status?: string) =>
    mutate(KEYS.issues(search || issueSearch, type || issueStatus, status || issueStatus)), [issueSearch, issueStatus, issueStatus]);

  const fetchProfiles = useCallback(() => mutate(KEYS.profiles()), []);

  // ─── STORES mutations ──────────────────────────────────────────────────────
  const createStore = async (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Store>('/api/stores', store);
    mutateStores((prev = []) => [res.data, ...prev], false);
    return res.data;
  };

  const updateStore = async (id: string, store: Partial<Store>) => {
    const res = await axios.put<Store>(`/api/stores/${id}`, store);
    mutateStores((prev = []) => prev.map(s => s.id === id ? res.data : s), false);
    return res.data;
  };

  const deleteStore = async (id: string) => {
    await axios.delete(`/api/stores/${id}`);
    mutateStores((prev = []) => prev.filter(s => s.id !== id), false);
  };

  // ─── VISITS mutations ──────────────────────────────────────────────────────
  const createVisit = async (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Visit>('/api/visits', visit);
    mutateVisits((prev = []) => [res.data, ...prev], false);
    return res.data;
  };

  const updateVisit = async (id: string, visit: Partial<Visit>) => {
    const res = await axios.put<Visit>(`/api/visits/${id}`, visit);
    mutateVisits((prev = []) => prev.map(v => v.id === id ? res.data : v), false);
    return res.data;
  };

  const deleteVisit = async (id: string) => {
    await axios.delete(`/api/visits/${id}`);
    mutateVisits((prev = []) => prev.filter(v => v.id !== id), false);
  };

  // ─── PLANS mutations ───────────────────────────────────────────────────────
  const createPlan = async (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Plan>('/api/plans', plan);
    mutatePlans((prev = []) => [res.data, ...prev], false);
    return res.data;
  };

  const updatePlan = async (id: string, plan: Partial<Plan>) => {
    const res = await axios.put<Plan>(`/api/plans/${id}`, plan);
    mutatePlans((prev = []) => prev.map(p => p.id === id ? res.data : p), false);
    return res.data;
  };

  const deletePlan = async (id: string) => {
    await axios.delete(`/api/plans/${id}`);
    mutatePlans((prev = []) => prev.filter(p => p.id !== id), false);
  };

  // ─── FORECASTS mutations ───────────────────────────────────────────────────
  const createForecast = async (forecast: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Forecast>('/api/forecasts', forecast);
    mutateForecasts((prev = []) => [res.data, ...prev], false);
    return res.data;
  };

  const updateForecast = async (id: string, forecast: Partial<Forecast>) => {
    const res = await axios.put<Forecast>(`/api/forecasts/${id}`, forecast);
    mutateForecasts((prev = []) => prev.map(f => f.id === id ? res.data : f), false);
    return res.data;
  };

  const deleteForecast = async (id: string) => {
    await axios.delete(`/api/forecasts/${id}`);
    mutateForecasts((prev = []) => prev.filter(f => f.id !== id), false);
  };

  // ─── ISSUES mutations ──────────────────────────────────────────────────────
  const createIssue = async (issue: any) => {
    const res = await axios.post('/api/issues', issue);
    mutateIssues((prev = []) => [res.data, ...prev], false);
    return res.data;
  };

  const updateIssue = async (id: string, issue: any) => {
    const res = await axios.put(`/api/issues/${id}`, issue);
    mutateIssues((prev = []) => prev.map(i => i.id === id ? res.data : i), false);
    return res.data;
  };

  const deleteIssue = async (id: string) => {
    await axios.delete(`/api/issues/${id}`);
    mutateIssues((prev = []) => prev.filter(i => i.id !== id), false);
  };

  // ─── Client-side search ────────────────────────────────────────────────────
  const searchStore = (keyword: string): Store[] => {
    if (!keyword) return [];
    const k = keyword.toLowerCase();
    return stores.filter(
      s => s.code?.toLowerCase().includes(k) ||
        s.name?.toLowerCase().includes(k) ||
        s.owner?.toLowerCase().includes(k)
    );
  };

  // ─── setVisits (compat for Dashboard import) ─────────────────────────────
  const setVisits = (updater: Visit[] | ((prev: Visit[]) => Visit[])) => {
    if (typeof updater === 'function') {
      mutateVisits(prev => updater(prev ?? []), false);
    } else {
      mutateVisits(updater, false);
    }
  };

  return {
    stores, visits, plans, forecasts, issues, profiles,
    loading,
    searchStore,
    setVisits,
    fetchStores, fetchVisits, fetchPlans, fetchForecasts, fetchIssues, fetchProfiles,
    createStore, updateStore, deleteStore,
    createVisit, updateVisit, deleteVisit,
    createPlan, updatePlan, deletePlan,
    createForecast, updateForecast, deleteForecast,
    createIssue, updateIssue, deleteIssue,
  };
}