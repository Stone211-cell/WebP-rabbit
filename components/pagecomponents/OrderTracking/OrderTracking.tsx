"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from "axios"

import { handleApiError } from "@/lib/handleError"
import PurchaseDialog from "@/components/purchase/PurchaseDialog"
import { Button } from "@/components/ui/button"
import { exportToExcel } from "@/lib/exportexcel/export"
import { Upload, Trash2, CheckCircle, Package } from "lucide-react"
import { toast } from "sonner"
import * as React from "react"
import { cn, formatThaiDate, confirmDelete } from "@/lib/utils"

export default function OrderTracking({ stores, visits, isAdmin }: any) {
    const [posts, setPosts] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("all")
    const fileInputRef = React.useRef<HTMLInputElement>(null)

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

    const handleDelete = async (id: string) => {
        if (!confirmDelete("รายการคำสั่งซื้อนี้")) return
        try {
            await axios.delete(`/api/OrderTracking/${id}`)
            toast.success("ลบรายการสำเร็จ")
            handleCreate()
        } catch (error) {
            handleApiError(error)
        }
    }

    const toggleStatus = async (id: string, currentStatus: string) => {
        if (!isAdmin) return;
        try {
            const newStatus = currentStatus === "paid" ? "pending" : "paid";
            // Optimistic rendering
            setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
            await axios.patch(`/api/OrderTracking/${id}`, { status: newStatus })
            toast.success("อัปเดตสถานะการสั่งซื้อสำเร็จ")
        } catch (error) {
            handleApiError(error)
            handleCreate() // Revert
        }
    }

    const handleExport = () => {
        const dataToExport = posts.map((post: any, index: number) => ({
            "ลำดับ": index + 1,
            "รอบบิล": post.round || "-",
            "วันที่": post.date ? formatThaiDate(post.date, "dd/MM/yyyy") : "-",
            "ชื่อร้าน": stores?.find((s: any) => s.id === post.storeId)?.name || "ไม่พบชื่อร้าน",
            "สถานะ": post.status === "paid" ? "ซื้อแล้ว" : "ยังไม่ซื้อ",
            "ยอดซื้อ": post.amount || 0
        }));
        exportToExcel(dataToExport, "OrderTracking", "ติดตามสินค้า");
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        toast.loading('กำลังโหลดการสั่งซื้อ...', { id: 'import-order' });
        try {
            const formData = new FormData()
            formData.append("file", file)

            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const bstr = evt.target?.result;
                    const XLSX = await import("xlsx");
                    const wb = XLSX.read(bstr, { type: 'array', cellDates: true });
                    const wsname = wb.SheetNames.find(n => n.includes('สั่งซื้อ') || n.includes('Order')) || wb.SheetNames[0];
                    const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

                    const res = await fetch("/api/OrderTracking/import", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data)
                    });
                    const info = await res.json();
                    if (res.ok) {
                        toast.success(info.message || "นำเข้าข้อมูลสำเร็จ", { id: 'import-order' });
                        handleCreate(); // reload the table 
                    } else {
                        toast.error(info.error || "เกิดข้อผิดพลาดในการนำเข้า", { id: 'import-order' });
                    }
                } catch (err) {
                    toast.error("รูปแบบไฟล์ไม่ถูกต้อง", { id: 'import-order' });
                }
            }
            reader.readAsArrayBuffer(file);
        } catch (error) {
            handleApiError(error);
            toast.dismiss('import-order');
        }
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 dark:border-slate-800/50 shadow-xl">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-500"><Package size={24} /></span>
                        ติดตาม <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">คำสั่งซื้อ</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-14 italic">จัดการและติดตามสถานะการซื้อสินค้าของลูกค้า</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImportExcel}
                                />
                                <Button
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="font-black px-4 h-12 rounded-2xl shadow-sm transition-all active:scale-95 bg-white/50 border-amber-200 text-amber-600 hover:bg-amber-50 dark:bg-slate-800/50 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-900/50"
                                >
                                    <Upload className="w-5 h-5 mr-2" /> นำเข้า Excel
                                </Button>
                            </>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="font-black px-4 h-12 rounded-2xl shadow-sm transition-all active:scale-95 bg-white/50 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:bg-slate-800/50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                            <span className="text-lg mr-2">📥</span> ส่งออก Excel
                        </Button>
                    </div>
                    {isAdmin && <PurchaseDialog stores={stores} onSuccess={handleCreate} />}
                </div>
            </div>

            {/* FILTER SECTION */}
            <div className="flex flex-wrap gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/20 dark:border-slate-800/50 shadow-sm">
                <Input
                    placeholder="ค้นหารอบบิล..."
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 bg-white dark:bg-slate-800 h-11 border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />

                <Select
                    defaultValue="all"
                    onValueChange={(val) => setStatus(val)}
                >
                    <SelectTrigger className="w-full md:w-48 bg-white dark:bg-slate-800 h-11 border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700 rounded-xl">
                        <SelectItem value="all" className="font-medium">ทั้งหมด</SelectItem>
                        <SelectItem value="paid" className="font-medium">✅ ซื้อแล้ว</SelectItem>
                        <SelectItem value="pending" className="font-medium">⌛ ยังไม่ซื้อ</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow className="border-slate-100 dark:border-slate-800/50">
                            <TableHead className="py-4 font-black uppercase text-[10px] pl-6 text-center w-[60px] hidden md:table-cell">ลำดับ</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] hidden sm:table-cell">รอบบิล</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] w-[100px] hidden md:table-cell">วันที่</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] min-w-[200px]">ร้านค้า</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] w-[120px] hidden sm:table-cell text-center">สถานะ</TableHead>
                            <TableHead className="py-4 font-black uppercase text-[10px] w-[110px] text-right">ยอดซื้อ (฿)</TableHead>
                            {isAdmin && <TableHead className="py-4 font-black uppercase text-[10px] w-[110px] text-right pr-6">จัดการ</TableHead>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center h-32 text-slate-400 font-medium italic">
                                    ไม่พบข้อมูลรายการคำสั่งซื้อ...
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post: any, index: number) => (
                                <TableRow key={post.id} className="border-slate-50 dark:border-slate-800/50 hover:bg-blue-500/5 transition-colors group">
                                    <TableCell className="text-center font-bold text-slate-500 text-xs pl-6 hidden md:table-cell w-[60px]">{index + 1}</TableCell>
                                    <TableCell className="font-bold text-slate-700 dark:text-slate-300 text-sm hidden sm:table-cell w-[100px] break-words whitespace-normal">{post.round}</TableCell>
                                    <TableCell className="font-medium text-slate-500 text-xs hidden md:table-cell w-[100px]">
                                        {post.date ? formatThaiDate(post.date, "dd/MM/yyyy") : "-"}
                                    </TableCell>
                                    <TableCell className="min-w-[200px] break-words whitespace-normal py-4">
                                        <div className="font-black text-slate-900 dark:text-white text-sm line-clamp-2">
                                            {stores?.find((s: any) => s.id === post.storeId)?.name || "ไม่พบชื่อร้าน"}
                                        </div>
                                        {/* Mobile info (status & date) fallback */}
                                        <div className="sm:hidden mt-2 text-xs flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    disabled={!isAdmin}
                                                    onClick={() => toggleStatus(post.id, post.status)}
                                                    className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold transition-all border",
                                                        post.status === "paid"
                                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
                                                        !isAdmin && "opacity-75 cursor-default hover:bg-transparent"
                                                    )}
                                                >
                                                    {post.status === "paid" ? <><CheckCircle size={12} /> ซื้อแล้ว</> : <><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> ยังไม่ซื้อ</>}
                                                </button>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 w-[120px] hidden sm:table-cell align-middle text-center">
                                        <button
                                            disabled={!isAdmin}
                                            onClick={() => toggleStatus(post.id, post.status)}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500/50",
                                                post.status === "paid"
                                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40",
                                                !isAdmin && "opacity-80 cursor-default hover:bg-emerald-500/10 hover:border-emerald-500/20 shadow-none"
                                            )}
                                        >
                                            {post.status === "paid" ? <><CheckCircle size={14} className="text-emerald-500" /> ซื้อแล้ว</> : <><div className="w-2 h-2 rounded-full bg-amber-500/80 animate-pulse"></div> ยังไม่ซื้อ</>}
                                        </button>
                                    </TableCell>
                                    <TableCell className="w-[110px] text-right font-black text-sm text-blue-600 dark:text-blue-400">
                                        {post.amount ? post.amount.toLocaleString() : "-"}
                                    </TableCell>
                                    {isAdmin && (
                                        <TableCell className="w-[110px] text-right pr-6 align-middle">
                                            <div className="flex justify-end gap-1.5 items-center">
                                                <PurchaseDialog stores={stores} onSuccess={handleCreate} editingItem={post} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(post.id)}
                                                    className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0"
                                                    title="ลบ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}