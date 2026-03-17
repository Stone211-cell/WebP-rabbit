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
  forecasts: (weekStart = '', endDate = '') =>
    `/api/forecasts?weekStart=${weekStart}&endDate=${endDate}`,
  issues: (search = '', type = '', status = '') =>
    `/api/issues?search=${search}&type=${type}&status=${status}`,
  profiles: () => `/api/profile`,
};

const SWR_CONFIG = {
  revalidateOnFocus: true,        // Enable revalidation on focus for better sync
  revalidateOnReconnect: true,
  dedupingInterval: 100,         // Reduced from 2000ms to allow more immediate re-refetches
  errorRetryCount: 3,
};

/** Global revalidation helper to sync all cached views of a resource */
const revalidateResource = (resourceType: string) => {
  return mutate((key) => typeof key === 'string' && key.startsWith('/api/' + resourceType), undefined, { revalidate: true });
};

export function useCRM(filters?: {
  storeSearch?: string; storeType?: string; storeStatus?: string;
  visitSearch?: string; visitSales?: string; visitStartDate?: string; visitEndDate?: string;
  planStartDate?: string; planEndDate?: string;
  forecastWeekStart?: string; forecastEndDate?: string;
  issueSearch?: string; issueType?: string; issueStatus?: string;
  include?: ('stores' | 'visits' | 'plans' | 'forecasts' | 'issues' | 'profiles')[];
}) {
  const {
    storeSearch = '', storeType = '', storeStatus = '',
    visitSearch = '', visitSales = '', visitStartDate = '', visitEndDate = '',
    planStartDate = '', planEndDate = '',
    forecastWeekStart = '', forecastEndDate = '',
    issueSearch = '', issueType = '', issueStatus = '',
    include = [],
  } = filters || {};

  // If include is empty, assume we want everything (backwards compat)
  const shouldInclude = (key: string) => include.length === 0 || include.includes(key as any);

  // ─── SWR Data hooks ───────────────────────────────────────────────────────
  const storeKey = shouldInclude('stores') ? KEYS.stores(storeSearch, storeType, storeStatus) : null;
  const visitKey = shouldInclude('visits') ? KEYS.visits(visitSearch, visitSales, visitStartDate, visitEndDate) : null;
  const planKey = shouldInclude('plans') ? KEYS.plans(planStartDate, planEndDate) : null;
  const forecastKey = shouldInclude('forecasts') ? KEYS.forecasts(forecastWeekStart, forecastEndDate) : null;
  const issueKey = shouldInclude('issues') ? KEYS.issues(issueSearch, issueType, issueStatus) : null;
  const profileKey = shouldInclude('profiles') ? KEYS.profiles() : null;

  const { data: stores = [], isLoading: storesLoading, isValidating: storesValidating, mutate: mutateStores } =
    useSWR<Store[]>(storeKey, fetcher, SWR_CONFIG);

  const { data: visits = [], isLoading: visitsLoading, isValidating: visitsValidating, mutate: mutateVisits } =
    useSWR<Visit[]>(visitKey, fetcher, SWR_CONFIG);

  const { data: plans = [], isLoading: plansLoading, isValidating: plansValidating, mutate: mutatePlans } =
    useSWR<Plan[]>(planKey, fetcher, SWR_CONFIG);

  const { data: forecasts = [], isLoading: forecastsLoading, isValidating: forecastsValidating, mutate: mutateForecasts } =
    useSWR<Forecast[]>(forecastKey, fetcher, SWR_CONFIG);

  const { data: issues = [], isLoading: issuesLoading, isValidating: issuesValidating, mutate: mutateIssues } =
    useSWR<any[]>(issueKey, fetcher, SWR_CONFIG);

  const { data: profiles = [], isLoading: profilesLoading, isValidating: profilesValidating, mutate: mutateProfiles } =
    useSWR<any[]>(profileKey, fetcher, SWR_CONFIG);

  const isLoading = storesLoading || visitsLoading || plansLoading || forecastsLoading || issuesLoading || profilesLoading;
  const isValidating = storesValidating || visitsValidating || plansValidating || forecastsValidating || issuesValidating || profilesValidating;

  // ─── Manual refetch helpers ───────────────────────────────────────────────
  const fetchStores = useCallback(() => revalidateResource('stores'), []);
  const fetchVisits = useCallback(() => revalidateResource('visits'), []);
  const fetchPlans = useCallback(() => revalidateResource('plans'), []);
  const fetchForecasts = useCallback(() => revalidateResource('forecasts'), []);
  const fetchIssues = useCallback(() => revalidateResource('issues'), []);
  const fetchProfiles = useCallback(() => mutate(KEYS.profiles()), []);

  // ─── STORES mutations ──────────────────────────────────────────────────────
  const createStore = async (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Store>('/api/stores', store);
    await revalidateResource('stores');
    return res.data;
  };

  const updateStore = async (id: string, store: Partial<Store>) => {
    const res = await axios.patch<Store>(`/api/stores/${id}`, store);
    await revalidateResource('stores');
    return res.data;
  };

  const deleteStore = async (id: string, options?: { revalidate?: boolean }) => {
    await axios.delete(`/api/stores/${id}`);
    if (options?.revalidate !== false) await revalidateResource('stores');
  };

  // ─── VISITS mutations ──────────────────────────────────────────────────────
  const createVisit = async (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Visit>('/api/visits', visit);
    await revalidateResource('visits');
    return res.data;
  };

  const updateVisit = async (id: string, visit: Partial<Visit>) => {
    const res = await axios.patch<Visit>(`/api/visits/${id}`, visit);
    await revalidateResource('visits');
    return res.data;
  };

  const deleteVisit = async (id: string, options?: { revalidate?: boolean }) => {
    await axios.delete(`/api/visits/${id}`);
    if (options?.revalidate !== false) await revalidateResource('visits');
  };

  const batchVisits = async (operations: any[], options?: { revalidate?: boolean }) => {
    const res = await axios.post('/api/visits/batch', { operations });
    if (options?.revalidate !== false) await revalidateResource('visits');
    return res.data;
  };

  // ─── PLANS mutations ───────────────────────────────────────────────────────
  const createPlan = async (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Plan>('/api/plans', plan);
    await revalidateResource('plans');
    return res.data;
  };

  const updatePlan = async (id: string, plan: Partial<Plan>) => {
    const res = await axios.patch<Plan>(`/api/plans/${id}`, plan);
    await revalidateResource('plans');
    return res.data;
  };

  const deletePlan = async (id: string, options?: { revalidate?: boolean }) => {
    await axios.delete(`/api/plans/${id}`);
    if (options?.revalidate !== false) await revalidateResource('plans');
  };

  const batchPlans = async (operations: any[], options?: { revalidate?: boolean }) => {
    const res = await axios.post('/api/plans/batch', { operations });
    if (options?.revalidate !== false) await revalidateResource('plans');
    return res.data;
  };

  // ─── FORECASTS mutations ───────────────────────────────────────────────────
  const createForecast = async (forecast: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>, options?: { revalidate?: boolean }) => {
    const res = await axios.post<Forecast>('/api/forecasts', forecast);
    if (options?.revalidate !== false) await revalidateResource('forecasts');
    return res.data;
  };

  const updateForecast = async (id: string, forecast: Partial<Forecast>, options?: { revalidate?: boolean }) => {
    const res = await axios.patch<Forecast>(`/api/forecasts/${id}`, forecast);
    if (options?.revalidate !== false) await revalidateResource('forecasts');
    return res.data;
  };

  const deleteForecast = async (id: string, options?: { revalidate?: boolean }) => {
    await axios.delete(`/api/forecasts/${id}`);
    if (options?.revalidate !== false) await revalidateResource('forecasts');
  };

  const batchForecasts = async (operations: any[], options?: { revalidate?: boolean }) => {
    const res = await axios.post('/api/forecasts/batch', { operations });
    if (options?.revalidate !== false) await revalidateResource('forecasts');
    return res.data;
  };

  // ─── ISSUES mutations ──────────────────────────────────────────────────────
  const createIssue = async (issue: any) => {
    const res = await axios.post('/api/issues', issue);
    await revalidateResource('issues');
    return res.data;
  };

  const updateIssue = async (id: string, issue: any) => {
    const res = await axios.patch(`/api/issues/${id}`, issue);
    await revalidateResource('issues');
    return res.data;
  };

  const deleteIssue = async (id: string) => {
    await axios.delete(`/api/issues/${id}`);
    await revalidateResource('issues');
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
    mutateVisits(updater, { revalidate: false });
  };

  return {
    stores, visits, plans, forecasts, issues, profiles,
    isLoading,
    isValidating,
    loading: isLoading, // compat
    searchStore,
    setVisits,
    fetchStores, fetchVisits, fetchPlans, fetchForecasts, fetchIssues, fetchProfiles,
    createStore, updateStore, deleteStore,
    createVisit, updateVisit, deleteVisit, batchVisits,
    createPlan, updatePlan, deletePlan, batchPlans,
    createForecast, updateForecast, deleteForecast, batchForecasts,
    createIssue, updateIssue, deleteIssue,
  };
}

