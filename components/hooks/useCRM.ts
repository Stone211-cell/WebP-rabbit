'use client';

import { Store, Visit, Plan, Forecast } from '@/lib/types/crm';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export function useCRM() {
  const [stores, setStores] = useState<Store[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- STORES ---------------- */

  const fetchStores = useCallback(async (search?: string, type?: string, status?: string) => {
    try {
      setLoading(true);
      const res = await axios.get<Store[]>('/api/stores', {
        params: { search, type, status },
      });
      setStores(res.data);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStore = async (store: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Store>('/api/stores', store);
    setStores((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateStore = async (id: string, store: Partial<Store>) => {
    const res = await axios.put<Store>(`/api/stores/${id}`, store);
    setStores((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    return res.data;
  };

  const deleteStore = async (id: string) => {
    await axios.delete(`/api/stores/${id}`);
    setStores((prev) => prev.filter((s) => s.id !== id));
  };

  /* ---------------- VISITS ---------------- */

  const fetchVisits = useCallback(async (search?: string, sales?: string, startDate?: string, endDate?: string) => {
    try {
      const res = await axios.get<Visit[]>('/api/visits', {
        params: { search, sales, startDate, endDate },
      });
      setVisits(res.data);
    } catch (error) {
      console.error('Failed to fetch visits:', error);
    }
  }, []);

  const createVisit = async (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Visit>('/api/visits', visit);
    setVisits((prev) => [res.data, ...prev]);
    return res.data;
  };

  const deleteVisit = async (id: string) => {
    await axios.delete(`/api/visits/${id}`);
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  /* ---------------- PLANS ---------------- */

  const fetchPlans = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const res = await axios.get<Plan[]>('/api/plans', {
        params: { startDate, endDate },
      });
      setPlans(res.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  }, []);

  const createPlan = async (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Plan>('/api/plans', plan);
    setPlans((prev) => [res.data, ...prev]);
    return res.data;
  };

  const deletePlan = async (id: string) => {
    await axios.delete(`/api/plans/${id}`);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------------- FORECASTS ---------------- */

  const fetchForecasts = useCallback(async (weekStart?: string) => {
    try {
      const res = await axios.get<Forecast[]>('/api/forecasts', {
        params: { weekStart },
      });
      setForecasts(res.data);
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
    }
  }, []);

  const createForecast = async (forecast: Omit<Forecast, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await axios.post<Forecast>('/api/forecasts', forecast);
    setForecasts((prev) => [res.data, ...prev]);
    return res.data;
  };

  const updateForecast = async (id: string, forecast: Partial<Forecast>) => {
    const res = await axios.put<Forecast>(`/api/forecasts/${id}`, forecast);
    setForecasts((prev) => prev.map((f) => (f.id === id ? res.data : f)));
    return res.data;
  };

  const deleteForecast = async (id: string) => {
    await axios.delete(`/api/forecasts/${id}`);
    setForecasts((prev) => prev.filter((f) => f.id !== id));
  };

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    fetchStores();
    fetchVisits();
    fetchPlans();
    fetchForecasts();
  }, [fetchStores, fetchVisits, fetchPlans, fetchForecasts]);

  /* ---------------- SEARCH ---------------- */

  const searchStore = (keyword: string): Store[] => {
    if (!keyword) return [];
    const k = keyword.toLowerCase();
    return stores.filter(
      (s) =>
        s.code?.toLowerCase().includes(k) ||
        s.name?.toLowerCase().includes(k) ||
        s.owner?.toLowerCase().includes(k)
    );
  };

  return {
    stores,
    visits,
    plans,
    forecasts,
    loading,
    searchStore,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    fetchVisits,
    createVisit,
    deleteVisit,
    fetchPlans,
    createPlan,
    deletePlan,
    fetchForecasts,
    createForecast,
    updateForecast,
    deleteForecast,
  };
}