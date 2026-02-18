import React from 'react';
import { X, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface VisitDetailModalProps {
    visit: any
    onClose: () => void
}

export function VisitDetailModal({ visit, onClose }: VisitDetailModalProps) {
    if (!visit) return null

    // Format Date
    const dateStr = visit.date ? format(new Date(visit.date), "d/M/yyyy", { locale: th }) : "-"

    // Status Color
    const isClosed = visit.dealStatus === "ปิดการขาย"
    const statusColor = isClosed ? "text-emerald-500" : "text-rose-500"
    const statusBg = isClosed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"

    // Helper for rendering rows
    const DetailRow = ({ label, value, className }: { label: string, value?: any, className?: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1">
            <span className="w-32 shrink-0 text-slate-400 font-medium text-sm">{label}</span>
            <span className={cn("text-slate-200 font-medium text-sm break-words flex-1", className)}>
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
            <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50 shrink-0">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        รายละเอียด
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="p-6 space-y-6">

                        {/* Grid Data */}
                        <div className="grid grid-cols-1 gap-y-2">
                            <DetailRow label="วันที่" value={dateStr} />
                            <DetailRow label="เซลล์" value={visit.sales} />
                            <DetailRow label="รหัส" value={visit.store?.code || visit.storeRef} />
                            <DetailRow label="ชื่อร้าน" value={visit.store?.name} />
                            <DetailRow label="เจ้าของ" value={visit.store?.owner} />
                            <DetailRow label="เบอร์โทร" value={visit.store?.phone} />
                            <DetailRow label="ประเภทร้าน" value={visit.store?.type} />
                            <DetailRow label="ประเภทลูกค้า" value={visit.store?.customerType || visit.visitCat} />
                            <DetailRow label="ที่อยู่" value={visit.store?.address} />
                            <DetailRow label="สินค้า" value={visit.store?.productUsed} />
                            <DetailRow label="ปริมาณ" value={visit.store?.quantity} />
                            <DetailRow label="ระยะเวลาสั่ง" value={visit.store?.orderPeriod} />
                            <DetailRow label="รับของจาก" value={visit.store?.supplier} />
                            <DetailRow label="เงื่อนไขชำระ" value={visit.store?.payment} />

                            <div className="border-t border-slate-800 my-2"></div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1">
                                <span className="w-32 shrink-0 text-slate-400 font-medium text-sm">หัวข้อเข้าพบ</span>
                                <span className="inline-flex px-2 py-0.5 rounded text-emerald-300 bg-emerald-900/30 text-xs font-bold border border-emerald-500/20">
                                    {visit.visitCat || "-"}
                                </span>
                            </div>

                            <DetailRow label="ประเภทเข้าพบ" value={visit.visitType} />

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-1 mt-1">
                                <span className="w-32 shrink-0 text-slate-400 font-medium text-sm">สถานะ:</span>
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-max", statusBg, statusColor)}>
                                    {isClosed ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                    {visit.dealStatus}
                                </span>
                            </div>
                        </div>

                        {/* Visit Notes */}
                        <div className="space-y-3 pt-4 border-t border-slate-800">
                            <h3 className="text-slate-400 font-medium text-sm">บันทึกเข้าพบ</h3>
                            {visit.notes && Object.keys(visit.notes).length > 0 ? (
                                <div className="space-y-3">
                                    {Object.entries(visit.notes).map(([key, note]: [string, any]) => (
                                        <div key={key} className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                                            <div className="text-xs text-blue-400 font-bold mb-2 uppercase tracking-wider">ครั้งที่ {key}</div>
                                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                                                {typeof note === 'string' ? note : (note?.text || JSON.stringify(note))}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-500 italic text-sm">ไม่มีบันทึก</div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

