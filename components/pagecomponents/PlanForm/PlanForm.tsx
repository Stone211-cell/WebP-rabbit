"use client"

import { useState, useEffect, useRef } from "react"
import { axiosInstance } from "@/lib/axios"
import { createPlan, updatePlan, deletePlan } from "@/lib/api/plans"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { exportToExcel } from "@/lib/export"
import { getExcelValue, parseExcelDate } from "@/lib/excel"
import * as XLSX from "xlsx"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ActionButton } from "@/components/crmhelper/helper"
import { Upload, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, Calendar, MapPin, Phone, CreditCard, Package, Clock, Truck, User, Store } from "lucide-react"
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
import { Button } from "@/components/ui/button" // Added missing Button import

import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { VisitTopics } from "@/lib/types/manu"


export default function PlanForm({ plans, profiles, onRefresh }: any) {
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

    // --- Order Auto-Calculation ---
    useEffect(() => {
        if (!form.sales || !form.date) return

        const targetDate = new Date(form.date).setHours(0, 0, 0, 0)
        const relevantPlans = (plans || []).filter((p: any) =>
            p.sales === form.sales &&
            new Date(p.date).setHours(0, 0, 0, 0) === targetDate
        )

        if (relevantPlans.length > 0) {
            const maxOrder = Math.max(...relevantPlans.map((p: any) => parseInt(p.order) || 0))
            setForm((prev: any) => ({ ...prev, order: String(maxOrder + 1) }))
        } else {
            setForm((prev: any) => ({ ...prev, order: "1" }))
        }
    }, [form.sales, form.date, plans])

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


    // ... imports

    // ... inside component

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
                await updatePlan(editingPlan.id, {
                    ...form,
                    masterId: selectedStore.id,
                    date: new Date(form.date).toISOString(),
                })
                toast.success("แก้ไขแผนงานเรียบร้อยแล้ว")
                setEditingPlan(null)
            } else {
                // CREATE
                await createPlan({
                    ...form,
                    masterId: selectedStore.id,
                    date: new Date(form.date).toISOString(),
                })
                toast.success("บันทึกแผนเรียบร้อยแล้ว")
            }

            // ล้างฟอร์ม
            setForm({
                ...form,
                date: new Date().toLocaleDateString('en-CA'),
                visitCat: "ตรวจเยี่ยมประจำเดือน",
                notes: "",
                order: "1"
            })

            if (onRefresh) onRefresh()
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("คุณต้องการลบแผนงานนี้ใช่หรือไม่?")) return

        try {
            await deletePlan(id)
            toast.success("ลบแผนงานเรียบร้อยแล้ว")
            if (onRefresh) onRefresh()
        } catch (error) {
            handleApiError(error)
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
        const dataToExport = (plans || []).map((p: any, index: number) => ({
            "ลำดับ": index + 1,
            "วันที่": new Date(p.date).toLocaleDateString('th-TH'),
            "รหัส": p.store?.code || "-",                  // matches API 'รหัส'
            "ชื่อร้าน": p.store?.name || p.storeName || "-",  // matches API 'ชื่อร้าน'
            "เซลล์": p.sales || "-",                         // matches API 'เซลล์'
            "หัวข้อเข้าพบ": p.visitCat || "-",               // matches API 'หัวข้อเข้าพบ'
            "บันทึก": p.notes || "-"                          // matches API 'บันทึก'
        }));
        exportToExcel(dataToExport, "WeeklyPlans");
    }

    const handleClear = async () => {
        if (!confirm("⚠️ คุณแน่ใจหรือไม่ว่าต้องการลบ \"ข้อมูลแผนงานทั้งหมด\" ในระบบ?\n\n- ร้านค้าและการเข้าพบจริงจะไม่ถูกลบ\n- การดำเนินการนี้ไม่สามารถย้อนกลับได้")) return
        setIsClearing(true)
        const toastId = toast.loading("กำลังลบแผนงาน...")
        try {
            const res = await axiosInstance.delete('/plans')
            toast.success(res.data.message || "ลบแผนงานเรียบร้อยแล้ว")
            if (onRefresh) {
                const endDate = new Date(currentWeekStart)
                endDate.setDate(currentWeekStart.getDate() + 6)
                endDate.setHours(23, 59, 59, 999)
                onRefresh(weekStartIso, endDate.toISOString())
            }
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
                        toast.success(info.message || "นำเข้าข้อมูลสำเร็จ", { id: 'import-plan' });
                        if (onRefresh) onRefresh();
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="space-y-1">
                    {/* Header / Week Navigation */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl">
                                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                                    แผนงาน <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">รายสัปดาห์</span>
                                </h1>
                                <p className="text-sm text-slate-500 font-bold italic">วางแผนล่วงหน้าเพื่อยอดขายที่เติบโต</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <ActionButton
                                onClick={handleClear}
                                disabled={isClearing}
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600 border-red-600 shadow-lg shadow-red-500/20 rounded-2xl px-6"
                                icon={<Trash2 className="w-4 h-4 mr-2" />}
                                label={isClearing ? "กำลังลบ..." : "ล้างข้อมูลทั้งหมด"}
                            />

                            <input type="file" ref={fileInputRef} onChange={handleImportExcel} className="hidden" accept=".xlsx, .xls" />
                            <ActionButton
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline"
                                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-200/20 dark:shadow-none rounded-2xl px-6"
                                icon={<Upload className="w-4 h-4 mr-2 text-blue-600" />}
                                label="นำเข้า Excel"
                            />

                            <ActionButton
                                onClick={handleExport}
                                variant="outline"
                                className="bg-white/50 dark:bg-slate-800/50 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-200/20 dark:shadow-none rounded-2xl px-6"
                                icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />}
                                label="ส่งออก Excel"
                            />

                            <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-xl border border-slate-100 dark:border-slate-700 ml-4">
                                <ActionButton variant="ghost" size="icon" onClick={goToPrevWeek} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600" icon={<ChevronLeft className="w-5 h-5" />} />
                                <div className="px-6 py-2 text-sm font-black text-slate-700 dark:text-slate-200 min-w-[220px] text-center">
                                    {formatWeekRange()}
                                </div>
                                <ActionButton variant="ghost" size="icon" onClick={goToNextWeek} className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600" icon={<ChevronRight className="w-5 h-5" />} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Salesperson */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">พนักงานขาย (เซลล์) *</Label>
                            {profiles && profiles.length > 0 ? (
                                <Select value={form.sales} onValueChange={(v) => setForm({ ...form, sales: v })}>
                                    <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                                        <SelectValue placeholder="เลือกเซลล์" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map((p: any) => (
                                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={form.sales}
                                    onChange={(e) => setForm({ ...form, sales: e.target.value })}
                                    placeholder="พิมพ์ชื่อเซลล์..."
                                    className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl"
                                />
                            )}
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

                        {/* Store Search */}
                        <div className="relative space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน *</Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="รหัส หรือ ชื่อร้าน..."
                                        value={storeSearch}
                                        onChange={(e) => setStoreSearch(e.target.value)}
                                        className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold"
                                    />
                                    {selectedStore && (
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-md pointer-events-none">{selectedStore.name}</div>
                                    )}
                                    {storeSearch && <button onClick={clearStore} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">✕</button>}
                                </div>
                                <Button onClick={handleManualSearch} className="rounded-2xl h-12 px-5 bg-blue-600 text-white">🔍</Button>
                            </div>

                            {/* Suggestions */}
                            {showSuggestions && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                                    {suggestions.map((s) => (
                                        <button key={s.id} onClick={() => selectStore(s)} className="w-full px-4 py-3 text-left hover:bg-blue-500/10 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm">{s.name}</span>
                                            <div className="text-[10px] text-slate-500 italic">{s.code}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Store Profile - Only shown when store selected */}
                    {selectedStore && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-sm">
                                {/* Profile Header */}
                                <div className="p-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between text-black">
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
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 text-black">
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
                            รายการ แผน <span className="text-sm font-normal text-slate-500 ml-2">(ทั้งหมด {plans?.length || 0} รายการ)</span>
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
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
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="font-black px-6 py-2 rounded-xl shadow-sm transition-all active:scale-95 bg-white/50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800/50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                            <span className="text-xl mr-2">📥</span> ส่งออก Excel
                        </Button>
                    </div>
                </div>

                <div className="bg-white text-black dark:bg-slate-900/50 dark:text-white rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                            <TableRow className="border-b dark:border-slate-800 hover:bg-transparent">
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 pl-6 text-center w-16">ลำดับ</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">วันที่</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">รหัส</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">ชื่อร้าน</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">เซลล์</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">หัวข้อเข้าพบ</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400">บันทึก</TableHead>
                                <TableHead className="py-4 font-bold text-slate-700 dark:text-slate-400 text-right pr-6">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans && plans.length > 0 ? (
                                plans
                                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .map((p: any, index: number) => (
                                        <TableRow key={p.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors even:bg-slate-50/50 dark:even:bg-slate-800/5">
                                            <TableCell className="text-center text-xs text-slate-500 dark:text-slate-400 font-bold pl-6">{index + 1}</TableCell>
                                            <TableCell className="py-3 text-xs text-slate-700 dark:text-slate-200 font-bold">{new Date(p.date).toLocaleDateString('th-TH')}</TableCell>
                                            <TableCell className="py-3 text-xs text-blue-600 dark:text-blue-500 font-bold">{p.store?.code || "-"}</TableCell>
                                            <TableCell className="py-3 text-xs text-slate-700 dark:text-slate-200 font-bold max-w-[150px]">
                                                <div className="truncate" title={p.store?.name || p.storeName || "-"}>
                                                    {p.store?.name || p.storeName || "-"} {p.store?.code && `(${p.store.code})`}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-xs text-slate-700 dark:text-slate-200 font-bold">{p.sales}</TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-md text-[10px] font-bold border",
                                                    p.visitCat === "ตรวจเยี่ยมประจำเดือน" ? "bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6]" :
                                                        p.visitCat === "ติดตามผล" ? "bg-[#fef7e0] text-[#b06000] border-[#feefc3]" :
                                                            "bg-[#e8f0fe] text-[#1967d2] border-[#d2e3fc]"
                                                )}>
                                                    {p.visitCat}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-xs">{p.notes || "-"}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <ActionButton
                                                    label="ลบ"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(p.id)}
                                                    className="h-7 px-3 text-[10px] bg-slate-800/50 text-slate-400 border border-slate-700 rounded hover:bg-slate-700 hover:text-white transition-all"
                                                />
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
        </div>
    )
}
