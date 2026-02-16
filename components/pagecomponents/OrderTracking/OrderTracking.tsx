"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from "axios"

import { handleApiError } from "@/lib/handleError"
import PurchaseDialog from "@/components/purchase/PurchaseDialog"
import { format } from "date-fns"

export default function OrderTracking({ stores, visits }: any) {
    const [posts, setPosts] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")

    const handleCreate = async () => {
        try {
            const res = await axios.get("/api/OrderTracking", {
                params: { search, status },
            })
            setPosts(res.data)
        } catch (error) {
            handleApiError(error)
        }
    }

    useEffect(() => {
        handleCreate()
    }, [search, status])

    return (
        <div className="min-h-screen space-y-6 p-6 dark:bg-[#0f172a] bg-slate-50 text-slate-900 dark:text-slate-100">

            <div className="flex justify-between items-center dark:bg-[#0f172a]">
                <h1 className="text-xl font-semibold dark:text-white">
                    ติดตามการซื้อของลูกค้า
                </h1>

                <PurchaseDialog stores={stores} onSuccess={handleCreate} />
            </div>

            <div className="flex gap-4 dark:bg-[#0f172a]">
                <Input
                    placeholder="ค้นหารอบบิล..."
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
                    {posts.length === 0 ? (
                        <TableRow className="hover:bg-transparent dark:border-slate-700">
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground dark:text-slate-500">
                                ไม่มีข้อมูล
                            </TableCell>
                        </TableRow>
                    ) : (
                        posts.map((post: any) => (
                            <tr key={post.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <TableCell className="dark:text-slate-200">{post.round}</TableCell>
                                <TableCell className="dark:text-slate-200">
                                    {post.date ? format(new Date(post.date), "dd/MM/yyyy") : "-"}
                                </TableCell>
                                <TableCell className="dark:text-slate-200">
                                    {stores?.find((s: any) => s.id === post.storeId)?.name || "ไม่พบชื่อร้าน"}
                                </TableCell>
                                <TableCell className="dark:text-slate-200 px-4">
                                    <div className={`
                                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                        ${post.status === "paid"
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                            : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"}
                                    `}>
                                        {post.status === "paid" ? "✅ ซื้อแล้ว" : "⌛ ยังไม่ซื้อ"}
                                    </div>
                                </TableCell>
                                <TableCell className="dark:text-slate-200 font-bold">
                                    ฿{(post.amount || 0).toLocaleString()}
                                </TableCell>
                            </tr>
                        ))
                    )}
                </TableBody>
            </Table>

        </div>
    )
}