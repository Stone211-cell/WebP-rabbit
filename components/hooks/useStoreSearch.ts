'use client';

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useDebounce } from './useDebounce';

export function useStoreSearch(initialStoreRef = '', initialSelectedStore = null) {
    const [storeSearch, setStoreSearch] = useState(initialStoreRef);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(initialSelectedStore);

    // Use shared useDebounce hook instead of manual setTimeout
    const debouncedSearch = useDebounce(storeSearch, 500);

    useEffect(() => {
        if (debouncedSearch?.length > 0 && debouncedSearch !== selectedStore?.code) {
            setIsSearching(true);
            setShowSuggestions(true);
            axiosInstance.get(`/stores?search=${debouncedSearch}`)
                .then(res => setSuggestions(res.data))
                .catch(() => setSuggestions([]))
                .finally(() => setIsSearching(false));
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [debouncedSearch, selectedStore?.code]);

    const selectStore = (store: any) => {
        setSelectedStore(store);
        setStoreSearch(store.code);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const clearStore = () => {
        setSelectedStore(null);
        setStoreSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleManualSearch = async () => {
        if (!storeSearch || storeSearch === selectedStore?.code) return;
        setIsSearching(true);
        setShowSuggestions(true);
        try {
            const res = await axiosInstance.get(`/stores?search=${storeSearch}`);
            setSuggestions(res.data);
        } catch {
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    };

    return {
        storeSearch,
        setStoreSearch,
        isSearching,
        suggestions,
        showSuggestions,
        setShowSuggestions,
        selectedStore,
        setSelectedStore,
        selectStore,
        clearStore,
        handleManualSearch,
    };
}
