"use client"

import { useState } from "react"
import axios from "axios"

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

export default function VisitForm({ stores, plans }: any) {
  const [form, setForm] = useState<any>({})

  const handleChange = (name: string, value: any) => {
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async () => {
    try {
      // 🔥 ต่อ API ตรงนี้
      // await axios.post("/api/visit", form)

      console.log(form)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="p-6 space-y-6 dark:bg-[#0f172a] min-h-screen text-black">

      {/* ================= FORM ================= */}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>บันทึกการเข้าพบ</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-none md:border-t md:pt-4">
            <div>
              <Label>เซลล์ *</Label>
              <Select onValueChange={(v) => handleChange("sales", v)}>
                <SelectTrigger className="dark:bg-[#1e293b] border-gray-600">
                  <SelectValue placeholder="เลือกเซลล์" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#1e293b] dark:text-white">
                  <SelectItem value="สมชาย" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">สมชาย</SelectItem>
                  <SelectItem value="สมศรี"  className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">สมศรี</SelectItem>
                  <SelectItem value="ตรี"  className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ตรี</SelectItem>
                  <SelectItem value="กร"  className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">กร</SelectItem>
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
              <Label>ลำดับ</Label>
              <Input type="number" className="dark:bg-[#1e293b] border-gray-600" />
            </div>

            <div>
              <Label>รหัสลูกค้า / ชื่อร้าน *</Label>
              <Input placeholder="พิมพ์รหัส หรือชื่อร้าน..." className="dark:bg-[#1e293b] border-gray-600" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-none md:border-t md:pt-4">
            <div>
              <Label>ประเภทเข้าพบ *</Label>
              <Select onValueChange={(v) => handleChange("type", v)}>
                <SelectTrigger className="dark:bg-[#1e293b] border-gray-600">
                  <SelectValue placeholder="เลือกประเภท" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#1b2433] dark:text-white">
                  <SelectItem value="new" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ร้านใหม่</SelectItem>
                  <SelectItem value="follow" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ติดตาม</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-none dark:border-t md:pt-0 dark:bg-[#1b2433">
              <Label>สถานะการขาย</Label>
              <Select>
                <SelectTrigger className="dark:bg-[#1e293b] border-gray-600">
                  <SelectValue placeholder="เลือกสถานะ" />
                </SelectTrigger>
                
                <SelectContent className=" dark:text-white dark:bg-[#1b2433">
                  <SelectItem value="open" className="flex items-center gap-2 bg-white dark:bg-[#1b2433]">
                    <div className="flex items-center gap-2 dark:text-white ">
                      <Badge className="dark:bg-[#1e293b] dark:text-white bg-white text-black text-md">🟢 เปิดการขาย</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="close">🔴 ปิดการขาย</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>ชื่อร้าน</Label>
              <Input />
            </div>

            <div>
              <Label>เจ้าของ</Label>
              <Input />
            </div>
          </div>

          {/* Tabs ครั้งที่ 1-8 */}
          <div>
            <Label>บันทึกเข้าพบ (ครั้งที่ 1-8)</Label>
            <Tabs defaultValue="1" className="mt-2 flex flex-col gap-4">
              <TabsList>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TabsTrigger key={i} value={`${i + 1}`} className="m-2   dark:text-white">
                    ครั้งที่ {i + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Array.from({ length: 8 }).map((_, i) => (
                <TabsContent key={i} value={`${i + 1}`}>
                  <Textarea
                    placeholder={`บันทึกเข้าพบ ครั้งที่ ${i + 1}...`}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit}>
              💾 บันทึกเข้าพบ
            </Button>
            <Button variant="secondary">ล้างฟอร์ม</Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* ================= TABLE ================= */}

      <Card>
        <CardHeader>
          <CardTitle>รายการเข้าพบทั้งหมด</CardTitle>
        </CardHeader>

        <CardContent className="m-3 flex flex-row gap-4">
            <Input
              placeholder="รหัส / ชื่อร้าน / เจ้าของ"
              className=" text-white border-white/10 bg-[#475569] dark:text-white"
            />

            <Select>
              <SelectTrigger className="border-white/10 dark:bg-[#475569] dark:text-white">
                <SelectValue placeholder="ทั้งหมด" />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#475569] dark:text-white">
                <SelectItem value="all" className="bg-[#475569] ">ทั้งหมด</SelectItem>
              </SelectContent>
            </Select>


 

        </CardContent>

        <CardContent>
          <Table>
            <TableHeader className="dark:bg-[#475569] dark:text-white">
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อร้าน</TableHead>
                <TableHead>เซลล์</TableHead>
                <TableHead>หัวข้อเข้าพบ</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell colSpan={7} className="h-100 text-center text-muted-foreground transition duration-300 ease-in-out dark:hover:bg-[#475569] dark:text-white">
                  ไม่มีบันทึก
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}