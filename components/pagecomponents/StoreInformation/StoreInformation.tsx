'use client'
import { useState, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

export default function StoreInformation({ stores, onRefresh }: { stores: any, onRefresh?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const initialForm = {
    name: "",
    owner: "",
    type: "",
    customerType: "",
    phone: "",
    address: "",
    productUsed: "",
    quantity: "",
    orderPeriod: "",
    supplier: "",
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

  // 🚀 CRUD Handlers (Clean Pattern)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingId) {
        await axiosInstance.put(`/stores/${editingId}`, form)
        toast.success("แก้ไขข้อมูลร้านค้าสำเร็จ!")
      } else {
        await axiosInstance.post("/stores", form)
        toast.success("เพิ่มร้านค้าเรียบร้อยแล้ว!")
      }
      resetForm()
      if (onRefresh) onRefresh()
      setOpen(false)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${name}"?`)) return
    try {
      await axiosInstance.delete(`/stores/${id}`)
      toast.success("ลบร้านค้าเรียบร้อยแล้ว!")
      if (onRefresh) onRefresh()
    } catch (error) {
      handleApiError(error)
    }
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    localStorage.removeItem("store_draft")
  }

  const startEdit = (store: any) => {
    setEditingId(store.id)
    setForm({ ...initialForm, ...store })
    setOpen(true)
  }

  const filteredStores = (stores || []).filter((s: any) =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase()) ||
    s.owner?.toLowerCase().includes(search.toLowerCase())
  )

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

          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl transition-all active:scale-95">
                <span className="text-xl mr-2">＋</span> เพิ่มร้านค้าใหม่
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[90vw] md:min-w-[800px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 rounded-[3rem] shadow-2xl">
              <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white">
                    {editingId ? "📝 แก้ไขข้อมูลร้าน" : "✨ เพิ่มร้านค้าใหม่"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ชื่อร้าน *</FieldLabel><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ระบุชื่อร้านค้า" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" required /></Field>
                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เจ้าของร้าน</FieldLabel><Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="ชื่อเจ้าของ" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" /></Field>
                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เบอร์โทร</FieldLabel><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0xx-xxx-xxxx" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-800" /></Field>

                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ประเภทร้าน</FieldLabel>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger className="h-12 rounded-2xl font-bold"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                      <SelectContent><SelectItem value="retail">ขายปลีก (Retail)</SelectItem><SelectItem value="wholesale">ขายส่ง (Wholesale)</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ประเภทลูกค้า</FieldLabel>
                    <Select value={form.customerType} onValueChange={(v) => setForm({ ...form, customerType: v })}>
                      <SelectTrigger className="h-12 rounded-2xl font-bold"><SelectValue placeholder="เลือกกลุ่ม" /></SelectTrigger>
                      <SelectContent><SelectItem value="general">ทั่วไป (General)</SelectItem><SelectItem value="vip">VIP (Premium)</SelectItem></SelectContent>
                    </Select>
                  </Field>
                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">เงื่อนไขชำระ</FieldLabel><Input value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })} className="h-12 rounded-2xl font-bold" /></Field>

                  <div className="md:col-span-3"><Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ที่อยู่ / พิกัด</FieldLabel><Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="rounded-[2rem] min-h-[100px] p-6" /></Field></div>

                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">สินค้าที่ใช้</FieldLabel><Input value={form.productUsed} onChange={(e) => setForm({ ...form, productUsed: e.target.value })} className="h-12 rounded-2xl" /></Field>
                  <Field><FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">ปริมาณสั่ง</FieldLabel><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="h-12 rounded-2xl" /></Field>
                  <Field>
                    <FieldLabel className="font-bold text-xs uppercase tracking-wider text-slate-500">สถานะร้าน</FieldLabel>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className={cn("h-12 rounded-2xl font-black border-2", form.status === "เปิดการขาย" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" : "bg-rose-500/5 text-rose-600 border-rose-500/20")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent><SelectItem value="เปิดการขาย">เปิดการขาย</SelectItem><SelectItem value="ปิดการขาย">ปิดการขาย</SelectItem></SelectContent>
                    </Select>
                  </Field>
                </div>

                <DialogFooter className="gap-4">
                  <DialogClose asChild><Button variant="outline" className="h-14 px-8 rounded-2xl font-bold border-slate-200">ยกเลิก</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting} className="h-14 px-12 rounded-2xl bg-blue-600 text-white font-black shadow-xl">
                    {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึกข้อมูล"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="relative">
            <Input
              placeholder="ค้นหารหัสร้าน, ชื่อร้าน หรือ ชื่อเจ้าของ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 pl-12 rounded-2xl bg-white/50 border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale opacity-50">🔍</span>
          </div>

          <div className="rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-inner bg-white/20">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="border-b dark:border-slate-800">
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 pl-8">รหัส</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">ชื่อสถานประกอบการ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">เจ้าของ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400">เบอร์โทร</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-center">สถานะ</TableHead>
                  <TableHead className="py-5 font-black uppercase text-[10px] text-slate-400 text-right pr-8">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-40 text-center py-20 text-slate-400 italic">ไม่พบข้อมูลร้านค้า</TableCell></TableRow>
                ) : (
                  filteredStores.map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-blue-500/5 transition-colors border-b dark:border-slate-800/50">
                      <TableCell className="py-6 pl-8 font-mono text-xs font-bold text-slate-400">{s.code || "-"}</TableCell>
                      <TableCell className="font-black text-slate-900 dark:text-white">{s.name}</TableCell>
                      <TableCell className="text-sm font-bold text-slate-500">{s.owner || "-"}</TableCell>
                      <TableCell className="text-sm font-bold text-slate-500">{s.phone || "-"}</TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black shadow-sm",
                          s.status === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        )}>{s.status}</span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEdit(s)} className="h-10 w-10 text-blue-600 hover:bg-blue-500/10 rounded-xl">✏️</Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.name)} className="h-10 w-10 text-rose-500 hover:bg-rose-500/10 rounded-xl">🗑️</Button>
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
    </div>
  )
}
