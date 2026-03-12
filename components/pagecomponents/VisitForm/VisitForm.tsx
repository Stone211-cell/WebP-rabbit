"use client"

import { useState, useEffect, useRef } from "react"
import { axiosInstance } from "@/lib/axios"
import * as XLSX from "xlsx"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn, formatThaiDate, confirmDelete, confirmClearAll } from "@/lib/utils"
import { exportVisitsToExcel } from "@/lib/exportexcel/exportFormatters"
import { getExcelValue, parseExcelDate } from "@/lib/exportexcel/excel"

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
import { useSearch } from "@/components/hooks/useSearch"
import { VisitTopics, VisitTypes, DealStatuses } from "@/lib/types/manu"
import { ActionButton, FilterButton } from "@/components/crmhelper/helper"
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import { HistorySearchFilter } from "@/components/crmhelper/HistorySearchFilter"
import { SalesPersonSelect } from "@/components/crmhelper/SalesPersonSelect"
import { VisitDetailModal } from "./VisitDetailModal"
import { Eye, Trash2, Upload, FileSpreadsheet, MapPin, Phone, CreditCard, Package, Clock, Truck, User, Store, Pencil } from "lucide-react"

export default function VisitForm({ visits, stores, profiles, onRefresh, onCreate, onUpdate, onDelete, isAdmin, hasProfile, currentUserProfile }: any) {
  const [form, setForm] = useState<any>({
    sales: !isAdmin && currentUserProfile ? currentUserProfile.name : "",
    date: new Date().toLocaleDateString('en-CA'),
    visitType: "new",
    dealStatus: "เปิดการขาย",
    closeReason: "",
    visitCat: "ตรวจเยี่ยมประจำเดือน",
    notes: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [salesFilter, setSalesFilter] = useState("all")
  const [selectedVisit, setSelectedVisit] = useState<any>(null)

  // New state for Edit Mode
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

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
    if (!form.sales) {
      toast.error("กรุณาเลือกพนักงานขาย")
      return
    }
    if (!editingVisitId && !selectedStore) {
      toast.error("กรุณาเลือกร้านค้า")
      return
    }

    setIsSubmitting(true)
    try {
      const masterId = selectedStore?.id || form.masterId
      const payload = {
        ...form,
        masterId,
        date: new Date(form.date).toISOString()
      }

      if (editingVisitId) {
        if (onUpdate) {
          await onUpdate(editingVisitId, payload)
        }
        toast.success("แก้ไขการเข้าพบเรียบร้อยแล้ว!")
      } else {
        if (onCreate) {
          await onCreate(payload)
        }
        toast.success("บันทึกการเข้าพบเรียบร้อยแล้ว!")
      }

      // ล้างฟอร์ม
      setForm({
        ...form,
        sales: !isAdmin && currentUserProfile ? currentUserProfile.name : "",
        date: new Date().toLocaleDateString('en-CA'),
        visitType: "new",
        dealStatus: "เปิดการขาย",
        closeReason: "",
        visitCat: "ตรวจเยี่ยมประจำเดือน",
        notes: {}
      })
      clearStore()
      setEditingVisitId(null)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const startEdit = (visit: any) => {
    setEditingVisitId(visit.id)
    setForm({
      sales: visit.sales || "",
      date: new Date(visit.date).toLocaleDateString('en-CA'),
      visitType: visit.visitType || "new",
      dealStatus: visit.dealStatus || "เปิดการขาย",
      closeReason: visit.closeReason || "",
      visitCat: visit.visitCat || "ตรวจเยี่ยมประจำเดือน",
      notes: visit.notes || {},
      masterId: visit.masterId || visit.store?.id  // ✅ เก็บ masterId ไว้เป็น fallback
    })

    // Automatically select the store for the form
    if (visit.store) selectStore(visit.store)

    // Scroll to top to bring form into view
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingVisitId(null)
    setForm({
      sales: !isAdmin && currentUserProfile ? currentUserProfile.name : "",
      date: new Date().toLocaleDateString('en-CA'),
      visitType: "new",
      dealStatus: "เปิดการขาย",
      closeReason: "",
      visitCat: "ตรวจเยี่ยมประจำเดือน",
      notes: {}
    })
    clearStore()
  }

  const handleClear = async () => {
    if (!confirmClearAll("ข้อมูลการเข้าพบทั้งหมด")) return
    setIsClearing(true)
    const toastId = toast.loading("กำลังลบข้อมูลการเข้าพบ...")
    try {
      const res = await axiosInstance.delete('/visits')
      toast.success(res.data.message || "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว")
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsClearing(false)
      toast.dismiss(toastId)
    }
  }

  const handleDelete = async (id: string, name?: string) => {
    if (!confirmDelete(name || "การเข้าพบนี้")) return
    const toastId = toast.loading("กำลังลบข้อมูล...")
    try {
      if (onDelete) {
        await onDelete(id)
      } else {
        await axiosInstance.delete(`/visits/${id}`)
      }
      toast.success("ลบข้อมูลสำเร็จ")
    } catch (error) {
      handleApiError(error)
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const toastId = toast.loading("กำลังนำเข้าข้อมูลการเข้าพบและร้านค้า...")

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      // Target specific sheet name, fallback to first sheet
      const targetSheetName = workbook.SheetNames.find(n => n.includes('เข้าพบ') || n.includes('Visit')) || workbook.SheetNames[0]
      const worksheet = workbook.Sheets[targetSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

      const visitsToImport = jsonData.map((row) => {
        let phone = getExcelValue(row, ['เบอร์โทร', 'phone', 'tel']) || '';
        if (phone && phone.length === 9 && !phone.startsWith('0')) phone = '0' + phone;
        phone = phone.replace(/[^0-9]/g, '');

        const dateRaw = getExcelValue(row, ['วันที่', 'date']);
        const finalDate = parseExcelDate(dateRaw);

        return {
          date: finalDate,
          sales: getExcelValue(row, ['เซลล์', 'sales', 'sale']) || '',
          storeCode: getExcelValue(row, ['รหัสลูกค้า', 'รหัส', 'store_code']) || '-',
          storeName: getExcelValue(row, ['ชื่อร้าน', 'name']) || '',
          customerType: getExcelValue(row, ['ประเภทลูกค้า', 'customer_type']) || '',
          owner: getExcelValue(row, ['เจ้าของ', 'owner']) || '',
          phone,
          storeType: getExcelValue(row, ['ประเภทร้าน', 'ประเภท', 'store_type']) || '',
          address: getExcelValue(row, ['ที่อยู่', 'address']) || '',
          productUsed: getExcelValue(row, ['สินค้าที่ใช้', 'สินค้า', 'product_used']) || '',
          quantity: getExcelValue(row, ['ปริมาณ', 'quantity']) || '',
          orderPeriod: getExcelValue(row, ['ระยะเวลาสั่ง', 'order_period', 'รอบสั่ง']) || '',
          supplier: getExcelValue(row, ['รับของเดิมจาก', 'รับของจาก', 'supplier']) || '',
          payment: getExcelValue(row, ['เงื่อนไขชำระ', 'payment']) || '',
          visitCat: getExcelValue(row, ['หัวข้อเข้าพบ', 'visit_cat']) || '',
          visitType: getExcelValue(row, ['ประเภทเข้าพบ', 'visit_type', 'ประเภท']) || '',
          status: getExcelValue(row, ['สถานะ', 'status']) || '',
          closeReason: getExcelValue(row, ['เหตุผลปิดการขาย', 'close_reason']) || '',
          notes: getExcelValue(row, ['บันทึกเข้าพบ', 'notes', 'บันทึก']) || '',
        }
      }).filter(v => v.storeName || v.storeCode)

      if (visitsToImport.length === 0) {
        toast.dismiss(toastId)
        toast.error('ไม่พบข้อมูลในไฟล์ Excel (ต้องมีคอลัมน์ชื่อร้าน หรือรหัสลูกค้า)')
        return
      }

      const res = await axiosInstance.post('/visits/import', { visits: visitsToImport })

      toast.dismiss(toastId)
      if (res.data.success > 0) {
        toast.success(`นำเข้าข้อมูลสำเร็จ ${res.data.success} รายการ, ล้มเหลว ${res.data.failed} รายการ`)
        if (onRefresh) onRefresh()
      } else {
        toast.error(`ไม่สามารถนำเข้าข้อมูลได้ ล้มเหลว ${res.data.failed} รายการ`)
      }
    } catch (error) {
      toast.dismiss(toastId)
      handleApiError(error)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleExport = () => {
    exportVisitsToExcel(filteredVisits);
  }

  // 🔍 ใช้ shared useSearch hook — แทน filteredVisits inline
  const { search: historySearch, setSearch: setHistorySearch, filtered: filteredVisits } = useSearch(
    visits,
    ['store.name', 'store.code'],
    salesFilter === 'all' ? undefined : (v: any) => v.sales === salesFilter
  )

  // Handle case where user has no profile
  if (!isAdmin && !hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-amber-500/10 rounded-full animate-bounce">
          <User className="w-12 h-12 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">กรุณาสร้างโปรไฟล์ก่อนบันทึกการเข้าพบ</h2>
          <p className="text-slate-500 font-bold italic">ระบบจำเป็นต้องทราบตัวตนของคุณก่อนบันทึกข้อมูล</p>
        </div>
        <p className="max-w-md text-sm text-slate-400">
          กรุณาไปที่หน้าข้อมูลส่วนตัวและสร้างโปรไฟล์ของคุณให้เรียบร้อยก่อน จึงจะสามารถใช้งานระบบบันทึกการเข้าพบได้
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 dark:bg-[#0f172a] min-h-screen">

      {/* ================= FORM ================= */}
      <Card className="shadow-2xl border-white/10 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-white/10 dark:border-white/5 py-8">
          <CardTitle className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">
            {editingVisitId ? "📝 แก้ไขบันทึกการเข้าพบลูกค้า" : "บันทึกการเข้าพบลูกค้า"}
          </CardTitle>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-bold italic">
            {editingVisitId ? "แก้ไขข้อมูลการเยี่ยมเยียนที่มีอยู่แล้ว" : "กรอกข้อมูลการเยี่ยมเยียนและสถานะการขายล่าสุด"}
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Main Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <SalesPersonSelect
                profiles={profiles}
                value={form.sales}
                onValueChange={(v) => handleChange("sales", v)}
                isAdmin={isAdmin}
                currentUserProfile={currentUserProfile}
                label="👤 พนักงานขาย *"
                placeholder="เลือกรายชื่อ"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">วันที่เข้าพบ *</Label>
              <Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl font-bold text-black dark:text-white" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs opacity-50">ลำดับ</Label>
              <Input value="1" readOnly className="bg-slate-100/30 dark:bg-slate-800/20 h-12 rounded-2xl text-center cursor-not-allowed" />
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">รหัสลูกค้า / ชื่อร้าน *</Label>
              <div className={editingVisitId ? "opacity-60 pointer-events-none" : ""}>
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
          </div>

          <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />

          {/* Form Contexts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs">หัวข้อเข้าพบ *</Label>
              <Select value={form.visitCat} onValueChange={(v) => handleChange("visitCat", v)}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-black dark:text-white">
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
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-12 rounded-2xl text-black dark:text-white">
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

          {/* Enhanced Store Profile - Only shown when store selected */}
          {selectedStore && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 text-black">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-[2rem] overflow-hidden shadow-sm">
                {/* Profile Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600/10 rounded-2xl">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{selectedStore.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] font-mono py-0 h-4 border-blue-200 text-blue-600 dark:border-blue-900/50 dark:text-blue-400">#{selectedStore.code}</Badge>
                        <Badge className="text-[10px] py-0 h-4 bg-indigo-500 text-white border-none">{selectedStore.customerType || "ทั่วไป"}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">เงื่อนไขการชำระ</span>
                    <span className="text-sm font-black text-blue-600">{selectedStore.payment || "เงินสด"}</span>
                  </div>
                </div>

                {/* Profile Body */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
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

          {form.dealStatus === "ปิดการขาย" && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <Label className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 block text-xs text-rose-500">เหตุผลที่ปิดการขาย *</Label>
              <Input placeholder="ระบุเหตุผลในการปิดการขาย..." value={form.closeReason} onChange={(e) => handleChange("closeReason", e.target.value)} className="bg-rose-50/50 border-rose-200 h-12 rounded-2xl text-rose-700 font-bold" />
            </div>
          )}

          {/* Detailed Visit Notes — UNLIMITED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-900 dark:text-white font-black text-lg">บันทึกรายละเอียดการพบปะ</Label>
              <button
                type="button"
                onClick={() => {
                  const numericKeys = Object.keys(form.notes || {}).filter(k => !isNaN(Number(k))).map(Number)
                  const nextKey = numericKeys.length > 0 ? Math.max(...numericKeys) + 1 : 1
                  handleChange("notes", { ...form.notes, [nextKey]: "" })
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl transition-colors"
              >
                {(() => {
                  const numericKeys = Object.keys(form.notes || {}).filter(k => !isNaN(Number(k))).map(Number)
                  const nextKey = numericKeys.length > 0 ? Math.max(...numericKeys) + 1 : 1
                  return `+ เพิ่มครั้งที่ ${nextKey}`
                })()}
              </button>
            </div>

            <div className="space-y-4">
              {Object.keys(form.notes || {}).filter(k => !isNaN(Number(k))).length === 0 && (
                <div className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem]">
                  กดปุ่ม <span className="font-bold text-blue-500">+ เพิ่มครั้งที่ 1</span> เพื่อเริ่มบันทึก
                </div>
              )}
              {Object.entries(form.notes || {})
                .filter(([key]) => !isNaN(Number(key)))
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ครั้งที่</span>
                        <input
                          type="number"
                          min={1}
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value
                            if (!newKey || newKey === key) return
                            const newNotes = { ...form.notes }
                            const oldVal = newNotes[key]
                            delete newNotes[key]
                            newNotes[newKey] = oldVal
                            handleChange("notes", newNotes)
                          }}
                          className="w-16 h-7 text-center text-sm font-black bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newNotes = { ...form.notes }
                          delete newNotes[key]
                          handleChange("notes", newNotes)
                        }}
                        className="text-xs font-bold text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1 rounded-lg transition-colors"
                      >
                        ลบ
                      </button>
                    </div>
                    <Textarea
                      placeholder={`รายละเอียดการพูดคุย ครั้งที่ ${key}...`}
                      value={(value as string) || ""}
                      onChange={(e) => handleChange("notes", { ...form.notes, [key]: e.target.value })}
                      className="min-h-[130px] bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium leading-relaxed"
                    />
                  </div>
                ))}
            </div>
          </div>


          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg py-8 rounded-[2rem] shadow-xl transition-all active:scale-95">
              {isSubmitting ? "กำลังบันทึก..." : (editingVisitId ? "💾 บันทึกการแก้ไข" : "💾 บันทึกการเข้าพบลูกค้า")}
            </Button>
            {editingVisitId ? (
              <Button variant="outline" onClick={cancelEdit} className="md:w-64 py-8 rounded-[2rem] font-bold border-slate-200">ยกเลิกการแก้ไข</Button>
            ) : (
              <Button variant="outline" onClick={clearStore} className="md:w-64 py-8 rounded-[2rem] font-bold border-slate-200">ล้างข้อมูล</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      {/* ================= HISTORY TABLE ================= */}
      <Card className="border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-8 bg-gradient-to-r from-orange-600/5 to-amber-600/5 border-b border-white/10 text-black">
          <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-orange-500/10 rounded-2xl">📝</span>
            บันทึก <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400">การเข้าพบ</span>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <ActionButton
                  onClick={handleClear}
                  disabled={isClearing || isImporting}
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 border-red-600 shadow-lg shadow-red-500/20 rounded-2xl px-6"
                  icon={<Trash2 className="w-4 h-4 mr-2" />}
                  label={isClearing ? "กำลังลบ..." : "ล้างข้อมูลทั้งหมด"}
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportExcel}
                  className="hidden"
                  accept=".xlsx, .xls"
                />
                <ActionButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  variant="outline"
                  className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none rounded-2xl px-6"
                  icon={<Upload className="w-4 h-4 mr-2" />}
                  label={isImporting ? "กำลังนำเข้า..." : "นำเข้า Excel"}
                />
              </>
            )}

            <ActionButton
              onClick={handleExport}
              variant="outline"
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none rounded-2xl px-6 text-black"
              icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />}
              label="ส่งออก Excel"
            />
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <HistorySearchFilter
            search={historySearch}
            onSearchChange={setHistorySearch}
            salesFilter={salesFilter}
            onSalesFilterChange={setSalesFilter}
            profiles={profiles}
            searchLabel="ค้นหาประวัติ"
          />

          <div className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner bg-white/20">
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="border-b dark:border-slate-800">
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 pl-6 text-center w-16 hidden md:table-cell">ลำดับ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 w-24">วันที่</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 min-w-[150px]">ร้านค้า</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 hidden xl:table-cell w-32">พนักงานขาย</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 hidden lg:table-cell min-w-[180px]">สรุปการเข้าพบ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center hidden sm:table-cell w-28">สถานะ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-right pr-6 w-36">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-400 italic text-xs">ไม่พบข้อมูลประวัติ</TableCell></TableRow>
                ) : (
                  filteredVisits.map((v: any, index: number) => (
                    <TableRow key={v.id} className="hover:bg-blue-500/5 transition-colors border-b dark:border-slate-800/50">
                      <TableCell className="w-[80px] text-center font-bold text-slate-500 text-xs pl-6 hidden md:table-cell">{index + 1}</TableCell>
                      <TableCell className="py-5 font-bold text-xs text-black dark:text-white">
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">{new Date(v.date).toLocaleDateString('th-TH')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[150px] break-words whitespace-normal">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 dark:text-white text-xs line-clamp-2">{v.store?.name || "-"}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-1">{v.store?.code || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] hidden xl:table-cell"><Badge variant="outline" className="font-bold text-blue-600 border-blue-200 rounded-lg text-[10px] break-words whitespace-normal text-center">{v.sales}</Badge></TableCell>
                      <TableCell className="w-[180px] hidden lg:table-cell break-words whitespace-normal">
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{v.visitCat || "-"}</span>
                          {Object.keys(v.notes || {}).length > 0 && (
                            <span className="text-[10px] text-indigo-500 font-bold mt-1">📝 บันทึก {Object.keys(v.notes).length} ครั้ง</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px] text-center hidden sm:table-cell">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm whitespace-nowrap",
                          v.dealStatus === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        )}>
                          {v.dealStatus}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 align-middle">
                        <div className="flex justify-end gap-2 sm:gap-3 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedVisit(v)}
                            className="hover:bg-blue-500/10 hover:text-blue-500 rounded-full h-8 w-8 text-blue-500"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => startEdit(v)}
                                className="hover:bg-amber-500/10 hover:text-amber-500 rounded-full h-8 w-8 text-amber-500"
                              >
                                ✏️
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(v.id)}
                                className="hover:bg-rose-500/10 hover:text-rose-500 rounded-full h-8 w-8 text-rose-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
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