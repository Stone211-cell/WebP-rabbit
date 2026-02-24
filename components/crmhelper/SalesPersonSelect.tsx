"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface SalesPersonSelectProps {
    profiles: any[]
    value: string
    onValueChange: (value: string) => void
    isAdmin: boolean
    currentUserProfile?: any
    label?: string
    placeholder?: string
    className?: string
    variant?: 'light' | 'dark'
}

/**
 * SalesPersonSelect — Shared component for selecting a salesperson or recorder.
 * Enforces admin-only selection logic.
 * Used by: PlanForm, VisitForm, FAQ
 */
export function SalesPersonSelect({
    profiles = [],
    value,
    onValueChange,
    isAdmin,
    currentUserProfile,
    label,
    placeholder = "เลือกรายชื่อ",
    className = "",
    variant = 'light',
}: SalesPersonSelectProps) {
    const isDark = variant === 'dark'

    const containerClass = `space-y-1.5 ${className}`

    const inputStyle = isDark
        ? "h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white opacity-70 cursor-not-allowed"
        : "bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-black dark:text-white cursor-not-allowed opacity-70"

    const selectTriggerStyle = isDark
        ? "h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white"
        : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-black dark:text-white"

    const selectContentStyle = isDark
        ? "bg-slate-900 border-slate-800 text-white rounded-2xl overflow-hidden"
        : "rounded-2xl overflow-hidden"

    // If not admin, force show current user's name and disable editing
    if (!isAdmin) {
        return (
            <div className={containerClass}>
                {label && <Label className={isDark ? "text-[10px] font-black uppercase text-slate-500 tracking-wider" : "text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs"}>{label}</Label>}
                <Input
                    value={currentUserProfile?.name || value || ""}
                    readOnly
                    className={inputStyle}
                />
            </div>
        )
    }

    // If admin, show the selection field
    return (
        <div className={containerClass}>
            {label && <Label className={isDark ? "text-[10px] font-black uppercase text-slate-500 tracking-wider" : "text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs"}>{label}</Label>}
            {profiles && profiles.length > 0 ? (
                <Select value={value} onValueChange={onValueChange}>
                    <SelectTrigger className={selectTriggerStyle}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className={selectContentStyle}>
                        {profiles.map((p: any) => (
                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder={placeholder}
                    className={isDark ? "h-12 bg-slate-900/50 border-slate-800 rounded-2xl text-white" : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-black dark:text-white"}
                />
            )}
        </div>
    )
}
