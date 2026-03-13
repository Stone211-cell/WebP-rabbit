"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"
import { handleApiError } from "@/lib/handleError"
import { toast } from "sonner"
import { useStoreSearch } from "@/components/hooks/useStoreSearch"
import { StoreSearchBox } from "@/components/crmhelper/StoreSearchBox"
import { Edit } from "lucide-react"

export default function PurchaseDialog({ stores, onSuccess, editingItem }: any) {
    const [open, setOpen] = useState(false)
    const [round, setRound] = useState("")
    const [date, setDate] = useState("")
    const [amount, setAmount] = useState("0")
    const [isPaid, setIsPaid] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 🔍 ใช้ Hook จัดการค้นหาร้านค้า
    const {
        storeSearch,
        setStoreSearch,
        isSearching,
        suggestions,
        showSuggestions,
        selectedStore,
        selectStore,
        clearStore,
        handleManualSearch
    } = useStoreSearch()

    useEffect(() => {
        if (open) {
            if (editingItem) {
                setRound(editingItem.round || "")
                setDate(editingItem.date ? new Date(editingItem.date).toLocaleDateString('en-CA') : "")
                setAmount(editingItem.amount?.toString() || "0")
                setIsPaid(editingItem.status === "paid")
                const store = stores?.find((s: any) => s.id === editingItem.storeId)
                if (store) selectStore(store)
            } else {
                setRound("")
                setDate(new Date().toLocaleDateString('en-CA'))
                clearStore()
                setAmount("0")
                setIsPaid(false)
            }
        }
    }, [open, editingItem, stores])

    // 🚀 จัดการการบันทึก
    const handleSave = async () => {
        if (!round || !date || !selectedStore) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
            return
        }

        setIsSubmitting(true)
        try {
            if (editingItem) {
                await axios.patch(`/api/OrderTracking/${editingItem.id}`, {
                    round,
                    date,
                    storeId: selectedStore.id,
                    amount: parseFloat(amount),
                    status: isPaid ? "paid" : "pending"
                })
                toast.success("อัปเดตรายการสั่งซื้อสำเร็จ")
            } else {
                await axios.post("/api/OrderTracking", {
                    round,
                    date,
                    storeId: selectedStore.id,
                    amount: parseFloat(amount),
                    status: isPaid ? "paid" : "pending"
                })
                toast.success("บันทึกรายการสั่งซื้อสำเร็จ")
            }

            setOpen(false)
            onSuccess?.()
        } catch (error) {
            handleApiError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {editingItem ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg shrink-0">
                        <Edit className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black px-6 py-2 rounded-xl shadow-lg transition-transform active:scale-95">
                        + เพิ่มรายการสั่งซื้อ
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="p-2 bg-blue-500/10 rounded-xl">🛒</span>
                        {editingItem ? <span className="text-blue-600">แก้ไขคำสั่งซื้อ</span> : <>เพิ่ม <span className="text-blue-600">รายการสั่งซื้อ</span></>}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-400 uppercase">รอบบิล *</Label>
                            <Input
                                value={round}
                                onChange={(e) => setRound(e.target.value)}
                                placeholder="ต.ค. 67"
                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-400 uppercase">วันที่ *</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl font-bold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <Label className="text-xs font-black text-slate-400 uppercase">เลือกร้านค้า *</Label>
                        <StoreSearchBox
                            storeSearch={storeSearch}
                            setStoreSearch={setStoreSearch}
                            suggestions={suggestions}
                            showSuggestions={showSuggestions}
                            selectedStore={selectedStore}
                            selectStore={selectStore}
                            clearStore={clearStore}
                            handleManualSearch={handleManualSearch}
                            isSearching={isSearching}
                            placeholder="ค้นหารหัส หรือ ชื่อร้าน..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label className="text-xs font-black text-slate-400 uppercase">ยอดคำสั่งซื้อ (บาท)</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 h-11 rounded-xl font-black text-blue-600"
                            />
                        </div>
                        <div className="flex items-center gap-3 h-11 px-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800/50">
                            <Checkbox
                                id="isPaid"
                                checked={isPaid}
                                onCheckedChange={(val: boolean) => setIsPaid(val)}
                                className="rounded-md border-slate-400 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                            />
                            <Label htmlFor="isPaid" className="text-sm font-black text-slate-600 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                                <span className="opacity-0 group-data-[state=checked]:opacity-100">✅</span> ชำระเงินแล้ว
                            </Label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black h-14 rounded-2xl shadow-xl transition-all active:scale-95 shadow-blue-500/20"
                        >
                            {isSubmitting ? "กำลังประมวลผล..." : "💾 บันทึกรายการ"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="h-14 px-8 rounded-2xl font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        >
                            ยกเลิก
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
