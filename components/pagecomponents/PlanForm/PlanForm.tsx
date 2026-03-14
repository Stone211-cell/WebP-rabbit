"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios"
import { createPlan, updatePlan, deletePlan } from "@/lib/api/plans"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn, formatThaiDate, confirmDelete, confirmClearAll } from "@/lib/utils"
import { exportPlansToExcel } from "@/lib/exportexcel/exportFormatters"
import { getExcelValue, parseExcelDate } from "@/lib/exportexcel/excel"
import * as XLSX from "xlsx"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ActionButton } from "@/components/crmhelper/helper"
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import { SalesPersonSelect } from "@/components/crmhelper/SalesPersonSelect"
import { Upload, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, Calendar, MapPin, Phone, CreditCard, Package, Clock, Truck, User, Store, Pencil, X } from "lucide-react"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { useSearch } from "@/components/hooks/useSearch"
import { VisitTopics } from "@/lib/types/manu"
import { HistorySearchFilter } from "@/components/crmhelper/HistorySearchFilter"


export default function PlanForm({ plans, stores, profiles, onRefresh, onCreate, onUpdate, onDelete, isAdmin, currentUserProfile }: any) {
    const router = useRouter()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [form, setForm] = useState<any>({
        sales: "",
        date: new Date().toLocaleDateString('en-CA'),
        visitCat: "ตรวจเยี่ยมประจำเดือน",
        notes: "",
        order: "1"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isClearing, setIsClearing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 💡 ใช้ Hook จัดการค้นหาร้านค้า
    const {
        storeSearch,
        setStoreSearch,
        isSearching,
        suggestions,
        showSuggestions,
        selectedStore,
        selectStore,
        clearStore,
        handleManualSearch
    } = useStoreSearch()

    // 🌟 Local state for immediate UI updates
    const [localPlans, setLocalPlans] = useState<any[]>(plans || [])

    useEffect(() => {
        setLocalPlans(plans || [])
    }, [plans])

    // 🔍 ใช้ shared useSearch hook สำหรับตัวกรองแผนงาน
    const [salesFilter, setSalesFilter] = useState("all")
    const { search: historySearch, setSearch: setHistorySearch, filtered: filteredPlans } = useSearch(
        localPlans,
        ['store.name', 'store.code', 'storeName', 'storeCode', 'notes', 'visitCat'],
        salesFilter === 'all' ? undefined : (p: any) => p.sales === salesFilter
    )

    // --- Order Auto-Calculation ---
    useEffect(() => {
        if (!form.sales || !form.date) return

        const targetDate = new Date(form.date).setHours(0, 0, 0, 0)
        const relevantPlans = localPlans.filter((p: any) =>
            p.sales === form.sales &&
            new Date(p.date).setHours(0, 0, 0, 0) === targetDate
        )

        if (relevantPlans.length > 0) {
            const maxOrder = Math.max(...relevantPlans.map((p: any) => parseInt(p.order) || 0))
            setForm((prev: any) => ({ ...prev, order: String(maxOrder + 1) }))
        } else {
            setForm((prev: any) => ({ ...prev, order: "1" }))
        }
    }, [form.sales, form.date, localPlans])

    // --- Week Navigation Logic ---
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date()
        const day = d.getDay()
        const date = d.getDate()
        const sun = new Date(new Date(d).setDate(date - day))
        sun.setHours(0, 0, 0, 0)
        return sun
    })

    const weekStartIso = currentWeekStart.toISOString()

    useEffect(() => {
        const endDate = new Date(currentWeekStart)
        endDate.setDate(currentWeekStart.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)

        if (onRefresh) {
            onRefresh(weekStartIso, endDate.toISOString())
        }
    }, [weekStartIso, onRefresh])

    const goToPrevWeek = () => setCurrentWeekStart(prev => new Date(new Date(prev).setDate(prev.getDate() - 7)))
    const goToNextWeek = () => setCurrentWeekStart(prev => new Date(new Date(prev).setDate(prev.getDate() + 7)))

    const formatWeekRange = () => {
        const start = currentWeekStart
        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
        const startDay = start.getDate()
        const endDay = end.getDate()
        const startMonth = monthNames[start.getMonth()]
        const endMonth = monthNames[end.getMonth()]
        const thaiYear = start.getFullYear() + 543

        if (start.getMonth() === end.getMonth()) {
            return `${startDay} - ${endDay} ${startMonth} ${thaiYear}`
        }
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${thaiYear}`
    }

    const [editingPlan, setEditingPlan] = useState<any>(null)

    const resetForm = () => {
        setForm({
            sales: isAdmin && currentUserProfile ? currentUserProfile.name : "",
            date: new Date().toLocaleDateString('en-CA'),
            visitCat: "ตรวจเยี่ยมประจำเดือน",
            notes: "",
            order: "1"
        });
        clearStore();
        setEditingPlan(null);
    };

    /** เริ่มโหมดแก้ไข — เติมฟอร์มจากข้อมูลแผนที่เลือก */
    const startEdit = (plan: any) => {
        setEditingPlan(plan)
        setForm({
            sales: plan.sales || "",
            date: new Date(plan.date).toLocaleDateString('en-CA'),
            visitCat: plan.visitCat || "ตรวจเยี่ยมประจำเดือน",
            notes: plan.notes || "",
            order: plan.order || "1",
        })
        if (plan.store) selectStore(plan.store)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // บังคับชื่อเซลล์เป็นผู้ใช้งานปัจจุบันถ้าไม่ใช่แอดมิน
    useEffect(() => {
        if (!isAdmin && currentUserProfile) {
            setForm(prev => ({ ...prev, sales: currentUserProfile.name }));
        }
    }, [isAdmin, currentUserProfile]);

    // 🚀 จัดการการบันทึก (Clean Pattern)
    const handleSubmit = async () => {
        if (!form.sales || !selectedStore) {
            toast.error("กรุณาเลือกเซลล์และร้านค้า")
            return
        }

        setIsSubmitting(true)
        try {
            if (editingPlan) {
                // UPDATE
                const updatedData = {
                    ...form,
                    masterId: selectedStore.id,
                    date: new Date(form.date).toISOString(),
                    store: selectedStore // add store object back for display
                }
                const res = await updatePlan(editingPlan.id, updatedData)

                // Optimistic UI Update
                setLocalPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...updatedData, id: editingPlan.id } : p))

                toast.success("แก้ไขแผนงานเรียบร้อยแล้ว")
                if (onUpdate) onUpdate(editingPlan.id, updatedData)
            } else {
                // CREATE
                const newData = {
                    ...form,
                    masterId: selectedStore.id,
                    date: new Date(form.date).toISOString(),
                    store: selectedStore // add store object back for display
                }
                const res = await createPlan(newData)

                // Optimistic UI Update
                if (res && res.id) {
                    setLocalPlans(prev => [res, ...prev])
                } else {
                    setLocalPlans(prev => [{ ...newData, id: Math.random().toString(36).substring(7) }, ...prev])
                }

                toast.success("บันทึกแผนเรียบร้อยแล้ว")
                if (onCreate) onCreate(newData)
            }

            // ล้างฟอร์ม
            resetForm()
            setIsCreateOpen(false)
            if (onRefresh) onRefresh()
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, name?: string) => {
        if (!confirmDelete(name || "แผนงานนี้")) return
        const toastId = toast.loading("กำลังลบแผนงาน...")
        try {
            await deletePlan(id)

            // Optimistic UI Update
            setLocalPlans(prev => prev.filter(p => p.id !== id))

            if (onDelete) await onDelete(id)
            if (onRefresh) onRefresh()
            toast.success("ลบแผนงานเรียบร้อยแล้ว!")
        } catch (error) {
            handleApiError(error)
        } finally {
            toast.dismiss(toastId)
        }
    }

    const handleCancelEdit = () => {
        setEditingPlan(null)
        setForm({
            ...form,
            notes: "",
            visitCat: "ตรวจเยี่ยมประจำเดือน"
        })
    }

    const handleExport = () => {
        exportPlansToExcel(plans || []);
    }

    const handleClear = async () => {
        if (!confirmClearAll("ข้อมูลแผนงานทั้งหมด")) return
        setIsClearing(true)
        const toastId = toast.loading("กำลังลบแผนงาน...")
        try {
            const res = await axiosInstance.delete('/plans')
            toast.success(res.data.message || "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว")
            if (onRefresh) onRefresh()
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsClearing(false)
            toast.dismiss(toastId)
        }
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        toast.loading('กำลังโหลดแผนงาน...', { id: 'import-plan' });
        try {
            const formData = new FormData()
            formData.append("file", file)
            // Import route accepts JSON right now. Needs refactor or we do it client side like dashboard

            // Wait, we can do client side parsing like the dashboard and send JSON
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const wb = XLSX.read(bstr, { type: 'array', cellDates: true });
                    const wsname = wb.SheetNames.find(n => n.includes('แผน') || n.includes('Plan')) || wb.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

                    const plansToImport = jsonData.map((row: any) => {
                        const dateRaw = getExcelValue(row, ['วันที่', 'date', 'plan_date', 'Date', 'วันที่นัด']);
                        const finalDate = parseExcelDate(dateRaw);

                        return {
                            date: finalDate,
                            sales: getExcelValue(row, ['เซลล์', 'sales', 'sale', 'พนักงานขาย']) || 'ไม่ระบุ',
                            storeCode: getExcelValue(row, ['รหัส', 'code', 'store_code', 'รหัสลูกค้า', 'รหัสร้าน']) || '',
                            storeName: getExcelValue(row, ['ชื่อร้าน', 'name', 'store_name', 'ชื่อ']) || '',
                            visitCat: getExcelValue(row, ['หัวข้อเข้าพบ', 'visitcat', 'visit_cat', 'หัวข้อ']) || 'ตรวจเยี่ยมประจำเดือน',
                            notes: getExcelValue(row, ['บันทึก', 'notes', 'note', 'details', 'หมายเหตุ']) || null,
                            order: getExcelValue(row, ['คำสั่งซื้อ', 'order', 'order_amount', 'ยอดสั่งซื้อ', 'ยอด']) || '1'
                        };
                    }).filter((p: any) => p.storeCode || p.storeName);

                    const res = await fetch("/api/plans/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plans: plansToImport })
                    });
                    const info = await res.json();
                    if (res.ok) {
                        toast.success(info.message || "นำเข้าข้อมูลสำเร็จ", { id: 'import-plan' })
                        if (onRefresh) onRefresh()
                    } else {
                        toast.error(info.error || "เกิดข้อผิดพลาดในการนำเข้า", { id: 'import-plan' });
                    }
                } catch (err) {
                    console.error("Import error:", err);
                    toast.error("รูปแบบไฟล์ไม่ถูกต้อง", { id: 'import-plan' });
                }
            }
            reader.readAsArrayBuffer(file);
        } catch (error) {
            handleApiError(error);
            toast.dismiss('import-plan');
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* HEADER & WEEK NAVIGATION */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-5 md:p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl space-y-4">
                {/* Top row: Title + buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl flex-shrink-0">
                            <Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                แผนงาน <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">รายสัปดาห์</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold italic">วางแผนล่วงหน้าเพื่อยอดขายที่เติบโต</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isAdmin && (
                            <>
                                <ActionButton
                                    onClick={handleClear}
                                    disabled={isClearing}
                                    variant="destructive"
                                    className="bg-red-500 hover:bg-red-600 border-red-600 rounded-2xl px-4 h-10 text-sm"
                                    icon={<Trash2 className="w-4 h-4" />}
                                    label={isClearing ? "กำลังลบ..." : "ล้างทั้งหมด"}
                                />
                                <input type="file" ref={fileInputRef} onChange={handleImportExcel} className="hidden" accept=".xlsx, .xls" />
                                <ActionButton
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    className="border-blue-200 dark:border-blue-800 rounded-2xl px-4 h-10 text-sm"
                                    icon={<Upload className="w-4 h-4 text-blue-600" />}
                                    label="นำเข้า"
                                />
                            </>
                        )}
                        <ActionButton
                            onClick={handleExport}
                            variant="outline"
                            className="border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 h-10 text-sm"
                            icon={<FileSpreadsheet className="w-4 h-4 text-green-600" />}
                            label="ส่งออก"
                        />
                    </div>
                </div>

                {/* Week navigator */}
                <div className="flex items-center justify-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-md border border-slate-100 dark:border-slate-700">
                    <ActionButton variant="ghost" size="icon" onClick={goToPrevWeek} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600" icon={<ChevronLeft className="w-5 h-5" />} />
                    <div className="flex-1 text-sm font-black text-slate-700 dark:text-slate-200 text-center px-4">
                        {formatWeekRange()}
                    </div>
                    <ActionButton variant="ghost" size="icon" onClick={goToNextWeek} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600" icon={<ChevronRight className="w-5 h-5" />} />
                </div>
            </div>

            {/* Edit Mode Banner */}
            {editingPlan && (
                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400">
                    <Pencil className="w-4 h-4 flex-shrink-0" />
                    <span className="font-bold text-sm flex-1">กำลังแก้ไขแผนงาน: <span className="font-black">{editingPlan.store?.name || ""}</span></span>
                    <button onClick={() => { setEditingPlan(null); setForm({ sales: "", date: new Date().toLocaleDateString('en-CA'), visitCat: "ตรวจเยี่ยมประจำเดือน", notes: "", order: "1" }); clearStore() }} className="flex items-center gap-1 text-xs font-bold hover:underline">
                        <X className="w-3 h-3" /> ยกเลิก
                    </button>
                </div>
            )}

            {/* FORM CARD */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Salesperson */}
                        <div className="space-y-1.5">
                            <SalesPersonSelect
                                profiles={profiles}
                                value={form.sales}
                                onValueChange={(v) => setForm({ ...form, sales: v })}
                                isAdmin={isAdmin}
                                currentUserProfile={currentUserProfile}
                                label="พนักงานขาย (เซลล์) *"
                                placeholder="เลือกเซลล์"
                            />
                        </div>

                        {/* Date & Order */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">วันที่ / ลำดับ *</Label>
                            <div className="flex gap-2">
                                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="flex-1 bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold" />
                                <Input
                                    type="text"
                                    value={form.order}
                                    readOnly
                                    className="w-20 bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold text-center cursor-not-allowed text-slate-500"
                                    placeholder="ลำดับ"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
                            <Select value={form.visitCat} onValueChange={(v) => setForm({ ...form, visitCat: v })}>
                                <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                                    <SelectValue placeholder="เลือกหัวข้อ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VisitTopics.map(topic => (
                                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Store Search — shared component */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน *</Label>
                            <StoreSearchBox
                                storeSearch={storeSearch}
                                setStoreSearch={setStoreSearch}
                                suggestions={suggestions}
                                showSuggestions={showSuggestions}
                                selectedStore={selectedStore}
                                selectStore={selectStore}
                                clearStore={clearStore}
                                handleManualSearch={handleManualSearch}
                            />
                        </div>
                    </div>

                    {/* Enhanced Store Profile - Only shown when store selected */}
                    {selectedStore && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-sm">
                                {/* Profile Header */}
                                <div className="p-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-slate-900 dark:text-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-600/10 rounded-2xl">
                                            <Store className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedStore.name}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="px-2 py-0 h-4 border border-blue-200 text-blue-600 dark:border-blue-900/50 dark:text-blue-400 text-[10px] font-mono rounded flex items-center italic">#{selectedStore.code}</span>
                                                <span className="px-2 py-0 h-4 bg-indigo-500 text-white border-none text-[10px] rounded flex items-center font-bold">{selectedStore.customerType || "ทั่วไป"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เงื่อนไขการชำระ</span>
                                        <span className="text-sm font-black text-blue-600">{selectedStore.payment || "เงินสด"}</span>
                                    </div>
                                </div>

                                {/* Profile Body */}
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-900 dark:text-slate-100">
                                    {/* Left Column: Core Info */}
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl mt-0.5">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">ที่อยู่ร้านค้า</Label>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{selectedStore.address || "ไม่ระบุข้อมูลที่อยู่"}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">เจ้าของ / ผู้ติดต่อ</Label>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedStore.owner || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl">
                                                    <Phone className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">เบอร์โทรศัพท์</Label>
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedStore.phone || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Business Insight */}
                                    <div className="grid grid-cols-2 gap-y-6 gap-6 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/50 md:pl-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Package className="w-3.5 h-3.5 text-indigo-500" />
                                                <Label className="text-[10px] text-slate-400 font-black uppercase">สินค้าที่ใช้</Label>
                                            </div>
                                            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{selectedStore.productUsed || "-"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                                                <Label className="text-[10px] text-slate-400 font-black uppercase">ปริมาณ/เดือน</Label>
                                            </div>
                                            <p className="text-sm font-black text-blue-600 dark:text-blue-400">{selectedStore.quantity || "-"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                                                <Label className="text-[10px] text-slate-400 font-black uppercase">รับของจาก</Label>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedStore.supplier || "-"}</p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                <Label className="text-[10px] text-slate-400 font-black uppercase">ระยะเวลาสั่ง</Label>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedStore.orderPeriod || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <Textarea placeholder="บันทึกรายละเอียด..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 rounded-2xl min-h-[100px]" />

                    <div className="flex gap-4">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className={cn(
                            "flex-1 text-white font-black text-lg py-7 rounded-3xl shadow-xl transition-all",
                            editingPlan ? "bg-amber-500 hover:bg-amber-600" : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        )}>
                            {isSubmitting ? "กำลังบันทึก..." : editingPlan ? "⚡ บันทึกการแก้ไข" : "เพิ่มแผนงานสัปดาห์"}
                        </Button>
                        <Button onClick={editingPlan ? handleCancelEdit : () => { setForm({ sales: "", date: new Date().toLocaleDateString('en-CA'), visitCat: "ตรวจเยี่ยมประจำเดือน", notes: "", order: "1" }); clearStore(); }} variant="outline" className="md:w-48 py-7 rounded-3xl font-bold">
                            {editingPlan ? "ยกเลิก" : "ล้างฟอร์ม"}
                        </Button>
                    </div>
                </CardContent>
            </Card>


            {/* MAIN PLAN LIST (Always Visible, matching reference) */}
            <div className="space-y-4 pt-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            รายการ แผน <span className="text-sm font-normal text-slate-500 ml-2">(ทั้งหมด {filteredPlans?.length || 0} รายการ)</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImportExcel}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="font-black px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 bg-white/50 border-amber-200 text-amber-600 hover:bg-amber-50 dark:bg-slate-800/50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                >
                                    <Upload className="w-5 h-5 mr-2" /> นำเข้า Excel
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="font-black px-6 py-2 rounded-xl shadow-sm transition-all active:scale-95 bg-white/50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800/50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                            <span className="text-xl mr-2">📥</span> ส่งออก Excel
                        </Button>
                    </div>
                </div>

                <HistorySearchFilter
                    search={historySearch}
                    onSearchChange={setHistorySearch}
                    salesFilter={salesFilter}
                    onSalesFilterChange={setSalesFilter}
                    profiles={profiles}
                    searchLabel="ค้นหาแผนงาน"
                    searchPlaceholder="รหัส / ชื่อร้าน / รายละเอียด..."
                />

                <div className="bg-white text-slate-900 dark:bg-slate-900/50 dark:text-white rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden">
                    <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                            <TableRow className="border-b dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 pl-6 text-center w-[80px] hidden md:table-cell">ลำดับ</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 w-[100px] hidden sm:table-cell">วันที่</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 w-[100px] hidden md:table-cell">รหัส</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 min-w-[150px]">ชื่อร้าน</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 w-[100px] hidden lg:table-cell">เซลล์</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 w-[120px] hidden lg:table-cell">หัวข้อเข้าพบ</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 min-w-[150px] hidden xl:table-cell">บันทึก</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 text-right pr-6 w-[100px]">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPlans && filteredPlans.length > 0 ? (
                                filteredPlans
                                    .sort((a: any, b: any) => {
                                        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
                                        if (dateDiff !== 0) return dateDiff;
                                        return (parseInt(a.order) || 0) - (parseInt(b.order) || 0);
                                    })
                                    .map((p: any, index: number) => (
                                        <TableRow key={p.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/5">
                                            <TableCell className="w-[80px] text-center text-xs text-slate-500 dark:text-slate-400 font-bold pl-6 hidden md:table-cell">{index + 1}</TableCell>
                                            <TableCell className="w-[100px] py-3 text-xs text-slate-700 dark:text-slate-200 font-bold hidden sm:table-cell">{formatThaiDate(p.date, 'dd/MM/yyyy')}</TableCell>
                                            <TableCell className="w-[100px] py-3 text-xs text-blue-600 dark:text-blue-500 font-bold break-words whitespace-normal hidden md:table-cell">{p.store?.code || "-"}</TableCell>
                                            <TableCell className="min-w-[150px] py-3 text-xs text-slate-700 dark:text-slate-200 font-bold break-words whitespace-normal">
                                                <div className="flex flex-col gap-1">
                                                    <div className="line-clamp-2" title={p.store?.name || p.storeName || "-"}>
                                                        {p.store?.name || p.storeName || "-"}
                                                    </div>
                                                    <div className="flex items-center gap-2 md:hidden">
                                                        <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{p.store?.code || "-"}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[100px] py-3 text-xs text-slate-700 dark:text-slate-200 font-bold break-words whitespace-normal hidden lg:table-cell">{p.sales}</TableCell>
                                            <TableCell className="w-[120px] hidden lg:table-cell">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] font-bold border",
                                                    p.visitCat === "ตรวจเยี่ยมประจำเดือน" ? "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]" :
                                                        p.visitCat === "ติดตามผล" ? "bg-[#fef7e0] text-[#b06000] border-[#feefc3]" :
                                                            "bg-[#e8f0fe] text-[#1967d2] border-[#d2e3fc]"
                                                )}>
                                                    {p.visitCat}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs break-words whitespace-normal hidden xl:table-cell min-w-[150px]"><div className="line-clamp-2">{p.notes || "-"}</div></TableCell>
                                            <TableCell className="text-right pr-4 align-middle">
                                                <div className="flex justify-end items-center gap-2">
                                                    {isAdmin && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => startEdit(p)}
                                                                className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 rounded-full"
                                                                title="แก้ไข"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDelete(p.id, p.store?.name)}
                                                                className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-full"
                                                                title="ลบ"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {!isAdmin && <span className="text-[10px] text-slate-400 italic">View Only</span>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-slate-500 italic">
                                        ยังไม่มีแผนงานในสัปดาห์นี้
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div >
    )
}
