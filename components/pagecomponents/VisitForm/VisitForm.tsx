"use client"

import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { createVisit } from "@/lib/api/visits"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { VisitTopics, VisitTypes, DealStatuses } from "@/lib/types/manu"
import { VisitDetailModal } from "./VisitDetailModal"
import { Eye } from "lucide-react"

export default function
  VisitForm({ visits, profiles, onRefresh }: any) {
  const [form, setForm] = useState<any>({
    sales: "",
    date: new Date().toLocaleDateString('en-CA'),
    visitType: "new",
    dealStatus: "เปิดการขาย",
    closeReason: "",
    visitCat: "ตรวจเยี่ยมประจำเดือน",
    notes: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [salesFilter, setSalesFilter] = useState("all")
  const [historySearch, setHistorySearch] = useState("")
  const [selectedVisit, setSelectedVisit] = useState<any>(null)

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

  // ซิงค์สถานะการขายจากร้านค้าที่เลือก
  useEffect(() => {
    if (selectedStore) {
      setForm(prev => ({
        ...prev,
        dealStatus: selectedStore.status || "เปิดการขาย",
        closeReason: selectedStore.closeReason || ""
      }))
    }
  }, [selectedStore])

  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // 🚀 จัดการการบันทึก (Clean Pattern)
  const handleSubmit = async () => {
    if (!form.sales || !selectedStore) {
      toast.error("กรุณาเลือกเซลล์และร้านค้า")
      return
    }

    setIsSubmitting(true)
    try {
      await createVisit({
        ...form,
        masterId: selectedStore.id,
        date: new Date(form.date).toISOString()
      })
      toast.success("บันทึกการเข้าพบเรียบร้อยแล้ว!")

      // ล้างฟอร์ม
      setForm({
        ...form,
        date: new Date().toLocaleDateString('en-CA'),
        visitType: "new",
        dealStatus: "เปิดการขาย",
        closeReason: "",
        visitCat: "ตรวจเยี่ยมประจำเดือน",
        notes: {}
      })
      clearStore()

      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredVisits = (visits || []).filter((v: any) => {
    const sMatch = !historySearch ||
      v.store?.name?.toLowerCase().includes(historySearch.toLowerCase()) ||
      v.store?.code?.toLowerCase().includes(historySearch.toLowerCase())
    const salesMatch = salesFilter === "all" || v.sales === salesFilter
    return sMatch && salesMatch
  })

  return (
    <div className="p-6 space-y-6 dark:bg-[#0f172a] min-h-screen text-black">

      {/* ================= FORM ================= */}
      <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-white/10 dark:border-white/5 py-8">
          <CardTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
            บันทึกการเข้าพบลูกค้า
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold italic">กรอกข้อมูลการเยี่ยมเยียนและสถานะการขายล่าสุด</p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Main Controls */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-2 text-xs">👤 พนักงานขาย *</Label>
              <Select value={form.sales} onValueChange={(v) => handleChange("sales", v)}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                  <SelectValue placeholder="เลือกรายชื่อ" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((p: any) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">วันที่เข้าพบ *</Label>
              <Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ลำดับ</Label>
              <Input value="1" readOnly className="bg-slate-100/30 dark:bg-slate-800/20 h-12 rounded-2xl text-center cursor-not-allowed" />
            </div>

            <div className="md:col-span-2 relative space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="รหัส หรือ ชื่อร้าน..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold pr-10"
                  />
                  {selectedStore && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-md pointer-events-none">{selectedStore.name}</div>
                  )}
                  {storeSearch && <button onClick={clearStore} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">✕</button>}
                </div>
                <Button onClick={handleManualSearch} disabled={isSearching} className="rounded-2xl h-12 px-5 bg-blue-600">🔍</Button>
              </div>

              {showSuggestions && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                  {suggestions.map((s) => (
                    <button key={s.id} onClick={() => selectStore(s)} className="w-full px-4 py-3 text-left hover:bg-blue-500/10 border-b last:border-0">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</span>
                      <div className="text-[10px] text-slate-500 italic">{s.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />

          {/* Form Contexts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
              <Select value={form.visitCat} onValueChange={(v) => handleChange("visitCat", v)}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                  <SelectValue placeholder="เลือกหัวข้อ" />
                </SelectTrigger>
                <SelectContent>
                  {VisitTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">ประเภทเข้าพบ *</Label>
              <Select value={form.visitType} onValueChange={(v) => handleChange("visitType", v)}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VisitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">สถานะการขาย</Label>
              <Select value={form.dealStatus} onValueChange={(v) => handleChange("dealStatus", v)}>
                <SelectTrigger className={cn(
                  "h-12 rounded-2xl border-2",
                  form.dealStatus === "เปิดการขาย" ? "bg-emerald-50/50 border-emerald-500/20 text-emerald-600" : "bg-rose-50/50 border-rose-500/20 text-rose-600"
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DealStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Store Insight - Only shown when store selected */}
          {selectedStore && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10">
              <div className="space-y-1 md:col-span-2"><Label className="text-[10px] text-slate-400 font-bold">ที่อยู่</Label><p className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedStore.address || "-"}</p></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">เบอร์โทร</Label><p className="text-xs font-bold text-slate-600 dark:text-slate-300">{selectedStore.phone || "-"}</p></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-400 font-bold">เงื่อนไขชำระ</Label><p className="text-xs font-bold text-blue-600">{selectedStore.payment || "เงินสด"}</p></div>
            </div>
          )}

          {form.dealStatus === "ปิดการขาย" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs text-rose-500">เหตุผลที่ปิดการขาย *</Label>
              <Input placeholder="ระบุเหตุผลในการปิดการขาย..." value={form.closeReason} onChange={(e) => handleChange("closeReason", e.target.value)} className="bg-rose-50/50 border-rose-200 h-12 rounded-2xl text-rose-700 font-bold" />
            </div>
          )}

          {/* Detailed Visit Notes */}
          <div className="space-y-4">
            <Label className="text-slate-900 dark:text-white font-black text-lg">บันทึกรายละเอียดการพบปะ</Label>
            <Tabs defaultValue="1" className="w-full">
              <div className="overflow-x-auto pb-2 scrollbar-none">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TabsTrigger key={i} value={`${i + 1}`} className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 shadow-none">
                      ครั้งที่ {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {Array.from({ length: 8 }).map((_, i) => (
                <TabsContent key={i} value={`${i + 1}`} className="mt-4">
                  <Textarea
                    placeholder={`รายละเอียดการพูดคุย ครั้งที่ ${i + 1}...`}
                    value={form.notes?.[i + 1] || ""}
                    onChange={(e) => handleChange("notes", { ...form.notes, [i + 1]: e.target.value })}
                    className="min-h-[150px] bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium leading-relaxed"
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg py-8 rounded-[2rem] shadow-xl transition-all active:scale-95">
              {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึกการเข้าพบลูกค้า"}
            </Button>
            <Button variant="outline" onClick={clearStore} className="md:w-64 py-8 rounded-[2rem] font-bold border-slate-200">ล้างข้อมูล</Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* ================= HISTORY TABLE ================= */}
      <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b p-8">
          <CardTitle className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/10 rounded-2xl">📊</span>
            ประวัติการเข้าพบ
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-black uppercase text-slate-400">ค้นหาประวัติ</Label>
              <Input
                placeholder="รหัส / ชื่อร้าน / รายละเอียด..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-white/60 dark:bg-slate-800/60 h-12 rounded-2xl"
              />
            </div>

            <div className="w-full md:w-80 space-y-1.5">
              <Label className="text-xs font-black uppercase text-slate-400">กรอกตามรายชื่อเซลล์</Label>
              <Select value={salesFilter} onValueChange={setSalesFilter}>
                <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 h-12 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด (All Units)</SelectItem>
                  {profiles?.map((p: any) => (
                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner bg-white/20">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="border-b dark:border-slate-800">
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 pl-6">วันที่</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">ร้านค้า</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">พนักงานขาย</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">สรุปการเข้าพบ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center">สถานะ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-32 text-center text-slate-400 italic text-xs">ไม่พบข้อมูลประวัติ</TableCell></TableRow>
                ) : (
                  filteredVisits.map((v: any) => (
                    <TableRow key={v.id} className="hover:bg-blue-500/5 transition-colors border-b dark:border-slate-800/50">
                      <TableCell className="py-5 pl-6 font-bold text-xs">{new Date(v.date).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-xs">{v.store?.name || "-"}</span>
                          <span className="text-[10px] font-mono text-slate-400">{v.store?.code || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="font-bold text-blue-600 rounded-lg text-[10px]">{v.sales}</Badge></TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{v.visitCat || "-"}</span>
                          {Object.keys(v.notes || {}).length > 0 && (
                            <span className="text-[10px] text-indigo-500 font-bold mt-1">📝 บันทึก {Object.keys(v.notes).length} ครั้ง</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm",
                          v.dealStatus === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        )}>
                          {v.dealStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedVisit(v)}
                          className="hover:bg-blue-500/10 hover:text-blue-500 rounded-full h-8 w-8"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VisitDetailModal
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />
    </div>
  )
}