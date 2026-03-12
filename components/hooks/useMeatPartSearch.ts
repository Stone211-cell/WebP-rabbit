'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import useSWR, { mutate } from 'swr';

export type MeatPartItem = { id: string; name: string; category: string; sortOrder?: number };

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useMeatPartSearch() {
    // SWR will cache this request by the key '/api/meat-parts'
    const { data: partsData, isLoading, error } = useSWR<MeatPartItem[]>('/api/meat-parts', fetcher, {
        revalidateOnFocus: false, // Optional: prevent refetching on window focus for faster perceived feel
        dedupingInterval: 60000, // Cache for 1 minute before checking for updates again
    });

    const parts = partsData || [];

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedPart, setSelectedPart] = useState<MeatPartItem | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filtered = useMemo(() => {
        return parts.filter(p =>
            (categoryFilter === 'all' || p.category === categoryFilter) &&
            (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
        )
    }, [parts, search, categoryFilter])

    const selectPart = (part: MeatPartItem) => {
        setSelectedPart(part);
        setSearch(part.name);
        setShowSuggestions(false);
    };

    const clearPart = () => {
        setSelectedPart(null);
        setSearch('');
        setShowSuggestions(false);
    };

    const addPart = async (name: string, category: string): Promise<MeatPartItem | null> => {
        try {
            const { data } = await axios.post<MeatPartItem>('/api/meat-parts', { name: name.trim(), category })
            // Revalidate SWR cache
            mutate('/api/meat-parts')
            return data
        } catch {
            return null
        }
    }

    const deletePart = async (id: string): Promise<boolean> => {
        try {
            await axios.delete(`/api/meat-parts/${id}`)
            // Revalidate SWR cache
            mutate('/api/meat-parts')
            return true
        } catch {
            return false
        }
    }

    return {
        parts,
        isLoading,
        error,
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        selectedPart,
        setSelectedPart,
        selectPart,
        clearPart,
        showSuggestions,
        setShowSuggestions,
        filtered,
        addPart,
        deletePart,
    };
}
