'use client'

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

export default function StoreInformation({ stores }: any) {
  return (
    <div className="w-full min-h-screen text-black bg-[#0f172a] p-6">

      <Card className=" border border-gray-200  rounded-xl">

        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-semibold">
            ฐานข้อมูล ร้านค้า
          </CardTitle>

          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            ＋ เพิ่มร้านค้า
          </Button>
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
                      <TableCell>{store.code}</TableCell>
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>{store.type}</TableCell>
                      <TableCell>{store.phone}</TableCell>
                      <TableCell>{store.customerType}</TableCell>
                      <TableCell>{store.status}</TableCell>
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