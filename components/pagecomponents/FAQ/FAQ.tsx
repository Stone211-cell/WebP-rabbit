"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface FAQItem {
  id: string
  date: string
  store: string
  type: string
  detail: string
  recorder: string
  status: string
}

export default function FAQ({ stores, visits }: any) {
  const [data, setData] = useState<FAQItem[]>([])
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    fetchData()
  }, [search, type, status])

  const fetchData = async () => {
    /*
    // Prisma (Server)
    const result = await prisma.faq.findMany({
      where: {
        type: type !== "all" ? type : undefined,
        status: status !== "all" ? status : undefined,
      },
    })
    */

    /*
    // Axios (Client)
    const res = await axios.get("/api/faq", {
      params: { search, type, status },
    })
    setData(res.data)
    */

    setData([])
  }

  const handleSubmit = async () => {
    /*
    await axios.post("/api/faq", form)
    fetchData()
    */
    alert("mock submit")
  }

  return (
    <div className="min-h-screen space-y-6 p-6 dark:bg-[#0f172a] bg-slate-50 text-slate-900 dark:text-slate-100">

      <h1 className="text-xl font-semibold">
        ⚠️ FAQ ร้านค้า ปัญหา & คำร้องเรียน
      </h1>

      {/* Add Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>+ เพิ่มรายการ FAQ</Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>เพิ่มปัญหา/คำร้องเรียน</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input placeholder="เลือกร้านค้า..." />
            <Input type="date" />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="ประเภทปัญหา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="สินค้า">สินค้า</SelectItem>
                <SelectItem value="บริการ">บริการ</SelectItem>
              </SelectContent>
            </Select>

            <Textarea placeholder="รายละเอียดปัญหา..." />

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="ผู้บันทึก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ตรี">ตรี</SelectItem>
                <SelectItem value="กร">กร</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="pending">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="done">เสร็จสิ้น</SelectItem>
              </SelectContent>
            </Select>

            <Textarea placeholder="หมายเหตุเพิ่มเติม..." />

            <div className="flex gap-3">
              <Button onClick={handleSubmit}>บันทึก</Button>
              <Button variant="outline">ยกเลิก</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="ค้นหา..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">ประเภท</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setType("all")}>
              ทั้งหมด
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setType("สินค้า")}>
              สินค้า
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">สถานะ</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatus("all")}>
              ทั้งหมด
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatus("pending")}>
              รอดำเนินการ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>วันที่</TableHead>
            <TableHead>ร้าน</TableHead>
            <TableHead>ประเภท</TableHead>
            <TableHead>รายละเอียด</TableHead>
            <TableHead>ผู้บันทึก</TableHead>
            <TableHead>สถานะ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                ไม่มีข้อมูล FAQ
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date}</TableCell>
                <TableCell>{item.store}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.detail}</TableCell>
                <TableCell>{item.recorder}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

    </div>
  )
}