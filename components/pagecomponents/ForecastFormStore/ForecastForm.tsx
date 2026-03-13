"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns"
import { th } from "date-fns/locale"
import { cn, formatThaiDate } from "@/lib/utils"
import { validateFields } from "@/lib/toast/validate"
import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { useMeatPartSearch } from "@/components/hooks/useMeatPartSearch"
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import axios from "axios"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
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
// ... (imports) ...
import {
    CalendarIcon,
    Trash2,
    Plus,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Target,
    ShoppingBag,
    Edit2,
    CheckCircle2,
    AlertCircle
} from "lucide-react"

// Type checking helper
const safeFloat = (val: any) => {
    const parsed = parseFloat(val)
    return !isNaN(parsed) ? parsed : 0
}

const DEFAULT_MEAT_PARTS = [
    { id: 'd-101', name: 'สันนอก', category: 'เนื้อแดง', sortOrder: 1 },
    { id: 'd-107', name: 'สะโพก', category: 'เนื้อแดง', sortOrder: 7 },
    { id: 'd-104', name: 'สันใน', category: 'เนื้อแดง', sortOrder: 4 },
    { id: 'd-114', name: 'น่องลาย', category: 'เนื้อแดง', sortOrder: 14 },
]

const MEAT_CATEGORIES = [
    { id: 'เนื้อแดง', label: '🥩 เนื้อแดง' },
    { id: 'เครื่องใน', label: '💜 เครื่องใน' },
    { id: 'ส่วนหัว', label: '🐷 ส่วนหัว' },
    { id: 'เศษ', label: '🟢 เศษ' },
    { id: 'อะไหล่', label: '🔵 อะไหล่' },
]

const PRODUCT_TYPES = [
    { id: 'สด', label: 'สด' },
    { id: 'เก่าสด', label: 'เก่าสด' },
    { id: 'ขึ้นรูป', label: 'ขึ้นรูป' },
    { id: 'สไลด์', label: 'สไลด์' },
    { id: 'แพ็ค', label: 'แพ็ค' },
    { id: 'เสต็ก', label: 'เสต็ก' },
]

