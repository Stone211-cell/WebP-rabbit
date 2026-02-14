"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import PurchaseDialog from "@/components/purchase/PurchaseDialog"
import axios from "axios"

export default function OrderTracking({ stores, visits }: any) {
    const [data, setData] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")

    const fetchData = async () => {
        // ===============================
        // 🔥 Axios (คอมเมนต์ไว้ตามสั่ง)
        // ===============================
        /*
        const res = await axios.get("/api/purchase", {
          params: { search, status },
        })
        setData(res.data)
        */

        setData([]) // mock
    }

    useEffect(() => {
        fetchData()
    }, [search, status])

    return (
        <div className="min-h-screen space-y-6 p-6 dark:bg-[#0f172a] bg-slate-50 text-slate-900 dark:text-slate-100">

            <div className="flex justify-between items-center dark:bg-[#0f172a]">
                <h1 className="text-xl font-semibold dark:text-white">
                    ติดตามการซื้อของลูกค้า
                </h1>
                {/* <PurchaseDialog onSuccess={fetchData} /> */}
            </div>

            <div className="flex gap-4 dark:bg-[#0f172a]">
                <Input
                    placeholder="ค้นหาร้าน, รอบบิล..."
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white dark:bg-[#1e293b] dark:text-white border-slate-200 dark:border-slate-700"
                />

                <Select
                    defaultValue="all"
                    onValueChange={(val) => setStatus(val)}
                >
                    <SelectTrigger className="w-48 bg-white dark:bg-[#1e293b] dark:text-white border-slate-200 dark:border-slate-700">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-[#1e293b] dark:border-slate-700">
                        <SelectItem value="all" className="dark:text-white dark:focus:bg-slate-800">ทั้งหมด</SelectItem>
                        <SelectItem value="paid" className="dark:text-white dark:focus:bg-slate-800">ซื้อแล้ว</SelectItem>
                        <SelectItem value="pending" className="dark:text-white dark:focus:bg-slate-800">ยังไม่ซื้อ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Table className="bg-white dark:bg-[#1e293b] rounded-lg overflow-hidden border dark:border-slate-800">
                <TableHeader className="bg-slate-50 dark:bg-[#0f172a]">
                    <TableRow className="border-b dark:border-slate-700 hover:bg-transparent">
                        <TableHead className="dark:text-slate-300">รอบบิล</TableHead>
                        <TableHead className="dark:text-slate-300">วันที่</TableHead>
                        <TableHead className="dark:text-slate-300">ชื่อร้าน</TableHead>
                        <TableHead className="dark:text-slate-300">สถานะ</TableHead>
                        <TableHead className="dark:text-slate-300">ยอดซื้อ</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.length === 0 ? (
                        <TableRow className="hover:bg-transparent dark:border-slate-700">
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground dark:text-slate-500">
                                ไม่มีข้อมูล
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <TableCell className="dark:text-slate-200">{item.round}</TableCell>
                                <TableCell className="dark:text-slate-200">{item.date}</TableCell>
                                <TableCell className="dark:text-slate-200">{item.storeName}</TableCell>
                                <TableCell className="dark:text-slate-200">{item.status}</TableCell>
                                <TableCell className="dark:text-slate-200">{item.amount}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

        </div>
    )
}