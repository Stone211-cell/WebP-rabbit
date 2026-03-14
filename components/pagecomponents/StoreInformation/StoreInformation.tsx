import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Database, Upload, FileSpreadsheet, Plus } from "lucide-react"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn, confirmDelete, confirmClearAll } from "@/lib/utils"
import * as XLSX from "xlsx"
import { exportStoresToExcel } from "@/lib/exportexcel/exportFormatters"
import { getExcelValue } from "@/lib/exportexcel/excel"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { StoreTypes, CreditRatings, OrderPeriods, CustomerGroups } from "@/lib/types/manu"
import { ActionButton } from "@/components/crmhelper/helper"
import { StoreDetailModal } from "./StoreDetailModal"
import { Eye } from "lucide-react"
import { useSearch } from "@/components/hooks/useSearch"

export default function StoreInformation({ stores, visits = [], issues = [], onRefresh, onCreate, onUpdate, onDelete, isAdmin, currentUserProfile }: { stores: any, visits?: any[], issues?: any[], onRefresh?: () => void, onCreate?: any, onUpdate?: any, onDelete?: any, isAdmin?: boolean, currentUserProfile?: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewingStore, setViewingStore] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Filters
  const [filterType, setFilterType] = useState("all")
  const [filterRating, setFilterRating] = useState("all")

  const initialForm = {
    name: "",
    code: "", // Added code field if not auto-generated strictly by backend, or just for view
    owner: "",
    type: "",
    customerType: "",
    phone: "",
    address: "",
    productUsed: "",
    quantity: "",
    orderPeriod: "",
    supplier: "", // รับของเดิมจาก
    payment: "เงินสด",
    paymentScore: "",
    status: "เปิดการขาย",
    closeReason: ""
  }

  const [form, setForm] = useState(initialForm)

  // 💾 Draft recovery logic
  useEffect(() => {
    const saved = localStorage.getItem("store_draft")
    if (saved && !editingId) {
      try { setForm(JSON.parse(saved)) } catch (e) { console.error("Draft fail", e) }
    }
  }, [editingId])

  useEffect(() => {
    if (!editingId) localStorage.setItem("store_draft", JSON.stringify(form))
  }, [form, editingId])

  // 🚀 CRUD Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        if (onUpdate) await onUpdate(editingId, form)
        toast.success("แก้ไขข้อมูลร้านค้าสำเร็จ!")
      } else {
        if (onCreate) await onCreate(form)
        toast.success("เพิ่มร้านค้าเรียบร้อยแล้ว!")
      }
      resetForm()
      setOpen(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${name}"?`)) return
    try {
      if (onDelete) await onDelete(id)
      if (onRefresh) onRefresh()
      toast.success("ลบร้านค้าเรียบร้อยแล้ว!")
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleClear = async () => {
    if (!confirm("⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบ \"ข้อมูลร้านค้าทั้งหมด\"?\n\n- การลบร้านค้าจะทำให้ข้อมูล 'การเข้าพบ' และ 'แผนงาน' ทั้งหมดถูกลบตามไปด้วย!\n- ข้อมูล 'สินค้า' และ 'รายชื่อผู้ใช้งาน' จะยังคงอยู่\n- การดำเนินการนี้ไม่สามารถย้อนกลับได้")) return
    setIsClearing(true)
    const toastId = toast.loading("กำลังลบข้อมูลร้านค้าและประวัติ...")
    try {
      const res = await axiosInstance.delete('/stores')
      toast.success(res.data.message || "ลบข้อมูลทั้งหมดเรียบร้อยแล้ว")
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsClearing(false)
      toast.dismiss(toastId)
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    localStorage.removeItem("store_draft")
  }

  const startEdit = (store: any) => {
    setEditingId(store.id)
    // Clean null values to empty strings for controlled inputs
    const cleanedStore = Object.entries(store).reduce((acc: any, [key, value]) => {
      acc[key] = value === null ? "" : value
      return acc
    }, {})
    setForm({ ...initialForm, ...cleanedStore })
    setOpen(true)
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const toastId = toast.loading("กำลังนำเข้าข้อมูลร้านค้า...")

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      // Target specific sheet name, fallback to first sheet
      const targetSheetName = workbook.SheetNames.find(n => n.includes('ร้านค้า') || n.includes('Store')) || workbook.SheetNames[0]
      const worksheet = workbook.Sheets[targetSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

      const storesToImport = jsonData.map((row) => {
        // Support both numeric stars and text-based payment scores
        let paymentScore = null
        const rawScore = getExcelValue(row, ['เครดิต']) ? String(getExcelValue(row, ['เครดิต'])).replace(' ดาว', '').replace('ดาว', '').trim() : null
        const rawScoreText = getExcelValue(row, ['คะแนนการชำระเงิน'])
        if (rawScore && !isNaN(parseInt(rawScore))) paymentScore = rawScore
        else if (rawScoreText === 'ดีมาก') paymentScore = '5'
        else if (rawScoreText === 'ดี') paymentScore = '4'
        else if (rawScoreText === 'ปานกลาง') paymentScore = '3'
        else if (rawScoreText === 'แย่') paymentScore = '2'
        else if (rawScoreText === 'แย่มาก') paymentScore = '1'

        let phone = getExcelValue(row, ['เบอร์โทร', 'phone', 'tel']) || '';
        if (phone && phone.length === 9 && !phone.startsWith('0')) phone = '0' + phone;
        phone = phone.replace(/[^0-9]/g, '');

        const name = getExcelValue(row, ['ชื่อร้าน', 'name']) || '';
        const code = getExcelValue(row, ['รหัส', 'code']) || '';

        return {
          name,
          code,
          owner: getExcelValue(row, ['เจ้าของ', 'owner']) || '',
          type: getExcelValue(row, ['ประเภทร้าน', 'ประเภท', 'type']) || '',
          customerType: getExcelValue(row, ['ประเภทลูกค้า', 'customer_type']) || '',
          phone,
          address: getExcelValue(row, ['ที่อยู่', 'address']) || '',
          productUsed: getExcelValue(row, ['สินค้าที่ใช้', 'สินค้า', 'product_used']) || '',
          quantity: getExcelValue(row, ['ปริมาณ', 'quantity']) || '',
          orderPeriod: getExcelValue(row, ['ระยะเวลาสั่ง', 'order_period', 'รอบสั่ง']) || '',
          supplier: getExcelValue(row, ['รับของเดิมจาก', 'รับของจาก', 'supplier']) || '',
          payment: getExcelValue(row, ['เงื่อนไขชำระ', 'payment']) || 'เงินสด',
          paymentScore,
          status: getExcelValue(row, ['สถานะ', 'status']) || 'เปิดการขาย',
          closeReason: getExcelValue(row, ['เหตุผลปิดการขาย', 'close_reason']) || '',
        }
      }).filter(s => s.name.trim() !== '')

      if (storesToImport.length === 0) {
        toast.dismiss(toastId)
        toast.error('ไม่พบข้อมูลร้านค้าในไฟล์ Excel (ต้องมีคอลัมน์ "ชื่อร้าน")')
        return
      }

      const res = await axiosInstance.post('/stores/import', { stores: storesToImport })

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

  // 🔍 ใช้ shared useSearch hook — รวม search + filterType + filterRating
  const { search, setSearch, filtered: filteredStores } = useSearch(
    stores,
    ['name', 'code', 'owner'],
    (s: any) => {
      const matchType = filterType === "all" || s.type === filterType
      const matchRating = filterRating === "all" || String(s.paymentScore) === filterRating
      return matchType && matchRating
    }
  )

  const handleExport = () => {
    exportStoresToExcel(filteredStores);
  }

  return (
    <div className="w-full min-h-screen text-black dark:text-white bg-transparent p-6 space-y-8 animate-in fade-in duration-700">

      <Card className="border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-white/10">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="p-2.5 bg-blue-500/10 rounded-2xl">🏪</span>
              ฐานข้อมูล <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">ร้านค้า</span>
            </CardTitle>
            <p className="text-xs text-slate-500 font-bold italic ml-12">จัดการข้อมูลลูกค้าและความสัมพันธ์คู่ค้า</p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImportExcel}
              disabled={isImporting}
            />

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
                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none rounded-2xl px-6"
                icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />}
                label="ส่งออก Excel"
              />

              {isAdmin && (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 rounded-2xl px-8 py-6 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                      <Plus className="w-5 h-5 mr-2" />
                      เพิ่มร้านค้าใหม่
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-[90vw] md:min-w-[900px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 rounded-[3rem] shadow-2xl">
                    <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                          {editingId ? "📝 แก้ไขข้อมูลร้าน" : "✨ เพิ่มร้านค้าใหม่"}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Row 1 */}
                        <div className="md:col-span-1">
                          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">รหัสลูกค้า (อัตโนมัติ)</FieldLabel>
                          <div className="h-12 flex items-center px-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 select-none">
                            {editingId ? form.code : "System Auto-Gen"}
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ชื่อร้าน *</FieldLabel><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ชื่อร้าน" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" required /></Field>
                        </div>
                        <div className="md:col-span-1">
                          <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เจ้าของร้าน</FieldLabel><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="ชื่อเจ้าของ" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" /></Field>
                        </div>

                        {/* Row 2 */}
                        <Field>
                          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ประเภทร้าน</FieldLabel>
                          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                            <SelectTrigger className="h-12 rounded-2xl font-bold w-full [&>span]:line-clamp-1"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                            <SelectContent>
                              {StoreTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ประเภทลูกค้า</FieldLabel>
                          <Select value={form.customerType} onValueChange={(v) => setForm({ ...form, customerType: v })}>
                            <SelectTrigger className="h-12 rounded-2xl font-bold w-full [&>span]:line-clamp-1"><SelectValue placeholder="เลือกกลุ่ม" /></SelectTrigger>
                            <SelectContent>
                              {CustomerGroups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เบอร์โทร</FieldLabel><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0xx-xxx-xxxx" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" /></Field>

                        {/* Row 3: Address */}
                        <div className="md:col-span-3"><Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ที่อยู่ / พิกัด</FieldLabel><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="ที่อยู่หรือพิกัด" className="rounded-[2rem] min-h-[80px] p-4 font-bold bg-slate-50 dark:bg-slate-800" /></Field></div>

                        {/* Row 4 */}
                        <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">สินค้าที่ใช้</FieldLabel><Input value={form.productUsed} onChange={(e) => setForm({ ...form, productUsed: e.target.value })} placeholder="ชื่อสินค้า" className="h-12 rounded-2xl" /></Field>
                        <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ปริมาณ</FieldLabel><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="เช่น 10 ถุง/เดือน" className="h-12 rounded-2xl" /></Field>
                        <Field>
                          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ระยะเวลาสั่ง</FieldLabel>
                          <Select value={form.orderPeriod} onValueChange={(v) => setForm({ ...form, orderPeriod: v })}>
                            <SelectTrigger className="h-12 rounded-2xl font-bold w-full [&>span]:line-clamp-1"><SelectValue placeholder="เลือกระยะเวลา" /></SelectTrigger>
                            <SelectContent>
                              {OrderPeriods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>

                        {/* Row 5 */}
                        <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">รับของเดิมจาก</FieldLabel><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="ชื่อคู่แข่ง" className="h-12 rounded-2xl" /></Field>
                        <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เงื่อนไขชำระ</FieldLabel>
                          <Select value={form.payment} onValueChange={(v) => setForm({ ...form, payment: v })}>
                            <SelectTrigger className="h-12 rounded-2xl font-bold w-full [&>span]:line-clamp-1"><SelectValue placeholder="เลือกเงื่อนไข" /></SelectTrigger>
                            <SelectContent>
                              {["เงินสด", "เครดิต 7 วัน", "เครดิต 15 วัน", "เครดิต 30 วัน",].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">คะแนนการชำระเงิน</FieldLabel>
                          <Select value={form.paymentScore} onValueChange={(v) => setForm({ ...form, paymentScore: v })}>
                            <SelectTrigger className="h-12 rounded-2xl font-bold w-full [&>span]:line-clamp-1"><SelectValue placeholder="เลือกคะแนน" /></SelectTrigger>
                            <SelectContent>
                              {CreditRatings.map(c => (
                                <SelectItem key={c.value} value={c.value}>
                                  <span className="flex items-center gap-2">
                                    <span className="text-yellow-400">{"⭐".repeat(c.stars)}</span>
                                    <span>{c.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>

                        {/* Row 6: Status & Reason */}
                        <div className="md:col-span-1">
                          <Field>
                            <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">สถานะ *</FieldLabel>
                            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                              <SelectTrigger className={cn("h-12 rounded-2xl font-black border-2 w-full [&>span]:line-clamp-1", form.status === "เปิดการขาย" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-rose-500/5 text-rose-600 border-rose-500/20")}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent><SelectItem value="เปิดการขาย">🟢 เปิดการขาย</SelectItem><SelectItem value="ปิดการขาย">🔴 ปิดการขาย</SelectItem></SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <div className="md:col-span-2">
                          <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เหตุผลปิดการขาย (ถ้ามี)</FieldLabel><Input value={form.closeReason} onChange={(e) => setForm({ ...form, closeReason: e.target.value })} placeholder="เช่น ร้านปิดตัว" className="h-12 rounded-2xl" /></Field>
                        </div>
                      </div>

                      <DialogFooter className="gap-4 pt-4">
                        <DialogClose asChild><Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200" onClick={resetForm}>ยกเลิก</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting} className="h-14 px-12 rounded-2xl bg-blue-600 text-white font-black shadow-xl">
                          {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึก"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Controls & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Input
                placeholder="ค้นหารหัสร้าน, ชื่อร้าน หรือ เจ้าของ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-50">🔍</span>
            </div>

            {/* Filter: Type */}
            <div className="w-full md:w-[200px]">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-14 rounded-2xl font-bold bg-white/50 border-slate-200 w-full [&>span]:line-clamp-1">
                  <SelectValue placeholder="ประเภทร้าน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {StoreTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Filter: Rating/Status */}
            <div className="w-full md:w-[200px]">
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="h-14 rounded-2xl font-bold bg-white/50 border-slate-200 w-full [&>span]:line-clamp-1">
                  <SelectValue placeholder="สถานะ/คะแนน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {CreditRatings.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label} ({c.stars}⭐)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner bg-white/20">
            <Table style={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="border-b dark:border-slate-800">
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 pl-6 text-center w-16 hidden lg:table-cell">ลำดับ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 hidden lg:table-cell w-24">รหัส</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 min-w-[150px]">ชื่อสถานประกอบการ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 hidden md:table-cell w-32">ประเภทร้าน</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 hidden xl:table-cell w-40">เจ้าของ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center hidden md:table-cell w-24">เครดิต</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center hidden sm:table-cell w-28">สถานะ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-right pr-6 w-36">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-40 text-center py-20 text-slate-400 italic">ไม่พบข้อมูลร้านค้า</TableCell></TableRow>
                ) : (
                  filteredStores.map((s: any, index: number) => (
                    <TableRow key={s.id} className="hover:bg-blue-500/5 transition-colors border-b dark:border-slate-800/50">
                      <TableCell className="w-[80px] text-center font-bold text-slate-400 text-xs pl-6 hidden lg:table-cell">{index + 1}</TableCell>
                      <TableCell className="w-[120px] py-6 font-mono text-xs font-bold text-slate-400 hidden lg:table-cell">{s.code || "-"}</TableCell>
                      <TableCell className="py-4 font-black text-slate-900 dark:text-white break-words whitespace-normal">
                        <div className="flex items-center gap-2 mb-1 lg:hidden">
                          <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{s.code || "-"}</span>
                        </div>
                        <div className="line-clamp-2 text-sm">{s.name}</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-1 line-clamp-1">{s.customerType}</div>
                      </TableCell>
                      <TableCell className="w-[150px] text-xs font-bold text-slate-600 dark:text-slate-300 hidden md:table-cell break-words whitespace-normal">{s.type || "-"}</TableCell>
                      <TableCell className="w-[150px] text-sm font-bold text-slate-500 hidden xl:table-cell break-words whitespace-normal">
                        <div className="line-clamp-1">{s.owner || "-"}</div>
                        <div className="text-[10px] font-mono opacity-70">{s.phone}</div>
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {s.paymentScore ? (
                          <span className="text-yellow-500 text-xs">{"⭐".repeat(parseInt(s.paymentScore) || 0)}</span>
                        ) : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="w-[120px] text-center hidden sm:table-cell">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black shadow-sm whitespace-nowrap",
                          s.status === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        )}>{s.status}</span>
                      </TableCell>
                      <TableCell className="text-right pr-4 md:pr-6 align-middle">
                        <div className="flex justify-end gap-2 sm:gap-3 items-center">
                          <ActionButton variant="ghost" size="icon" onClick={() => setViewingStore(s)} className="h-10 w-10 text-emerald-600 hover:bg-emerald-500/10 rounded-xl" label={<Eye className="w-5 h-5" />} />
                          {isAdmin ? (
                            <>
                              <ActionButton variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-10 w-10 text-blue-600 hover:bg-blue-500/10 rounded-xl" label="✏️" />
                              <ActionButton variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)} className="h-10 w-10 text-rose-500 hover:bg-rose-500/10 rounded-xl" label="🗑️" />
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-400 italic">View Only</div>
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

      {/* Show the Store Details Modal */}
      {viewingStore && (
        <StoreDetailModal
          store={viewingStore}
          visits={visits}
          issues={issues}
          onClose={() => setViewingStore(null)}
        />
      )}
    </div>
  )
}