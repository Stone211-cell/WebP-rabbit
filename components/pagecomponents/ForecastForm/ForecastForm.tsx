"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns"
import { cn, formatThaiDate } from "@/lib/utils"
import { useMeatPartSearch } from "@/components/hooks/useMeatPartSearch"
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { SaveButton, CancelButton } from "@/components/crmhelper/ActionButtons"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
// import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Target,
    ShoppingBag,
    CheckCircle2,
    //    AlertCircle
} from "lucide-react"

const safeFloat = (val: any) => {
    const parsed = parseFloat(val)
    return isNaN(parsed) ? 0 : parsed
}

const DEFAULT_MEAT_PARTS = [
    { id: 'd-101', name: 'สันนอก', category: 'เนื้อแดง', sortOrder: 1 },
    { id: 'd-107', name: 'สะโพก', category: 'เนื้อแดง', sortOrder: 7 },
    { id: 'd-104', name: 'สันใน', category: 'เนื้อแดง', sortOrder: 4 },
    { id: 'd-114', name: 'น่องลาย', category: 'เนื้อแดง', sortOrder: 14 },
]

interface SelectedTargetStore {
    store: any;
    target: string;
    existingId?: string;
    actual?: number;
}

function TargetStoreRow({ storeItem, index, onChangeStore, onChangeTarget, onRemove }: any) {
    const {
        storeSearch,
        setStoreSearch,
        isSearching,
        suggestions,
        showSuggestions,
        selectedStore,
        selectStore,
        clearStore,
        handleManualSearch,
    } = useStoreSearch(storeItem.store?.code || '')

    useEffect(() => {
        if (selectedStore && selectedStore.id !== storeItem.store?.id) {
            onChangeStore(index, selectedStore)
        }
    }, [selectedStore, index, onChangeStore, storeItem.store?.id])

    useEffect(() => {
        if (storeItem.store && !selectedStore) {
            selectStore(storeItem.store)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="flex items-center gap-2 relative">
            <div className="flex-1">
                <StoreSearchBox
                    storeSearch={storeSearch}
                    setStoreSearch={setStoreSearch}
                    suggestions={suggestions}
                    showSuggestions={showSuggestions}
                    selectedStore={selectedStore}
                    selectStore={selectStore}
                    clearStore={() => { clearStore(); onChangeStore(index, null); }}
                    handleManualSearch={handleManualSearch}
                    isSearching={isSearching}
                    placeholder="พิมพ์ชื่อหรือรหัสร้าน..."
                    variant="dark"
                />
            </div>
            <Input
                type="number"
                placeholder="เป้า (กก.)"
                className="h-12 w-24 border-slate-200 dark:border-slate-700 text-sm font-bold bg-white dark:bg-slate-900/50 rounded-2xl"
                value={storeItem.target}
                onChange={(e) => onChangeTarget(index, e.target.value)}
            />
            <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-2xl shrink-0"
                onClick={() => onRemove(index)}
            >
                <Trash2 size={16} />
            </Button>
        </div>
    )
}

export default function ForecastForm({ stores = [], forecasts, onRefresh, onCreate, onUpdate, onDelete, isAdmin }: any) {
    const router = useRouter()
    const [date, setDate] = useState<Date>(new Date())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDialog, setShowDialog] = useState(false)

    // Edit state
    const [editingGroup, setEditingGroup] = useState<any>(null)

    // Meat Part State (From fontiontwo hook)
    const [savedMeatParts, setSavedMeatParts] = useState<{ id: string; name: string; category: string }[]>([])
    const {
        search: partSearch,
        setSearch: setPartSearch,
        selectedPart: selectedMeatPart,
        selectPart: selectMeatPart,
        clearPart: clearMeatPart,
        showSuggestions: showPartSuggestions,
        setShowSuggestions: setShowPartSuggestions,
        filtered: filteredParts,
        addPart: addMeatPart,
        deletePart: deletePartItem,
    } = useMeatPartSearch(savedMeatParts)

    // Fetch meat parts on mount
    useEffect(() => {
        const fetchParts = async () => {
            try {
                const { data } = await axios.get('/api/meat-parts')
                setSavedMeatParts(data && data.length > 0 ? data : DEFAULT_MEAT_PARTS)
            } catch {
                setSavedMeatParts(DEFAULT_MEAT_PARTS)
            }
        }
        fetchParts()
    }, [])

    const handleAddPart = async () => {
        if (!partSearch) return toast.error("กรุณาพิมพ์ชื่อชิ้นส่วนเนื้อ")
        const newPart = await addMeatPart(partSearch, "เนื้อแดง")
        if (newPart) {
            setSavedMeatParts(prev => [newPart, ...prev.filter(p => p.id !== newPart.id)])
            selectMeatPart(newPart)
        }
    }

    const handleDeletePart = async (id: string) => {
        if (!confirm("ยืนยันลบชิ้นส่วนนี้?")) return
        const ok = await deletePartItem(id)
        if (ok) {
            setSavedMeatParts(prev => prev.filter(p => p.id !== id))
            if (selectedMeatPart?.id === id) clearMeatPart()
        }
    }

    // Dialog form states
    const [selectedStores, setSelectedStores] = useState<SelectedTargetStore[]>([])
    const [totalForecastInput, setTotalForecastInput] = useState<string>("")
    const [notes, setNotes] = useState<string>("")

    const autoTotalTarget = useMemo(() => {
        let sum = 0;
        selectedStores.forEach(s => sum += safeFloat(s.target));
        return sum;
    }, [selectedStores])

    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
    const weekStartStr = weekStart.toISOString()

    useEffect(() => {
        if (onRefresh) onRefresh(weekStartStr)
    }, [weekStartStr, onRefresh])

    const goPrevWeek = () => setDate(subWeeks(date, 1))
    const goNextWeek = () => setDate(addWeeks(date, 1))

    const resetForm = () => {
        setEditingGroup(null)
        setTotalForecastInput("")
        setSelectedStores([])
        setNotes("")
        clearMeatPart()
        setPartSearch("")
        setShowDialog(false)
    }

    const openAddDialog = () => {
        resetForm()
        setShowDialog(true)
    }

    const handleEditGroup = (group: any) => {
        resetForm()
        setEditingGroup(group)

        // Set meat part
        const fp = savedMeatParts.find(p => p.name === group.product) || { id: 'temp', name: group.product, category: 'เนื้อแดง' }
        selectMeatPart(fp)

        // Auto calculate existing inputs
        setTotalForecastInput(group.totalForecast.toString())

        // Map existing stores
        const mappedStores = group.items.map((item: any) => ({
            store: item.store,
            target: item.targetWeek.toString(),
            existingId: item.id,
            actual: item.actual
        }))
        setSelectedStores(mappedStores)

        if (group.items.length > 0 && group.items[0].notes) {
            setNotes(group.items[0].notes)
        }

        setShowDialog(true)
    }

    const handleDeleteGroup = async (group: any) => {
        if (!confirm(`ยืนยันลบคาดการณ์ทั้งหมดของชิ้นส่วน ${group.product}?`)) return
        try {
            for (const item of group.items) {
                if (onDelete) await onDelete(item.id)
            }
            if (onRefresh) onRefresh(weekStartStr)
            toast.success("ลบข้อมูลสำเร็จ")
        } catch (e) {
            toast.error("ลบข้อมูลไม่สำเร็จ")
        }
    }

    const handleSubmit = async () => {
        if (!selectedMeatPart && !partSearch) return toast.error("กรุณาเลือกชิ้นส่วน/สินค้า")
        if (selectedStores.length === 0) return toast.error("กรุณาเพิ่มร้านเป้าหมายอย่างน้อย 1 ร้าน")

        const productName = selectedMeatPart ? selectedMeatPart.name : partSearch

        let valid = true
        for (let i = 0; i < selectedStores.length; i++) {
            if (!selectedStores[i].store?.id) {
                toast.error(`กรุณาเลือกร้านค้าในรายการที่ ${i + 1}`)
                valid = false; break;
            }
            if (!selectedStores[i].target || parseFloat(selectedStores[i].target) <= 0) {
                toast.error(`กรุณาระบุเป้า(กก.)ให้ครบถ้วน`)
                valid = false; break;
            }
        }
        if (!valid) return

        const tForecast = safeFloat(totalForecastInput)
        const tTarget = autoTotalTarget

        setIsSubmitting(true)

        try {
            if (editingGroup) {
                const existingItems = editingGroup.items;
                const newIds: string[] = []

                for (const row of selectedStores) {
                    const targetVal = safeFloat(row.target)
                    const forecastVal = tTarget > 0 ? (targetVal / tTarget) * tForecast : 0

                    if (row.existingId) {
                        newIds.push(row.existingId)
                        const original = existingItems.find((x: any) => x.id === row.existingId)
                        if (original) {
                            if (onUpdate) await onUpdate(original.id, {
                                ...original,
                                masterId: row.store.id,
                                targetWeek: targetVal,
                                targetMonth: targetVal * 4,
                                forecast: forecastVal,
                                notes: notes
                            })
                        }
                    } else {
                        if (onCreate) await onCreate({
                            masterId: row.store.id,
                            product: productName,
                            productType: "สด",
                            targetWeek: targetVal,
                            targetMonth: targetVal * 4,
                            forecast: forecastVal,
                            actual: 0,
                            notes: notes,
                            weekStart: weekStart.toISOString()
                        })
                    }
                }

                const toDelete = existingItems.filter((x: any) => !newIds.includes(x.id))
                for (const item of toDelete) {
                    if (onDelete) await onDelete(item.id)
                }

                toast.success("อัปเดตข้อมูลคาดการณ์สำเร็จ")

            } else {
                for (const row of selectedStores) {
                    const targetVal = safeFloat(row.target)
                    const forecastVal = tTarget > 0 ? (targetVal / tTarget) * tForecast : 0

                    if (onCreate) await onCreate({
                        masterId: row.store.id,
                        product: productName,
                        productType: "สด",
                        targetWeek: targetVal,
                        targetMonth: targetVal * 4,
                        forecast: forecastVal,
                        actual: 0,
                        notes: notes,
                        weekStart: weekStart.toISOString()
                    })
                }
                toast.success("เพิ่มข้อมูลคาดการณ์สำเร็จ")
            }

            resetForm()
            if (onRefresh) onRefresh(weekStartStr)
        } catch (e: any) {
            toast.error(e?.message || "เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setIsSubmitting(false)
        }
    }

    const { summary, groupedForecasts } = useMemo(() => {
        let sumWeekTarget = 0, sumWeekForecast = 0, sumWeekActual = 0, sumMonthTarget = 0
        const groups: Record<string, { product: string, items: any[], totalTarget: number, totalForecast: number, totalActual: number }> = {}

        if (forecasts) {
            forecasts.forEach((f: any) => {
                const wTarget = f.targetWeek || 0
                const wForecast = f.forecast || 0
                const wActual = f.actual || 0
                const mTarget = f.targetMonth || 0

                sumWeekTarget += wTarget
                sumWeekForecast += wForecast
                sumWeekActual += wActual
                sumMonthTarget += mTarget

                const pName = f.product || 'ไม่ระบุชิ้นส่วน'
                if (!groups[pName]) groups[pName] = { product: pName, items: [], totalTarget: 0, totalForecast: 0, totalActual: 0 }

                groups[pName].items.push(f)
                groups[pName].totalTarget += wTarget
                groups[pName].totalForecast += wForecast
                groups[pName].totalActual += wActual
            })
        }

        const sortedGroups = Object.values(groups).sort((a: any, b: any) => a.product.localeCompare(b.product))

        return {
            summary: {
                week: { forecast: sumWeekForecast, actual: sumWeekActual, diff: sumWeekActual - sumWeekForecast, target: sumWeekTarget },
                month: { forecast: sumWeekForecast * 4, actual: sumWeekActual * 4, diff: (sumWeekActual * 4) - sumMonthTarget, target: sumMonthTarget }
            },
            groupedForecasts: sortedGroups
        }
    }, [forecasts])


    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 min-h-screen pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                            <TrendingUp size={24} />
                        </span>
                        คาดการณ์ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">ชิ้นส่วนเนื้อรายสัปดาห์</span>
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <Button variant="ghost" size="icon" onClick={goPrevWeek} className="rounded-full h-8 w-8 hover:bg-white dark:hover:bg-slate-600">
                            <ChevronLeft size={16} />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="px-4 h-8 text-xs font-bold rounded-full">
                                    {formatThaiDate(weekStart, "d MMM")} - {formatThaiDate(weekEnd, "d MMM yyyy")}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 bg-slate-900 border-slate-800">
                                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="icon" onClick={goNextWeek} className="rounded-full h-8 w-8 hover:bg-white dark:hover:bg-slate-600">
                            <ChevronRight size={16} />
                        </Button>
                    </div>

                    {isAdmin && (
                        <Button
                            onClick={openAddDialog}
                            className="bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all active:scale-95 px-6 shadow-lg hover:shadow-xl"
                        >
                            <Plus size={18} className="mr-1" />เพิ่มคาดการณ์
                        </Button>
                    )}
                </div>
            </div>

            {/* --- LIST OVERVIEW --- */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-500 font-bold ml-2">
                    <div className="h-4 w-4 bg-indigo-200 rounded-sm"></div> คาดการณ์รายสัปดาห์ แยกตามชิ้นส่วน
                </div>

                {groupedForecasts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedForecasts.map(group => {
                            const diff = group.totalTarget - group.totalForecast
                            const percent = group.totalTarget > 0 ? (group.totalForecast / group.totalTarget) * 100 : 0

                            return (
                                <Card key={group.product} className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[1.2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xl font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">🥩 {group.product}</h4>
                                            {isAdmin && (
                                                <div className="flex gap-1.5">
                                                    <Button size="sm" variant="outline" className="h-7 px-3 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0" onClick={() => handleEditGroup(group)}>แก้ไข</Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-3 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-rose-600 hover:bg-rose-100" onClick={() => handleDeleteGroup(group)}>ลบ</Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Blue Card */}
                                        <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-[1rem] flex items-center justify-between shadow-inner gap-1 sm:gap-0">
                                            <div className="text-center w-1/3 border-r border-blue-500/50 px-1">
                                                <div className="text-[9px] sm:text-[10px] font-bold opacity-80 flex flex-col sm:flex-row items-center justify-center gap-1 mb-1 truncate"><Target size={10} className="hidden sm:block" /> เป้าหมาย </div>
                                                <div className="text-lg sm:text-2xl font-black leading-none truncate">{group.totalTarget.toFixed(1)}</div>
                                                <div className="text-[9px] sm:text-[10px] opacity-70 mt-1">กก.</div>
                                            </div>
                                            <div className="text-center w-1/3 border-r border-blue-500/50 px-1">
                                                <div className="text-[9px] sm:text-[10px] font-bold opacity-80 flex flex-col sm:flex-row items-center justify-center gap-1 mb-1 truncate"><CheckCircle2 size={10} className="hidden sm:block" /> คาดการณ์ </div>
                                                <div className="text-lg sm:text-2xl font-black text-emerald-300 leading-none truncate">{group.totalForecast.toFixed(1)}</div>
                                                <div className="text-[9px] sm:text-[10px] opacity-70 mt-1 truncate">({percent.toFixed(0)}%)</div>
                                            </div>
                                            <div className="text-center w-1/3 px-1">
                                                <div className="text-[9px] sm:text-[10px] font-bold opacity-80 flex flex-col sm:flex-row items-center justify-center gap-1 text-rose-200 mb-1 truncate">✗ ขาด </div>
                                                <div className="text-lg sm:text-2xl font-black text-rose-300 leading-none truncate">{diff.toFixed(1)}</div>
                                                <div className="text-[9px] sm:text-[10px] opacity-70 mt-1">กก.</div>
                                            </div>
                                        </div>

                                        {/* Store Target List */}
                                        <div className="space-y-2 mt-4 pt-2">
                                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 max-w-full">
                                                <ShoppingBag size={12} className="shrink-0" /> ร้านเป้าหมาย
                                            </div>
                                            <div className="space-y-2">
                                                {group.items.map((item: any) => {
                                                    const itemPercent = item.targetWeek > 0 ? (item.actual / item.targetWeek) * 100 : 0;
                                                    return (
                                                        <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-200">
                                                            <div className="min-w-0 pr-2">
                                                                <div className="font-bold text-sm tracking-tight leading-tight truncate">{item.store?.name}</div>
                                                                <div className="text-[10px] opacity-60 font-mono mb-1 truncate">{item.store?.code}</div>
                                                                <div className="text-xs font-medium truncate">เป้า: {item.targetWeek.toFixed(1)} กก.</div>
                                                            </div>
                                                            <div className="font-black text-sm shrink-0">
                                                                {itemPercent.toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400">ยังไม่มีข้อมูลคาดการณ์ในสัปดาห์นี้</p>
                    </div>
                )}
            </div>

            {/* --- ADD/EDIT DIALOG --- */}
            <Dialog open={showDialog} onOpenChange={(o) => { if (!o) resetForm(); else setShowDialog(o); }}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[1.5rem] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="bg-rose-500 text-white p-1.5 rounded-lg"><Target size={16} /></span>
                            {editingGroup ? "แก้ไขคาดการณ์รายสัปดาห์" : "เพิ่มคาดการณ์รายสัปดาห์"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto flex-1">

                        <div className="grid grid-cols-2 gap-6">
                            {/* ชิ้นส่วน/สินค้า */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500">ชิ้นส่วน/สินค้า *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="เช่น สะโพก, น่อง, สันใน"
                                            value={partSearch}
                                            onFocus={() => setShowPartSuggestions(true)}
                                            onChange={(e) => { setPartSearch(e.target.value); setShowPartSuggestions(true) }}
                                            className="h-10 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
                                            disabled={!!editingGroup || !!selectedMeatPart}
                                        />
                                        {showPartSuggestions && filteredParts.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-44 overflow-y-auto">
                                                {filteredParts.map(p => (
                                                    <div key={p.id} className="flex items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                                                        <button
                                                            onClick={() => { selectMeatPart(p); setShowPartSuggestions(false) }}
                                                            className="flex-1 flex items-center gap-2 p-3 text-sm text-left text-slate-700 dark:text-white"
                                                        >
                                                            <span className="flex-1">{p.name}</span>
                                                            <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p.category}</span>
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeletePart(p.id) }}
                                                                className="opacity-0 group-hover/item:opacity-100 p-2 mr-1 rounded-md text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                                                                title="ลบ"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && !selectedMeatPart && (
                                        <Button size="icon" onClick={handleAddPart} className="bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 h-10 w-10 shrink-0" title="เพิ่มชิ้นส่วนใหม่">
                                            <Plus size={16} />
                                        </Button>
                                    )}
                                </div>
                                {selectedMeatPart && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md inline-flex items-center">
                                        ✓ {selectedMeatPart.name}
                                        {!editingGroup && <button onClick={() => clearMeatPart()} className="ml-2 text-slate-400 hover:text-rose-500">✕</button>}
                                    </div>
                                )}
                            </div>

                            {/* เป้าหมายรวม */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-rose-500 flex items-center gap-1"><Target size={12} /> เป้าหมายรวม (กก.) *</Label>
                                <Input
                                    readOnly
                                    className="h-10 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed font-medium text-slate-500"
                                    value={autoTotalTarget || ''}
                                    placeholder="ใส่เป้าหมายแต่ละร้านด้านล่าง"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                            {/* คาดการณ์ขายได้ */}
                            <div className="space-y-2 mb-4">
                                <Label className="text-xs font-bold text-slate-500">คาดการณ์ขายได้ (กก.)</Label>
                                <Input
                                    type="number"
                                    placeholder="ใส่ยอดรวม"
                                    value={totalForecastInput}
                                    onChange={e => setTotalForecastInput(e.target.value)}
                                    className="h-10 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Store List */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><ShoppingBag size={14} /> ร้านเป้าหมาย</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedStores([...selectedStores, { store: null, target: '' }])}
                                    className="h-7 text-xs font-bold bg-slate-100 border-none dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    + เพิ่มร้าน
                                </Button>
                            </div>

                            {selectedStores.length === 0 ? (
                                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-400 border border-slate-100 dark:border-slate-800">
                                    คลิก "+ เพิ่มร้าน" เพื่อเพิ่มร้านเป้าหมาย
                                </div>
                            ) : (
                                <div className="space-y-2 mt-2">
                                    {selectedStores.map((s, i) => (
                                        <TargetStoreRow
                                            key={i}
                                            index={i}
                                            storeItem={s}
                                            onChangeStore={(idx: number, newStore: any) => {
                                                const newArr = [...selectedStores]
                                                newArr[idx].store = newStore
                                                setSelectedStores(newArr)
                                            }}
                                            onChangeTarget={(idx: number, newTarget: string) => {
                                                const newArr = [...selectedStores]
                                                newArr[idx].target = newTarget
                                                setSelectedStores(newArr)
                                            }}
                                            onRemove={(idx: number) => {
                                                setSelectedStores(selectedStores.filter((_, idx2) => idx2 !== idx))
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Label className="text-xs font-bold text-slate-500">หมายเหตุ</Label>
                            <Textarea
                                placeholder="บันทึกเพิ่มเติม..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="h-16 resize-none border-slate-200 dark:border-slate-700 text-sm"
                            />
                        </div>

                    </div>

                    <DialogFooter className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 justify-end bg-slate-50 dark:bg-slate-950/50">
                        <CancelButton onClick={resetForm} className="w-full sm:w-auto" />
                        <SaveButton onClick={handleSubmit} isSubmitting={isSubmitting} className="w-full sm:w-auto" />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
