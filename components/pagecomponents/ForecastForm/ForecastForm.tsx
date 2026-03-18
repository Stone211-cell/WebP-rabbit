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
    forecast: string;
    forcedSales: string;
    existingId?: string;
    actual?: number;
}

function TargetStoreRow({ storeItem, index, onChangeStore, onChangeTarget, onChangeForecast, onChangeForcedSales, onChangeActual, onRemove }: any) {
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
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 relative p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <div className="flex-1 flex flex-col gap-1.5 min-w-[200px]">
                <Label className="text-[18px] sm:text-xs font-black text-slate-400 dark:text-slate-500 px-1 uppercase tracking-wider">สาขาของลูกค้า *</Label>
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
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row items-center gap-4 xl:gap-4">
                <div className="flex flex-col gap-1.5 w-full lg:w-20">
                    <Label className="text-[12px] sm:text-[12px] font-black text-slate-400 dark:text-slate-500 px-1 lg:text-center uppercase tracking-wider">เป้า (กก.)</Label>
                    <Input
                        type="number"
                        placeholder="0.0"
                        className="h-10 w-full border-slate-200 dark:border-slate-700/50 text-sm py-0 text-center font-bold bg-white dark:bg-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                        value={storeItem.target === 0 ? '0' : (storeItem.target || '')}
                        onChange={(e) => onChangeTarget(index, e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5  w-full lg:w-32">
                    <Label className="text-[12px] sm:text-[12px] font-black text-blue-600 dark:text-blue-400 mx-1 lg:text-center flex flex-row gap-1 uppercase tracking-wider text-inline">คาดการณ์ (กก.)</Label>
                    <Input
                        type="number"
                        placeholder="0.0"
                        className="h-10 w-full border-blue-200/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 text-sm py-0 text-center font-black bg-blue-500/5 dark:bg-blue-500/5 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                        value={storeItem.forecast === 0 ? '0' : (storeItem.forecast || '')}
                        onChange={(e) => onChangeForecast(index, e.target.value)}
                    />
                </div>

                <div className="hidden">
                    <Label className="text-[12px] sm:text-[12px] font-black text-rose-600 dark:text-rose-400 px-1 lg:text-center uppercase tracking-wider">บังคับขาย</Label>
                    <Input
                        type="number"
                        placeholder="0.0"
                        className="h-10 w-full border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm py-0 text-center font-black bg-rose-500/5 dark:bg-rose-500/5 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                        value={storeItem.forcedSales === 0 ? '0' : (storeItem.forcedSales || '')}
                        onChange={(e) => onChangeForcedSales(index, e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5 w-full lg:w-24">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[12px] sm:text-[12px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">ซื้อจริง</Label>
                        {(safeFloat(storeItem.forecast) > 0 && (storeItem.actual !== undefined && storeItem.actual !== null)) ? (
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1 rounded-full border border-emerald-500/20">
                                {((safeFloat(storeItem.actual) / safeFloat(storeItem.forecast)) * 100).toFixed(0)}%
                            </span>
                        ) : null}
                    </div>
                    <Input
                        type="number"
                        placeholder="0.0"
                        className="h-10 w-full border-emerald-200/50 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm py-0 text-center font-black bg-emerald-500/5 dark:bg-emerald-500/5 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                        value={storeItem.actual === 0 ? '0' : (storeItem.actual || '')}
                        onChange={(e) => onChangeActual(index, e.target.value)}
                    />
                </div>

                <div className="flex flex-col gap-1.5 justify-end col-span-2 sm:col-span-1 lg:w-10">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl shrink-0 transition-all active:scale-95 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20"
                        onClick={() => onRemove(index)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
//
export default function ForecastForm({ stores = [], forecasts, date, setDate, weekStart, weekEnd, onRefresh, onCreate, onUpdate, onDelete, onBatch, isAdmin }: any) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDialog, setShowDialog] = useState(false)

    // Edit state
    const [editingGroup, setEditingGroup] = useState<any>(null)

    // Form inputs state additions
    const [selectedProductType, setSelectedProductType] = useState<string>("")
    const [newPartCategory, setNewPartCategory] = useState<string>("")
    const [jointForcedSales, setJointForcedSales] = useState<string>("")

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("")
    const [productFilter, setProductFilter] = useState("all")

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
    const [notes, setNotes] = useState<string>("")

    const autoTotalTarget = useMemo(() => {
        let sum = 0;
        selectedStores.forEach(s => sum += safeFloat(s.target));
        return sum;
    }, [selectedStores])

    const autoTotalForecast = useMemo(() => {
        let sum = 0;
        selectedStores.forEach(s => sum += safeFloat(s.forecast));
        return sum;
    }, [selectedStores])

    const autoTotalForcedSales = useMemo(() => {
        let sum = 0;
        selectedStores.forEach(s => sum += safeFloat(s.forcedSales));
        return sum;
    }, [selectedStores])

    const autoTotalActual = useMemo(() => {
        let sum = 0;
        selectedStores.forEach(s => sum += safeFloat(s.actual));
        return sum;
    }, [selectedStores])

    // Sync joint value when total changes from outside typing (e.g. adding/removing stores)
    useEffect(() => {
        if (!showDialog) return;
        // Only update if the numerical value changed from outside (to prevent jumping when typing "10.")
        if (safeFloat(jointForcedSales) !== autoTotalForcedSales) {
            setJointForcedSales(autoTotalForcedSales === 0 ? '0' : autoTotalForcedSales.toString());
        }
    }, [autoTotalForcedSales, showDialog])

    const goPrevWeek = () => setDate(subWeeks(date, 1))
    const goNextWeek = () => setDate(addWeeks(date, 1))

    const WeekNavigator = ({ className }: { className?: string }) => (
        <div className={cn("flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm", className)}>
            <Button
                variant="ghost"
                size="icon"
                onClick={goPrevWeek}
                className="rounded-full h-10 w-10 hover:bg-white dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 active:scale-90 transition-transform"
            >
                <ChevronLeft size={24} />
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="px-6 h-10 text-sm md:text-base font-black rounded-full hover:bg-white dark:hover:bg-slate-600 tracking-tight">
                        📅 {formatThaiDate(weekStart, "d MMM")} - {formatThaiDate(weekEnd, "d MMM yyyy")}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-3xl z-[100]">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus />
                </PopoverContent>
            </Popover>
            <Button
                variant="ghost"
                size="icon"
                onClick={goNextWeek}
                className="rounded-full h-10 w-10 hover:bg-white dark:hover:bg-slate-600 text-blue-600 dark:text-blue-400 active:scale-90 transition-transform"
            >
                <ChevronRight size={24} />
            </Button>
        </div>
    )

    const resetForm = () => {
        setEditingGroup(null)
        setSelectedStores([])
        setNotes("")
        setSelectedProductType("")
        setNewPartCategory("")
        setJointForcedSales("")
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

        // Product Type
        if (group.items.length > 0 && group.items[0].productType) {
            setSelectedProductType(group.items[0].productType)
        }

        // Map existing stores
        const mappedStores = group.items.map((item: any) => ({
            store: item.store,
            target: item.targetWeek.toString(),
            forecast: (item.forecast || 0).toString(),
            forcedSales: (item.forcedSales || 0).toString(),
            existingId: item.id,
            actual: item.actual
        }))
        setSelectedStores(mappedStores)

        if (group.items.length > 0 && group.items[0].notes) {
            setNotes(group.items[0].notes)
        }

        const totalInit = group.items.reduce((acc: number, item: any) => acc + (item.forcedSales || 0), 0);
        setJointForcedSales(totalInit === 0 ? '0' : totalInit.toString());

        setShowDialog(true)
    }

    const handleDeleteGroup = async (group: any) => {
        if (!confirm(`ยืนยันลบคาดการณ์ทั้งหมดของชิ้นส่วน ${group.product}?`)) return
        setIsSubmitting(true)
        try {
            const ops = group.items.map((item: any) => ({
                type: 'delete',
                id: item.id
            }))

            if (onBatch) {
                await onBatch(ops)
            } else {
                // Fallback
                await Promise.allSettled(group.items.map((item: any) => {
                    if (onDelete) return onDelete(item.id, { revalidate: false })
                    return Promise.resolve()
                }))
            }

            toast.success("ลบข้อมูลสำเร็จ")
            if (onRefresh) onRefresh()
        } catch (e: any) {
            console.error("Delete group error:", e)
            toast.error(e?.message || "ลบข้อมูลไม่สำเร็จ")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async () => {
        if (!selectedMeatPart && !partSearch) {
            toast.error("กรุณาระบุชิ้นส่วนสินค้า")
            return
        }

        if (selectedStores.length === 0) {
            toast.error("กรุณาเพิ่มอย่างน้อย 1 ร้านค้า")
            return
        }

        // Validation
        const invalidStores = selectedStores.filter((s: any) => !s.store)
        if (invalidStores.length > 0) {
            toast.error("กรุณาระบุสาขาให้ครบทุกแถว")
            return
        }

        setIsSubmitting(true)
        const ops: any[] = []
        try {
            const productName = selectedMeatPart?.name || partSearch

            // Collect creates and updates
            selectedStores.forEach((s: any) => {
                const targetVal = safeFloat(s.target)
                const payload = {
                    masterId: s.store.id,
                    product: productName,
                    productType: selectedProductType,
                    targetWeek: targetVal,
                    targetMonth: targetVal * 4,
                    forecast: safeFloat(s.forecast),
                    forcedSales: safeFloat(s.forcedSales),
                    actual: s.actual === undefined ? null : safeFloat(s.actual),
                    notes: notes,
                    weekStart: weekStart.toISOString()
                }

                if (s.existingId) {
                    ops.push({ type: 'update', id: s.existingId, data: payload })
                } else {
                    ops.push({ type: 'create', data: payload })
                }
            })

            // Collect deletions
            if (editingGroup) {
                const existingIds = new Set(selectedStores.filter(s => s.existingId).map(s => s.existingId));
                const toDelete = editingGroup.items.filter((x: any) => !existingIds.has(x.id));
                toDelete.forEach(item => {
                    ops.push({ type: 'delete', id: item.id })
                });
            }

            if (onBatch) {
                await onBatch(ops)
            } else {
                // Fallback to sequential for reliability if onBatch is missing
                for (const op of ops) {
                    if (op.type === 'create') await onCreate(op.data, { revalidate: false });
                    if (op.type === 'update') await onUpdate(op.id, op.data, { revalidate: false });
                    if (op.type === 'delete') await onDelete(op.id, { revalidate: false });
                }
            }

            toast.success("บันทึกข้อมูลเรียบร้อย")
            resetForm()
            if (onRefresh) onRefresh()
        } catch (error: any) {
            console.error("Submit error details:", {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
                opsCount: ops.length
            })
            toast.error(error?.response?.data?.error || error?.message || "เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setIsSubmitting(false)
        }
    }

    const { summary, groupedForecasts, globalAggregates, totalFilteredItems } = useMemo(() => {
        let sumWeekTarget = 0, sumWeekForecast = 0, sumWeekActual = 0, sumMonthTarget = 0, sumWeekForcedSales = 0
        let globalExceed = 0, globalMiss = 0
        const groups: Record<string, { product: string, items: any[], totalTarget: number, totalForecast: number, totalActual: number, totalForcedSales: number }> = {}

        // Strict Week Filtering: Only include items that fall within the selected week range
        const filteredByWeek = (forecasts || []).filter((f: any) => {
            const fDate = new Date(f.weekStart)
            return fDate >= weekStart && fDate <= weekEnd
        })

        filteredByWeek.forEach((f: any) => {
            // Filter by product if not "all"
            if (productFilter !== "all" && f.product !== productFilter) return

            // Filter by search term (store name or code)
            const sName = (f.store?.name || "").toLowerCase()
            const sCode = (f.store?.code || "").toLowerCase()
            const sQuery = searchTerm.toLowerCase()
            if (searchTerm && !sName.includes(sQuery) && !sCode.includes(sQuery)) return

            const wTarget = f.targetWeek || 0
            const wForecast = f.forecast || 0
            const wForcedSales = f.forcedSales || 0
            const wActual = f.actual || 0
            const mTarget = f.targetMonth || 0

            sumWeekTarget += wTarget
            sumWeekForecast += wForecast
            sumWeekForcedSales += wForcedSales
            sumWeekActual += wActual

            // Re-calculate monthly target reactively (Target Week * 4) for consistent summary
            sumMonthTarget += (wTarget * 4)

            const pName = f.product || 'ไม่ระบุชิ้นส่วน'
            if (!groups[pName]) groups[pName] = { product: pName, items: [], totalTarget: 0, totalForecast: 0, totalActual: 0, totalForcedSales: 0 }

            groups[pName].items.push(f)
            groups[pName].totalTarget += wTarget
            groups[pName].totalForecast += wForecast
            groups[pName].totalForcedSales += wForcedSales
            groups[pName].totalActual += wActual
        })

        Object.values(groups).forEach(g => {
            globalExceed += g.totalActual > g.totalForcedSales ? g.totalActual - g.totalForcedSales : 0
            globalMiss += g.totalActual < g.totalForcedSales ? g.totalForcedSales - g.totalActual : 0
        })

        const sortedGroups = Object.values(groups).sort((a: any, b: any) => a.product.localeCompare(b.product))

        return {
            summary: {
                week: { forecast: sumWeekForecast, actual: sumWeekActual, diff: sumWeekActual - sumWeekForcedSales, target: sumWeekTarget, forcedSales: sumWeekForcedSales },
                month: { forecast: sumWeekForecast * 4, actual: sumWeekActual * 4, diff: (sumWeekActual * 4) - (sumWeekForcedSales * 4), target: sumMonthTarget },
                products: Object.values(groups).map(g => ({ name: g.product, target: g.totalTarget, actual: g.totalActual, forecast: g.totalForecast, forcedSales: g.totalForcedSales }))
            },
            groupedForecasts: sortedGroups,
            globalAggregates: {
                exceed: globalExceed,
                miss: globalMiss,
                percent: sumWeekForcedSales > 0 ? (sumWeekActual / sumWeekForcedSales) * 100 : 0
            },
            totalFilteredItems: filteredByWeek.length
        }
    }, [forecasts, productFilter, searchTerm, weekStart, weekEnd])


    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 min-h-screen pb-20">
            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="flex-1 w-full">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 shrink-0">
                                <TrendingUp size={24} className="md:w-7 md:h-7" />
                            </span>
                            <span className="text-2xl md:text-3xl font-black">คาดการณ์</span>
                        </div>
                        <span className="text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight">ชิ้นส่วนเนื้อรายสัปดาห์</span>
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    {/* Date Picker Range (Synchronized 1) */}
                    <WeekNavigator className="w-full sm:w-auto min-w-[280px]" />

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => exportForecastsToExcel(forecasts, `คาดการณ์_ชิ้นส่วนเนื้อ_${formatThaiDate(weekStart, "d_MMM_yyyy")}`)}
                            className="flex-1 sm:flex-none h-11 bg-white/80 dark:bg-slate-800/80 text-emerald-600 dark:text-emerald-400 font-black rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm border-emerald-200 dark:border-emerald-800/50 px-6"
                        >
                            <Download size={18} className="mr-2" />
                            <span className="hidden sm:inline">ส่งออก</span> Excel
                        </Button>

                        {isAdmin && (
                            <Button
                                onClick={openAddDialog}
                                className="flex-1 sm:flex-none h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 px-8 shadow-md"
                            >
                                <Plus size={20} className="mr-1" />
                                เพิ่ม<span className="hidden sm:inline text-[13px] ml-1">คาดการณ์</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- GLOBAL SUMMARY BANNER --- */}
            {groupedForecasts.length > 0 && (
                <div className="bg-[#3A7CF6] text-white rounded-[1rem] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 md:gap-10 border-none mt-2 relative overflow-hidden">
                    {/* Background indicator for past/future */}
                    {new Date() > weekEnd && <div className="absolute top-0 right-0 bg-slate-400/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-xl">ข้อมูลย้อนหลัง</div>}
                    {new Date() < weekStart && <div className="absolute top-0 right-0 bg-amber-400/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-xl border-b border-l border-amber-400/20">สัปดาห์หน้า</div>}

                    <div className="flex-1 flex flex-col items-center justify-center md:border-r border-blue-400/50 pb-4 md:pb-0 border-b md:border-b-0 border-blue-400/30 min-w-0">
                        <div className="text-[14px] sm:text-base font-bold opacity-80 flex items-center gap-2 mb-1 text-rose-50 whitespace-nowrap">
                            <Target size={28} className="shrink-0" /> <span className="truncate">เป้าบังคับขาย (สัปดาห์)</span>
                        </div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black tabular-nums tracking-tighter text-rose-100 truncate w-full text-center">
                            {summary.week.forcedSales.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center md:border-r border-blue-400/50 pb-4 md:pb-0 border-b md:border-b-0 border-blue-400/30 min-w-0">
                        <div className="text-[14px] sm:text-base font-bold opacity-80 flex items-center gap-2 mb-1 text-emerald-100 whitespace-nowrap">
                            <CheckCircle2 size={18} className="shrink-0" /> <span className="truncate">คาดการณ์ (กก.)</span>
                        </div>
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#5ceaa3] tabular-nums tracking-tighter flex items-baseline justify-center gap-2 w-full truncate">
                            {summary.week.forecast.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            <span className="text-[16px] sm:text-lg lg:text-xl font-bold opacity-90 text-[#7debb4]">({globalAggregates.percent.toFixed(0)}%)</span>
                        </div>
                    </div>

                    <div className="flex-[1.2] w-full flex flex-row items-center justify-center gap-4 sm:gap-10 lg:gap-16 min-w-0">
                        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                            <div className="text-[14px] sm:text-base font-bold opacity-90 mb-1 text-[#5ceaa3] truncate w-full text-center">
                                ยอดซื้อ (จริง)
                            </div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#5ceaa3] tabular-nums tracking-tighter truncate w-full text-center">
                                {summary.week.actual.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                        </div>

                        <div className="w-px h-12 lg:h-20 bg-blue-400/30 shrink-0"></div>

                        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
                            <div className="text-[14px] sm:text-base font-bold opacity-90 mb-1 text-[#ffa3a3] truncate w-full text-center whitespace-nowrap">
                                ประมาณการ (เดือน)
                            </div>
                            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#ffa3a3] tabular-nums tracking-tighter truncate w-full text-center">
                                {summary.month.forecast.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LIST OVERVIEW --- */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm gap-6">
                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-black text-lg">
                            <div className="h-5 w-1.5 bg-blue-500 rounded-full"></div> คาดการณ์รายสัปดาห์
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3">แยกตามชิ้นส่วน</div>
                    </div>

                    {/* Date Picker Range (Synchronized 2 - Extra visibility above list) */}
                    <div className="flex-1 flex justify-center max-w-md w-full">
                        <WeekNavigator className="w-full bg-white dark:bg-slate-950 border-blue-100 dark:border-blue-900/30 scale-105" />
                    </div>

                    {/* Search & Filter UI */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Input
                                placeholder="ค้นหาชื่อร้าน หรือ รหัส..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl pl-10 shadow-sm focus-visible:ring-blue-500"
                            />
                            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select value={productFilter} onValueChange={setProductFilter}>
                                <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                                    <SelectValue placeholder="ทุกสินค้า" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                    <SelectItem value="all">-- ทุกชิ้นส่วน --</SelectItem>
                                    {summary.products.map((p: any) => (
                                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {groupedForecasts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-6 lg:gap-8">
                        {groupedForecasts.map(group => {
                            const forcedSalesValue = group.totalForcedSales || 0;
                            const actualValue = group.totalActual || 0;
                            const groupExceed = actualValue > forcedSalesValue ? actualValue - forcedSalesValue : 0;
                            const groupMiss = actualValue < forcedSalesValue ? forcedSalesValue - actualValue : 0;

                            return (
                                <Card key={group.product} className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                        {/* Header */}
                                        <div className="flex justify-between items-center px-1">
                                            <h4 className="text-[12px] sm:text-2xl md:text-3xl font-black flex items-center gap-1 sm:gap-2 text-slate-800 dark:text-slate-100 truncate">🥩 {group.product}</h4>
                                            {isAdmin && (
                                                <div className="flex gap-1 sm:gap-2 shrink-0">
                                                    <Button size="sm" variant="outline" className="h-6 sm:h-9 px-1.5 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700/50" onClick={() => handleEditGroup(group)}>แก้ไข</Button>
                                                    <Button size="sm" variant="ghost" className="h-6 sm:h-9 px-1.5 sm:px-4 rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteGroup(group)}>ลบ</Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Summaries Card - Refined Look Grid 2x3 */}
                                        <div className="bg-[#3A7CF6] p-3 sm:p-7 rounded-[1.2rem] sm:rounded-[2.5rem] flex flex-col gap-2 border-none shadow-xl shadow-blue-500/20 text-white">
                                            <div className="grid grid-cols-2 gap-2 sm:gap-4 divide-x divide-white/10">
                                                {/* Row 1: Actual and Forecast */}
                                                <div className="text-center flex flex-col justify-center min-w-0">
                                                    <div className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-white/70 mb-0.5 sm:mb-1">จริง (กก.)</div>
                                                    <div className="text-lg sm:text-4xl lg:text-5xl font-black truncate drop-shadow-sm tabular-nums">{group.totalActual.toFixed(1)}</div>
                                                </div>
                                                <div className="text-center flex flex-col justify-center min-w-0 pl-2 sm:pl-4 border-white/10">
                                                    <div className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-white/70 mb-0.5 sm:mb-1">คาดการณ์ (กก.)</div>
                                                    <div className="text-base sm:text-3xl font-black text-emerald-300 truncate drop-shadow-sm tabular-nums">
                                                        {group.totalForecast.toFixed(1)}
                                                        <span className="text-[8px] sm:text-xs block mt-0.5 sm:mt-1 opacity-80">({group.totalForecast > 0 ? ((group.totalActual / group.totalForecast) * 100).toFixed(0) : 0}%)</span>
                                                    </div>
                                                </div>

                                                {/* Row 2: Forced Sales and Target */}
                                                <div className="text-center flex flex-col justify-center min-w-0 border-t border-white/10 pt-2 sm:pt-4 mt-1 sm:mt-2">
                                                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white mb-0.5 sm:mb-1">บังคับขาย (กก.)</div>
                                                    <div className="text-base sm:text-3xl font-black text-rose-600 truncate tabular-nums">{group.totalForcedSales.toFixed(1)}</div>
                                                </div>
                                                <div className="text-center flex flex-col justify-center min-w-0 pl-2 sm:pl-4 border-t border-white/10 pt-2 sm:pt-4 mt-1 sm:mt-2">
                                                    <div className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-white/70 mb-0.5 sm:mb-1">เป้าหมาย (กก.)</div>
                                                    <div className="text-base sm:text-3xl font-black text-blue-100 truncate tabular-nums">{group.totalTarget.toFixed(1)}</div>
                                                </div>

                                                {/* Row 3: Exceed and Miss */}
                                                <div className="text-center flex flex-col justify-center min-w-0 border-t border-white/10 pt-2 sm:pt-4 mt-1 sm:mt-2">
                                                    <div className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-emerald-200 mb-0.5 sm:mb-1">เกินเป้า</div>
                                                    <div className="text-base sm:text-3xl font-black text-emerald-300 truncate tabular-nums">{groupExceed.toFixed(1)}</div>
                                                </div>
                                                <div className="text-center flex flex-col justify-center min-w-0 pl-2 sm:pl-4 border-t border-white/10 pt-2 sm:pt-4 mt-1 sm:mt-2">
                                                    <div className="text-[8px] sm:text-xs font-black uppercase tracking-widest text-rose-200 mb-0.5 sm:mb-1">ขาดเป้า</div>
                                                    <div className="text-base sm:text-3xl font-black text-rose-300 truncate tabular-nums">{groupMiss.toFixed(1)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Store Target List */}
                                        <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                                            <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xl font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 sm:mb-2 px-1">
                                                <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" /> รายละเอียดรายร้าน
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 sm:gap-4">
                                                {group.items.map((item: any) => {
                                                    const tActual = safeFloat(item.actual);
                                                    return (
                                                        <div key={item.id} className="relative overflow-hidden group/store">
                                                            <div className="flex flex-col p-2.5 sm:p-6 justify-center align-center rounded-[1.2rem] sm:rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300">
                                                                <div className="w-full space-y-2 relative">
                                                                    <div className="flex items-baseline justify-between gap-2 mb-1.5 sm:mb-3">
                                                                        <div className="font-black text-[11px] sm:text-xl text-slate-800 dark:text-slate-100 leading-tight truncate">{item.store?.name}</div>
                                                                        <div className="font-black text-slate-400 dark:text-slate-600 font-mono text-[7px] sm:text-[10px] uppercase shrink-0 bg-white dark:bg-slate-900 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border border-slate-100 dark:border-slate-800">{item.store?.code}</div>
                                                                    </div>

                                                                    <div className="grid grid-cols-3  gap-0.5 md:gap-2 lg:gap-4 bg-white dark:bg-slate-900 p-1.5 sm:p-5 rounded-lg sm:rounded-2xl border border-slate-50 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
                                                                        <div className="flex flex-col items-center justify-center">
                                                                            <span className="text-[7px] sm:text-[10px] lg:text-[13px] font-black text-slate-500 uppercase tracking-tighter mb-0.5 sm:mb-1 select-none whitespace-nowrap">เป้า</span>
                                                                            <span className="text-slate-900 dark:text-white text-[10px] sm:text-xl lg:text-2xl font-black tabular-nums">{item.targetWeek?.toFixed(1) || "0.0"}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center pl-0.5 sm:pl-1">
                                                                            <span className="hidden xl:block text-[14px] text-center font-black text-blue-500 uppercase tracking-tighter mb-1 select-none">คาดการณ์</span>
                                                                            <span className="block xl:hidden text-[7px] sm:text-[10px] md:text-[12px] lg:text-[13px] text-center font-black text-blue-500 uppercase tracking-tighter mb-0.5 sm:mb-1 select-none">คก.</span>
                                                                            <span className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xl lg:text-2xl font-black tabular-nums">{item.forecast?.toFixed(1) || "0.0"}</span>
                                                                        </div>
                                                                        <div className="hidden flex flex-col items-center justify-center pl-0.5 sm:pl-1">
                                                                            <span className=" text-[7px] sm:text-[10px] lg:text-[13px] font-black text-rose-500 uppercase tracking-tighter mb-0.5 sm:mb-1 select-none whitespace-nowrap truncate">บังคับขาย</span>
                                                                            <span className=" text-rose-600 dark:text-rose-400 text-[10px] sm:text-xl lg:text-2xl font-black tabular-nums">{item.forcedSales?.toFixed(1) || "0.0"}</span>
                                                                        </div>
                                                                        <div className="flex flex-col items-center justify-center pl-0.5 sm:pl-1 border-l border-slate-100 dark:border-slate-800">
                                                                            <span className="text-[7px] sm:text-[10px] lg:text-[13px] font-black text-emerald-500 uppercase tracking-tighter mb-0.5 sm:mb-1 select-none whitespace-nowrap">จริง</span>
                                                                            <span className={cn("text-[10px] sm:text-xl lg:text-2xl font-black tabular-nums", tActual > 0 ? "text-emerald-990" : "text-gray-500")}>{tActual.toFixed(1)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="mt-2 sm:mt-5 space-y-2 sm:space-y-4">
                                                                    {/* Under Target (Miss) */}
                                                                    {item.forcedSales > tActual && (
                                                                        <div>
                                                                            <div className="flex justify-between items-end mb-0.5 sm:mb-1 px-1">
                                                                                <span className="text-[10px] sm:text-base lg:text-[18px] font-black text-rose-500 uppercase tracking-widest truncate">ขาดเป้า {Math.max(0, (item.forcedSales || 0) - tActual).toFixed(1)} กก.</span>
                                                                                <span className="text-[10px] sm:text-base lg:text-[18px] font-black text-rose-600 dark:text-rose-400 shrink-0 ml-1 sm:ml-2">
                                                                                    {item.forcedSales && item.forcedSales > 0 ? ((tActual / item.forcedSales) * 100).toFixed(0) : 0}%
                                                                                </span>
                                                                            </div>
                                                                            <div className="h-0.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[0.5px] sm:p-[1px]">
                                                                                <div
                                                                                    className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                                                                    style={{ width: `${Math.min(item.forcedSales && item.forcedSales > 0 ? (tActual / item.forcedSales) * 100 : 0, 100)}%` }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Over Target (Exceed) */}
                                                                    <div>
                                                                        <div className="flex justify-between items-end mb-0.5 sm:mb-1 px-1">
                                                                            <span className="hiddentext-[10px] sm:text-base lg:text-[18px] font-black text-blue-500 uppercase tracking-widest truncate">
                                                                                {tActual > item.forcedSales ? `เกินเป้า ${(tActual - item.forcedSales).toFixed(1)} กก.` : "เป้าหมายการขายรวม"}
                                                                            </span>
                                                                            <span className="text-[10px] sm:text-base lg:text-[18px] font-black text-blue-600 dark:text-blue-400 shrink-0 ml-1 sm:ml-2">
                                                                                {item.forcedSales && item.forcedSales > 0 ? ((tActual / item.forcedSales) * 100).toFixed(0) : 0}%
                                                                            </span>
                                                                        </div>
                                                                        <div className="h-0.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[0.5px] sm:p-[1px]">
                                                                            <div
                                                                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                                                                style={{ width: `${Math.min(item.forcedSales && item.forcedSales > 0 ? (tActual / item.forcedSales) * 100 : 0, 100)}%` }}
                                                                            />
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
                <DialogContent className="w-[95vw] md:max-w-6xl bg-white dark:bg-slate-950 border-none shadow-3xl rounded-[2.5rem] p-0 overflow-hidden flex flex-col max-h-[92vh]">
                    <DialogHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-white">
                            <span className="bg-rose-500 text-white p-1.5 rounded-lg"><Target size={16} /></span>
                            {editingGroup ? "แก้ไขคาดการณ์รายสัปดาห์" : "เพิ่มคาดการณ์รายสัปดาห์"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto flex-1">

                        {/* Section 1: Product & Type Selection (Row 1) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                            <div className="space-y-2">
                                <Label className="text-[18px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">กลุ่ม/ประเภท</Label>
                                <Select value={partCategoryFilter} onValueChange={setPartCategoryFilter} disabled={!!selectedMeatPart}>
                                    <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 font-black rounded-2xl shadow-sm">
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

                            <div className="space-y-2">
                                <Label className="text-[18px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">ชิ้นส่วน/สินค้า *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="พิมพ์เพื่อค้นหา..."
                                            value={partSearch}
                                            onFocus={() => setShowPartSuggestions(true)}
                                            onChange={(e) => { setPartSearch(e.target.value); setShowPartSuggestions(true) }}
                                            className="h-11 border-slate-200 dark:border-slate-700/50 focus-visible:ring-blue-500 rounded-2xl shadow-sm bg-white dark:bg-slate-900 font-black"
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
                                        <Button size="icon" onClick={handleAddPart} className="bg-slate-200/50 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 h-11 w-11 shrink-0 rounded-2xl transition-all shadow-sm" title="เพิ่มชิ้นส่วนใหม่">
                                            <Plus size={16} />
                                        </Button>
                                    )}
                                </div>
                                {selectedMeatPart && (
                                    <div className="absolute top-[85px] left-4 z-10 text-xs text-blue-600 dark:text-blue-400 font-black bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full inline-flex items-center border border-blue-100 dark:border-blue-900/30 shadow-sm animate-in zoom-in-95 duration-200">
                                        <span className="mr-1.5 opacity-70">✓</span> {selectedMeatPart.name}
                                        {!editingGroup && <button onClick={() => clearMeatPart()} className="ml-2 h-5 w-5 flex items-center justify-center rounded-full text-blue-300 dark:text-blue-700 hover:bg-rose-100 hover:text-rose-500 transition-colors">✕</button>}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[18px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">ชนิดสินค้า</Label>
                                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                                    <SelectTrigger className="h-11 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/50 font-black rounded-2xl shadow-sm focus:ring-blue-500/20">
                                        <SelectValue placeholder="-- เลือกประเภท --" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                        {PRODUCT_TYPES.map(pt => (
                                            <SelectItem key={pt.id} value={pt.id} className="rounded-xl font-medium">{pt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Section 2: Totals Summary (Row 2) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 dark:bg-slate-950/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-inner">
                            <div className="space-y-2 min-w-0">
                                <Label className="text-[18px] md:text-2xl font-black uppercase tracking-wider text-blue-500 flex items-center justify-center gap-1.5">เป้าหมายรวม</Label>
                                <div className="relative">
                                    <Input
                                        readOnly
                                        className="h-16 w-full bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 cursor-not-allowed font-black text-center text-blue-600 dark:text-blue-500 rounded-[1.5rem] text-3xl"
                                        value={autoTotalTarget || '0'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 min-w-0">
                                <Label className="text-[18px] md:text-2xl font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">คาดการณ์รวม</Label>
                                <div className="relative">
                                    <Input
                                        readOnly
                                        className="h-16 w-full bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50 cursor-not-allowed font-black text-center text-slate-900 dark:text-white rounded-[1.5rem] text-3xl"
                                        value={autoTotalForecast || '0'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 min-w-0">
                                <Label className="text-[18px] md:text-2xl font-black uppercase tracking-wider text-rose-500 flex items-center justify-center gap-1.5">บังคับขาย</Label>
                                <div className="relative group">
                                    <Input
                                        className="h-16 w-full bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/30 font-black text-center text-rose-600 dark:text-rose-500 rounded-[1.5rem] text-3xl focus:ring-4 focus:ring-rose-500/10 shadow-sm group-hover:shadow-md transition-all"
                                        value={jointForcedSales}
                                        placeholder="0.0"
                                        onChange={(e) => {
                                            const newVal = e.target.value.replace(/[^0-9.]/g, '');
                                            if (newVal === jointForcedSales && e.target.value !== newVal) return;
                                            setJointForcedSales(newVal);
                                            if (selectedStores.length > 0) {
                                                setSelectedStores(prev => {
                                                    const newArr = [...prev];
                                                    newArr[0] = { ...newArr[0], forcedSales: newVal };
                                                    for (let i = 1; i < newArr.length; i++) newArr[i] = { ...newArr[i], forcedSales: '0' };
                                                    return newArr;
                                                });
                                            } else if (newVal && newVal !== '0') {
                                                toast.error("กรุณาเพิ่มร้านค้าก่อนกำหนดเป้าบังคับขายรวม");
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Actuals & Diffs (Row 3 - New) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-6 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem]">
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">ซื้อจริงรวม กก</span>
                                    <span className="text-[14px] font-bold text-emerald-500/70">คำนวณเป็น % เทียบ บังคับขาย</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{autoTotalActual.toFixed(1)}</div>
                                    <div className="text-xl font-bold text-emerald-500/80">{autoTotalForcedSales > 0 ? ((autoTotalActual / autoTotalForcedSales) * 100).toFixed(0) : 0}%</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-[2rem]">
                                <div className="flex flex-col justify-center border-r border-slate-200 dark:border-slate-800 pr-4">
                                    <span className="text-lg font-black text-rose-500 uppercase">ขาดเป้า</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-rose-600">{Math.max(0, autoTotalForcedSales - autoTotalActual).toFixed(1)}</span>
                                        <span className="text-xs font-bold text-rose-400 truncate">กก.</span>
                                    </div>
                                    <div className="text-sm font-bold text-rose-400">
                                        {autoTotalForcedSales > 0 ? (Math.max(0, (autoTotalForcedSales - autoTotalActual) / autoTotalForcedSales) * 100).toFixed(0) : 0}%
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center pl-4">
                                    <span className="text-lg font-black text-blue-500 uppercase">เกินเป้า</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-blue-600">{Math.max(0, autoTotalActual - autoTotalForcedSales).toFixed(1)}</span>
                                        <span className="text-xs font-bold text-blue-400 truncate">กก.</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-400">
                                        {autoTotalForcedSales > 0 ? (Math.max(0, (autoTotalActual - autoTotalForcedSales) / autoTotalForcedSales) * 100).toFixed(0) : 0}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Stores & Notes */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <Label className="text-xl font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <ShoppingBag size={18} className="text-blue-500" /> ร้านเป้าหมายและการกระจายตัวเลข
                                    </Label>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedStores([...selectedStores, { store: null, target: '', forecast: '', forcedSales: '', actual: 0 }])}
                                        className="h-9 px-4 text-xs font-black bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-all"
                                    >
                                        <Plus size={14} className="mr-1" /> เพิ่มร้านค้า
                                    </Button>
                                </div>

                                {selectedStores.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/20 rounded-[2rem] text-sm text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                                        คลิก "+ เพิ่มร้านค้า" เพื่อระบุเป้าหมายในแต่ละสาขา
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedStores.map((s, i) => (
                                            <TargetStoreRow
                                                key={i}
                                                index={i}
                                                storeItem={s}
                                                onChangeStore={(idx: number, newStore: any) => {
                                                    setSelectedStores(prev => {
                                                        const newArr = [...prev]
                                                        newArr[idx] = { ...newArr[idx], store: newStore }
                                                        return newArr
                                                    })
                                                }}
                                                onChangeTarget={(idx: number, newTarget: string) => {
                                                    setSelectedStores(prev => {
                                                        const newArr = [...prev]
                                                        newArr[idx] = { ...newArr[idx], target: newTarget }
                                                        return newArr
                                                    })
                                                }}
                                                onChangeForecast={(idx: number, newForecast: string) => {
                                                    setSelectedStores(prev => {
                                                        const newArr = [...prev]
                                                        newArr[idx] = { ...newArr[idx], forecast: newForecast }
                                                        return newArr
                                                    })
                                                }}
                                                onChangeForcedSales={(idx: number, newForcedSales: string) => {
                                                    setSelectedStores(prev => {
                                                        const newArr = [...prev]
                                                        newArr[idx] = { ...newArr[idx], forcedSales: newForcedSales }
                                                        return newArr
                                                    })
                                                }}
                                                onChangeActual={(idx: number, newActual: string) => {
                                                    setSelectedStores(prev => {
                                                        const newArr = [...prev]
                                                        newArr[idx] = { ...newArr[idx], actual: newActual === '' ? undefined : safeFloat(newActual) }
                                                        return newArr
                                                    })
                                                }}
                                                onRemove={(idx: number) => {
                                                    setSelectedStores(prev => prev.filter((_, idx2) => idx2 !== idx))
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-950/20 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                            <Label className="text-[18px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 ml-1">หมายเหตุ / บันทึกเพิ่มเติม</Label>
                            <Textarea
                                placeholder="ใส่ข้อมูลเพิ่มเติมที่ต้องการระบุ..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="min-h-[80px] resize-none border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 rounded-2xl focus:ring-blue-500/20"
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