export default function ForecastForm({ stores = [], forecasts, date, setDate, weekStart, weekEnd, onRefresh, onCreate, onUpdate, onDelete, isAdmin }: any) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    // Store Search Hook
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
    } = useStoreSearch()

    // Form State
    const [formData, setFormData] = useState({
        productType: "",
        targetWeek: "",
        targetMonth: "",
        forecast: "",
        actual: "",
        notes: ""
    })

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState("")
    const [productFilter, setProductFilter] = useState("all")

    const [newPartCategory, setNewPartCategory] = useState<string>("")
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
        const finalCategory = (partCategoryFilter && partCategoryFilter !== 'all') ? partCategoryFilter : newPartCategory;
        if (!finalCategory) return toast.error("กรุณาเลือกประเภทชิ้นส่วนก่อนเพิ่มใหม่")

        const newPart = await addMeatPart(partSearch, finalCategory)
        if (newPart) {
            selectMeatPart(newPart)
        }
    }

    const handleDeletePart = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("ยืนยันลบชิ้นส่วนนี้?")) return
        const ok = await deletePartItem(id)
        if (ok) {
            if (selectedMeatPart?.id === id) clearMeatPart()
        }
    }

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

    // Reset form
    const resetForm = () => {
        setFormData({
            productType: "",
            targetWeek: "",
            targetMonth: "",
            forecast: "",
            actual: "",
            notes: ""
        })
        clearStore()
        setPartSearch("")
        clearMeatPart()
        setPartCategoryFilter("all")
        setNewPartCategory("")
        setEditingItem(null)
        setShowDialog(false)
    }

    // Add Product to existing store
    const handleAddProduct = (store: any) => {
        // Clear form data but keep store
        setFormData({
            productType: "",
            targetWeek: "",
            targetMonth: "",
            forecast: "",
            actual: "",
            notes: ""
        })
        setPartSearch("")
        clearMeatPart()
        setPartCategoryFilter("all")
        setNewPartCategory("")
        setEditingItem(null)

        // Select the store
        if (store) {
            selectStore(store)
        }
        setShowDialog(true)
    }

    // Open Edit Dialog
    const handleEdit = (item: any) => {
        setEditingItem(item)
        setFormData({
            productType: item.productType || "",
            targetWeek: item.targetWeek?.toString() || "",
            targetMonth: item.targetMonth?.toString() || "",
            forecast: item.forecast?.toString() || "",
            actual: item.actual?.toString() || "",
            notes: item.notes || ""
        })

        // Find existing part or fallback to manual search string
        const tempParts = filteredParts.length > 0 ? filteredParts : [];
        const foundPart = tempParts.find(p => p.name === item.product)
        if (foundPart) selectMeatPart(foundPart)
        else setPartSearch(item.product || "")
        // Mock selecting the store
        if (item.store) {
            selectStore(item.store)
        }
        setShowDialog(true)
    }

    // Handle Submit
    const handleSubmit = async () => {
        const productName = selectedMeatPart ? selectedMeatPart.name : partSearch
        const ok = validateFields([
            { label: "ร้านค้า", value: selectedStore },
            { label: "ชื่อสินค้า", value: productName, invalid: !productName },
            { label: "เป้าหมายรายสัปดาห์", value: formData.targetWeek, invalid: formData.targetWeek === "" },
            { label: "เป้าหมายรายเดือน", value: formData.targetMonth, invalid: formData.targetMonth === "" },
        ], toast.error)
        if (!ok) return

        setIsSubmitting(true)
        try {
            const payload = {
                masterId: selectedStore.id,
                product: productName,
                productType: formData.productType,
                targetWeek: safeFloat(formData.targetWeek),
                targetMonth: safeFloat(formData.targetMonth),
                forecast: safeFloat(formData.forecast),
                actual: safeFloat(formData.actual),
                notes: formData.notes,
                weekStart: weekStart.toISOString()
            }

            if (editingItem) {
                if (onUpdate) await onUpdate(editingItem.id, payload)
                toast.success("อัปเดตข้อมูลเรียบร้อย")
            } else {
                if (onCreate) await onCreate(payload)
                toast.success("เพิ่มข้อมูลเรียบร้อย")
            }

            resetForm()
            if (onRefresh) onRefresh()
        } catch (error: any) {
            toast.error(error?.response?.data?.error || error?.message || "เกิดข้อผิดพลาด")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle Delete
    const handleDelete = async (id: string) => {
        if (!confirm("ยืนยันการลบรายการนี้?")) return
        try {
            if (onDelete) await onDelete(id)
            if (onRefresh) onRefresh()
            toast.success("ลบรายการเรียบร้อย")
        } catch (error: any) {
            toast.error(error?.response?.data?.error || "ลบไม่สำเร็จ")
        }
    }

    // --- Calculations ---
    const summary = useMemo<{
        week: { target: number, forecast: number, actual: number, diff: number },
        month: { target: number, forecast: number, actual: number, diff: number },
        products: { name: string, target: number, actual: number, forecast: number }[]
    }>(() => {
        let weekTarget = 0, weekForecast = 0, weekActual = 0;
        let monthTarget = 0, monthForecast = 0, monthActual = 0;
        const productsMap = new Map<string, { name: string, target: number, actual: number, forecast: number }>();

        // The 'forecasts' prop now contains data for the ENTIRE month
        (forecasts || []).forEach((f: any) => {
            const fDate = new Date(f.weekStart);
            const wTarget = f.targetWeek || 0;
            const wForecast = f.forecast || 0;
            const wActual = f.actual || 0;

            // Monthly aggregation (True Sum)
            monthTarget += wTarget;
            monthForecast += wForecast;
            monthActual += wActual;

            // Weekly aggregation (Strictly for the selected week)
            if (fDate >= weekStart && fDate <= weekEnd) {
                weekTarget += wTarget;
                weekForecast += wForecast;
                weekActual += wActual;

                // Product Grouping (for the selected week)
                const pName = f.product || "Other";
                if (!productsMap.has(pName)) {
                    productsMap.set(pName, { name: pName, target: 0, actual: 0, forecast: 0 });
                }
                const p = productsMap.get(pName)!;
                p.target += wTarget;
                p.actual += wActual;
                p.forecast += wForecast;
            }
        });

        return {
            week: { target: weekTarget, forecast: weekForecast, actual: weekActual, diff: weekActual - weekForecast },
            month: { 
                target: monthTarget, 
                actual: monthActual, 
                forecast: monthForecast, 
                diff: monthActual - monthForecast 
            },
            products: Array.from(productsMap.values())
        };
    }, [forecasts, weekStart, weekEnd]);

    // --- Grouping by Store ---
    const groupedForecasts = useMemo(() => {
        const groups: Record<string, { store: any, items: any[] }> = {}

        // Strict Week Filtering
        const filteredByWeek = (forecasts || []).filter((f: any) => {
            const fDate = new Date(f.weekStart)
            return fDate >= weekStart && fDate <= weekEnd
        })

        filteredByWeek.forEach((f: any) => {
            if (productFilter !== "all" && f.product !== productFilter) return
            const sName = (f.store?.name || "").toLowerCase()
            const sCode = (f.store?.code || "").toLowerCase()
            const sQuery = searchTerm.toLowerCase()
            if (searchTerm && !sName.includes(sQuery) && !sCode.includes(sQuery)) return

            const sid = f.store?.id || 'unknown'
            if (!groups[sid]) groups[sid] = { store: f.store, items: [] }
            groups[sid].items.push(f)
        })

        return Object.values(groups).sort((a: any, b: any) => (a.store?.code || "").localeCompare(b.store?.code || ""))
    }, [forecasts, productFilter, searchTerm, weekStart, weekEnd])


    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 min-h-screen pb-20">

            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="flex-1 w-full">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                            <span className="p-2.5 md:p-3 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 shrink-0">
                                <TrendingUp size={24} className="md:w-7 md:h-7" />
                            </span>
                            <span className="text-2xl md:text-3xl font-black">คาดการณ์</span>
                        </div>
                        <span className="text-xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-tight">ลูกค้ารายสัปดาห์</span>
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <WeekNavigator className="w-full sm:w-auto min-w-[280px]" />

                    {isAdmin && (
                        <Button
                            onClick={() => setShowDialog(true)}
                            className="flex-1 sm:flex-none h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-full hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 px-8 shadow-md"
                        >
                            <Plus size={20} className="mr-1" />
                            เพิ่ม<span className="hidden sm:inline text-[13px] ml-1">คาดการณ์</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* --- MONTHLY SUMMARY (Purple) --- */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-purple-800 p-8 text-white shadow-2xl shadow-purple-900/40">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                <h3 className="flex items-center gap-2 font-black text-lg opacity-90 mb-6">
                    <CalendarIcon size={20} /> สรุปรายเดือน (ประมาณการ 4 สัปดาห์)
                    {/* Background indicator for past/future */}
                    <div className="ml-auto flex gap-2">
                        {new Date() > weekEnd && <span className="bg-slate-400/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">ข้อมูลย้อนหลัง</span>}
                        {new Date() < weekStart && <span className="bg-amber-400/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-400/20">สัปดาห์หน้า</span>}
                    </div>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                        <div className="text-sm opacity-70 mb-1">คาดการณ์รวม</div>
                        <div className="text-4xl font-black tracking-tight">{summary.month.forecast.toLocaleString()}</div>
                        <div className="text-xs opacity-50 mt-1">กิโลกรัม/เดือน</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm opacity-70 mb-1">
                            <CheckCircle2 size={14} className="text-emerald-300" /> ซื้อรวมได้
                        </div>
                        <div className="text-4xl font-black tracking-tight">{summary.month.actual.toLocaleString()}</div>
                        <div className="text-xs opacity-50 mt-1">กิโลกรัม/เดือน</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center relative overflow-hidden">
                        <div className={cn("absolute inset-0 opacity-20", summary.month.diff >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
                        <div className="relative z-10">
                            <div className="text-sm opacity-70 mb-1">ส่วนต่าง</div>
                            <div className="text-4xl font-black tracking-tight flex items-center justify-center gap-2">
                                {summary.month.diff > 0 ? "▲" : "▼"} {Math.abs(summary.month.diff).toLocaleString()}
                            </div>
                            <div className="text-xs opacity-50 mt-1">
                                {summary.month.target > 0
                                    ? `เกินเป้า ${((summary.month.actual / summary.month.target) * 100).toFixed(0)}%`
                                    : "ไม่มีเป้าหมาย"
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- WEEKLY SUMMARY (Blue/Green) --- */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 ml-2">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" /> สรุปรายสัปดาห์นี้
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 rounded-[2rem]">
                        <CardContent className="p-6 text-center">
                            <div className="text-sm opacity-80 mb-1">คาดการณ์รวม</div>
                            <div className="text-3xl font-black">{summary.week.forecast.toLocaleString()}</div>
                            <div className="text-[10px] opacity-60">กิโลกรัม</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20 rounded-[2rem]">
                        <CardContent className="p-6 text-center">
                            <div className="text-sm opacity-80 mb-1">ซื้อจริง</div>
                            <div className="text-3xl font-black">{summary.week.actual.toLocaleString()}</div>
                            <div className="text-[10px] opacity-60">กิโลกรัม</div>
                        </CardContent>
                    </Card>
                    <Card className={cn("text-white border-0 shadow-lg rounded-[2rem]", summary.week.diff >= 0 ? "bg-emerald-600 shadow-emerald-600/20" : "bg-rose-500 shadow-rose-500/20")}>
                        <CardContent className="p-6 text-center">
                            <div className="text-sm opacity-80 mb-1">ส่วนต่าง</div>
                            <div className="text-3xl font-black flex items-center justify-center gap-2">
                                {summary.week.diff > 0 ? "▲" : "▼"} {Math.abs(summary.week.diff).toLocaleString()}
                            </div>
                            <div className="text-[10px] opacity-60">
                                {summary.week.target > 0
                                    ? `${((summary.week.actual / summary.week.target) * 100).toFixed(0)}% จากเป้า`
                                    : "ไม่มีเป้าหมาย"
                                }
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- PRODUCT SUMMARY --- */}
            {summary.products.length > 0 && (
                <Card className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-900 dark:text-white">
                            <ShoppingBag size={18} className="text-orange-500 dark:text-orange-400" /> สรุปตามสินค้า
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {summary.products.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="font-bold text-slate-900 dark:text-white ml-2">{p.name}</div>
                                    <div className="text-right text-xs space-y-1 mr-2">
                                        <div className="flex gap-4 opacity-70">
                                            <span>คาดการณ์ {(Number(p.forecast) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                            <span>ซื้อจริง {(Number(p.actual) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className={cn("font-bold text-sm", (p.actual - p.forecast) >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                                            ส่วนต่าง {(p.actual - p.forecast) > 0 ? "+" : ""}{(Number((p.actual - p.forecast).toFixed(2))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- DETAILED LIST (GROUPED BY STORE) --- */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm gap-6">
                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-black text-lg px-2">
                            <div className="h-5 w-1.5 bg-indigo-500 rounded-full"></div> รายละเอียดรายร้านค้า
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-5">แยกตามสาขา</div>
                    </div>

                    {/* Date Picker Range (Synchronized 2) */}
                    <div className="flex-1 flex justify-center max-w-md w-full">
                        <WeekNavigator className="w-full bg-white dark:bg-slate-950 border-indigo-100 dark:border-indigo-900/30 scale-105 shadow-md" />
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
                    <div className="flex flex-col gap-8">
                        {groupedForecasts.map((group: any) => (
                            <div key={group.store?.id || Math.random()} className="bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-md rounded-[2rem] p-4 md:p-6 border border-white/20 dark:border-slate-800 shadow-sm">
                                {/* Store Group Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-500/20">
                                            {group.store?.name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1.5">{group.store?.name}</h4>
                                            <div className="flex gap-2 text-xs font-mono text-slate-500 items-center">
                                                <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 font-bold">{group.store?.code}</span>
                                                <span className="opacity-70">| {group.store?.name}</span>
                                                <span className="opacity-50">({group.items.length} รายการ)</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            onClick={() => handleAddProduct(group.store)}
                                            size="sm"
                                            className="bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white font-bold rounded-full px-5 shadow-sm hover:shadow-md transition-all border border-indigo-100 dark:border-indigo-500"
                                        >
                                            <Plus size={16} className="mr-1" /> เพิ่มสินค้า
                                        </Button>
                                    )}
                                </div>

                                {/* Items Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {group.items.map((f: any) => {
                                        const progressWeek = f.targetWeek > 0 ? (f.actual / f.targetWeek) * 100 : 0
                                        const progressMonth = f.targetMonth > 0 ? (f.actual / f.targetMonth) * 100 : 0
                                        const diff = (f.actual || 0) - (f.forecast || 0)

                                        return (
                                            <Card key={f.id} className="relative overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-sm rounded-[1.2rem] hover:shadow-lg transition-all group">
                                                <div className="p-4 space-y-1">
                                                    {/* Top Row: Product Name & Edit */}
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                                {f.product}
                                                            </h4>
                                                        </div>
                                                        {isAdmin ? (
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => handleEdit(f)}>
                                                                    แก้ไข
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg" onClick={() => handleDelete(f.id)}>
                                                                    ลบ
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity">View Only</span>
                                                        )}
                                                    </div>

                                                    {/* Progress Bars Row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Week Target */}
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs font-bold">
                                                                <span className="flex items-center gap-1 text-blue-500"><Target size={12} /> เป้าหมายสัปดาห์</span>
                                                                <span>{f.targetWeek?.toLocaleString()} กก.</span>
                                                            </div>
                                                            <Progress value={progressWeek} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
                                                            <div className="flex justify-between text-[10px] font-medium">
                                                                <span className="text-slate-500">ซื้อแล้ว {f.actual?.toLocaleString()} ({progressWeek.toFixed(0)}%)</span>
                                                                {progressWeek >= 100 ? (
                                                                    <span className="text-emerald-500 font-bold">บรรลุเป้าแล้ว!</span>
                                                                ) : (
                                                                    <span className="text-slate-400">เหลืออีก {(f.targetWeek - f.actual).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Month Target */}
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs font-bold">
                                                                <span className="flex items-center gap-1 text-purple-500"><Target size={12} /> เป้าหมายเดือน</span>
                                                                <span>{f.targetMonth?.toLocaleString()} กก.</span>
                                                            </div>
                                                            <Progress value={progressMonth} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
                                                            <div className="flex justify-between text-[10px] font-medium">
                                                                <span className="text-slate-500">สะสม {f.actual?.toLocaleString()} ({progressMonth.toFixed(0)}%)</span>
                                                                {progressMonth >= 100 ? (
                                                                    <span className="text-emerald-500 font-bold">บรรลุเป้าแล้ว!</span>
                                                                ) : (
                                                                    <span className="text-rose-400">ยังขาดอีก {(f.targetMonth - f.actual).toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bottom Stats Footer */}
                                                <div className="bg-slate-50/50 dark:bg-black/20 px-4 py-3 flex justify-between items-center text-[10px] border-t border-slate-100 dark:border-slate-800">
                                                    <div className="text-center w-1/3 border-r border-slate-200 dark:border-slate-800">
                                                        <div className="opacity-50 mb-0.5">คาดการณ์</div>
                                                        <div className="font-bold text-blue-500 text-sm">{f.forecast?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="text-center w-1/3 border-r border-slate-200 dark:border-slate-800">
                                                        <div className="opacity-50 mb-0.5">ซื้อจริง</div>
                                                        <div className="font-bold text-emerald-500 text-sm">{f.actual?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="text-center w-1/3">
                                                        <div className="opacity-50 mb-0.5">ส่วนต่าง</div>
                                                        <div className={cn("font-bold text-sm", diff >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                                            {diff > 0 ? "+" : ""}{diff.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400">ยังไม่มีข้อมูลคาดการณ์ในสัปดาห์นี้</p>
                    </div>
                )}
            </div>

            {/* --- ADD/EDIT DIALOG --- */}
            <Dialog open={showDialog} onOpenChange={(o) => { if (!o) resetForm(); else setShowDialog(o); }}>
                <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-4xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            {editingItem ? <Edit2 className="text-blue-500" /> : <Plus className="text-blue-500" />}
                            {editingItem ? "แก้ไขคาดการณ์" : "เพิ่มคาดการณ์รายสัปดาห์"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">เลือกร้าน *</Label>
                                <div className="relative">
                                    <StoreSearchBox
                                        storeSearch={storeSearch}
                                        setStoreSearch={setStoreSearch}
                                        suggestions={suggestions}
                                        showSuggestions={showSuggestions}
                                        selectedStore={selectedStore}
                                        selectStore={selectStore}
                                        clearStore={clearStore}
                                        handleManualSearch={handleManualSearch}
                                        isSearching={isSearching}
                                        placeholder="ค้นหารหัส หรือ ชื่อร้าน..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">เลือกกลุ่ม/ประเภท</Label>
                                <Select value={partCategoryFilter} onValueChange={setPartCategoryFilter} disabled={!!selectedMeatPart}>
                                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl h-[42px] focus:ring-2 focus:ring-blue-500/20">
                                        <SelectValue placeholder="-- ทั้งหมด --" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                        <SelectItem value="all">-- ทั้งหมด --</SelectItem>
                                        {MEAT_CATEGORIES.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">สินค้า *</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            placeholder="พิมพ์เพื่อค้นหา..."
                                            value={partSearch}
                                            onFocus={() => setShowPartSuggestions(true)}
                                            onChange={(e) => { setPartSearch(e.target.value); setShowPartSuggestions(true) }}
                                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl h-[42px] focus:ring-2 focus:ring-blue-500/20"
                                            disabled={!!selectedMeatPart}
                                        />
                                        {showPartSuggestions && filteredParts.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-700/50">
                                                {filteredParts.map(p => (
                                                    <div key={p.id} className="flex items-center group/item hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer first:rounded-t-lg last:rounded-b-lg transition-colors">
                                                        <button
                                                            onClick={() => { selectMeatPart(p); setShowPartSuggestions(false) }}
                                                            className="flex-1 flex items-center gap-2 p-2.5 text-xs text-left text-slate-700 dark:text-slate-200"
                                                        >
                                                            <span className="h-5 w-5 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded text-[10px] group-hover/item:bg-blue-500 group-hover/item:text-white transition-colors">🥩</span>
                                                            <span className="flex-1 font-bold">{p.name}</span>
                                                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{p.category}</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeletePart(p.id, e)}
                                                            className="opacity-0 group-hover/item:opacity-100 p-1.5 mr-1 rounded-md text-rose-400 hover:bg-rose-500/20 transition-all hover:text-rose-500"
                                                            title="ลบ"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {!selectedMeatPart && (
                                        <Button size="icon" onClick={handleAddPart} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 h-[42px] w-[42px] shrink-0 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700" title="เพิ่มชิ้นส่วนใหม่">
                                            <Plus size={16} />
                                        </Button>
                                    )}
                                </div>
                                {selectedMeatPart && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-2 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full inline-flex items-center border border-blue-100 dark:border-blue-900/30">
                                        <span className="mr-1.5 opacity-70">✓</span> {selectedMeatPart.name} <span className="mx-1.5 opacity-30">|</span> <span className="opacity-70 text-[9px] uppercase tracking-wider">{selectedMeatPart.category}</span>
                                        <button onClick={() => clearMeatPart()} className="ml-2 h-4 w-4 flex items-center justify-center rounded-full text-blue-300 dark:text-blue-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-500 transition-colors">✕</button>
                                    </div>
                                )}
                                {!selectedMeatPart && filteredParts.length === 0 && partSearch.length > 0 && partCategoryFilter === 'all' && (
                                    <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 space-y-2">
                                        <Label className="text-[10px] font-bold text-amber-600 dark:text-amber-500">ระบุประเภทชิ้นส่วนใหม่ก่อนเพิ่ม:</Label>
                                        <Select value={newPartCategory} onValueChange={setNewPartCategory}>
                                            <SelectTrigger className="h-8 bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800/50 text-slate-900 dark:text-white text-xs">
                                                <SelectValue placeholder="-- ไม่ได้เลือกรายการ --" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                                {MEAT_CATEGORIES.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">ชนิดสินค้า</Label>
                                <Select
                                    value={formData.productType}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, productType: val }))}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl h-[42px] focus:ring-2 focus:ring-blue-500/20">
                                        <SelectValue placeholder="เลือกชนิดสินค้า..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                        {PRODUCT_TYPES.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400 flex items-center gap-1"><Target size={12} className="text-blue-500" /> เป้าหมายสัปดาห์ (กก.) *</Label>
                                <Input
                                    type="number"
                                    value={formData.targetWeek}
                                    onChange={(e) => setFormData({ ...formData, targetWeek: e.target.value })}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-400 flex items-center gap-1"><Target size={12} className="text-purple-500" /> เป้าหมายเดือน (กก.) *</Label>
                                <Input
                                    type="number"
                                    value={formData.targetMonth}
                                    onChange={(e) => setFormData({ ...formData, targetMonth: e.target.value })}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">คาดการณ์ (กก./สัปดาห์)</Label>
                                <Input
                                    type="number"
                                    value={formData.forecast}
                                    onChange={(e) => setFormData({ ...formData, forecast: e.target.value })}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">ยอดซื้อจริง (กก.)</Label>
                                <Input
                                    type="number"
                                    value={formData.actual}
                                    onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl h-11 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400">หมายเหตุ</Label>
                            <Textarea
                                placeholder="บันทึกเพิ่มเติม..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl resize-none h-24 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                     <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex gap-2 justify-end">
                        <Button variant="ghost" onClick={resetForm} className="hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">ยกเลิก</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-500 text-white min-w-[100px]">
                            {isSubmitting ? "บันทึก..." : "บันทึก"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    )
}