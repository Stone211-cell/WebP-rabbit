"use client"

import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useStoreSearch } from "@/components/hooks/useStoreSearch"

export default function FAQ({ issues, profiles, onRefresh, onCreate, onUpdate, onDelete }: any) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const initialForm = {
    date: new Date().toLocaleDateString('en-CA'),
    type: "ส่งช้า",
    detail: "",
    recorder: "",
    notes: "",
    status: "pending"
  }

  const [form, setForm] = useState(initialForm)

  // 🔍 ใช้ Hook จัดการค้นหาร้านค้า
  const {
    storeSearch,
    setStoreSearch,
    isSearching,
    suggestions,
    showSuggestions,
    selectedStore,
    setSelectedStore,
    selectStore,
    clearStore,
    handleManualSearch
  } = useStoreSearch()

  const handleSave = async () => {
    if (!selectedStore || !form.recorder || !form.detail) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        await onUpdate(editingId, {
          ...form,
          masterId: selectedStore.id,
        })
        toast.success("แก้ไขข้อมูลเรียบร้อยแล้ว")
      } else {
        await onCreate({
          ...form,
          masterId: selectedStore.id,
        })
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว")
      }
      setIsCreateOpen(false)
      resetForm()
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return
    try {
      await onDelete(id)
      toast.success("ลบรายการเรียบร้อยแล้ว")
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    }
  }

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setForm({
      date: new Date(item.date).toLocaleDateString('en-CA'),
      type: item.type || "อื่นๆ",
      detail: item.detail || "",
      recorder: item.recorder || "",
      notes: item.notes || "",
      status: item.status || "pending"
    })
    setSelectedStore(item.store)
    setStoreSearch(item.store?.name || "")
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    clearStore()
  }

  const filteredIssues = (issues || []).filter((i: any) =>
    i.detail?.toLowerCase().includes(search.toLowerCase()) ||
    i.store?.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.recorder?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return "bg-amber-500/10 text-amber-600 border-amber-500/20"
      case 'fixing': return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      case 'done': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return "รอดำเนินการ"
      case 'fixing': return "กำลังแก้ไข"
      case 'done': return "ดำเนินการแล้ว"
      default: return status
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-amber-500/10 rounded-2xl">⚠️</span>
            ปัญหา & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">คำร้องเรียน</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-12 italic">บันทึกและติดตามข้อร้องเรียนหรือปัญหาจากลูกค้า</p>
        </div>

        <Button
          onClick={() => { resetForm(); setIsCreateOpen(true); }}
          className="rounded-2xl h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all font-bold"
        >
          + เพิ่มรายการ FAQ / ปัญหา
        </Button>
      </div>

      {/* TABLE SECTION */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-6">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            📋 ประวัติรายการ
            <Badge variant="outline" className="rounded-lg ml-2">{filteredIssues.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="ค้นหาชื่อร้าน, รายละเอียด, ผู้บันทึก..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-10 rounded-xl bg-white/40 border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-slate-100 dark:border-slate-800">
                <TableHead className="py-4 font-black uppercase text-[10px] pl-8">วันที่</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px]">ร้านค้า</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px]">ประเภท</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px]">รายละเอียด</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px]">ผู้บันทึก</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] text-center">สถานะ</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] text-right pr-8">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-slate-400 italic">
                    ไม่พบข้อมูลรายการ...
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((item: any) => (
                  <TableRow key={item.id} className="border-slate-50 dark:border-slate-800/50 hover:bg-blue-500/5 transition-colors group">
                    <TableCell className="py-5 pl-8 text-xs font-bold text-slate-500">{new Date(item.date).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white text-xs">{item.store?.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{item.store?.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg text-[9px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs font-medium text-slate-600 dark:text-slate-400">{item.detail}</TableCell>
                    <TableCell className="text-xs font-bold text-indigo-500 italic">👤 {item.recorder}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("rounded-full text-[9px] font-black px-3 py-1", getStatusColor(item.status))}>
                        {getStatusText(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8 text-blue-600 hover:bg-blue-500/10 rounded-lg">✏️</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg">🗑️</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={(val) => { setIsCreateOpen(val); if (!val) resetForm(); }}>
        <DialogContent className="max-w-3xl bg-slate-950/95 border-slate-800/50 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-3xl text-white">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
              <span className="p-2 bg-amber-500/20 rounded-xl text-amber-500 text-lg">⚠️</span>
              {editingId ? "แก้ไขปัญหา/คำร้องเรียน" : "เพิ่มปัญหา/คำร้องเรียน"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Search */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">เลือกร้านค้า *</Label>
                <div className="relative">
                  <Input
                    placeholder="ค้นหารหัส หรือ ชื่อร้าน..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="h-12 bg-slate-900/50 border-slate-800 rounded-2xl focus:ring-amber-500/20 pr-10"
                  />
                  {selectedStore && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-lg pointer-events-none">
                      {selectedStore.code}
                    </div>
                  )}
                  {storeSearch && <button onClick={clearStore} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors text-sm">✕</button>}

                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                      {suggestions.map((s) => (
                        <button key={s.id} onClick={() => selectStore(s)} className="w-full px-4 py-3 text-left hover:bg-amber-500/10 transition-colors border-b border-slate-800/50 last:border-0">
                          <div className="font-bold text-sm text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{s.code}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">วันที่ *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="h-12 bg-slate-900/50 border-slate-800 rounded-2xl focus:ring-amber-500/20 text-blue-400 font-bold"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ประเภทปัญหา *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-12 bg-slate-900/50 border-slate-800 rounded-2xl">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl overflow-hidden">
                    <SelectItem value="ส่งช้า">🚛 ส่งช้า</SelectItem>
                    <SelectItem value="หั่นหนาเกินไป">🔪 หั่นหนาเกินไป</SelectItem>
                    <SelectItem value="ไม่ตรงสเปก">📏 ไม่ตรงสเปก</SelectItem>
                    <SelectItem value="คุณภาพไม่ดี">⭐️ คุณภาพไม่ดี</SelectItem>
                    <SelectItem value="น้ำหนักไม่ครบ">⚖️ น้ำหนักไม่ครบ</SelectItem>
                    <SelectItem value="บรรจุภัณฑ์ชำรุด">📦 บรรจุภัณฑ์ชำรุด</SelectItem>
                    <SelectItem value="อื่นๆ">📝 อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">สถานะ</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className={cn("h-12 bg-slate-900/50 border-slate-800 rounded-2xl", getStatusColor(form.status))}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl overflow-hidden">
                    <SelectItem value="pending">🟡 รอดำเนินการ</SelectItem>
                    <SelectItem value="fixing">🔵 กำลังแก้ไข</SelectItem>
                    <SelectItem value="done">🟢 ดำเนินการแล้ว</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Detail */}
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">รายละเอียดปัญหา *</Label>
                <Textarea
                  placeholder="อธิบายรายละเอียดปัญหา..."
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  className="min-h-[100px] bg-slate-900/50 border-slate-800 rounded-[1.5rem] focus:ring-amber-500/20"
                />
              </div>

              {/* Recorder */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ผู้บันทึก *</Label>
                <Select value={form.recorder} onValueChange={(v) => setForm({ ...form, recorder: v })}>
                  <SelectTrigger className="h-12 bg-slate-900/50 border-slate-800 rounded-2xl">
                    <SelectValue placeholder="เลือกผู้บันทึก" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-2xl overflow-hidden">
                    {profiles?.map((p: any) => (
                      <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">หมายเหตุ/แนวทางแก้ไข</Label>
              <Textarea
                placeholder="บันทึกเพิ่มเติม..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-[80px] bg-slate-900/50 border-slate-800 rounded-[1.5rem] focus:ring-amber-500/20"
              />
            </div>

            {/* FOOTER */}
            <div className="flex gap-4 pt-4 pb-4">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-7 rounded-[1.5rem] shadow-xl transition-all shadow-blue-500/20 active:scale-95"
              >
                <span className="mr-2">💾</span>
                {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setIsCreateOpen(false); resetForm(); }}
                className="px-8 bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-400 font-bold py-7 rounded-[1.5rem] active:scale-95"
              >
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}