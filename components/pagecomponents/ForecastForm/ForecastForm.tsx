"use client"

import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"

import { CalendarIcon, Trash2 } from "lucide-react"
import { useStoreSearch } from "@/components/hooks/useStoreSearch"

export default function ForecastForm({ forecasts, onRefresh }: any) {
    const [date, setDate] = useState<Date>(new Date())
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 💡 สารสกัด logic ค้นหาร้านค้าไปใช้ Hook
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

    const [amounts, setAmounts] = useState({ forecast: "", actual: "" })

    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

    const weekStartStr = weekStart.toISOString()

    // 🎯 โหลดข้อมูลเมื่อวันที่เปลี่ยน
    useEffect(() => {
        if (onRefresh) onRefresh(weekStartStr)
    }, [weekStartStr, onRefresh])

    const goPrevWeek = () => setDate(subWeeks(date, 1))
    const goNextWeek = () => setDate(addWeeks(date, 1))

    // 🚀 จัดการการสร้าง (Clean Pattern แบบ OrderTracking)
    const handleSubmit = async () => {
        if (!selectedStore) {
            toast.error("กรุณาเลือกร้านค้า")
            return
        }

        setIsSubmitting(true)
        try {
            await axiosInstance.post("/forecasts", {
                masterId: selectedStore.id,
                forecast: amounts.forecast ? parseFloat(amounts.forecast) : null,
                actual: amounts.actual ? parseFloat(amounts.actual) : null,
                weekStart: weekStart.toISOString()
            })
            toast.success("บันทึกคาดการณ์เรียบร้อยแล้ว")

            // ล้างฟอร์ม
            clearStore()
            setAmounts({ forecast: "", actual: "" })

            if (onRefresh) onRefresh(weekStart.toISOString())
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // 🗑️ จัดการการลบ
    const handleDelete = async (id: string) => {
        if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return
        try {
            await axiosInstance.delete(`/forecasts/${id}`)
            toast.success("ลบรายการเรียบร้อยแล้ว")
            if (onRefresh) onRefresh(weekStart.toISOString())
        } catch (error) {
            handleApiError(error)
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* HEADER & WEEK NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-2.5 bg-blue-500/10 rounded-2xl">📈</span>
                        คาดการณ์ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">รายสัปดาห์</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-12 italic">วางแผนเป้าหมายและสรุปยอดขายรายสัปดาห์</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-end md:self-center">
                    <Button variant="ghost" size="icon" onClick={goPrevWeek} className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700">
                        <span className="text-lg">←</span>
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="px-4 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(weekStart, "d MMM yyyy")} - {format(weekEnd, "d MMM yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-slate-900 border-slate-800 p-0" align="center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="ghost" size="icon" onClick={goNextWeek} className="h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-700">
                        <span className="text-lg">→</span>
                    </Button>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Store Search */}
                        <div className="md:col-span-2 relative space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">ค้นหาลูกค้า / ชื่อร้าน *</Label>
                            <div className="relative">
                                <Input
                                    placeholder="รหัส หรือ ชื่อร้าน..."
                                    value={storeSearch}
                                    onChange={(e) => setStoreSearch(e.target.value)}
                                    className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-slate-900 dark:text-slate-100 font-bold pr-10"
                                />
                                {selectedStore && (
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-md pointer-events-none">
                                        {selectedStore.name}
                                    </div>
                                )}
                                {storeSearch && (
                                    <button onClick={clearStore} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✕</button>
                                )}
                            </div>

                            {/* Suggestions */}
                            {showSuggestions && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                                    {suggestions.length > 0 ? (
                                        suggestions.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => selectStore(s)}
                                                className="w-full px-4 py-3 text-left hover:bg-blue-500/10 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                                            >
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono italic">{s.code}</div>
                                            </button>
                                        ))
                                    ) : !isSearching && (
                                        <div className="p-4 text-center text-xs text-slate-500">ไม่พบร้านค้า</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Forecast Amount */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">เป้าหมาย (Forecast)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amounts.forecast}
                                onChange={(e) => setAmounts({ ...amounts, forecast: e.target.value })}
                                className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold"
                            />
                        </div>

                        {/* Actual Amount */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">ยอดจริง (Actual)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amounts.actual}
                                onChange={(e) => setAmounts({ ...amounts, actual: e.target.value })}
                                className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg py-7 rounded-3xl shadow-xl transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? "กำลังบันทึก..." : "เพิ่มข้อมูลคาดการณ์"}
                    </Button>
                </CardContent>
            </Card>

            {/* LIST TABLE */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">รายการคาดการณ์</h3>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-800/5 dark:bg-white/5">
                            <TableRow className="border-slate-200 dark:border-slate-800">
                                <TableHead className="py-4 font-black uppercase text-[10px]">ร้านค้า</TableHead>
                                <TableHead className="font-black uppercase text-[10px] text-right">เป้าหมาย</TableHead>
                                <TableHead className="font-black uppercase text-[10px] text-right">ยอดจริง</TableHead>
                                <TableHead className="font-black uppercase text-[10px] text-right">ผลต่าง</TableHead>
                                <TableHead className="font-black uppercase text-[10px] text-center w-[80px]">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {forecasts && forecasts.length > 0 ? (
                                forecasts.map((f: any) => {
                                    const diff = (f.actual || 0) - (f.forecast || 0)
                                    return (
                                        <TableRow key={f.id} className="border-slate-100 dark:border-slate-800 hover:bg-blue-500/5 transition-colors">
                                            <TableCell className="py-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs">{f.store?.name || "N/A"}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">{f.store?.code}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                                {f.forecast?.toLocaleString() || "0"}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {f.actual?.toLocaleString() || "0"}
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-right font-bold",
                                                diff >= 0 ? "text-emerald-500" : "text-rose-500"
                                            )}>
                                                {diff > 0 ? "+" : ""}{diff.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)} className="h-8 w-8 text-rose-500 hover:bg-rose-500/10">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center text-slate-400 italic text-xs">
                                        ไม่มีข้อมูลคาดการณ์สำหรับสัปดาห์นี้
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