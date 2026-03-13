import useSWR, { mutate } from 'swr';
import axios from 'axios';
import { Store, Visit, Plan, Forecast } from '@/lib/types/crm';
import { KEYS } from './useCRM';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  errorRetryCount: 2,
};

export function useStores(filters?: { search?: string; type?: string; status?: string }) {
  const { search = '', type = '', status = '' } = filters || {};
  const key = KEYS.stores(search, type, status);
  const { data = [], isLoading, mutate: mutateStores } = useSWR<Store[]>(key, fetcher, SWR_CONFIG);

  const fetchStores = () => mutate(key);

  const createStore = async (store: any) => {
    const res = await axios.post<Store>('/api/stores', store);
    mutateStores((prev = []) => [res.data, ...prev]);
    return res.data;
  };
  const updateStore = async (id: string, store: any) => {
    const res = await axios.patch<Store>(`/api/stores/${id}`, store);
    mutateStores((prev = []) => prev.map(s => s.id === id ? res.data : s));
    return res.data;
  };
  const deleteStore = async (id: string) => {
    await axios.delete(`/api/stores/${id}`);
    mutateStores((prev = []) => prev.filter(s => s.id !== id));
  };

  return { stores: data, isLoading, fetchStores, createStore, updateStore, deleteStore };
}

export function useVisits(filters?: { search?: string; sales?: string; startDate?: string; endDate?: string }) {
  const { search = '', sales = '', startDate = '', endDate = '' } = filters || {};
  const key = KEYS.visits(search, sales, startDate, endDate);
  const { data = [], isLoading, mutate: mutateVisits } = useSWR<Visit[]>(key, fetcher, SWR_CONFIG);

  const fetchVisits = () => mutate(key);
  const setVisits = (updater: Visit[] | ((prev: Visit[]) => Visit[])) => {
    if (typeof updater === 'function') {
      mutateVisits(prev => updater(prev ?? []));
    } else {
      mutateVisits(updater);
    }
  };

  const createVisit = async (visit: any) => {
    const res = await axios.post<Visit>('/api/visits', visit);
    mutateVisits((prev = []) => [res.data, ...prev]);
    return res.data;
  };
  const updateVisit = async (id: string, visit: any) => {
    const res = await axios.patch<Visit>(`/api/visits/${id}`, visit);
    mutateVisits((prev = []) => prev.map(v => v.id === id ? res.data : v));
    return res.data;
  };
  const deleteVisit = async (id: string) => {
    await axios.delete(`/api/visits/${id}`);
    mutateVisits((prev = []) => prev.filter(v => v.id !== id));
  };

  return { visits: data, isLoading, fetchVisits, setVisits, createVisit, updateVisit, deleteVisit };
}

export function usePlans(filters?: { startDate?: string; endDate?: string }) {
  const { startDate = '', endDate = '' } = filters || {};
  const key = KEYS.plans(startDate, endDate);
  const { data = [], isLoading, mutate: mutatePlans } = useSWR<Plan[]>(key, fetcher, SWR_CONFIG);

  const fetchPlans = () => mutate(key);

  const createPlan = async (plan: any) => {
    const res = await axios.post<Plan>('/api/plans', plan);
    mutatePlans((prev = []) => [res.data, ...prev]);
    return res.data;
  };
  const updatePlan = async (id: string, plan: any) => {
    const res = await axios.patch<Plan>(`/api/plans/${id}`, plan);
    mutatePlans((prev = []) => prev.map(p => p.id === id ? res.data : p));
    return res.data;
  };
  const deletePlan = async (id: string) => {
    await axios.delete(`/api/plans/${id}`);
    mutatePlans((prev = []) => prev.filter(p => p.id !== id));
  };

  return { plans: data, isLoading, fetchPlans, createPlan, updatePlan, deletePlan };
}

export function useForecasts(filters?: { weekStart?: string; endDate?: string }) {
  const { weekStart = '', endDate = '' } = filters || {};
  const key = KEYS.forecasts(weekStart, endDate);
  const { data = [], isLoading, mutate: mutateForecasts } = useSWR<Forecast[]>(key, fetcher, SWR_CONFIG);

  const fetchForecasts = () => mutate(key);

  const createForecast = async (forecast: any) => {
    const res = await axios.post<Forecast>('/api/forecasts', forecast);
    mutateForecasts((prev = []) => [res.data, ...prev]);
    return res.data;
  };
  const updateForecast = async (id: string, forecast: any) => {
    const res = await axios.patch<Forecast>(`/api/forecasts/${id}`, forecast);
    mutateForecasts((prev = []) => prev.map(f => f.id === id ? res.data : f));
    return res.data;
  };
  const deleteForecast = async (id: string) => {
    await axios.delete(`/api/forecasts/${id}`);
    mutateForecasts((prev = []) => prev.filter(f => f.id !== id));
  };

  return { forecasts: data, isLoading, fetchForecasts, createForecast, updateForecast, deleteForecast };
}

export function useIssues(filters?: { search?: string; type?: string; status?: string }) {
  const { search = '', type = '', status = '' } = filters || {};
  const key = KEYS.issues(search, type, status);
  const { data = [], isLoading, mutate: mutateIssues } = useSWR<any[]>(key, fetcher, SWR_CONFIG);

  const fetchIssues = () => mutate(key);

  const createIssue = async (issue: any) => {
    const res = await axios.post('/api/issues', issue);
    mutateIssues((prev = []) => [res.data, ...prev]);
    return res.data;
  };
  const updateIssue = async (id: string, issue: any) => {
    const res = await axios.patch(`/api/issues/${id}`, issue);
    mutateIssues((prev = []) => prev.map(i => i.id === id ? res.data : i));
    return res.data;
  };
  const deleteIssue = async (id: string) => {
    await axios.delete(`/api/issues/${id}`);
    mutateIssues((prev = []) => prev.filter(i => i.id !== id));
  };

  return { issues: data, isLoading, fetchIssues, createIssue, updateIssue, deleteIssue };
}

export function useProfiles() {
  const key = KEYS.profiles();
  const { data = [], isLoading, mutate: mutateProfiles } = useSWR<any[]>(key, fetcher, SWR_CONFIG);
  const fetchProfiles = () => mutate(key);
  return { profiles: data, isLoading, fetchProfiles };
}