// ─── Individual export hooks for backwards compatibility/simplicity ────────
export function useStores(filters?: any) {
  const { stores, isLoading, fetchStores, createStore, updateStore, deleteStore } = useCRM({
    storeSearch: filters?.search,
    storeType: filters?.type,
    storeStatus: filters?.status,
  });
  return { stores, isLoading, fetchStores, createStore, updateStore, deleteStore };
}

export function useVisits(filters?: any) {
  const { visits, isLoading, fetchVisits, setVisits, createVisit, updateVisit, deleteVisit } = useCRM({
    visitSearch: filters?.search,
    visitSales: filters?.sales,
    visitStartDate: filters?.startDate,
    visitEndDate: filters?.endDate,
    include: ['stores', 'visits']
  });
  return { visits, isLoading, fetchVisits, setVisits, createVisit, updateVisit, deleteVisit };
}

export function usePlans(filters?: any) {
  const { plans, isLoading, fetchPlans, createPlan, updatePlan, deletePlan } = useCRM({
    planStartDate: filters?.startDate,
    planEndDate: filters?.endDate,
    include: ['stores', 'plans']
  });
  return { plans, isLoading, fetchPlans, createPlan, updatePlan, deletePlan };
}

export function useForecasts(filters?: any) {
  const { forecasts, isLoading, fetchForecasts, createForecast, updateForecast, deleteForecast } = useCRM({
    forecastWeekStart: filters?.weekStart,
    forecastEndDate: filters?.endDate,
    include: ['forecasts']
  });
  return { forecasts, isLoading, fetchForecasts, createForecast, updateForecast, deleteForecast };
}

export function useIssues(filters?: any) {
  const { issues, isLoading, fetchIssues, createIssue, updateIssue, deleteIssue } = useCRM({
    issueSearch: filters?.search,
    issueType: filters?.type,
    issueStatus: filters?.status,
    include: ['stores', 'issues']
  });
  return { issues, isLoading, fetchIssues, createIssue, updateIssue, deleteIssue };
}

export function useProfiles() {
  const { profiles, isLoading, fetchProfiles } = useCRM({ include: ['profiles'] });
  return { profiles, isLoading, fetchProfiles };
}