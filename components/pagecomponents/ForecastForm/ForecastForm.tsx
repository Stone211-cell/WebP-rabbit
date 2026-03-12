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
    Download,
    //    AlertCircle
} from "lucide-react"

import { exportForecastsToExcel } from "@/lib/exportexcel/exportFormatters"

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

const PRODUCT_TYPES = [
    { id: 'สด', label: 'สด' },
    { id: 'เก่าสด', label: 'เก่าสด' },
    { id: 'ขึ้นรูป', label: 'ขึ้นรูป' },
    { id: 'สไลด์', label: 'สไลด์' },
    { id: 'แพ็ค', label: 'แพ็ค' },
    { id: 'เสต็ก', label: 'เสต็ก' },
]

const MEAT_CATEGORIES = [
    { id: 'เนื้อแดง', label: '🥩 เนื้อแดง' },
    { id: 'เครื่องใน', label: '💜 เครื่องใน' },
    { id: 'ส่วนหัว', label: '🐷 ส่วนหัว' },
    { id: 'เศษ', label: '🟢 เศษ' },
    { id: 'อะไหล่', label: '🔵 อะไหล่' },
]

interface SelectedTargetStore {
    store: any;
    target: string;
    existingId?: string;
    actual?: number;
}

function TargetStoreRow({ storeItem, index, onChangeStore, onChangeTarget, onChangeActual, onRemove }: any) {
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative p-3 sm:p-0 bg-slate-50 dark:bg-slate-900/40 sm:bg-transparent rounded-2xl border border-slate-100 dark:border-slate-800/50 sm:border-none">
            <div className="flex-1 flex flex-col gap-1">
                <Label className="text-[10px] sm:text-xs font-bold text-slate-500 px-1 hidden sm:block">สาขาขอลูกค้า</Label>
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
            <div className="flex items-center gap-2">
                <div className="flex flex-col flex-1 sm:w-24 gap-1">
                    <Label className="text-[10px] sm:text-xs font-bold text-slate-500 px-1 text-center">เป้า</Label>
                    <Input
                        type="number"
                        placeholder="เป้า"
                        className="h-12 w-full border-slate-200 dark:border-slate-700 text-sm py-0 text-center font-bold bg-white dark:bg-slate-900 rounded-2xl focus-visible:ring-blue-500"
                        value={storeItem.target}
                        onChange={(e) => onChangeTarget(index, e.target.value)}
                    />
                </div>
                <div className="flex flex-col flex-1 sm:w-28 gap-1">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">ซื้อจริง</Label>
                        {storeItem.target && parseFloat(storeItem.target) > 0 && storeItem.actual ? (
                            <span className="text-[10px] sm:text-[11px] font-black text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 px-1.5 rounded-full">
                                {((parseFloat(storeItem.actual) / parseFloat(storeItem.target)) * 100).toFixed(0)}%
                            </span>
                        ) : null}
                    </div>
                    <Input
                        type="number"
                        placeholder="จริง"
                        className="h-12 w-full border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm py-0 text-center font-black bg-emerald-50/10 dark:bg-emerald-500/5 rounded-2xl focus-visible:ring-emerald-500"
                        value={storeItem.actual || ''}
                        onChange={(e) => onChangeActual(index, e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1 justify-end">
                    <div className="h-[14px] sm:h-[16px] hidden sm:block"></div> {/* Spacer to align with labels */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-2xl shrink-0 transition-colors"
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
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

    // Form inputs state additions
    const [selectedProductType, setSelectedProductType] = useState<string>("")
    const [newPartCategory, setNewPartCategory] = useState<string>("")

    // Meat Part State (From fontiontwo hook)
    const {
        search: partSearch,
        setSearch: setPartSearch,
        categoryFilter: partCategoryFilter,
        setCategoryFilter: setPartCategoryFilter,
        selectedPart: selectedMeatPart,
        selectPart: selectMeatPart,
        clearPart: clearMeatPart,
        showSuggestions: showPartSuggestions,
        setShowSuggestions: setShowPartSuggestions,
        filtered: filteredParts,
        addPart: addMeatPart,
        deletePart: deletePartItem,
    } = useMeatPartSearch()

    const handleAddPart = async () => {
        if (!partSearch) return toast.error("กรุณาพิมพ์ชื่อชิ้นส่วนเนื้อ")

        // Use active filter category if available, otherwise use the specific select
        const finalCategory = (partCategoryFilter && partCategoryFilter !== 'all')
            ? partCategoryFilter
            : newPartCategory;

        if (!finalCategory) return toast.error("กรุณาเลือกประเภทชิ้นส่วนก่อนเพิ่มใหม่")

        const newPart = await addMeatPart(partSearch, finalCategory)
        if (newPart) {
            selectMeatPart(newPart)
        }
    }

    const handleDeletePart = async (id: string) => {
        if (!confirm("ยืนยันลบชิ้นส่วนนี้?")) return
        const ok = await deletePartItem(id)
        if (ok) {
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
        setSelectedProductType("")
        setNewPartCategory("")
        clearMeatPart()
        setPartSearch("")
        setPartCategoryFilter("all")
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
        const tempParts = filteredParts.length > 0 ? filteredParts : [];
        const fp = tempParts.find(p => p.name === group.product) || { id: 'temp', name: group.product, category: 'เนื้อแดง' }
        selectMeatPart(fp)

        // Auto calculate existing inputs
        setTotalForecastInput(group.totalForecast.toString())

        // Product Type
        if (group.items.length > 0 && group.items[0].productType) {
            setSelectedProductType(group.items[0].productType)
        }

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
        const pType = selectedProductType || ""

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
                    const actualVal = safeFloat(row.actual)

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
                                actual: actualVal,
                                notes: notes
                            })
                        }
                    } else {
                        if (onCreate) await onCreate({
                            masterId: row.store.id,
                            product: productName,
                            productType: pType,
                            targetWeek: targetVal,
                            targetMonth: targetVal * 4,
                            forecast: forecastVal,
                            actual: actualVal,
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
                    const actualVal = safeFloat(row.actual)

                    if (onCreate) await onCreate({
                        masterId: row.store.id,
                        product: productName,
                        productType: pType,
                        targetWeek: targetVal,
                        targetMonth: targetVal * 4,
                        forecast: forecastVal,
                        actual: actualVal,
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

    const { summary, groupedForecasts, globalAggregates } = useMemo(() => {
        let sumWeekTarget = 0, sumWeekForecast = 0, sumWeekActual = 0, sumMonthTarget = 0
        let globalExceed = 0, globalMiss = 0
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

            Object.values(groups).forEach(g => {
                globalExceed += g.totalActual > g.totalForecast ? g.totalActual - g.totalForecast : 0
                globalMiss += g.totalActual < g.totalForecast ? g.totalForecast - g.totalActual : 0
            })
        }

        const sortedGroups = Object.values(groups).sort((a: any, b: any) => a.product.localeCompare(b.product))

        return {
            summary: {
                week: { forecast: sumWeekForecast, actual: sumWeekActual, diff: sumWeekActual - sumWeekForecast, target: sumWeekTarget },
                month: { forecast: sumWeekForecast * 4, actual: sumWeekActual * 4, diff: (sumWeekActual * 4) - sumMonthTarget, target: sumMonthTarget }
            },
            groupedForecasts: sortedGroups,
            globalAggregates: {
                exceed: globalExceed,
                miss: globalMiss,
                percent: sumWeekTarget > 0 ? (sumWeekForecast / sumWeekTarget) * 100 : 0
            }
        }
    }, [forecasts])


    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 min-h-screen pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="flex-1 w-full md:w-auto">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="p-2 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
                                <TrendingUp size={20} className="md:w-6 md:h-6" />
                            </span>
                            <span className="sm:hidden text-2xl font-black shrink-0">คาดการณ์</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="hidden sm:inline shrink-0">คาดการณ์</span>
                            <span className="text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight block">ชิ้นส่วนเนื้อรายสัปดาห์</span>
                        </div>
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

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => exportForecastsToExcel(forecasts, `คาดการณ์_ชิ้นส่วนเนื้อ_${formatThaiDate(weekStart, "d_MMM_yyyy")}`)}
                            className="bg-white/80 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-bold rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 transition-all active:scale-95 px-5 shadow-sm border-emerald-200 dark:border-emerald-800"
                        >
                            <Download size={16} className="mr-2" />ส่งออก Excel
                        </Button>

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
            </div>

            {/* --- GLOBAL SUMMARY BANNER --- */}
            {groupedForecasts.length > 0 && (
                <div className="bg-[#3A7CF6] text-white rounded-[1rem] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-10 border-none mt-2">
                    <div className="flex-1 flex flex-col items-center justify-center md:border-r border-blue-400/50 pb-4 md:pb-0 border-b md:border-b-0 border-blue-400/30">
                        <div className="text-[14px] sm:text-base font-bold opacity-80 flex items-center gap-2 mb-1 text-blue-50">
                            <Target size={18} /> เป้าหมาย
                        </div>
                        <div className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter">
                            {summary.week.target.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center md:border-r border-blue-400/50 pb-4 md:pb-0 border-b md:border-b-0 border-blue-400/30">
                        <div className="text-[14px] sm:text-base font-bold opacity-80 flex items-center gap-2 mb-1 text-emerald-100">
                            <CheckCircle2 size={18} /> คาดการณ์
                        </div>
                        <div className="text-3xl sm:text-5xl font-black text-[#5ceaa3] tabular-nums tracking-tighter flex items-baseline gap-2">
                            {summary.week.forecast.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            <span className="text-[16px] sm:text-xl font-bold opacity-90 text-[#7debb4]">({globalAggregates.percent.toFixed(0)}%)</span>
                        </div>
                    </div>

                    <div className="flex-[1.2] w-full flex flex-row items-center justify-center gap-10 sm:gap-16">
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="text-[14px] sm:text-base font-bold opacity-90 mb-1 text-[#5ceaa3]">
                                เกินเป้า
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-[#5ceaa3] tabular-nums tracking-tighter">
                                {globalAggregates.exceed.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                        </div>

                        <div className="w-px h-16 sm:h-20 bg-blue-400/30"></div>

                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="text-[14px] sm:text-base font-bold opacity-90 mb-1 text-[#ffa3a3]">
                                ขาดเป้า
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-[#ffa3a3] tabular-nums tracking-tighter">
                                {globalAggregates.miss.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LIST OVERVIEW --- */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-500 font-bold ml-2">
                    <div className="h-4 w-4 bg-indigo-200 rounded-sm"></div> คาดการณ์รายสัปดาห์ แยกตามชิ้นส่วน
                </div>

                {groupedForecasts.length > 0 ? (
                    <div className="columns-2 xl:columns-2 gap-4 xl:gap-8 space-y-4 xl:space-y-8">
                        {groupedForecasts.map(group => {
                            const percent = group.totalTarget > 0 ? (group.totalForecast / group.totalTarget) * 100 : 0
                            const forecastValue = group.totalForecast || 0;
                            const actualValue = group.totalActual || 0;
                            const groupExceed = actualValue > forecastValue ? actualValue - forecastValue : 0;
                            const groupMiss = actualValue < forecastValue ? forecastValue - actualValue : 0;

                            return (
                                <Card key={group.product} className="break-inside-avoid mb-4 xl:mb-8 relative overflow-hidden bg-white dark:bg-slate-900 rounded-[1.2rem] shadow-sm border border-slate-200 dark:border-slate-800">
                                    <div className="p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">🥩 {group.product}</h4>
                                            {isAdmin && (
                                                <div className="flex gap-1.5">
                                                    <Button size="sm" variant="outline" className="h-7 px-3 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0" onClick={() => handleEditGroup(group)}>แก้ไข</Button>
                                                    <Button size="sm" variant="ghost" className="h-7 px-3 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:text-rose-600 hover:bg-rose-100" onClick={() => handleDeleteGroup(group)}>ลบ</Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Blue Card */}
                                        <div className="bg-blue-600 text-white p-2.5 sm:p-4 rounded-xl flex items-center justify-between shadow-inner gap-1 sm:gap-2 mt-2 divide-x divide-blue-500/50">
                                            <div className="text-center flex-1 px-1 flex flex-col justify-center">
                                                <div className="text-[10px] sm:text-xs font-bold opacity-80 flex flex-col xl:flex-row items-center justify-center gap-1 mb-1 leading-tight"><Target size={14} className="opacity-80 shrink-0 hidden sm:block" /> <span className="whitespace-nowrap">เป้าหมาย</span> </div>
                                                <div className="text-base sm:text-2xl font-black leading-tight mt-auto truncate w-full">{group.totalTarget.toFixed(1)}</div>
                                            </div>
                                            <div className="text-center flex-1 px-1 flex flex-col justify-center">
                                                <div className="text-[10px] sm:text-xs font-bold opacity-80 flex flex-col xl:flex-row items-center justify-center gap-1 mb-1 leading-tight"><CheckCircle2 size={12} className="opacity-80 shrink-0 hidden sm:block" /> <span className="whitespace-nowrap">คาดการณ์</span> </div>
                                                <div className="text-base flex flex-col sm:flex-row items-center justify-center gap-0 sm:gap-1 sm:text-2xl font-black text-emerald-300 leading-tight mt-auto truncate w-full">{group.totalForecast.toFixed(1)}
                                                    <div className="text-[9px] sm:text-xs text-emerald-200 opacity-90 font-bold sm:mt-1 truncate ">({percent.toFixed(0)}%)</div>
                                                </div>

                                            </div>
                                            <div className="flex-1 px-1 flex flex-row items-center justify-center border-l border-blue-500/50 gap-4 sm:gap-6 py-1">
                                                <div className="flex flex-col items-center justify-center min-w-[3rem]">
                                                    <span className="whitespace-nowrap text-[12px] sm:text-[14px] font-bold opacity-80 mb-0.5 leading-tight text-emerald-200">เกินเป้า</span>
                                                    <div className="text-xl sm:text-2xl font-black leading-tight text-emerald-300">
                                                        {groupExceed.toFixed(1)}
                                                    </div>
                                                </div>

                                                <div className="w-px h-8 sm:h-10 bg-blue-400/30"></div>

                                                <div className="flex flex-col items-center justify-center min-w-[3rem]">
                                                    <span className="whitespace-nowrap text-[12px] sm:text-[14px] font-bold opacity-80 mb-0.5 leading-tight text-rose-200">ขาดเป้า</span>
                                                    <div className="text-xl sm:text-2xl font-black leading-tight text-rose-300">
                                                        {groupMiss.toFixed(1)}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Store Target List */}
                                        <div className="space-y-3 mt-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-[18px] w-full font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                <ShoppingBag size={18} className="shrink-0" /> ร้านเป้าหมาย
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {group.items.map((item: any) => {
                                                    const tWeek = item.targetWeek || 0;
                                                    const tActual = item.actual || 0;
                                                    const itemPercent = group.totalTarget > 0 ? (tWeek / group.totalTarget) * 100 : 0;
                                                    const actualPercent = tWeek > 0 ? (tActual / tWeek) * 100 : 0;
                                                    const storeExceed = tActual > tWeek ? tActual - tWeek : 0;
                                                    const storeMiss = tActual < tWeek ? tWeek - tActual : 0;
                                                    return (
                                                        <div key={item.id} className="relative overflow-hidden group/store text-[14px]">
                                                            <div className="flex flex-col p-2.5 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 shadow-sm hover:border-blue-500/30 transition-all duration-300 h-full">
                                                                <div className="w-full space-y-0.5 relative">
                                                                    <div className="flex items-baseline justify-between gap-2">
                                                                        <div className="font-black text-[18px] text-slate-700 dark:text-slate-200 leading-tight truncate">{item.store?.name}</div>
                                                                        <div className="font-bold text-slate-500 dark:text-slate-400 font-mono tracking-tighter opacity-80 text-[18px] uppercase shrink-0">{item.store?.code}</div>
                                                                    </div>


                                                                    <div className="flex gap-2 mt-2 bg-slate-50/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                                        <div className="flex flex-col items-center flex-1 px-2 sm:px-3 justify-center">
                                                                            <span className="opacity-80 text-[12px] sm:text-[14px] font-bold text-slate-500 dark:text-slate-400">เป้า</span>
                                                                            <span className="text-slate-900 text-xl sm:text-2xl dark:text-slate-200 font-black truncate">{tWeek.toFixed(1)}</span>
                                                                        </div>

                                                                        <div className="w-px bg-slate-200 dark:bg-slate-800"></div>

                                                                        <div className="flex flex-col items-center flex-1 px-2 sm:px-3 justify-center">
                                                                            <span className="opacity-80 text-[12px] sm:text-[14px] font-bold text-slate-500 dark:text-slate-400">จริง</span>
                                                                            <span className={cn("font-black text-xl sm:text-2xl truncate", tActual > 0 ? "text-emerald-500" : "text-slate-400")}>{tActual.toFixed(1)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 w-full shrink-0">
                                                                    {/* Blue Target % */}
                                                                    <div>
                                                                        <div className="flex justify-between items-end mb-1">
                                                                            <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">สัดส่วนเป้าหมาย</span>
                                                                            <span className="text-[13px] font-black text-blue-500 dark:text-blue-400 transition-colors duration-500">
                                                                                {itemPercent.toFixed(0)}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center w-full">
                                                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex items-center">
                                                                                <div
                                                                                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-1000 ease-out"
                                                                                    style={{ width: `${Math.min(itemPercent, 100)}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Green Actual % */}
                                                                    <div>
                                                                        <div className="flex justify-between items-end mb-1">
                                                                            <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">สัดส่วนยอดซื้อจริง</span>
                                                                            <span className="text-[13px] font-black text-emerald-500 dark:text-emerald-400 transition-colors duration-500">
                                                                                {actualPercent.toFixed(0)}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center w-full">
                                                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner flex items-center">
                                                                                <div
                                                                                    className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-1000 ease-out"
                                                                                    style={{ width: `${Math.min(actualPercent, 100)}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
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
                <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[1.5rem] p-0 overflow-hidden flex flex-col max-h-[95vh]">
                    <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="bg-rose-500 text-white p-1.5 rounded-lg"><Target size={16} /></span>
                            {editingGroup ? "แก้ไขคาดการณ์รายสัปดาห์" : "เพิ่มคาดการณ์รายสัปดาห์"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto flex-1">

                        {/* Section 1: Product Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">เลือกกลุ่ม/ประเภท</Label>
                                <Select value={partCategoryFilter} onValueChange={setPartCategoryFilter} disabled={!!selectedMeatPart}>
                                    <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 font-medium rounded-xl shadow-sm">
                                        <SelectValue placeholder="-- ทั้งหมด --" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                        <SelectItem value="all" className="rounded-lg">-- ทั้งหมด --</SelectItem>
                                        {MEAT_CATEGORIES.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="rounded-lg">{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">ชิ้นส่วน/สินค้า *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="พิมพ์เพื่อค้นหา..."
                                            value={partSearch}
                                            onFocus={() => setShowPartSuggestions(true)}
                                            onChange={(e) => { setPartSearch(e.target.value); setShowPartSuggestions(true) }}
                                            className="h-10 border-slate-200 dark:border-slate-700/50 focus-visible:ring-blue-500 rounded-xl shadow-sm bg-white dark:bg-slate-900"
                                            disabled={!!editingGroup || !!selectedMeatPart}
                                        />
                                        {showPartSuggestions && filteredParts.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1 divide-y divide-slate-50 dark:divide-slate-800/50">
                                                {filteredParts.map(p => (
                                                    <div key={p.id} className="flex items-center group/item hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer first:rounded-t-xl last:rounded-b-xl transition-colors">
                                                        <button
                                                            onClick={() => { selectMeatPart(p); setShowPartSuggestions(false) }}
                                                            className="flex-1 flex items-center gap-3 p-3 text-sm text-left text-slate-700 dark:text-slate-200"
                                                        >
                                                            <span className="h-6 w-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-xs group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors">🥩</span>
                                                            <span className="flex-1 font-bold">{p.name}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{p.category}</span>
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeletePart(p.id) }}
                                                                className="opacity-0 group-hover/item:opacity-100 p-2 mr-2 rounded-lg text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all hover:text-rose-600"
                                                                title="ลบ"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && !selectedMeatPart && (
                                        <Button size="icon" onClick={handleAddPart} className="bg-slate-200/50 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 h-10 w-10 shrink-0 rounded-xl transition-all shadow-sm" title="เพิ่มชิ้นส่วนใหม่">
                                            <Plus size={16} />
                                        </Button>
                                    )}
                                </div>
                                {selectedMeatPart && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-black mt-2 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full inline-flex items-center border border-blue-100 dark:border-blue-900/30 shadow-sm animate-in zoom-in-95 duration-200">
                                        <span className="mr-1.5 opacity-70">✓</span> {selectedMeatPart.name} <span className="mx-1.5 opacity-30">|</span> <span className="opacity-70 text-[10px] uppercase font-bold tracking-wider">{selectedMeatPart.category}</span>
                                        {!editingGroup && <button onClick={() => clearMeatPart()} className="ml-2 h-5 w-5 flex items-center justify-center rounded-full text-blue-300 dark:text-blue-700 hover:bg-rose-100 hover:text-rose-500 transition-colors">✕</button>}
                                    </div>
                                )}
                                {isAdmin && !selectedMeatPart && filteredParts.length === 0 && partSearch.length > 0 && partCategoryFilter === 'all' && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-2">
                                        <Label className="text-[10px] font-bold text-amber-600 dark:text-amber-400">ระบุประเภทชิ้นส่วนใหม่ก่อนเพิ่ม:</Label>
                                        <Select value={newPartCategory} onValueChange={setNewPartCategory}>
                                            <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800">
                                                <SelectValue placeholder="-- ไม่ได้เลือกรายการ --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MEAT_CATEGORIES.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Details and Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/20 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-inner">
                            <div className="space-y-2 min-w-0">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">
                                    <ShoppingBag size={12} /> ชนิดสินค้า
                                </Label>
                                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                                    <SelectTrigger className="h-11 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 font-bold rounded-2xl shadow-sm focus:ring-blue-500/20">
                                        <SelectValue placeholder="-- เลือกประเภท --" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                        {PRODUCT_TYPES.map(pt => (
                                            <SelectItem key={pt.id} value={pt.id} className="rounded-xl font-medium">{pt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 min-w-0">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-rose-500/80 flex items-center gap-1.5 ml-1">
                                    <Target size={12} /> เป้าหมายรวม (กก.)
                                </Label>
                                <div className="relative group">
                                    <Input
                                        readOnly
                                        className="h-11 w-full bg-rose-50/30 dark:bg-rose-500/5 border-rose-100 dark:border-rose-900/20 cursor-not-allowed font-black text-rose-600 dark:text-rose-400 rounded-2xl text-lg pl-10"
                                        value={autoTotalTarget || '0'}
                                    />
                                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400 dark:text-rose-600" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2 min-w-0">
                                <Label className="text-[11px] font-black uppercase tracking-wider text-blue-500/80 flex items-center gap-1.5 ml-1">
                                    <TrendingUp size={12} /> คาดการณ์ขายได้
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0.0"
                                        value={totalForecastInput}
                                        onChange={e => setTotalForecastInput(e.target.value)}
                                        className="h-11 w-full border-blue-200 dark:border-blue-900/30 focus-visible:ring-blue-500 font-black text-blue-600 dark:text-blue-400 rounded-2xl text-lg pl-10 bg-blue-50/10"
                                    />
                                    <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-600" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Store List */}

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm  font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><ShoppingBag size={14} /> ร้านเป้าหมาย</Label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedStores([...selectedStores, { store: null, target: '', actual: 0 }])}
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
                                            onChangeActual={(idx: number, newActual: string) => {
                                                const newArr = [...selectedStores]
                                                newArr[idx].actual = safeFloat(newActual)
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
