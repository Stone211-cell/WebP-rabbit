"use client"

import { useState, useEffect, useCallback } from "react"
import { axiosInstance } from "@/lib/axios"
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

export default function VisitForm({ stores, visits, profiles, onRefresh }: any) {
  const [form, setForm] = useState<any>({
    sales: "",
    date: new Date().toISOString().split('T')[0],
    visitType: "new",
    dealStatus: "เปิดการขาย",
    notes: {} // Store 8-tab details as JSON
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [salesFilter, setSalesFilter] = useState("all")
  const [historySearch, setHistorySearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  // Debounced API Search for Stores
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Skip search if value is too short OR if it matches the current selected store code
      if (form.storeSearch?.length > 1 && form.storeSearch !== form.storeRef) {
        setIsSearching(true)
        try {
          // axiosInstance already has /api base
          const res = await axiosInstance.get(`/stores?search=${form.storeSearch}`)
          setSuggestions(res.data.slice(0, 5))
        } catch (err) {
          console.error("Search failed", err)
        } finally {
          setIsSearching(false)
        }
      } else {
        setSuggestions([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [form.storeSearch, form.storeRef])

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
      storeSearch: store.code,
      dealStatus: store.status || "เปิดการขาย",
      closeReason: store.closeReason || ""
    }))
    setSuggestions([])
  }

  const handleSubmit = async () => {
    if (!form.sales || !form.masterId) {
      alert("กรุณาเลือกเซลล์และร้านค้า")
      return
    }
    setIsSubmitting(true)
    try {
      await axiosInstance.post("/visits", {
        ...form,
        date: new Date(form.date).toISOString()
      })
      toast.success("บันทึกการเข้าพบเรียบร้อยแล้ว!")
      setForm({
        date: new Date().toISOString().split('T')[0],
        visitType: "new",
        dealStatus: "เปิดการขาย",
        notes: {}
      })
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

      <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-white/10 dark:border-white/5 py-8">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
            บันทึกการเข้าพบลูกค้า
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">กรอกข้อมูลการเยี่ยมเยียนและสถานะการขายล่าสุด</p>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative group">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-2 text-xs">
                <span className="p-1 bg-blue-500/10 rounded-md text-blue-500">👤</span>
                พนักงานขาย (เซลล์) *
              </Label>
              <Select value={form.sales} onValueChange={(v) => handleChange("sales", v)}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl h-10 transition-all hover:bg-white/80 dark:hover:bg-slate-800/80 hover:border-blue-500/30">
                  <SelectValue placeholder="เลือกรายชื่อผู้เข้าพบ" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                  {profiles && profiles.length > 0 ? (
                    profiles.map((p: any) => (
                      <SelectItem key={p.id} value={p.name} className="focus:bg-blue-500/10 dark:focus:bg-blue-500/20 rounded-xl cursor-pointer py-2.5 group/item">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            {p.profileImage ? (
                              <img src={p.profileImage} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                {p.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                              {p.email || "ไม่มีอีเมล"}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <div className="text-2xl opacity-20 italic font-serif">Empty</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">ไม่พบรายชื่อเซลล์ในระบบ</p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>วันที่เข้าพบ *</Label>
              <Input
                type="date"
                onChange={(e) => handleChange("date", e.target.value)}
                className="dark:bg-[#1e293b] border-gray-600"
              />
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">ลำดับ</Label>
              <Input value="1" readOnly className="bg-slate-100/30 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-center cursor-not-allowed" />
            </div>

            <div className="relative">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน * <span className="text-blue-500 font-normal italic">(พิมพ์เพื่อหา)</span></Label>
              <Input
                placeholder="KHN-C0001"
                value={form.storeSearch || ""}
                onChange={(e) => handleChange("storeSearch", e.target.value)}
                className="bg-white/50 dark:bg-[#1e293b]/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl h-10 font-bold"
              />

              {isSearching && (
                <div className="absolute right-3 top-9 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-blue-500 font-bold animate-pulse">Searching...</span>
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectStore(s)}
                      className="w-full px-4 py-2.5 text-left hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors flex flex-col border-b border-slate-100 dark:border-slate-800/50 last:border-0 group"
                    >
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">{s.name}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono italic">{s.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
              <Input
                placeholder="ตรวจเยี่ยมประจำเดือน"
                value={form.visitCat || ""}
                onChange={(e) => handleChange("visitCat", e.target.value)}
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">ประเภทเข้าพบ *</Label>
              <Select value={form.visitType} onValueChange={(v) => handleChange("visitType", v)} >
                <SelectTrigger className="p-5 py-6 bg-white/50 dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 h-10 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:border-blue-500/30">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-[#0f172a] border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                  <SelectItem value="new" className="focus:bg-blue-500/10 dark:bg-[#0f172a] rounded-xl cursor-pointer py-2.5 group">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">ร้านใหม่</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">เปิดหน้าใหม่ / ยังไม่เคยซื้อ</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="continuous" className="focus:bg-indigo-500/10 dark:bg-[#0f172a] rounded-xl cursor-pointer py-2.5 group">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">ร้านติดต่อต่อเนื่อง</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">อยู่ในระหว่างการติดตามผล</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="follow" className="focus:bg-emerald-500/10 dark:bg-[#0f172a] rounded-xl cursor-pointer py-2.5 group">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">ร้านเดิม</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ลูกค้าปัจจุบันที่มีการสั่งซื้อ</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="database" className="focus:bg-amber-500/10 dark:bg-[#0f172a] rounded-xl cursor-pointer py-2.5 group">
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">ร้านฐานข้อมูลเดิม</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ร้านค้าเก่าที่เคยติดต่อในอดีต</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">สถานะการขาย</Label>
              <Select value={form.dealStatus} onValueChange={(v) => handleChange("dealStatus", v)}>
                <SelectTrigger className={cn(
                  "h-10 rounded-xl transition-all duration-300 border-2 p-5 py-6",
                  form.dealStatus === "เปิดการขาย"
                    ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 text-rose-700 dark:text-rose-400"
                )}>
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                  <SelectItem value="เปิดการขาย" className="focus:bg-emerald-500/10 rounded-xl cursor-pointer py-2.5 group dark:bg-[#0f172a]">
                    <div className="flex items-center gap-3 ">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors ">เปิดการขาย</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">กำลังดำเนินการขาย</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="ปิดการขาย" className="focus:bg-rose-500/10 rounded-xl cursor-pointer py-2.5 group dark:bg-[#0f172a]">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">ปิดการขาย</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">หยุดการขาย / ไม่สามารถขายได้</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ชื่อร้าน</Label>
              <Input value={form.storeName || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">เจ้าของ</Label>
              <Input value={form.owner || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          {/* Row 3 - Store Details (Synchronized) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">เบอร์โทร</Label>
              <Input value={form.phone || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ประเภทร้าน</Label>
              <Input value={form.type || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ประเภทลูกค้า</Label>
              <Input value={form.customerType || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ที่อยู่ / พิกัด</Label>
              <Input value={form.address || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          {/* Row 4 - Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">สินค้าที่ใช้</Label>
              <Input value={form.productUsed || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ปริมาณการสั่ง</Label>
              <Input value={form.quantity || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ระยะเวลาสั่ง</Label>
              <Input value={form.orderPeriod || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">รับของเดิมจาก</Label>
              <Input value={form.supplier || ""} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed" />
            </div>
          </div>

          {/* Row 5 - Sales Status & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">เงื่อนไขชำระ</Label>
              <Input value={form.payment || "เงินสด"} readOnly className="bg-slate-100/10 dark:bg-slate-800/10 border-slate-200 dark:border-slate-700 h-10 rounded-xl text-slate-500 cursor-not-allowed w-full md:w-1/2" />
            </div>
            {form.dealStatus === "ปิดการขาย" && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">เหตุผลที่ปิดการขาย</Label>
                <Input
                  placeholder="กรอกเมื่อเลือก ปิดการขาย"
                  value={form.closeReason || ""}
                  onChange={(e) => handleChange("closeReason", e.target.value)}
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-10 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Tabs ครั้งที่ 1-8 */}
          <div className="space-y-4">
            <Label className="text-slate-700 dark:text-slate-300 font-bold text-lg">บันทึกรายละเอียดการพบปะ</Label>
            <Tabs defaultValue="1" className="w-full">
              <div className="overflow-x-auto pb-2 scrollbar-hide">
                <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 inline-flex min-w-full md:min-w-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TabsTrigger
                      key={i}
                      value={`${i + 1}`}
                      className="rounded-xl px-4 py-2 text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
                    >
                      ครั้งที่ {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {Array.from({ length: 8 }).map((_, i) => (
                <TabsContent key={i} value={`${i + 1}`} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Textarea
                    placeholder={`รายละเอียดการพูดคุย ครั้งที่ ${i + 1}...`}
                    value={form.notes?.[i + 1] || ""}
                    onChange={(e) => {
                      const newNotes = { ...form.notes, [i + 1]: e.target.value }
                      handleChange("notes", newNotes)
                    }}
                    className="min-h-[120px] bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium leading-relaxed"
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
            >
              {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึกเข้าพบ"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setForm({ date: new Date().toISOString().split('T')[0], visitType: "new", dealStatus: "เปิดการขาย", notes: {} })}
              className="border-slate-200 dark:border-slate-700 px-8 py-2 rounded-xl"
            >
              ล้างฟอร์ม
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================= TABLE ================= */}

      <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-white/10 dark:border-white/5 py-6">
          <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">📊</span>
            รายการเข้าพบทั้งหมด
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 flex flex-col md:flex-row gap-6 bg-slate-50/30 dark:bg-slate-900/10">
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">ค้นหาประวัติ</Label>
            <div className="relative">
              <Input
                placeholder="ค้นหารหัส / ชื่อร้าน / รายละเอียด..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl h-10 pl-10 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              />
              <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">กรองตามรายชื่อเซลล์</Label>
            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger className="bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 rounded-xl h-10 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium">
                <SelectValue placeholder="ทุกรายชื่อ" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-slate-200 dark:border-slate-800 rounded-xl">
                <SelectItem value="all" className="font-bold text-blue-600">ทั้งหมด [Show All]</SelectItem>
                {profiles?.map((p: any) => (
                  <SelectItem key={p.id} value={p.name} className="cursor-pointer">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>




        </CardContent>

        <CardContent>
          <Table>
            <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
              <TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest">วันที่เข้าพบ</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest">รหัสลูกค้า</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest">ชื่อสถานประกอบการ</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest">พนักงานขาย</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest">สรุปการเข้าพบ</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest text-center">ประเภท</TableHead>
                <TableHead className="font-bold text-slate-700 dark:text-slate-200 py-4 uppercase text-[10px] tracking-widest text-center">ความคืบหน้า</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-400">
                    ไม่พบข้อมูลประวัติการเข้าพบ
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((v: any) => (
                  <TableRow key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium">{new Date(v.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono text-xs">{v.store?.code || "-"}</TableCell>
                    <TableCell className="font-bold">{v.store?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                        {v.sales}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{v.visitCat || "-"}</span>
                        {v.notes && Object.keys(v.notes).length > 0 && (
                          <span className="text-[10px] text-indigo-500 font-medium italic mt-1 flex items-center gap-1">
                            📝 มีบันทึก {Object.keys(v.notes).length} ครั้ง
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{v.visitType === "new" ? "ร้านใหม่" : "ติดตาม"}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold shadow-sm",
                          v.dealStatus === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        )}>
                          {v.dealStatus}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}