"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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

export default function PlanForm({ stores, plans }: any) {
    const [form, setForm] = useState<any>({})

    const handleSubmit = async () => {
        await fetch("/api/weekly-plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
    }

    return (
        <div className="p-6 dark:bg-[#0f172a] min-h-screen text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    แผน <span className="text-blue-400">สัปดาห์</span>
                </h2>

                <div className="flex items-center gap-4 text-sm">
                    <Button variant="default" size="sm" className="bg-red-500 text-white">← กลับ</Button>
                    <span className="text-black dark:text-white">15 ก.พ. 2569 – 21 ก.พ. 2569</span>
                    <Button variant="default" size="sm" className="bg-red-500 text-white">ต่อไป →</Button>
                </div>
            </div>

            {/* FORM CARD */}
            <Card className="bg-transparent border-gray-700 shadow-none">
                <CardContent className="space-y-5">

                    {/* ROW 1 */}
                    <div className="grid md:grid-cols-5 gap-4">
{/* className="text-dark dark:text-white" */}
                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">เซลล์ *</Label>
                            <Select>
                                <SelectTrigger className="bg-[#1e293b] border-gray-600 bg-white" >
                                    <SelectValue placeholder="เลือกเซลล์" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#1e293b] dark:text-white">
                                    <SelectItem value="ตรี" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ตรี</SelectItem>
                                    <SelectItem value="กร" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">กร</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">วันที่แผน *</Label>
                            <Input
                                type="date"
                                className="bg-white text-black  dark:bg-[#1e293b] border-gray-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">ลำดับ</Label>
                            <Input
                                type="number"
                                defaultValue="1"
                                className="bg-white text-black  dark:bg-[#1e293b] border-gray-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">หัวข้อเข้าพบ *</Label>
                            <Select>
                                <SelectTrigger className="bg-[#1e293b] border-gray-600 bg-white">
                                    <SelectValue placeholder="ตรวจเยี่ยมประจำเดือน" className="dark:text-white" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#1e293b] dark:text-white">
                                    <SelectItem value="visit" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ตรวจเยี่ยม</SelectItem>
                                    <SelectItem value="follow" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ติดตาม</SelectItem>
                                    <SelectItem value="new" className="bg-white dark:bg-[#1e293b] dark:hover:bg-black">ร้านใหม่</SelectItem>
                  
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-black dark:text-white">รหัสลูกค้า / ชื่อร้าน *</Label>
                            <Input
                                placeholder="พิมพ์รหัส หรือชื่อร้าน..."
                                className="bg-white dark:bg-[#1e293b] border-gray-600"
                            />
                        </div>

                    </div>


                    <div className="space-y-4">
                        {/* ROW 2 */}
                        <div className="grid md:grid-cols-5 gap-4">
                            <Input placeholder="ชื่อร้าน" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="เจ้าของ" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="เบอร์โทร" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="ประเภทร้าน" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="ประเภทลูกค้า" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                        </div>

                        {/* ROW 3 */}
                        <div className="grid md:grid-cols-5 gap-4">
                            <Input placeholder="สินค้าใช้" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="ปริมาณ" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="ระยะเวลาสั่ง" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="รับของเดิมจาก" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                            <Input placeholder="เงื่อนไขชำระ" className="bg-white text-black  dark:bg-[#1e293b] border-gray-600" />
                        </div>
                    </div>


                    {/* NOTE */}
                    <div className="space-y-2">
                        <Label className="text-black dark:text-white">บันทึกแผน</Label>
                        <Textarea
                            placeholder="วัตถุประสงค์ เป้าหมาย..."
                            className="bg-white text-black dark:bg-[#1e293b] border-gray-600 min-h-[80px]"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button className="bg-blue-600 text-yellow-300 text-md hover:bg-blue-700">
                            + เพิ่มแผน
                        </Button>
                        <Button variant="default">
                            ล้างฟอร์ม
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* TABLE */}
            <div className="mt-8">
                <h3 className="text-sm font-semibold mb-3 text-black dark:text-white">
                    รายการ <span className="text-blue-400">แผน</span>
                </h3>

                <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#1e293b]">
                            <TableRow>
                                <TableHead>วันที่</TableHead>
                                <TableHead>รหัส</TableHead>
                                <TableHead>ชื่อร้าน</TableHead>
                                <TableHead>เซลล์</TableHead>
                                <TableHead>หัวข้อเข้าพบ</TableHead>
                                <TableHead>บันทึก</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-gray-400">
                                    ไม่มีแผนสำหรับสัปดาห์นี้
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>

        </div>
    )
}