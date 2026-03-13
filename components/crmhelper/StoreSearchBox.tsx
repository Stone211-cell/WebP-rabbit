"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2 } from "lucide-react"

interface StoreSearchBoxProps {
    storeSearch: string
    setStoreSearch: (v: string) => void
    suggestions: any[]
    showSuggestions: boolean
    selectedStore: any
    selectStore: (s: any) => void
    clearStore: () => void
    handleManualSearch: () => void
    isSearching?: boolean
    placeholder?: string
    className?: string
    /** 'dark' = ใช้ใน Dialog สีเข้ม, 'light' = ใช้ใน Card ปกติ (default) */
    variant?: 'light' | 'dark'
}

/**
 * StoreSearchBox — Shared store search input with auto-suggest dropdown.
 * Used by: PlanForm, VisitForm, FAQ
 */
export function StoreSearchBox({
    storeSearch,
    setStoreSearch,
    suggestions,
    showSuggestions,
    selectedStore,
    selectStore,
    clearStore,
    handleManualSearch,
    isSearching = false,
    placeholder = "รหัส หรือ ชื่อร้าน...",
    className,
    variant = 'light',
}: StoreSearchBoxProps) {
    const isDark = variant === 'dark'

    const inputClass = isDark
        ? "h-12 bg-white/10 dark:bg-slate-900/50 border-slate-200/20 dark:border-slate-700 rounded-2xl font-bold pr-10 text-slate-900 dark:text-white placeholder:text-slate-500"
        : "bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold pr-10 text-slate-900 dark:text-white"

    const btnClass = isDark
        ? "rounded-2xl h-12 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all active:scale-95"
        : "rounded-2xl h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95"

    const dropdownClass = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"

    return (
        <div className={`relative w-full ${className ?? ""}`}>
            {/* Input row */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder={selectedStore ? "" : placeholder}
                        value={selectedStore ? "" : storeSearch}
                        onChange={(e) => setStoreSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                        className={inputClass}
                    />
                    {/* Selected store tag overlay */}
                    {selectedStore && (
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 ${isDark ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'} text-[10px] font-bold rounded-md pointer-events-none max-w-[85%] truncate`}>
                            {selectedStore.name} ({selectedStore.code})
                        </div>
                    )}
                    {/* Clear button */}
                    {(storeSearch || selectedStore) && (
                        <button
                            type="button"
                            onClick={clearStore}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <Button
                    type="button"
                    onClick={handleManualSearch}
                    disabled={isSearching}
                    className={btnClass}
                >
                    {isSearching
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Search className="w-4 h-4" />
                    }
                </Button>
            </div>

            {/* Auto-suggest dropdown — z-[200] เพื่อขึ้นเหนือ Dialog */}
            {showSuggestions && suggestions.length > 0 && (
                <div className={`absolute z-[200] w-full mt-2 ${dropdownClass} border rounded-3xl shadow-2xl overflow-hidden`}>
                    <div className="max-h-80 overflow-y-auto">
                        {suggestions.map((s: any) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => selectStore(s)}
                                className={`w-full px-4 py-3 text-left transition-colors border-b last:border-0 ${isDark ? 'hover:bg-amber-500/10 border-slate-800' : 'hover:bg-blue-500/10 border-slate-100 dark:border-slate-800/50'}`}
                            >
                                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{s.name}</span>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.code}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
