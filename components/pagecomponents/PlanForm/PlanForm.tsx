"use client"

import { useState, useEffect, useCallback } from "react"
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

export default function PlanForm({ stores, plans, profiles, onRefresh }: any) {
    const [form, setForm] = useState<any>({
        sales: "",
        date: new Date().toLocaleDateString('en-CA'), // Local date default
        visitCat: "ตรวจเยี่ยมประจำเดือน",
        notes: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    // --- Week Navigation Logic ---
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date()
        const day = d.getDay()
        const date = d.getDate()
        const sun = new Date(new Date(d).setDate(date - day))
        sun.setHours(0, 0, 0, 0)
        return sun
    })

    useEffect(() => {
        const endDate = new Date(currentWeekStart)
        endDate.setDate(currentWeekStart.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)

        if (onRefresh) {
            onRefresh(currentWeekStart.toISOString(), endDate.toISOString())
        }
    }, [currentWeekStart, onRefresh])

    const goToPrevWeek = () => {
        setCurrentWeekStart(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 7)
            return d
        })
    }

    const goToNextWeek = () => {
        setCurrentWeekStart(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 7)
            return d
        })
    }

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

    const handleChange = (name: string, value: any) => {
        setForm((prev: any) => ({ ...prev, [name]: value }))
    }

    // Debounced API Search for Stores (Threshold: 1 char)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (form.storeSearch?.length > 0 && form.storeSearch !== form.storeRef) {
                setIsSearching(true)
                setShowSuggestions(true)
                try {
                    const res = await axiosInstance.get(`/stores?search=${form.storeSearch}`)
                    setSuggestions(res.data.slice(0, 10))
                } catch (err) {
                    console.error("Search failed", err)
                    setSuggestions([])
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSuggestions([])
                setShowSuggestions(false)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [form.storeSearch, form.storeRef])

    const handleManualSearch = async () => {
        if (!form.storeSearch || form.storeSearch === form.storeRef) return
        setIsSearching(true)
        setShowSuggestions(true)
        try {
            const res = await axiosInstance.get(`/stores?search=${form.storeSearch}`)
            setSuggestions(res.data.slice(0, 10))
        } catch (err) {
            console.error("Manual search failed", err)
            setSuggestions([])
        } finally {
            setIsSearching(false)
        }
    }

    const selectStore = (store: any) => {
        setForm((prev: any) => ({
            ...prev,
            masterId: store.id,
            storeRef: store.code,
            storeName: store.name,
            owner: store.owner,
            phone: store.phone,
            type: store.type,
            customerType: store.customerType,
            address: store.address,
            productUsed: store.productUsed,
            quantity: store.quantity,
            orderPeriod: store.orderPeriod,
            supplier: store.supplier,
            payment: store.payment,
            storeSearch: store.code
        }))
        setSuggestions([])
        setShowSuggestions(false)
    }

    const clearStore = () => {
        setForm((prev: any) => ({
            ...prev,
            masterId: "",
            storeRef: "",
            storeName: "",
            owner: "",
            phone: "",
            type: "",
            customerType: "",
            address: "",
            productUsed: "",
            quantity: "",
            orderPeriod: "",
            supplier: "",
            payment: "",
            storeSearch: ""
        }))
        setSuggestions([])
        setShowSuggestions(false)
    }

    const handleSubmit = async () => {
        if (!form.sales || !form.masterId) {
            toast.error("กรุณาเลือกเซลล์และร้านค้า")
            return
        }

        setIsSubmitting(true)
        try {
            await axiosInstance.post("/plans", {
                ...form,
                date: new Date(form.date).toISOString(), // Ensure ISO for DB
            })
            toast.success("บันทึกแผนเรียบร้อยแล้ว")
            setForm({
                sales: form.sales, // Keep sales
                date: new Date().toLocaleDateString('en-CA'),
                visitCat: "ตรวจเยี่ยมประจำเดือน",
                notes: ""
            })
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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevWeek}
                        className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
                    >
                        <span className="text-lg">←</span>
                    </Button>
                    <div className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 min-w-[120px] text-center block">
                            {formatWeekRange()}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNextWeek}
                        className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 active:scale-90 transition-transform"
                    >
                        <span className="text-lg">→</span>
                    </Button>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-8">

                    {/* PRIMARY INFO ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Salesperson Select */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">พนักงานขาย (เซลล์) *</Label>
                            <Select value={form.sales} onValueChange={(v) => handleChange("sales", v)}>
                                <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-blue-500/30">
                                    <SelectValue placeholder="เลือกเซลล์ผู้รับผิดชอบ" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                                    {profiles && profiles.length > 0 ? (
                                        profiles.map((p: any) => (
                                            <SelectItem key={p.id} value={p.name} className="focus:bg-blue-500/10 rounded-xl cursor-pointer py-2 group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-[10px] border border-blue-500/20 group-hover:scale-110 transition-transform">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            p.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.name}</span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic">{p.email || "No Email"}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center space-y-2">
                                            <div className="text-2xl opacity-20 italic font-serif text-slate-400 text-black dark:text-white">Empty</div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">ไม่พบรายชื่อเซลล์ในระบบ</p>
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Input */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">วันที่แผน *</Label>
                            <Input
                                type="date"
                                value={form.date || ""}
                                onChange={(e) => handleChange("date", e.target.value)}
                                className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold"
                            />
                        </div>

                        {/* Visit Category Select */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
                            <Select value={form.visitCat} onValueChange={(v) => handleChange("visitCat", v)}>
                                <SelectTrigger className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-blue-500/30">
                                    <SelectValue placeholder="เลือกหัวข้อ" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                                    <SelectItem value="ตรวจเยี่ยมประจำเดือน" className="focus:bg-blue-500/10 rounded-xl py-3">ตรวจเยี่ยมประจำเดือน</SelectItem>
                                    <SelectItem value="ติดตามยอดค้างชำระ" className="focus:bg-rose-500/10 rounded-xl py-3 text-rose-600 dark:text-rose-400">ติดตามยอดค้างชำระ</SelectItem>
                                    <SelectItem value="แนะนำสินค้าใหม่" className="focus:bg-emerald-500/10 rounded-xl py-3 text-emerald-600 dark:text-emerald-400">แนะนำสินค้าใหม่</SelectItem>
                                    <SelectItem value="เจรจาขยายฐานลูกค้า" className="focus:bg-amber-500/10 rounded-xl py-3 text-amber-600 dark:text-amber-400">เจรจาขยายฐานลูกค้า</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Store Search */}
                        <div className="relative space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน * <span className="text-blue-500 font-normal italic">(พิมพ์หรือกดแว่นขยายเพื่อหา)</span></Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="รหัส หรือ ชื่อร้าน..."
                                        value={form.storeSearch || ""}
                                        onChange={(e) => handleChange("storeSearch", e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                handleManualSearch()
                                            }
                                        }}
                                        className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-slate-900 dark:text-slate-100 font-bold pr-10"
                                    />

                                    {form.storeSearch && !isSearching && (
                                        <button
                                            type="button"
                                            onClick={clearStore}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors dark:text-white"
                                        >
                                            ✕
                                        </button>
                                    )}

                                    {isSearching && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleManualSearch}
                                    disabled={isSearching}
                                    className="rounded-2xl h-12 px-5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center"
                                >
                                    <span className="text-lg">🔍</span>
                                </Button>
                            </div>

                            {/* Autocomplete Suggestions */}
                            {showSuggestions && (
                                <div className="absolute z-50 w-full md:w-[calc(100%-3.5rem)] mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[300px] overflow-y-auto">
                                    {suggestions.length > 0 ? (
                                        suggestions.map((s: any) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => selectStore(s)}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors flex flex-col border-b border-slate-100 dark:border-slate-800/50 last:border-0 group"
                                            >
                                                <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{s.name}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic">{s.code}</span>
                                                    <span className="text-[10px] text-slate-400">|</span>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 italic font-medium">{s.owner || "No Owner"}</span>
                                                </div>
                                            </button>
                                        ))
                                    ) : !isSearching && (
                                        <div className="p-8 text-center space-y-2">
                                            <div className="text-3xl opacity-20 italic text-slate-400 text-black dark:text-white">Empty</div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ไม่พบร้านค้าที่ตรงกับการค้นหา</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STORE DETAILS VISUALIZATION (Synced) */}
                    <div className="space-y-4 bg-slate-500/5 dark:bg-white/5 p-6 rounded-3xl border border-slate-200/50 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Store Information</span>
                            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ชื่อร้าน</Label>
                                <Input value={form.storeName || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เจ้าของ</Label>
                                <Input value={form.owner || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เบอร์โทร</Label>
                                <Input value={form.phone || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ประเภทร้าน</Label>
                                <Input value={form.type || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ประเภทลูกค้า</Label>
                                <Input value={form.customerType || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">สินค้าใช้</Label>
                                <Input value={form.productUsed || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ปริมาณ</Label>
                                <Input value={form.quantity || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ระยะเวลาสั่ง</Label>
                                <Input value={form.orderPeriod || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">รับของจาก</Label>
                                <Input value={form.supplier || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">การชำระเงิน</Label>
                                <Input value={form.payment || ""} readOnly className="h-9 bg-white/30 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-700/50 rounded-xl text-xs font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* NOTES SECTION */}
                    <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            บันทึกรายละเอียดแผนงาน
                        </Label>
                        <Textarea
                            placeholder="ระบุวัตถุประสงค์ของการเข้าพบครั้งนี้, เป้าหมายการขาย หรือสิ่งที่จะติดตาม..."
                            value={form.notes || ""}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 rounded-2xl min-h-[120px] focus:ring-2 focus:ring-blue-500/20 transition-all p-4 text-sm"
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-7 rounded-3xl shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] border-b-4 border-blue-800/50"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>กําลังบันทึก...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {/* <span className="text-2xl">✨</span> */}
                                    <span>เพิ่มแผนงานสัปดาห์</span>
                                </div>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setForm({ sales: form.sales, date: new Date().toLocaleDateString('en-CA'), visitCat: "ตรวจเยี่ยมประจำเดือน", notes: "" })}
                            className="md:w-48 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 py-7 rounded-3xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                            ล้างฟอร์ม
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* TABLE */}
            <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        รายการ <span className="text-blue-600 dark:text-blue-400">แผนงาน</span>
                    </h3>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-4" />
                </div>

                {plans && plans.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries((plans || []).reduce((acc: any, p: any) => {
                            const salesName = p.sales || "ไม่ระบุเซลล์"
                            if (!acc[salesName]) acc[salesName] = []
                            acc[salesName].push(p)
                            return acc
                        }, {})).map(([salesName, salesPlans]: [string, any], groupIdx) => (
                            <div key={salesName} className="space-y-3">
                                {/* Group Header */}
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 w-fit">
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <span className="p-1 bg-white dark:bg-slate-900 rounded-lg text-[10px]">👤</span>
                                        {salesName}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-2 uppercase italic tracking-wider">
                                        {salesPlans.length} รายการ
                                    </span>
                                </div>

                                {/* Group Table */}
                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-800/5 dark:bg-white/5">
                                            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                                <TableHead className="py-4 font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[10px] w-[100px]">วันที่</TableHead>
                                                <TableHead className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[10px] w-[100px]">รหัส</TableHead>
                                                <TableHead className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[10px]">ชื่อร้าน</TableHead>
                                                <TableHead className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[10px]">หัวข้อเข้าพบ</TableHead>
                                                <TableHead className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[10px]">บันทึก</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {salesPlans.map((p: any) => (
                                                <TableRow key={p.id} className="border-slate-100 dark:border-slate-800/50 dark:bg-[#1e293b] hover:bg-blue-500/5 transition-colors group">
                                                    <TableCell className="py-4 font-bold text-slate-900 dark:text-slate-300 text-xs">
                                                        {new Date(p.date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                                                    </TableCell>
                                                    <TableCell className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">{p.storeRef}</TableCell>
                                                    <TableCell className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[150px]">{p.store?.name || p.storeName || "N/A"}</TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-lg text-[9px] font-bold border",
                                                            p.visitCat === "ตรวจเยี่ยมประจำเดือน" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                                p.visitCat === "ติดตามยอดค้างชำระ" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                                                                    p.visitCat === "แนะนำสินค้าใหม่" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                        )}>
                                                            {p.visitCat}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-[11px] text-slate-500 dark:text-slate-400 italic max-w-[200px] truncate">{p.notes || "-"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden py-20">
                        <div className="flex flex-col items-center gap-3 opacity-30 select-none">
                            <div className="text-6xl font-serif italic text-slate-400">Empty</div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em]">ไม่มีแผนงานสำหรับสัปดาห์นี้</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
