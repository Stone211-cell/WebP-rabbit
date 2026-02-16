'use client';

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';

export function useStoreSearch(initialStoreRef = '') {
    const [storeSearch, setStoreSearch] = useState(initialStoreRef);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedStore, setSelectedStore] = useState<any>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            // Threshold: 1 character or more, and not already selected
            if (storeSearch?.length > 0 && storeSearch !== selectedStore?.code) {
                setIsSearching(true);
                setShowSuggestions(true);
                try {
                    const res = await axiosInstance.get(`/stores?search=${storeSearch}`);
                    setSuggestions(res.data.slice(0, 10));
                } catch (err) {
                    console.error('Store Search failed:', err);
                    setSuggestions([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [storeSearch, selectedStore?.code]);

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
            setSuggestions(res.data.slice(0, 10));
        } catch (err) {
            console.error('Manual store search failed:', err);
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
