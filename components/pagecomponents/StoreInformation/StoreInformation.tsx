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

export default function StoreInformation({ stores }: any) {

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


  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  ;

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
      const { data } = await axiosInstance.post("/stores", form);

      if (data.id) {
        toast.success("เพิ่มร้านค้าเรียบร้อยแล้ว!", {
          style: {
            background: '#22c55e',
            color: '#fff',
            border: 'none',
          }
        });

        // ล้างฟอร์ม
        setForm({ ...initialForm });
        // localStorage.removeItem("store_draft");

        // รีเฟรชข้อมูลเพื่อให้เห็นร้านค้าใหม่ในตาราง
        // เนื่องจาก parent จำหน้า activePage ไว้ใน localStorage แล้ว
        // การ reload จะทำให้เรากลับมาที่หน้าเดิมพร้อมข้อมูลใหม่ครับ
        window.location.reload();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen text-black bg-[#0f172a] p-6">

      <Card className=" border border-gray-200  rounded-xl">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-semibold">
            ฐานข้อมูล ร้านค้า
          </CardTitle>


          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <span className="text-lg">＋</span> เพิ่มร้านค้า
              </Button>
            </DialogTrigger>
            <DialogContent className="min-w-[90vh] max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-[#1e293b] border-none shadow-2xl">
              <form onSubmit={handleSubmit}>
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">เพิ่มร้านค้า</DialogTitle>
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
                    <FieldLabel className="text-slate-700 dark:text-slate-300">สถานะ</FieldLabel>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-black dark:text-white">
                      <input type="hidden" name="status" value="เปิดการขาย" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                      <span className="text-sm font-medium">เปิดการขาย</span>
                    </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

            <Input
              placeholder="รหัส / ชื่อร้าน / เจ้าของ"
              className=" text-white border-white/10"
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
          <div className="overflow-hidden rounded-lg border border-white/10">

            <Table>
              <TableHeader className="bg-[#475569] ">
                <TableRow>
                  <TableHead>ลำดับ</TableHead>
                  <TableHead>รหัส</TableHead>
                  <TableHead>ชื่อร้าน</TableHead>
                  <TableHead>เจ้าของ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>เบอร์โทร</TableHead>
                  <TableHead>ประเภทลูกค้า</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="bg-[#0f172a]">
                {!stores || stores.length === 0 ? (
                  <TableRow className="bg-[#475569]">
                    <TableCell colSpan={8} className="text-center py-6 text-white/60">
                      ไม่มีข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store: any, index: number) => (
                    <TableRow key={store.id || index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-mono">{store.code}</TableCell>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>{store.type}</TableCell>
                      <TableCell>{store.phone}</TableCell>
                      <TableCell>{store.customerType}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          store.status === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {store.status}
                        </span>
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
