"use client"

import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
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

import { useStoreSearch } from "@/components/hooks/useStoreSearch"

export default function PlanForm({ plans, profiles, onRefresh }: any) {
    const [form, setForm] = useState<any>({
        sales: "",
        date: new Date().toLocaleDateString('en-CA'),
        visitCat: "ตรวจเยี่ยมประจำเดือน",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    // 🚀 จัดการการบันทึก (Clean Pattern)
    const handleSubmit = async () => {
        if (!form.sales || !selectedStore) {
            toast.error("กรุณาเลือกเซลล์และร้านค้า")
            return
        }

        setIsSubmitting(true)
        try {
            await axiosInstance.post("/plans", {
                ...form,
                masterId: selectedStore.id,
                date: new Date(form.date).toISOString(),
            })
            toast.success("บันทึกแผนเรียบร้อยแล้ว")

            // ล้างฟอร์ม
            setForm({
                ...form,
                date: new Date().toLocaleDateString('en-CA'),
                visitCat: "ตรวจเยี่ยมประจำเดือน",
                notes: ""
            })
            clearStore()

            if (onRefresh) onRefresh()
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* HEADER & WEEK NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-2.5 bg-blue-500/10 rounded-2xl">📅</span>
                        แผน <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">สัปดาห์</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-12 italic">จัดการแผนงานและตารางนัดหมายรายสัปดาห์</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-end md:self-center">
                    <Button variant="ghost" size="icon" onClick={goToPrevWeek} className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700">
                        <span className="text-lg">←</span>
                    </Button>
                    <div className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[120px] text-center block">
                            {formatWeekRange()}
                        </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700">
                        <span className="text-lg">→</span>
                    </Button>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Salesperson */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">พนักงานขาย (เซลล์) *</Label>
                            <Select value={form.sales} onValueChange={(v) => setForm({ ...form, sales: v })}>
                                <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                                    <SelectValue placeholder="เลือกเซลล์" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profiles?.map((p: any) => (
                                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">วันที่แผน *</Label>
                            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold" />
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
                            <Select value={form.visitCat} onValueChange={(v) => setForm({ ...form, visitCat: v })}>
                                <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                                    <SelectValue placeholder="เลือกหัวข้อ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ตรวจเยี่ยมประจำเดือน">ตรวจเยี่ยมประจำเดือน</SelectItem>
                                    <SelectItem value="ติดตามยอดค้างชำระ">ติดตามยอดค้างชำระ</SelectItem>
                                    <SelectItem value="แนะนำสินค้าใหม่">แนะนำสินค้าใหม่</SelectItem>
                                    <SelectItem value="เจรจาขยายฐานลูกค้า">เจรจาขยายฐานลูกค้า</SelectItem>
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

                    {/* STORE DETAILS VISUALIZATION */}
                    {selectedStore && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-500/5 p-6 rounded-3xl border border-slate-200/50">
                            <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">ชื่อร้าน</Label><Input value={selectedStore.name} readOnly className="h-9 bg-white/30 rounded-xl text-xs font-bold" /></div>
                            <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">เจ้าของ</Label><Input value={selectedStore.owner || "-"} readOnly className="h-9 bg-white/30 rounded-xl text-xs font-bold" /></div>
                            <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">เบอร์โทร</Label><Input value={selectedStore.phone || "-"} readOnly className="h-9 bg-white/30 rounded-xl text-xs font-bold" /></div>
                            <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">ประเภทร้าน</Label><Input value={selectedStore.type || "-"} readOnly className="h-9 bg-white/30 rounded-xl text-xs font-bold" /></div>
                            <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">ที่อยู่</Label><Input value={selectedStore.address || "-"} readOnly className="h-9 bg-white/30 rounded-xl text-xs font-bold" /></div>
                        </div>
                    )}

                    <Textarea placeholder="บันทึกรายละเอียด..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 rounded-2xl min-h-[100px]" />

                    <div className="flex gap-4">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg py-7 rounded-3xl shadow-xl">
                            {isSubmitting ? "กำลังบันทึก..." : "เพิ่มแผนงานสัปดาห์"}
                        </Button>
                        <Button onClick={() => setForm({ ...form, notes: "" })} variant="outline" className="md:w-48 py-7 rounded-3xl font-bold">ล้างฟอร์ม</Button>
                    </div>
                </CardContent>
            </Card>

            {/* TABLE */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">รายการแผนงาน</h3>
                </div>

                {plans && Object.entries((plans || []).reduce((acc: any, p: any) => {
                    const salesName = p.sales || "ไม่ระบุเซลล์"
                    if (!acc[salesName]) acc[salesName] = []
                    acc[salesName].push(p)
                    return acc
                }, {})).map(([salesName, salesPlans]: [string, any]) => (
                    <div key={salesName} className="space-y-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 w-fit">
                            <span className="text-sm font-black text-slate-700 dark:text-slate-300">👤 {salesName}</span>
                            <span className="text-[10px] font-bold text-slate-400 ml-2">{salesPlans.length} รายการ</span>
                        </div>

                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-800/5 dark:bg-white/5">
                                    <TableRow className="border-slate-200 dark:border-slate-800">
                                        <TableHead className="py-4 font-black uppercase text-[10px]">วันที่</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px]">ชื่อร้าน</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px]">หัวข้อ</TableHead>
                                        <TableHead className="py-4 font-black uppercase text-[10px]">บันทึก</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {salesPlans.map((p: any) => (
                                        <TableRow key={p.id} className="border-slate-100 dark:border-slate-800/50 hover:bg-blue-500/5 transition-colors">
                                            <TableCell className="py-4 text-xs font-bold">{new Date(p.date).toLocaleDateString('th-TH')}</TableCell>
                                            <TableCell className="text-xs font-bold">{p.store?.name || p.storeName}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">{p.visitCat}</span>
                                            </TableCell>
                                            <TableCell className="text-[11px] text-slate-500 italic max-w-[200px] truncate">{p.notes || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
