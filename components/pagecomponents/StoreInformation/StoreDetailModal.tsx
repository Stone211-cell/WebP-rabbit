import React from 'react';
import { X, AlertTriangle, Lock, User, Calendar as CalendarIcon, Phone, MapPin, Package, Scale, Clock, Truck, CreditCard, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

    const InfoSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
        <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                {icon} {title}
            </h3>
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 shadow-sm">
                {children}
            </div>
        </div>
    )

    const DetailItem = ({ label, value, className, icon }: { label: string, value?: any, className?: string, icon?: string }) => (
        <div className={cn("flex flex-col gap-1", className)}>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                {icon} {label}
            </span>
            <div className="text-slate-900 dark:text-slate-100 font-bold text-sm leading-relaxed break-words">
                {value || "-"}
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 dark:bg-slate-950/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[92vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-7 border-b border-slate-100 dark:border-slate-800/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shrink-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                            <span className="text-blue-500">📋</span> รายละเอียดร้านค้า
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 px-1">
                            <span>รหัส:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono text-[14px]">{store.code}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-10 w-10">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    <div className="p-7 md:p-10 space-y-10">

                        {/* SECTION 1: GENERAL INFO */}
                        <InfoSection title="ข้อมูลพื้นฐาน" icon="🏢">
                            <DetailItem label="ชื่อร้านค้า" value={store.name} className="sm:col-span-1" />
                            <DetailItem label="ชื่อเจ้าของ" value={store.owner} />
                            <DetailItem label="เบอร์โทรศัพท์" value={store.phone} icon="📞" />
                            <DetailItem label="ประเภทร้านค้า" value={store.type} />
                            <DetailItem label="ประเภทลูกค้า" value={store.customerType} />
                            <DetailItem label="ที่อยู่อย่างละเอียด" value={store.address} className="sm:col-span-2" icon="📍" />
                        </InfoSection>

                        {/* SECTION 2: LOGISTICS & PRODUCTS */}
                        <InfoSection title="การสั่งซื้อและสินค้า" icon="📦">
                            <DetailItem label="สินค้าที่ใช้" value={store.productUsed} />
                            <DetailItem label="ปริมาณการสั่ง" value={store.quantity} icon="⚖️" />
                            <DetailItem label="รอบในการสั่ง" value={store.orderPeriod} icon="🕒" />
                            <DetailItem label="รับสินค้าจาก" value={store.supplier} icon="🚚" />
                        </InfoSection>

                        {/* SECTION 3: FINANCE & STATUS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/50 p-6 flex flex-col sm:flex-row gap-8 shadow-sm">
                                <DetailItem label="เงื่อนไขการชำระเงิน" value={store.payment} icon="💳" className="flex-1" />
                                <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-800 h-10 self-center"></div>
                                <DetailItem label="คะแนนความน่าเชื่อถือ" value={
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <span key={s} className={cn("text-lg", s <= (store.paymentScore || 0) ? "text-amber-400" : "text-slate-200 dark:text-slate-800")}>★</span>
                                        ))}
                                    </div>
                                } className="flex-1" />
                            </div>
                            
                            <div className={cn(
                                "rounded-[1.5rem] p-6 flex flex-col items-center justify-center gap-2 border shadow-sm",
                                store.status === "เปิดการขาย" 
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400"
                            )}>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">สถานะปัจจุบัน</span>
                                <span className="text-xl font-black">{store.status === "เปิดการขาย" ? "🟢 เปิดการขาย" : "🔴 ปิดการขาย"}</span>
                            </div>
                        </div>

                        <Separator className="bg-slate-100 dark:bg-slate-800/50" />

                        {/* FAQ SECTION */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[18px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6" />
                                    แจ้งปัญหา & คำร้องเรียน
                                </h3>
                                <Badge variant="outline" className="rounded-full bg-rose-500/10 text-rose-600 border-rose-500/20 px-4 font-bold">
                                    {sortedIssues.length} รายการ
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {sortedIssues.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800/50 text-slate-400 font-bold italic tracking-wide">
                                        ไม่พบประวัติปัญหาหรือคำร้องเรียน
                                    </div>
                                ) : (
                                    sortedIssues.map((issue) => (
                                        <div key={issue.id} className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800/60 space-y-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                                                <div className="font-black text-rose-600 dark:text-rose-400 flex items-center gap-2.5 text-base">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                                    ปัญหา: {issue.type}
                                                </div>
                                                <div className="text-[11px] text-rose-500 font-black bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/30 uppercase tracking-tighter">
                                                    📅 {formatThaiDate(issue.date, "dd MMMM yyyy")}
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-100 dark:border-slate-800/50 rounded-2xl text-[15px] text-slate-800 dark:text-slate-100 font-medium leading-relaxed shadow-inner">
                                                {issue.detail || "-"}
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <span className="p-1.5 bg-blue-500 text-white rounded-lg">👤</span>
                                                    ผู้บันทึก: <span className="text-blue-600 dark:text-blue-400">{issue.recorder}</span>
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider",
                                                    issue.status === 'done' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                                                    issue.status === 'fixing' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : 
                                                    "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                )}>
                                                    {issue.status === 'done' ? "🟢 ดำเนินการแล้ว" : issue.status === 'fixing' ? "🔵 กำลังแก้ไข" : "🟡 รอดำเนินการ"}
                                                </div>
                                            </div>
                                            {issue.notes && (
                                                <div className="bg-amber-50/50 dark:bg-amber-500/5 p-5 border border-amber-200/50 dark:border-amber-900/20 rounded-2xl text-sm text-slate-700 dark:text-slate-300">
                                                    <span className="text-amber-600 dark:text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] block mb-2">💡 หมายเหตุ / แนวทางแก้ไข</span> 
                                                    <p className="font-medium leading-relaxed italic">{issue.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div className="mt-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest opacity-80">
                                    <Lock className="w-4 h-4" />
                                    ข้อมูลถาวร ไม่สามารถลบหรือแก้ไขได้
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-slate-100 dark:bg-slate-800/50" />

                        {/* VISIT HISTORY SECTION */}
                        <div className="space-y-6 pb-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-[18px] font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <span className="text-xl">📅</span> บันทึกการเข้าพบ
                                </h3>
                                <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white border-none px-4 font-black">
                                    {sortedVisits.length} ครั้ง
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {sortedVisits.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-900/20 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800/50 text-slate-400 font-bold italic">
                                        ยังไม่เคยมีการบันทึกการเข้าพบร้าค้า
                                    </div>
                                ) : (
                                    sortedVisits.map((v, index) => (
                                        <div key={v.id} className="bg-white dark:bg-slate-900/40 p-7 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
                                            
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-50 dark:border-slate-800 pb-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-500/20">
                                                        {sortedVisits.length - index}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 dark:text-white text-lg leading-tight uppercase tracking-tight">ครั้งที่ {sortedVisits.length - index}</div>
                                                        <div className="text-xs font-bold text-slate-400">Visit Log #{v.id?.slice(-4)}</div>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-black text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    📅 {formatThaiDate(v.date, "dd MMMM yyyy")}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">พนักงานขาย</span>
                                                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                                        <span className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-[10px]">👔</span> {v.sales}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">หัวข้อการเข้าพบ</span>
                                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg w-fit border border-slate-100 dark:border-slate-700">
                                                        {v.visitCat || "-"}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ความสำเร็จ</span>
                                                    <div className={cn(
                                                        "text-sm font-black flex items-center gap-2",
                                                        v.dealStatus === "เปิดการขาย" ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                        {v.dealStatus === "เปิดการขาย" ? "✓ เปิดการขายสำเร็จ" : "✗ ปิดการขาย"}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                                                <div className="flex items-center gap-2">
                                                    <span className="opacity-50">ประเภท:</span>
                                                    <span className="text-slate-700 dark:text-slate-200">{v.visitType === 'new' ? 'ลูกค้าใหม่' : v.visitType === 'old' ? 'ลูกค้าเก่า' : v.visitType || '-'}</span>
                                                </div>
                                                {v.dealStatus === "ปิดการขาย" && (
                                                    <div className="flex items-center gap-2 text-rose-500">
                                                        <span className="opacity-50 text-slate-400">เหตุผล:</span>
                                                        <span>{v.closeReason || "ไม่ระบุ"}</span>
                                                    </div>
                                                )}
                                            </div>


                                            {v.notes && (
                                                <div className="bg-slate-50 dark:bg-[#0f172a] p-5 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 mt-4 space-y-4 shadow-sm">
                                                    {typeof v.notes === 'string' ? (
                                                        <div className="flex gap-4 items-start bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            <span className="shrink-0 w-max px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black h-fit border border-blue-500/20">บันทึกทั่วไป</span>
                                                            <p className="whitespace-pre-wrap leading-relaxed text-sm pt-0.5 flex-1 font-medium">{v.notes}</p>
                                                        </div>
                                                    ) : (
                                                        Object.entries(v.notes)
                                                            .filter(([key]) => !isNaN(Number(key)))
                                                            .sort(([a], [b]) => Number(a) - Number(b))
                                                            .map(([key, note]: [string, any]) => (
                                                                <div key={key} className="flex gap-4 items-start bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                                                    <span className="shrink-0 w-max px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black h-fit border border-emerald-500/20">ครั้งที่ {key}</span>
                                                                    <p className="whitespace-pre-wrap leading-relaxed text-sm pt-0.5 flex-1 font-medium">
                                                                        {typeof note === 'string' ? note : (note?.text || note?.voice || JSON.stringify(note))}
                                                                    </p>
                                                                </div>
                                                            ))
                                                    )}
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
