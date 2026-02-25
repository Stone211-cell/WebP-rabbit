'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';

export type MeatPartItem = { id: string; name: string; category: string; sortOrder?: number };

export function useMeatPartSearch(parts: MeatPartItem[]) {
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
            return data
        } catch {
            return null
        }
    }

    const deletePart = async (id: string): Promise<boolean> => {
        try {
            await axios.delete(`/api/meat-parts/${id}`)
            return true
        } catch {
            return false
        }
    }

    return {
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
