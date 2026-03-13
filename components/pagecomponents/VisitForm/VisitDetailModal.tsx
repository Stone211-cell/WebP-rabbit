import React from 'react';
import { X, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn, formatThaiDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface VisitDetailModalProps {
    visit: any
    onClose: () => void
}

export function VisitDetailModal({ visit, onClose }: VisitDetailModalProps) {
    if (!visit) return null

    // Format Date
    const dateStr = formatThaiDate(visit.date, "d/MM/yyyy")

    // Status Color
    const isClosed = visit.dealStatus === "ปิดการขาย"
    const statusColor = isClosed ? "text-emerald-500" : "text-rose-500"
    const statusBg = isClosed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"

    // Helper for rendering rows
    const DetailRow = ({ label, value, className }: { label: string, value?: any, className?: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1">
            <span className="w-32 shrink-0 text-slate-500 dark:text-slate-400 font-medium text-sm">{label}</span>
            <span className={cn("text-slate-900 dark:text-slate-200 font-medium text-sm break-words flex-1", className)}>
                {value || "-"}
            </span>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        รายละเอียด
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="p-6 space-y-6">

                        {/* Grid Data */}
                        <div className="grid grid-cols-1 gap-y-2">
                            <DetailRow label="วันที่" value={dateStr} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="เซลล์" value={visit.sales} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="รหัส" value={visit.store?.code || visit.storeRef} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ชื่อร้าน" value={visit.store?.name} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="เจ้าของ" value={visit.store?.owner} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="เบอร์โทร" value={visit.store?.phone} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ประเภทร้าน" value={visit.store?.type} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ประเภทลูกค้า" value={visit.store?.customerType || visit.visitCat} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ที่อยู่" value={visit.store?.address} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="สินค้า" value={visit.store?.productUsed} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ปริมาณ" value={visit.store?.quantity} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="ระยะเวลาสั่ง" value={visit.store?.orderPeriod} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="รับของจาก" value={visit.store?.supplier} className="text-slate-900 dark:text-slate-200" />
                            <DetailRow label="เงื่อนไขชำระ" value={visit.store?.payment} className="text-slate-900 dark:text-slate-200" />

                            <div className="border-t border-slate-100 dark:border-slate-800 my-2"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1">
                                <span className="w-32 shrink-0 text-slate-400 font-medium text-sm">หัวข้อเข้าพบ</span>
                                <span className="inline-flex px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-bold border border-emerald-500/20">
                                    {visit.visitCat || "-"}
                                </span>
                            </div>

                            <DetailRow label="ประเภทเข้าพบ" value={visit.visitType} className="text-slate-900 dark:text-slate-200" />

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1 mt-1">
                                <span className="w-32 shrink-0 text-slate-400 font-medium text-sm">สถานะ:</span>
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-max", statusBg, statusColor)}>
                                    {isClosed ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                    {visit.dealStatus}
                                </span>
                            </div>
                        </div>

                        {/* Visit Notes */}
                        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-slate-400 font-medium text-sm">บันทึกเข้าพบ</h3>
                            {visit.notes ? (
                                <div className="space-y-3">
                                    {typeof visit.notes === 'string' ? (
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-black mb-0 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">บันทึกทั่วไป</div>
                                                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50"></div>
                                            </div>
                                            <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                                {visit.notes}
                                            </p>
                                        </div>
                                    ) : (
                                        Object.entries(visit.notes)
                                            .filter(([key]) => !isNaN(Number(key))) // กรองเฉพาะ key ที่เป็นตัวเลข
                                            .sort(([a], [b]) => Number(a) - Number(b)) // เรียงน้อยไปมาก
                                            .map(([key, note]: [string, any]) => (
                                                <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-black mb-0 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">ครั้งที่ {key}</div>
                                                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700/50"></div>
                                                    </div>
                                                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                                        {typeof note === 'string' ? note : (note?.text || note?.voice || JSON.stringify(note))}
                                                    </p>
                                                </div>
                                            ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-slate-400 dark:text-slate-500 italic text-sm">ไม่มีบันทึก</div>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    )
}

