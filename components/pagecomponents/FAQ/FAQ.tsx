"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn, formatThaiDate, confirmDelete } from "@/lib/utils"
import { exportToExcel } from "@/lib/exportexcel/export"

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
import { Upload } from "lucide-react"
import * as React from "react"
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
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import { SalesPersonSelect } from "@/components/crmhelper/SalesPersonSelect"
import { useSearch } from "@/components/hooks/useSearch"

export default function FAQ({ stores, issues, profiles, onRefresh, onCreate, onUpdate, onDelete, isAdmin, currentUserProfile }: any) {
  const router = useRouter()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleDelete = async (id: string, name?: string) => {
    if (!confirmDelete(name || "รายการนี้")) return
    try {
      await onDelete(id)
      if (onRefresh) onRefresh()
      toast.success("ลบรายการเรียบร้อยแล้ว")
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

  // ผู้บรรทึกสามารถกรอกได้อิสระ ไม่บังคับชื่อ

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    clearStore()
  }

  // 🔍 ใช้ shared useSearch hook
  const { search, setSearch, filtered: filteredIssues } = useSearch(
    issues,
    ['detail', 'store.name', 'recorder', 'type']
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

  const handleExport = () => {
    const dataToExport = filteredIssues.map((item: any, index: number) => ({
      "ลำดับ": index + 1,
      "วันที่": formatThaiDate(item.date, 'dd/MM/yyyy'),
      "ร้านค้า": item.store?.name || "-",
      "รหัสร้านค้า": item.store?.code || "-",
      "ประเภท": item.type || "-",
      "รายละเอียด": item.detail || "-",
      "ผู้บันทึก": item.recorder || "-",
      "สถานะ": getStatusText(item.status) || "-"
    }));
    exportToExcel(dataToExport, "FAQ_Issues", "แจ้งปัญหา");
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    toast.loading('กำลังโหลดข้อมูลร้องเรียน...', { id: 'import-faq' });
    try {
      const formData = new FormData()
      formData.append("file", file)

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const XLSX = await import("xlsx");
          const wb = XLSX.read(bstr, { type: 'array', cellDates: true });
          const wsname = wb.SheetNames.find(n => n.includes('FAQ') || n.includes('Issue')) || wb.SheetNames[0];
          const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

          const res = await fetch("/api/issues/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          const info = await res.json();
          if (res.ok) {
            toast.success(info.message || "นำเข้าข้อมูลสำเร็จ", { id: 'import-faq' });
            if (onRefresh) onRefresh();
          } else {
            toast.error(info.error || "เกิดข้อผิดพลาดในการนำเข้า", { id: 'import-faq' });
          }
        } catch (err) {
          toast.error("รูปแบบไฟล์ไม่ถูกต้อง", { id: 'import-faq' });
        }
      }
      reader.readAsArrayBuffer(file);
    } catch (error) {
      handleApiError(error);
      toast.dismiss('import-faq');
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

        {isAdmin && (
          <Button
            onClick={() => { resetForm(); setIsCreateOpen(true); }}
            className="rounded-2xl h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all font-bold"
          >
            + เพิ่มรายการ FAQ / ปัญหา
          </Button>
        )}
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
                    className="font-black px-4 h-10 rounded-xl shadow-sm transition-all active:scale-95 bg-white/50 border-amber-200 text-amber-600 hover:bg-amber-50 dark:bg-slate-800/50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-900/50"
                  >
                    <Upload className="w-5 h-5 mr-2" /> นำเข้า Excel
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={handleExport}
                className="font-black h-10 px-4 rounded-xl shadow-sm transition-all active:scale-95 bg-white/50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800/50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
              >
                <span className="text-lg mr-2">📥</span> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table style={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="border-slate-100 dark:border-slate-800">
                <TableHead className="py-4 font-black uppercase text-[10px] pl-6 text-center w-[60px] hidden md:table-cell">ลำดับ</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] w-[80px] hidden sm:table-cell">วันที่</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] min-w-[150px]">ร้านค้า</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] hidden md:table-cell">ประเภท</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] min-w-[200px]">รายละเอียด</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] hidden lg:table-cell">ผู้บันทึก</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] text-center hidden sm:table-cell">สถานะ</TableHead>
                <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] text-right pr-6">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-slate-400 italic">
                    ไม่พบข้อมูลรายการ...
                  </TableCell>
                </TableRow>
              ) : (
                filteredIssues.map((item: any, index: number) => (
                  <TableRow key={item.id} className="border-slate-50 dark:border-slate-800/50 hover:bg-blue-500/5 transition-colors group">
                    <TableCell className="w-[60px] text-center font-bold text-slate-500 text-xs pl-6 hidden md:table-cell">{index + 1}</TableCell>
                    <TableCell className="w-[80px] py-5 font-bold text-slate-500 text-xs hidden sm:table-cell">{new Date(item.date).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell className="min-w-[150px] break-words whitespace-normal py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-slate-900 dark:text-white text-xs line-clamp-2">{item.store?.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{item.store?.code}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px] hidden md:table-cell break-words whitespace-normal">
                      <Badge variant="secondary" className="rounded-lg text-[9px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="min-w-[200px] text-xs font-medium text-slate-600 dark:text-slate-400 break-words whitespace-normal py-4">{item.detail}</TableCell>
                    <TableCell className="w-[100px] text-xs font-bold text-indigo-500 italic hidden lg:table-cell break-words whitespace-normal">👤 {item.recorder}</TableCell>
                    <TableCell className="w-[100px] text-center hidden sm:table-cell">
                      <Badge className={cn("rounded-full text-[9px] font-black px-3 py-1 whitespace-nowrap", getStatusColor(item.status))}>
                        {getStatusText(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 align-middle">
                      {isAdmin ? (
                        <div className="flex justify-end gap-2 sm:gap-3 items-center">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(item)} className="h-8 w-8 text-blue-600 hover:bg-blue-500/10 rounded-lg" title="แก้ไข">✏️</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.store?.name)} className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" title="ลบ">🗑️</Button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">View Only</span>
                      )}
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
        <DialogContent className="max-w-4xl bg-white dark:bg-slate-950/95 border-slate-200 dark:border-slate-800/50 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden shadow-3xl text-slate-900 dark:text-white">
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

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">วันที่ *</Label>
                 <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-amber-500/20 text-blue-600 dark:text-blue-400 font-bold"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ประเภทปัญหา *</Label>
                 <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl overflow-hidden">
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
                  <SelectTrigger className={cn("h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl", getStatusColor(form.status))}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl overflow-hidden">
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
                  className="min-h-[150px] bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 rounded-[1.5rem] focus:ring-amber-500/20 text-slate-900 dark:text-white text-base p-4 shadow-sm"
                />
              </div>

              {/* Recorder */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">ผู้บันทึก *</Label>
                 <Input
                  placeholder="กรอกชื่อผู้บันทึก..."
                  value={form.recorder}
                  onChange={(e) => setForm({ ...form, recorder: e.target.value })}
                  className="h-12 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-amber-500/20 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">หมายเหตุ/แนวทางแก้ไข</Label>
               <Textarea
                placeholder="บันทึกเพิ่มเติม..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 rounded-[1.5rem] focus:ring-amber-500/20 text-slate-900 dark:text-white text-base p-4 shadow-sm"
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
                className="px-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-7 rounded-[1.5rem] active:scale-95"
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