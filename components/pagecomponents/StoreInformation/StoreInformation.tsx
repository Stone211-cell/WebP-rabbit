'use client'
import { useState, useEffect } from "react";
import { axiosInstance } from "@/lib/axios";
import { handleApiError } from "@/lib/handleError";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
  };

  // ✅ 2. ดึง type จาก initialForm อัตโนมัติ
  type StoreForm = typeof initialForm;

  // ✅ 3. ใช้ type กับ useState
  const [form, setForm] = useState<StoreForm>(initialForm);

  // ✅ 4. Auto-save logic
  useEffect(() => {
    const saved = localStorage.getItem("store_draft");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error("Scale to load draft", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("store_draft", JSON.stringify(form));
  }, [form]);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (store: any) => {
    setEditingId(store.id);
    setForm({
      ...initialForm,
      ...store
    });
    setOpen(true);
  };

  const handleDelete = async (store: any) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า "${store.name}"?`)) return;

    try {
      await axiosInstance.delete(`/stores/${store.id}`);
      toast.success("ลบร้านค้าเรียบร้อยแล้ว!");
      if (onRefresh) onRefresh();
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        // Mode: UPDATE
        await axiosInstance.put(`/stores/${editingId}`, form);
        toast.success("แก้ไขข้อมูลร้านค้าสำเร็จ!");
      } else {
        // Mode: CREATE
        await axiosInstance.post("/stores", form);
        toast.success("เพิ่มร้านค้าเรียบร้อยแล้ว!");
      }

      // ล้างฟอร์มและรีเฟรช
      setForm({ ...initialForm });
      setEditingId(null);
      if (onRefresh) onRefresh();
      setOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-black dark:text-white bg-transparent p-6 transition-colors duration-300">

      <Card className="border-none bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden transition-all duration-300">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-semibold text-slate-800 dark:text-white">
            ฐานข้อมูล ร้านค้า
          </CardTitle>


          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingId(null);
              setForm({ ...initialForm });
            }
          }}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...initialForm });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-2 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
              >
                <span className="text-lg">＋</span> เพิ่มร้านค้า
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[90vh] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-white/20 dark:border-slate-800/50 shadow-2xl rounded-3xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                    {editingId ? "แก้ไขข้อมูลร้านค้า" : "เพิ่มร้านค้า"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Row 1 */}
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">รหัสลูกค้า (อัตโนมัติ)</FieldLabel>
                    <Input name="code" disabled defaultValue="KHN-C0001" className="bg-slate-200/50 dark:bg-slate-800/50 dark:text-white text-black border-slate-300 dark:border-slate-700 font-mono" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">ชื่อร้าน <span className="text-rose-500">*</span></FieldLabel>
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="ชื่อร้าน" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" required />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">เจ้าของร้าน</FieldLabel>
                    <Input name="owner" value={form.owner} onChange={handleChange} placeholder="ชื่อเจ้าของ" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>

                  {/* Row 2 */}
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">ประเภทร้าน</FieldLabel>
                    <Select name="type" onValueChange={(v) => handleSelectChange('type', v)}>
                      <SelectTrigger className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-black dark:text-white">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">ขายปลีก</SelectItem>
                        <SelectItem value="wholesale">ขายส่ง</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">ประเภทลูกค้า</FieldLabel>
                    <Select name="customerType" onValueChange={(v) => handleSelectChange('customerType', v)}>
                      <SelectTrigger className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                        <SelectValue placeholder="– ไม่ระบุ –" className="dark:text-white bg-white dark:bg-slate-800/50" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">ทั่วไป</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">เบอร์โทร</FieldLabel>
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="0xx-xxx-xxxx" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>

                  {/* Row 3 - Full Width Address */}
                  <div className="md:col-span-3">
                    <Field>
                      <FieldLabel className="text-slate-700 dark:text-slate-300">ที่อยู่/พิกัด</FieldLabel>
                      <Textarea name="address" value={form.address} onChange={handleChange} placeholder="ที่อยู่หรือพิกัด" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 min-h-[80px]" />
                    </Field>
                  </div>

                  {/* Row 4 */}
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">สินค้าที่ใช้</FieldLabel>
                    <Input name="productUsed" value={form.productUsed} onChange={handleChange} placeholder="ชื่อสินค้า" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">ปริมาณ</FieldLabel>
                    <Input name="quantity" value={form.quantity} onChange={handleChange} placeholder="เช่น 10 ถุง/เดือน" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">ระยะเวลาสั่ง</FieldLabel>
                    <Select name="orderPeriod" onValueChange={(v) => handleSelectChange('orderPeriod', v)}>
                      <SelectTrigger className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-black dark:text-white">
                        <SelectValue placeholder="เลือกระยะเวลา" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">ทุกสัปดาห์</SelectItem>
                        <SelectItem value="monthly">ทุกเดือน</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Row 5 */}
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">รับของเดิมจาก</FieldLabel>
                    <Input name="supplier" value={form.supplier} onChange={handleChange} placeholder="ชื่อคู่แข่ง" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">เงื่อนไขชำระ</FieldLabel>
                    <Input name="payment" value={form.payment} onChange={handleChange} placeholder="เงินสด" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                  </Field>
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300">คะแนนการชำระเงิน</FieldLabel>
                    <Select name="paymentScore" onValueChange={(v) => handleSelectChange('paymentScore', v)}>
                      <SelectTrigger className="bg-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-black dark:text-white">
                        <SelectValue placeholder="– ไม่ระบุ –" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">A (ดีมาก)</SelectItem>
                        <SelectItem value="b">B (ปกติ)</SelectItem>
                        <SelectItem value="c">C (ล่าช้า)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Row 6 */}
                  <Field>
                    <FieldLabel className="text-slate-700 dark:text-slate-300 font-bold mb-1.5 flex items-center gap-2">
                      สถานะร้านค้า
                      {form.status === "เปิดการขาย" ? (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                      )}
                    </FieldLabel>
                    <Select value={form.status} onValueChange={(v) => handleSelectChange('status', v)}>
                      <SelectTrigger className={cn(
                        "h-11 rounded-xl transition-all duration-300 border-2",
                        form.status === "เปิดการขาย"
                          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                          : "bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40 text-rose-700 dark:text-rose-400"
                      )}>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1 overflow-hidden">
                        <SelectItem value="เปิดการขาย" className="focus:bg-emerald-500/10 rounded-xl cursor-pointer py-3 group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">เปิดการขาย</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ร้านยังดำเนินกิจการปกติ</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="ปิดการขาย" className="focus:bg-rose-500/10 rounded-xl cursor-pointer py-3 group">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] group-hover:scale-110 transition-transform" />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">ปิดการขาย</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ร้านเลิกกิจการหรือยกเลิกการขาย</span>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field>
                      <FieldLabel className="text-slate-700 dark:text-slate-300">เหตุผลปิดการขาย</FieldLabel>
                      <Input name="closeReason" value={form.closeReason} onChange={handleChange} placeholder="เช่น ร้านปิดตัว" className="bg-white text-black dark:text-white dark:bg-slate-800/50 border-slate-300 dark:border-slate-700" />
                    </Field>
                  </div>
                </div>

                <DialogFooter className="mt-8 gap-3 sm:justify-start">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl flex items-center gap-2 text-base shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">💾</span> บันทึก
                      </>
                    )}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-700 px-8 py-6 rounded-xl text-base hover:bg-slate-100 dark:text-white dark:hover:bg-red-600  dark:hover:text-white transition-colors ">
                      ยกเว้น
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </CardHeader>

        <CardContent>

          {/* FILTER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            <Input
              placeholder="รหัส / ชื่อร้าน / เจ้าของ"
              className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
            />

            <Select>
              <SelectTrigger className="border-white/10">
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="border-white/10 text-white">
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
              </SelectContent>
            </Select>

          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm">

            <Table>
              <TableHeader className=" bg-[#475569]  ">
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อร้าน</TableHead>
                  <TableHead>เจ้าของ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>ประเภทลูกค้า</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!stores || stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500 italic">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📭</span>
                        ไม่พบข้อมูลร้านค้าในขณะนี้
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store: any, index: number) => (
                    <TableRow key={store.id || index} className="hover:bg-blue-500/5 dark:hover:bg-blue-500/10 transition-colors border-b border-slate-100 dark:border-slate-800/50">
                      <TableCell className="text-slate-500 dark:text-slate-400 font-medium">{index + 1}</TableCell>
                      <TableCell className="font-mono text-slate-600 dark:text-slate-300">{store.code}</TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">{store.name}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{store.owner}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{store.type}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{store.phone}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">{store.customerType}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          store.status === "เปิดการขาย"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        )}>
                          {store.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300"
                          onClick={() => handleEdit(store)}
                        >
                          <span className="text-lg mr-2">✏️</span> แก้ไข
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
                          onClick={() => handleDelete(store)}
                        >
                          <span className="text-lg mr-2">🗑️</span> ลบ
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

    </div>
  )
}
