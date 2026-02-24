import React from 'react';
import { X, AlertTriangle, Lock } from "lucide-react"
import { cn, formatThaiDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StoreDetailModalProps {
    store: any
    issues: any[]
    visits: any[]
    onClose: () => void
}

export function StoreDetailModal({ store, issues = [], visits = [], onClose }: StoreDetailModalProps) {
    if (!store) return null

    // Filter data for this specific store
    const storeIssues = issues.filter(i => i.masterId === store.id)
    const storeVisits = visits.filter(v => v.masterId === store.id)

    // Sort visits latest first for display
    const sortedVisits = [...storeVisits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const sortedIssues = [...storeIssues].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const DetailRow = ({ label, value, className }: { label: string, value?: any, className?: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-700/50 last:border-0">
            <span className="w-32 shrink-0 text-slate-400 font-bold text-xs uppercase tracking-wider">{label}</span>
            <span className={cn("text-slate-200 font-bold text-sm break-words flex-1", className)}>
                {value || "-"}
            </span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-[#1e293b] border border-slate-700 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-[#0f172a] shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        รายละเอียด
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="p-6 md:p-8 space-y-8">

                        {/* Store Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
                            <DetailRow label="รหัสร้าน" value={<span className="text-blue-400">{store.code}</span>} />
                            <DetailRow label="ชื่อร้าน" value={store.name} />
                            <DetailRow label="เจ้าของ" value={store.owner} />
                            <DetailRow label="เบอร์โทร" value={store.phone} />
                            <DetailRow label="ประเภทร้าน" value={store.type} />
                            <DetailRow label="ประเภทลูกค้า" value={store.customerType} />
                            <DetailRow label="ที่อยู่" className="md:col-span-2 lg:col-span-3" value={store.address} />
                            <DetailRow label="สินค้า" value={store.productUsed} />
                            <DetailRow label="ปริมาณ" value={store.quantity} />
                            <DetailRow label="ระยะเวลาสั่ง" value={store.orderPeriod} />
                            <DetailRow label="รับของจาก" value={store.supplier} />
                            <DetailRow label="เงื่อนไขชำระ" value={store.payment} />
                            <DetailRow label="คะแนนการชำระเงิน" value={store.paymentScore ? `${store.paymentScore} ดาว` : "-"} />
                            <DetailRow label="สถานะ" className="md:col-span-2 lg:col-span-3" value={
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black shadow-sm",
                                    store.status === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                )}>
                                    {store.status === "เปิดการขาย" ? "🟢 เปิดการขาย" : "🔴 ปิดการขาย"}
                                </span>
                            } />
                        </div>

                        <div className="border-t border-slate-700"></div>

                        {/* FAQ Section */}
                        <div className="space-y-4 pt-2">
                            <h3 className="text-lg font-black text-rose-500 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                FAQ / ปัญหา & คำร้องเรียน ({sortedIssues.length} รายการ)
                            </h3>

                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 md:p-6 space-y-4 relative">
                                {sortedIssues.length === 0 ? (
                                    <div className="text-center py-4 text-rose-400/50 text-sm font-bold">ไม่มีประวัติปัญหา / คำร้องเรียน</div>
                                ) : (
                                    sortedIssues.map((issue) => (
                                        <div key={issue.id} className="bg-[#0f172a]/50 p-4 rounded-xl border border-rose-500/10 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-rose-500 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> ปัญหา: {issue.type}
                                                </div>
                                                <div className="text-xs text-rose-400 font-medium opacity-80">{formatThaiDate(issue.date, "dd/MM/yyyy")}</div>
                                            </div>
                                            <div className="bg-[#1e293b] p-3 border border-slate-700 rounded-lg text-sm text-slate-200">
                                                {issue.detail || "-"}
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
                                                <span className="text-slate-400">ผู้บันทึก: <span className="text-blue-400">{issue.recorder}</span></span>
                                                <span className="text-slate-400">
                                                    สถานะ: <span className={cn(
                                                        "ml-1",
                                                        issue.status === 'done' ? "text-emerald-500" : issue.status === 'fixing' ? "text-blue-500" : "text-amber-500"
                                                    )}>
                                                        {issue.status === 'done' ? "🟢 ดำเนินการแล้ว" : issue.status === 'fixing' ? "🔵 กำลังแก้ไข" : "🟡 รอดำเนินการ"}
                                                    </span>
                                                </span>
                                            </div>
                                            {issue.notes && (
                                                <div className="bg-[#0f172a] p-3 border border-slate-700 rounded-lg text-sm text-slate-400">
                                                    <span className="text-slate-300 font-bold">หมายเหตุ:</span> {issue.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Lock Warning */}
                                <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center justify-center gap-2 text-rose-500 text-sm font-bold">
                                    <Lock className="w-4 h-4 text-rose-500/70" />
                                    ข้อมูล FAQ เป็นข้อมูลถาวร ไม่สามารถลบหรือแก้ไขได้
                                </div>
                            </div>
                        </div>


                        {/* Visit History Section */}
                        <div className="space-y-4 pt-6">
                            <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
                                📋 ประวัติการเข้าพบ ({sortedVisits.length} ครั้ง)
                            </h3>

                            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-4 md:p-6 space-y-4">
                                {sortedVisits.length === 0 ? (
                                    <div className="text-center py-4 text-slate-500 text-sm font-bold">ไม่มีประวัติการเข้าพบ</div>
                                ) : (
                                    sortedVisits.map((v, index) => (
                                        <div key={v.id} className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/50 pb-3">
                                                <div className="font-black text-md text-white flex gap-2 items-center">
                                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                    บันทึกที่ {sortedVisits.length - index}
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium">{formatThaiDate(v.date, "dd/MM/yyyy")}</div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold pt-1">
                                                <div>
                                                    <span className="text-slate-400 mr-2">เซลล์:</span>
                                                    <span className="text-blue-400">{v.sales}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 mr-2">หัวข้อ:</span>
                                                    <span className="text-slate-300">{v.visitCat || "-"}</span>
                                                </div>
                                                <div className="sm:text-right">
                                                    <span className="text-slate-400 mr-2">สถานะ:</span>
                                                    <span className={cn(
                                                        v.dealStatus === "เปิดการขาย" ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                        {v.dealStatus === "เปิดการขาย" ? "🟢 เปิดการขาย" : "🔴 ปิดการขาย"}
                                                    </span>
                                                </div>
                                            </div>

                                            {v.notes && Object.keys(v.notes).length > 0 && (
                                                <div className="bg-[#0f172a] p-3 border border-slate-700 rounded-lg text-sm text-slate-300 mt-2 space-y-2">
                                                    {Object.entries(v.notes).map(([key, note]: [string, any]) => (
                                                        <div key={key} className="flex gap-2">
                                                            <span className="shrink-0 w-max px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-black h-fit">ครั้งที่ {key}</span>
                                                            <p className="whitespace-pre-wrap leading-relaxed text-xs pt-0.5">
                                                                {typeof note === 'string' ? note : (note?.text || JSON.stringify(note))}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}

                                {/* Lock Warning */}
                                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-center gap-2 text-amber-500 text-sm font-bold">
                                    <AlertTriangle className="w-4 h-4 text-amber-500/70" />
                                    ประวัติเหล่านี้เป็นข้อมูลถาวร ไม่สามารถลบหรือแก้ไขได้
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
