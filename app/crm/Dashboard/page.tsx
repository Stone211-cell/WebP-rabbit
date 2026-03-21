'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import {
    format,
    addDays,
    subDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    addQuarters,
    subQuarters,
    addYears,
    subYears,
    startOfWeek,
    endOfWeek,
    startOfQuarter,
    endOfQuarter,
    isSameDay,
    isSameMonth
} from "date-fns"
import { th } from "date-fns/locale"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Download,
    Upload,
    Save,
    Database,
    Trash2,
    LayoutGrid,
    BarChart2,
    PieChart,
    Zap,
    Users,
    User,
    MapPin,
    AlertCircle,
    TrendingUp,
    Target,
    FileSpreadsheet,
    Image as ImageIcon,
    X,
    MessageSquare,
    CheckCircle2
} from "lucide-react"
import * as XLSX from 'xlsx'
import { exportToExcel } from "@/lib/exportexcel/export"
import {
    exportVisitsToExcel,
    exportPlansToExcel,
    getVisitsExportData,
    getPlansExportData,
    getStoresExportData
} from "@/lib/exportexcel/exportFormatters"
import { getExcelValue, parseExcelDate } from "@/lib/exportexcel/excel"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table"
import ChartCard from "@/components/crmhelper/charts/ChartCard"
import { useCRM } from "@/components/hooks/useCRM"

import { cn, formatThaiDate, normalizeName } from "@/lib/utils"
import { toast } from "sonner"
import { ActionButton, FilterButton } from "@/components/crmhelper/helper"
import { StoreTypes, VisitTopics, CustomerGroups } from "@/lib/types/manu"
import { useCRMSession } from "@/components/hooks/useCRMSession"

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'

// =====================================================================
// CalendarDayButton — pure CSS group-hover tooltip
// =====================================================================
type CalendarDayButtonProps = {
    day: any
    modifiers: any
    className?: string
    [key: string]: any
    getPlansForDate: (d: Date) => any[]
    getVisitsForDate: (d: Date) => any[]
}

function CalendarDayButton({ day, modifiers, getPlansForDate, getVisitsForDate, ...buttonProps }: CalendarDayButtonProps) {
    const date = day.date
    const dayPlans = getPlansForDate(date)
    const dayVisits = getVisitsForDate(date)
    const hasData = dayPlans.length > 0 || dayVisits.length > 0
    const hasClosedDeal = dayVisits.some((v: any) => v.sellSuccessful === true)

    return (
        <div className="relative w-full h-full group/day">
            <button
                {...buttonProps}
                className={cn(
                    buttonProps.className,
                    "w-full h-full flex flex-col items-center justify-start pt-1 pb-1 transition-all relative border border-transparent overflow-hidden",
                    hasData && "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 shadow-inner",
                    modifiers.today && !modifiers.selected && "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border-blue-200 dark:border-blue-800",
                    modifiers.selected && "bg-orange-500 shadow-md shadow-orange-500/20 text-white font-bold border-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500",
                    !hasData && !modifiers.today && !modifiers.selected && "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
            >
                <span className={cn(
                    "relative z-10 w-6 h-6 flex items-center justify-center rounded-full text-[13px]",
                    modifiers.selected && "text-white"
                )}>
                    {date.getDate()}
                </span>
                {hasData && (
                    <div className="flex gap-1 mt-1 justify-center z-10">
                        {dayPlans.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]" />}
                        {dayVisits.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]" />}
                        {hasClosedDeal && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />}
                    </div>
                )}
            </button>
        </div>
    )
}

export default function DashboardPage({ initialStores, initialVisits, summary, propProfiles }: any) {
    const {
        stores, fetchStores,
        visits, fetchVisits, setVisits,
        plans, fetchPlans,
        issues,
        isLoading: crmLoading,
        isValidating: crmValidating
    } = useCRM()
    const { profiles: crmProfiles, isAdmin, isLoaded } = useCRMSession()
    
    // Show detailed loading overlay only if we have NO data yet
    const isInitialLoading = (crmLoading && stores.length === 0 && visits.length === 0) || !isLoaded
    const loading = isInitialLoading // Keep 'loading' variable for compatibility if used elsewhere

    // Use provided initial props if hook data is empty (SSR/prop hydration)
    const displayStores = stores.length > 0 ? stores : (initialStores || [])
    const displayVisits = visits.length > 0 ? visits : (initialVisits || [])
    const displayPlans = plans && plans.length > 0 ? plans : (summary || [])
    const profiles = crmProfiles && crmProfiles.length > 0 ? crmProfiles : (propProfiles || [])

    // State
    const [currentDate, setCurrentDate] = useState<Date>(new Date())

    const [period, setPeriod] = useState<Period>('week')

    // Calendar Visit & Plan Popup State
    const [showVisitPopup, setShowVisitPopup] = useState(false)
    const [selectedDateVisits, setSelectedDateVisits] = useState<any[]>([])
    const [selectedDatePlans, setSelectedDatePlans] = useState<any[]>([])
    const [popupDate, setPopupDate] = useState<Date | null>(null)

    // File Input Ref for Import
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isClearing, setIsClearing] = useState(false)

    const handleClearAll = async () => {
        if (!confirm('⚠️ คำเตือน: คุณแน่ใจหรือไม่ว่าต้องการลบ "ข้อมูลทั้งหมด" ในระบบ?\n\n- ร้านค้า, การเข้าพบ, แผนงาน, สินค้า, รายการสั่งซื้อ จะถูกลบทั้งหมด\n- ข้อมูลรายชื่อผู้ใช้งาน (Profile) จะไม่ถูกลบ\n\nการดำเนินการนี้ไม่สามารถย้อนกลับได้')) return
        setIsClearing(true)
        const id = toast.loading('กำลังล้างข้อมูลโครงการ...')
        try {
            const res = await fetch('/api/nuclear', { method: 'DELETE' })
            const data = await res.json()
            toast.dismiss(id)

            if (res.ok) {
                toast.success('ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว')
                // Refresh all data via hook helpers
                fetchVisits()
                fetchPlans()
                fetchStores()
            } else {
                toast.error(data.error || "เกิดข้อผิดพลาดในการลบ")
            }
        } catch (err) {
            toast.dismiss(id)
            toast.error('เกิดข้อผิดพลาดในการลบ')
        } finally {
            setIsClearing(false)
        }
    }



    // Navigation Handlers
    const handlePrevious = () => {
        switch (period) {
            case 'day': setCurrentDate(prev => subDays(prev, 1)); break;
            case 'week': setCurrentDate(prev => subWeeks(prev, 1)); break;
            case 'month': setCurrentDate(prev => subMonths(prev, 1)); break;
            case 'quarter': setCurrentDate(prev => subQuarters(prev, 1)); break;
            case 'year': setCurrentDate(prev => subYears(prev, 1)); break;
        }
    }

    const handleNext = () => {
        switch (period) {
            case 'day': setCurrentDate(prev => addDays(prev, 1)); break;
            case 'week': setCurrentDate(prev => addWeeks(prev, 1)); break;
            case 'month': setCurrentDate(prev => addMonths(prev, 1)); break;
            case 'quarter': setCurrentDate(prev => addQuarters(prev, 1)); break;
            case 'year': setCurrentDate(prev => addYears(prev, 1)); break;
        }
    }

    const goToday = () => setCurrentDate(new Date())

    // Dynamic Labels
    const getPeriodLabel = () => {
        const options = { locale: th }
        switch (period) {
            case 'day': return `วันที่: ${formatThaiDate(currentDate, 'd MMM yyyy')}`
            case 'week': {
                const start = startOfWeek(currentDate, { weekStartsOn: 1 })
                const end = endOfWeek(currentDate, { weekStartsOn: 1 })
                return `วันที่: ${formatThaiDate(start, 'd MMM yyyy')} - ${formatThaiDate(end, 'd MMM yyyy')}`
            }
            case 'month': return `เดือน: ${formatThaiDate(currentDate, 'MMMM yyyy')}`
            case 'quarter': return `ไตรมาส: ${formatThaiDate(startOfQuarter(currentDate), 'd MMM')} - ${formatThaiDate(endOfQuarter(currentDate), 'd MMM yyyy')}`
            case 'year': return `ปี: ${formatThaiDate(currentDate, 'yyyy')}`
            case 'all': return 'ข้อมูลทั้งหมด'
            default: return formatThaiDate(currentDate, 'd MMM yyyy')
        }
    }

    const getPreviousLabel = () => {
        switch (period) {
            case 'day': return 'วันก่อนหน้า'; case 'week': return 'สัปดาห์ก่อน'; case 'month': return 'เดือนก่อน'; case 'quarter': return 'ไตรมาสก่อน'; case 'year': return 'ปีก่อน';
        }
    }
    const getNextLabel = () => {
        switch (period) {
            case 'day': return 'วันถัดไป'; case 'week': return 'สัปดาห์ถัดไป'; case 'month': return 'เดือนถัดไป'; case 'quarter': return 'ไตรมาสถัดไป'; case 'year': return 'ปีถัดไป';
        }
    }


    const getNextPeriodLabel = () => {
        switch (period) {
            case 'day': return 'วันพรุ่งนี้'
            case 'week': return 'สัปดาห์ถัดไป'
            case 'month': return 'เดือนถัดไป'
            case 'quarter': return 'ไตรมาสถัดไป'
            case 'year': return 'ปีถัดไป'
            default: return 'ถัดไป'
        }
    }

    // --- CALENDAR HELPERS (Visits & Plans) ---
    const getVisitsForDate = (date: Date) => {
        return displayVisits.filter((visit: any) => {
            const visitDate = visit.date ? new Date(visit.date) : new Date(NaN)
            if (isNaN(visitDate.getTime())) return false
            return isSameDay(visitDate, date)
        })
    }

    const getPlansForDate = (date: Date) => {
        return displayPlans.filter((plan: any) => {
            const planDate = plan.date ? new Date(plan.date) : plan.startDate ? new Date(plan.startDate) : plan.createdAt ? new Date(plan.createdAt) : new Date(NaN)
            if (isNaN(planDate.getTime())) return false
            return isSameDay(planDate, date)
        })
    }

    const handleDateClick = (date: Date) => {
        // If clicking the same day that's already selected as a 'day' period, revert to month view
        if (period === 'day' && isSameDay(date, currentDate)) {
            setPeriod('month')
            setPopupDate(null)
            setShowVisitPopup(false)
            return
        }

        // Otherwise, set the period to 'day', update the current date, and show the popup
        setPeriod('day')
        setCurrentDate(date)
        setPopupDate(date)

        // Also show the popup for a detailed view of that specific day
        const visitsOnDate = getVisitsForDate(date)
        const plansOnDate = getPlansForDate(date)

        setSelectedDateVisits(visitsOnDate)
        setSelectedDatePlans(plansOnDate)
        setShowVisitPopup(true)
    }

    // --- FILTERING & AGGREGATION ---

    // --- FILTERING LOGIC ---
    const filteredVisits = useMemo(() => {
        return displayVisits.filter((visit: any) => {
            const visitDate = new Date(visit.date)
            if (isNaN(visitDate.getTime())) return false

            switch (period) {
                case 'day': return isSameDay(visitDate, currentDate)
                case 'week': return visitDate >= startOfWeek(currentDate, { weekStartsOn: 1 }) && visitDate <= endOfWeek(currentDate, { weekStartsOn: 1 })
                case 'month': return isSameMonth(visitDate, currentDate)
                case 'year': return visitDate.getFullYear() === currentDate.getFullYear()
                case 'quarter': return visitDate >= startOfQuarter(currentDate) && visitDate <= endOfQuarter(currentDate)
                case 'all': return true
                default: return true
            }
        })
    }, [displayVisits, period, currentDate])

    const filteredPlans = useMemo(() => {
        return (plans || []).filter((plan: any) => {
            const planDate = new Date(plan.date || plan.startDate || plan.createdAt)
            if (isNaN(planDate.getTime())) return false

            switch (period) {
                case 'day': return isSameDay(planDate, currentDate)
                case 'week': return planDate >= startOfWeek(currentDate, { weekStartsOn: 1 }) && planDate <= endOfWeek(currentDate, { weekStartsOn: 1 })
                case 'month': return isSameMonth(planDate, currentDate)
                case 'year': return planDate.getFullYear() === currentDate.getFullYear()
                case 'quarter': return planDate >= startOfQuarter(currentDate) && planDate <= endOfQuarter(currentDate)
                default: return true
            }
        })
    }, [plans, period, currentDate])

    // --- STATS CALCULATION ---
    const stats = useMemo(() => {
        const closedDealsCount = filteredVisits.filter((v: any) => v.sellSuccessful === true).length
        const totalVisitsCount = filteredVisits.length

        // New Stores in Period
        const newStoresCount = displayStores.filter((s: any) => {
            const createDate = new Date(s.createdAt)
            switch (period) {
                case 'day': return isSameDay(createDate, currentDate)
                case 'week': return createDate >= startOfWeek(currentDate, { weekStartsOn: 1 }) && createDate <= endOfWeek(currentDate, { weekStartsOn: 1 })
                case 'month': return isSameMonth(createDate, currentDate)
                case 'year': return createDate.getFullYear() === currentDate.getFullYear()
                case 'quarter': return createDate >= startOfQuarter(currentDate) && createDate <= endOfQuarter(currentDate)
                default: return true
            }
        }).length

        return {
            stores: displayStores.length, // Database total
            totalVisits: totalVisitsCount,
            successRate: totalVisitsCount > 0 ? Math.round((closedDealsCount / totalVisitsCount) * 100) : 0,
            newStores: newStoresCount,
            issues: issues?.filter((i: any) => i.status !== 'resolved').length || 0, // Pending issues (current state)
            closedDeals: closedDealsCount
        }
    }, [filteredVisits, displayStores, issues, period, currentDate])



    // --- EXPORT TO EXCEL ---IMPORT HANDLERS ---
    const handleExportVisits = () => {
        exportVisitsToExcel(displayVisits);
        toast.success("Export เข้าพบเรียบร้อย")
    }

    const handleExportPlans = () => {
        exportPlansToExcel(plans || []);
        toast.success("Export แผนเรียบร้อย")
    }

    const handleExportAll = () => {
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getVisitsExportData(displayVisits)), "บันทึกเข้าพบ")
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getPlansExportData(plans || [])), "แผนงานสัปดาห์")
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getStoresExportData(displayStores)), "ฐานข้อมูลลูกค้า")
        XLSX.writeFile(wb, `backup_full_${formatThaiDate(new Date(), 'dd-MM-yyyy')}.xlsx`)
        toast.success("Export ข้อมูลทั้งหมดเรียบร้อย")
    }

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''

        toast.loading('กำลังอ่านไฟล์...', { id: 'import-toast' })

        const reader = new FileReader()
        reader.onerror = () => toast.error('ไม่สามารถอ่านไฟล์ได้', { id: 'import-toast' })
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result
                const wb = XLSX.read(bstr, { type: 'array', cellDates: true })

                // ─── Find sheets by name (Thai or English) ─────────────────────────
                const storeSheetName = wb.SheetNames.find(n => n.includes('ฐานข้อมูลลูกค้า') || n.includes('Stores'))
                const visitSheetName = wb.SheetNames.find(n => n.includes('การเข้าพบ') || n.includes('Visits'))
                const planSheetName = wb.SheetNames.find(n => n.includes('แผนสัปดาห์') || n.includes('Plans'))

                let storesData: any[] = storeSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[storeSheetName]) : []
                let visitsData: any[] = visitSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[visitSheetName]) : []
                let plansData: any[] = planSheetName ? XLSX.utils.sheet_to_json(wb.Sheets[planSheetName]) : []

                // Fallback: If single generic sheet, assume it's visits (old logic)
                if (!storeSheetName && !visitSheetName && !planSheetName && wb.SheetNames.length > 0) {
                    visitsData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
                }

                const totalRows = storesData.length + visitsData.length + plansData.length
                if (totalRows === 0) {
                    toast.error('ไม่พบข้อมูลในไฟล์', { id: 'import-toast' })
                    return
                }

                toast.loading(`พบข้อมูลรวม ${totalRows} รายการ...`, { id: 'import-toast', duration: 4000 })

                // ─── Step 1: Load stores + profiles ──────────────────────────────────
                const [storesRes, profilesRes] = await Promise.all([
                    fetch('/api/stores'),
                    fetch('/api/profile')
                ])
                const allStores: any[] = await storesRes.json()
                const profiles: any[] = await profilesRes.json()

                const storeMap = new Map<string, string>()
                allStores.forEach((s: any) => {
                    if (s.code) storeMap.set(s.code.trim().toLowerCase(), s.id)
                })

                const validSales = new Set<string>()
                profiles.forEach((p: any) => {
                    if (p.name) validSales.add(normalizeName(p.name))
                })
                console.log(`📚 DB Stores: ${storeMap.size}, DB Profiles: ${validSales.size}`)

                // ─── Step 2: Auto-create missing stores ──────────────────────────────
                const uniqueCodes = new Set<string>()
                const toCreate: any[] = []

                // 2a. Check actual Store sheet
                storesData.forEach(row => {
                    const code = getExcelValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน', 'รหัสลูกค้า'])
                    if (code && !storeMap.has(code.toLowerCase()) && !uniqueCodes.has(code.toLowerCase())) {
                        uniqueCodes.add(code.toLowerCase())
                        toCreate.push({
                            code,
                            name: getExcelValue(row, ['ชื่อร้าน', 'name', 'store_name', 'ชื่อ']) || code,
                            owner: getExcelValue(row, ['เจ้าของ', 'owner']) || null,
                            type: getExcelValue(row, ['ประเภทร้าน', 'type', 'store_type', 'ประเภท']) || null,
                            customerType: getExcelValue(row, ['ประเภทลูกค้า', 'customertype', 'customer_type']) || null,
                            phone: getExcelValue(row, ['เบอร์โทร', 'phone', 'tel', 'โทร']) || null,
                            address: getExcelValue(row, ['ที่อยู่', 'address', 'addr']) || null,
                            productUsed: getExcelValue(row, ['สินค้า', 'product', 'items', 'รายการสินค้า']) || null,
                            quantity: getExcelValue(row, ['ปริมาณ', 'quantity', 'amount', 'จำนวน']) || null,
                            orderPeriod: getExcelValue(row, ['ระยะเวลาสั่ง', 'order_period', 'รอบสั่ง']) || null,
                            supplier: getExcelValue(row, ['รับของจาก', 'supplier', 'แหล่งซื้อ']) || null,
                            payment: getExcelValue(row, ['เงื่อนไขชำระ', 'payment', 'terms']) || null,
                            paymentScore: getExcelValue(row, ['คะแนนการชำระเงิน', 'payment_score', 'rating']) || null,
                            status: getExcelValue(row, ['สถานะ', 'status']) || 'เปิดการขาย',
                            closeReason: getExcelValue(row, ['เหตุผลปิดการขาย', 'close_reason', 'reason']) || null
                        })
                    }
                })

                // 2b. Check Visit & Plan sheets for unknown stores
                const otherData = [...visitsData, ...plansData]
                otherData.forEach(row => {
                    const code = getExcelValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน', 'รหัสลูกค้า'])
                    if (code && !storeMap.has(code.toLowerCase()) && !uniqueCodes.has(code.toLowerCase())) {
                        uniqueCodes.add(code.toLowerCase())
                        toCreate.push({
                            code,
                            name: getExcelValue(row, ['ชื่อร้าน', 'name', 'store_name', 'ชื่อ']) || code,
                            owner: getExcelValue(row, ['เจ้าของ', 'owner']) || null,
                            type: getExcelValue(row, ['ประเภทร้าน', 'type', 'store_type', 'ประเภท']) || null,
                            customerType: getExcelValue(row, ['ประเภทลูกค้า', 'customertype', 'customer_type']) || null,
                            phone: getExcelValue(row, ['เบอร์โทร', 'phone', 'tel', 'โทร']) || null,
                            address: getExcelValue(row, ['ที่อยู่', 'address', 'addr']) || null,
                            status: 'เปิดการขาย'
                        })
                    }
                })

                if (toCreate.length > 0) {
                    toast.loading(`สร้างร้านค้าใหม่ ${toCreate.length} ร้าน...`, { id: 'import-toast' })
                    await Promise.all(toCreate.map(async (storeData) => {
                        try {
                            const res = await fetch('/api/stores', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(storeData)
                            })
                            if (res.ok) {
                                const created = await res.json()
                                storeMap.set(created.code.trim().toLowerCase(), created.id)
                            } else {
                                console.error('Store create failed:', storeData.code)
                            }
                        } catch (err) {
                            console.error('Store API error:', storeData.code)
                        }
                    }))
                }

                const failedReasons: string[] = []
                let vSuccess = 0, pSuccess = 0, errCount = 0

                if (visitsData.length > 0) {
                    toast.loading(`นำเข้าการเข้าพบ ${visitsData.length} รายการ...`, { id: 'import-toast' })
                    const newVisits: any[] = []

                    await Promise.all(visitsData.map(async (row, idx) => {
                        try {
                            const storeCode = getExcelValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน', 'รหัสลูกค้า'])
                            const storeId = storeCode ? storeMap.get(storeCode.toLowerCase()) : undefined
                            if (!storeId) {
                                failedReasons.push(`[Visits แถว ${idx + 2}] ไม่พบร้าน: "${storeCode}"`)
                                errCount++
                                return
                            }

                            let salesName = getExcelValue(row, ['เซลล์', 'sales', 'sale', 'sales_name', 'พนักงานขาย', 'ชื่อเซลล์']) || 'ไม่ระบุ'

                            const rawDate = getExcelValue(row, ['วันที่', 'date', 'visit_date', 'Date'])
                            const finalDate = parseExcelDate(rawDate)

                            const visitData = {
                                date: finalDate,
                                sales: salesName,
                                storeRef: storeCode,
                                masterId: storeId,
                                visitCat: getExcelValue(row, ['หัวข้อเข้าพบ', 'visitcat', 'visit_cat', 'หัวข้อ']) || 'ตรวจเยี่ยมประจำเดือน',
                                visitType: getExcelValue(row, ['ประเภทเข้าพบ', 'visittype', 'visit_type', 'ประเภท', 'type']) || 'general',
                                dealStatus: getExcelValue(row, ['สถานะ', 'status', 'deal_status']) || 'เปิดการขาย',
                                closeReason: getExcelValue(row, ['เหตุผลปิดการขาย', 'reason', 'close_reason']) || null,
                                notes: { text: getExcelValue(row, ['บันทึกเข้าพบ', 'notes', 'note', 'details', 'บันทึก', 'หมายเหตุ']) || '-' },
                                order: getExcelValue(row, ['คำสั่งซื้อ', 'order', 'order_amount', 'ยอดสั่งซื้อ', 'ยอด', 'จำนวน']) || '0'
                            }

                            const res = await fetch('/api/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(visitData) })
                            if (res.ok) { newVisits.push(await res.json()); vSuccess++ }
                            else { failedReasons.push(`[Visits แถว ${idx + 2}] API Error`); errCount++ }
                        } catch { errCount++ }
                    }))
                    if (newVisits.length > 0) setVisits((prev: any) => [...newVisits, ...prev])
                }

                // ─── Step 4: Create plans ──────────────────────────────────────────────
                if (plansData.length > 0) {
                    toast.loading(`นำเข้าแผนงาน ${plansData.length} รายการ...`, { id: 'import-toast' })
                    const newPlans: any[] = []

                    await Promise.all(plansData.map(async (row, idx) => {
                        try {
                            const storeCode = getExcelValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน', 'รหัสลูกค้า'])
                            const storeId = storeCode ? storeMap.get(storeCode.toLowerCase()) : undefined
                            if (!storeId) {
                                failedReasons.push(`[Plans แถว ${idx + 2}] ไม่พบร้าน: "${storeCode}"`)
                                errCount++
                                return
                            }

                            let salesName = getExcelValue(row, ['เซลล์', 'sales', 'sale', 'sales_name', 'พนักงานขาย', 'ชื่อเซลล์']) || 'ไม่ระบุ'

                            const rawDate = getExcelValue(row, ['วันที่', 'date', 'plan_date', 'Date', 'วันที่นัด'])
                            const finalDate = parseExcelDate(rawDate)

                            const planData = {
                                date: finalDate,
                                sales: salesName,
                                masterId: storeId,
                                visitCat: getExcelValue(row, ['หัวข้อเข้าพบ', 'visitcat', 'visit_cat', 'หัวข้อ']) || 'ตรวจเยี่ยมประจำเดือน',
                                notes: getExcelValue(row, ['บันทึก', 'notes', 'note', 'details', 'หมายเหตุ']) || null,
                                order: getExcelValue(row, ['คำสั่งซื้อ', 'order', 'order_amount', 'ยอดสั่งซื้อ', 'ยอด']) || null
                            }

                            const res = await fetch('/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(planData) })
                            if (res.ok) pSuccess++
                            else { failedReasons.push(`[Plans แถว ${idx + 2}] API Error`); errCount++ }
                        } catch { errCount++ }
                    }))
                    await fetchPlans()
                }

                // Summary
                if (errCount > 0) {
                    console.table(failedReasons)
                    toast.warning(
                        `Import ข้อมูล:\n✅ เข้าพบ ${vSuccess} | แผน ${pSuccess}\n❌ ล้มเหลว ${errCount} (ดู Console F12)`,
                        { id: 'import-toast', duration: 7000 }
                    )
                } else {
                    toast.success(
                        `✅ Import สำเร็จ!\nร้านใหม่: ${toCreate.length}\nเข้าพบ: ${vSuccess}\nแผน: ${pSuccess}`,
                        { id: 'import-toast', duration: 5000 }
                    )
                }

                // FORCE REFRESH AFTER MEGA-IMPORT SO THE DASHBOARD REACTS
                await Promise.all([
                    fetchVisits(),
                    fetchPlans(),
                    fetchStores()
                ])

            } catch (err: any) {
                console.error('❌ Import fatal error:', err)
                toast.error(`เกิดข้อผิดพลาดในการโหลดไฟล์ Excel`, { id: 'import-toast' })
            }

        }
        reader.readAsArrayBuffer(file)
    }


    // --- CHART CONFIGS ---
    const topicConfig = {
        topic1: { label: "ตรวจเยี่ยมประจำเดือน", color: "#3b82f6" },   // Blue
        topic2: { label: "เข้าพบร้านค้าใหม่", color: "#22c55e" },      // Green
        topic3: { label: "ติดตามผล", color: "#f97316" },              // Orange
        topic4: { label: "เข้าพบเสนอราคา", color: "#eab308" },          // Yellow
        topic5: { label: "ติดตามยอดชำระ", color: "#ef4444" },          // Red
        topic6: { label: "นำเสนอสินค้าตัวอย่าง", color: "#a855f7" },      // Purple
        other: { label: "อื่นๆ", color: "#94a3b8" }                    // Slate
    }

    const chartConfig = {
        typeA: { label: "ร้านเดิม A", color: "#ef4444" }, // Red
        typeB: { label: "ร้านเดิม B", color: "#f97316" }, // Orange
        new: { label: "ร้านใหม่ N", color: "#3b82f6" },   // Blue
        typeS: { label: "ร้านเก่าหยุดซื้อ S", color: "#64748b" }, // Slate
        typeT: { label: "พัฒนาออเดอร์ T", color: "#eab308" }, // Yellow
        typeD: { label: "ตัวแทนจำหน่าย D", color: "#a855f7" }, // Purple
        closed: { label: "ปิดการขาย", color: "#22c55e" },  // Green
        general: { label: "ทั่วไป", color: "#94a3b8" }     // Slate
    }

    // --- AGGREGATION: Sales Performance (Real Data) ---
    const salesPerformance = useMemo(() => {
        // 1. Get all unique sales reps (Profiles + any unique names in visits)
        const allRepNames = new Map<string, string>()
        profiles.forEach(p => allRepNames.set(normalizeName(p.name), p.name))
        displayVisits.forEach(v => {
            const name = (v.sales || "ไม่ระบุ").trim()
            const norm = normalizeName(name)
            if (!allRepNames.has(norm)) {
                allRepNames.set(norm, name)
            }
        })

        const initialStats = Array.from(allRepNames.values()).map(name => ({
            name,
            total: 0,
            typeA: 0, typeB: 0, new: 0, typeS: 0, typeT: 0, typeD: 0, general: 0,
            closed: 0,
            visitedStores: [] as string[],
            closedStores: [] as string[]
        }))

        const data = filteredVisits.reduce((acc: any[], visit: any) => {
            const name = (visit.sales || "ไม่ระบุ").trim()
            const normName = normalizeName(name)
            let rep = acc.find((item: any) => normalizeName(item.name) === normName)

            if (!rep) {
                rep = {
                    name,
                    total: 0,
                    typeA: 0, typeB: 0, new: 0, typeS: 0, typeT: 0, typeD: 0, general: 0,
                    closed: 0,
                    visitedStores: [] as string[],
                    closedStores: [] as string[]
                }
                acc.push(rep)
            }

            rep.total++
            const storeName = visit.store?.name || visit.storeRef || "ไม่ระบุร้าน"
            if (!rep.visitedStores.includes(storeName)) {
                rep.visitedStores.push(storeName)
            }

            const cat = visit.visitCat || visit.store?.customerType || ""
            const lowerCat = cat.toLowerCase()
            const isClosed = visit.sellSuccessful === true

            if (isClosed) {
                rep.closed++
                if (!rep.closedStores.includes(storeName)) {
                    rep.closedStores.push(storeName)
                }
            }

            if (cat.includes('ร้านเดิม A') || lowerCat.includes('type a')) {
                rep.typeA++
            } else if (cat.includes('ร้านเดิม B') || lowerCat.includes('type b')) {
                rep.typeB++
            } else if (cat.includes('ร้านใหม่ N') || lowerCat.includes('type n') || visit.visitType === 'new') {
                rep.new++
            } else if (cat.includes('หยุดซื้อ') || cat.includes('S')) {
                rep.typeS++
            } else if (cat.includes('พัฒนา') || cat.includes('T')) {
                rep.typeT++
            } else if (cat.includes('ตัวแทน') || cat.includes('D')) {
                rep.typeD++
            } else {
                rep.general++
            }

            return acc
        }, initialStats)

        return data.map((item: any) => ({
            ...item,
            percent: item.total > 0 ? Math.round((item.closed / item.total) * 100) : 0
        }))
    }, [filteredVisits, displayVisits, profiles])

    // --- NEW: Visit Topic Stats for Graph 1 ---
    const visitTopicStats = useMemo(() => {
        const allRepNames = new Map<string, string>()
        profiles.forEach(p => allRepNames.set(normalizeName(p.name), p.name))
        displayVisits.forEach(v => {
            const name = (v.sales || "ไม่ระบุ").trim()
            const norm = normalizeName(name)
            if (!allRepNames.has(norm)) allRepNames.set(norm, name)
        })

        const initialStats = Array.from(allRepNames.values()).map(name => ({
            name,
            total: 0,
            topic1: 0, topic2: 0, topic3: 0, topic4: 0, topic5: 0, topic6: 0, other: 0,
            visitedStores: [] as string[]
        }))

        return filteredVisits.reduce((acc: any[], visit: any) => {
            const name = (visit.sales || "ไม่ระบุ").trim()
            const normName = normalizeName(name)
            let rep = acc.find((item: any) => normalizeName(item.name) === normName)

            if (!rep) {
                rep = { name, total: 0, topic1: 0, topic2: 0, topic3: 0, topic4: 0, topic5: 0, topic6: 0, other: 0, visitedStores: [] as string[] }
                acc.push(rep)
            }

            rep.total++

            const storeName = visit.store?.name || visit.storeRef || "ไม่ระบุร้าน"
            if (!rep.visitedStores.includes(storeName)) {
                rep.visitedStores.push(storeName)
            }

            const topic = (visit.visitCat || "").trim()
            if (topic.includes("ตรวจเยี่ยม") || topic.includes("ประจำเดือน")) rep.topic1++
            else if (topic.includes("ค้าใหม่") || topic.includes("ร้านใหม่")) rep.topic2++
            else if (topic.includes("ติดตามผล")) rep.topic3++
            else if (topic.includes("เสนอราคา")) rep.topic4++
            else if (topic.includes("ยอดชำระ")) rep.topic5++
            else if (topic.includes("สินค้าตัวอย่าง") || topic.includes("เสนอสินค้า") || topic.includes("ตัวอย่าง")) rep.topic6++
            else rep.other++

            return acc
        }, initialStats)
    }, [filteredVisits, displayVisits, profiles])

    // Merge Plans Count to salesPerformance (for Table view if needed)
    // But strictly for the "Future Plans" Chart, we need a separate structure grouped by Rep -> Type

    // --- NEW: Current Period Plans Stats (Same as visits filtering) ---
    const currentPeriodPlansStats = useMemo(() => {
        const allRepNames = new Map<string, string>()
        profiles.forEach(p => allRepNames.set(normalizeName(p.name), p.name))
        displayVisits.forEach(v => {
            const name = (v.sales || "ไม่ระบุ").trim()
            const norm = normalizeName(name)
            if (!allRepNames.has(norm)) allRepNames.set(norm, name)
        })

        const initialStats = Array.from(allRepNames.values()).map(name => ({
            name,
            total: 0,
            topic1: 0, topic2: 0, topic3: 0, topic4: 0, topic5: 0, topic6: 0, other: 0,
            plannedStores: [] as string[]
        }))

        return filteredPlans.reduce((acc: any[], plan: any) => {
            const name = (plan.sales || "ไม่ระบุ").trim()
            const normName = normalizeName(name)
            let rep = acc.find((r: any) => normalizeName(r.name) === normName)

            if (!rep) {
                rep = { name, total: 0, topic1: 0, topic2: 0, topic3: 0, topic4: 0, topic5: 0, topic6: 0, other: 0, plannedStores: [] as string[] }
                acc.push(rep)
            }

            rep.total++
            const storeName = plan.store?.name || plan.storeRef || plan.storeCode || "ไม่ระบุร้าน"
            if (!rep.plannedStores.includes(storeName)) {
                rep.plannedStores.push(storeName)
            }

            const topic = (plan.visitCat || "").trim()
            if (topic.includes("ตรวจเยี่ยม") || topic.includes("ประจำเดือน")) rep.topic1++
            else if (topic.includes("ค้าใหม่") || topic.includes("ร้านใหม่")) rep.topic2++
            else if (topic.includes("ติดตามผล")) rep.topic3++
            else if (topic.includes("เสนอราคา")) rep.topic4++
            else if (topic.includes("ยอดชำระ")) rep.topic5++
            else if (topic.includes("สินค้าตัวอย่าง") || topic.includes("เสนอสินค้า") || topic.includes("ตัวอย่าง")) rep.topic6++
            else rep.other++

            return acc
        }, initialStats)
    }, [filteredPlans, displayVisits, profiles])

    // --- NEW: Summary by Store Type ---
    const storeTypePerformance = useMemo(() => {
        // 1. Initialize result with all customer groups from CustomerGroups
        const stats: any = {}
        CustomerGroups.forEach((type: string) => {
            stats[type] = { type, totalVisits: 0, newVisits: 0, closed: 0 }
        })

        filteredVisits.forEach((v: any) => {
            const type = v.store?.customerType || v.visitCat || "ทั่วไป"
            
            // Try to match with our defined groups
            let matchedType = "ทั่วไป"
            if (type.includes('ร้านเดิม A')) matchedType = "ร้านเดิม A"
            else if (type.includes('ร้านเดิม B')) matchedType = "ร้านเดิม B"
            else if (type.includes('ร้านใหม่ N')) matchedType = "ร้านใหม่ N"
            else if (type.includes('หยุดซื้อ') || type.includes('S')) matchedType = "ร้านเก่าหยุดซื้อ S"
            else if (type.includes('พัฒนา') || type.includes('T')) matchedType = "พัฒนาออเดอร์ T"
            else if (type.includes('ตัวแทน') || type.includes('D')) matchedType = "ตัวแทนจำหน่าย D"

            if (!stats[matchedType]) stats[matchedType] = { type: matchedType, totalVisits: 0, newVisits: 0, closed: 0 }

            stats[matchedType].totalVisits++

            const cat = v.visitCat || v.store?.customerType || ""
            if (cat.includes('ร้านใหม่ N') || v.visitType === 'new') {
                stats[matchedType].newVisits++
            }

            if (v.sellSuccessful === true) {
                stats[matchedType].closed++
            }
        })

        return Object.values(stats).map((item: any) => ({
            ...item,
            percent: item.totalVisits > 0 ? Math.round((item.closed / item.totalVisits) * 100) : 0
        })).sort((a: any, b: any) => b.totalVisits - a.totalVisits)
    }, [filteredVisits])

    const performanceTotals = useMemo(() => {
        return salesPerformance.reduce((acc, row) => ({
            total: acc.total + row.total,
            new: acc.new + row.new,
            typeA: acc.typeA + row.typeA,
            typeB: acc.typeB + row.typeB,
            typeS: acc.typeS + row.typeS,
            typeT: acc.typeT + row.typeT,
            typeD: acc.typeD + row.typeD,
            closed: acc.closed + row.closed,
        }), { total: 0, new: 0, typeA: 0, typeB: 0, typeS: 0, typeT: 0, typeD: 0, closed: 0 });
    }, [salesPerformance]);

    const totalPercent = performanceTotals.total > 0 ? Math.round((performanceTotals.closed / performanceTotals.total) * 100) : 0;

    const handleExportPerformance = () => {
        const dataToExport = salesPerformance.map((row: any, i: number) => ({
            "ลำดับ": i + 1,
            "เซลล์": row.name,
            "เข้าพบทั้งหมด": row.total,
            "ร้านใหม่ N": row.new,
            "ร้านเดิม A": row.typeA,
            "ร้านเดิม B": row.typeB,
            "ร้านเก่าหยุดซื้อ S": row.typeS,
            "พัฒนาออเดอร์ T": row.typeT,
            "ตัวแทนจำหน่าย D": row.typeD,
            "ปิดการขาย": row.closed,
            "% สำเร็จ": `${row.percent}%`
        }));

        // Add Grand Total row for Excel
        dataToExport.push({
            "ลำดับ": "รวม",
            "เซลล์": "-",
            "เข้าพบทั้งหมด": performanceTotals.total,
            "ร้านใหม่ N": performanceTotals.new,
            "ร้านเดิม A": performanceTotals.typeA,
            "ร้านเดิม B": performanceTotals.typeB,
            "ร้านเก่าหยุดซื้อ S": performanceTotals.typeS,
            "พัฒนาออเดอร์ T": performanceTotals.typeT,
            "ตัวแทนจำหน่าย D": performanceTotals.typeD,
            "ปิดการขาย": performanceTotals.closed,
            "% สำเร็จ": `${totalPercent}%`
        });

        exportToExcel(dataToExport, "SalesPerformance", "สรุปผลงานเซลล์");
    }

    // Calculate Percentages for Table
    salesPerformance.forEach((item: any) => {
        item.percent = item.total > 0 ? Math.round((item.closed / item.total) * 100) : 0
    })

    // 3. CLOSED DEALS DATA (For Charts)
    const closedBySalesData = salesPerformance.map((item: any) => ({
        name: item.name,
        value: item.closed,
        stores: item.closedStores
    }))

    const storeTypesData = displayStores.reduce((acc: any[], store: any) => {
        const type = store.type || "ไม่ระบุ"
        const existing = acc.find(i => i.name === type)
        if (existing) {
            existing.value++
        } else {
            acc.push({ name: type, value: 1 })
        }
        return acc
    }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 5)

    return (
        <div className="p-6 space-y-6 dark:bg-[#0f172a] min-h-screen text-black relative">
            {isInitialLoading && (
                <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/20 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-[2.5rem]">
                    <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            )}

            {/* Syncing indicator */}
            {crmValidating && !isInitialLoading && (
                <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-blue-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Syncing...</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Navigation & Filters Row */}
                {/* Navigation & Filters Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-100 dark:bg-[#0f172a] p-3 rounded-2xl shadow-sm border border-slate-800">
                    {['day', 'week', 'month', 'quarter', 'year', 'all'].map(p => (
                        <button
                            key={p}
                            onClick={() => {
                                setPeriod(p as Period);
                                setCurrentDate(new Date());
                            }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-xl transition-all border",
                                period === p
                                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                                    : "bg-white text-black dark:bg-transparent text-slate-300 border-slate-700 dark:hover:bg-slate-800 hover:bg-blue-200 dark:text-white text-black"
                            )}
                        >
                            <CalendarIcon className="w-4 h-4 opacity-70" />
                            {p === 'day' ? 'วันนี้' : p === 'week' ? 'สัปดาห์นี้' : p === 'month' ? 'เดือนนี้' : p === 'quarter' ? 'ไตรมาสนี้' : p === 'year' ? 'ปีนี้' : 'บันทึกทั้งหมด'}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex  flex-wrap gap-2 items-center justify-between">
                    <div className="flex gap-2">
                        <ActionButton onClick={handleExportVisits} label="Export เข้าพบ" icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />} />
                        <ActionButton onClick={handleExportPlans} label="Export แผน" icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />} />
                        <ActionButton onClick={handleExportAll} label="Export ทั้งหมด" icon={<Database className="w-4 h-4 mr-2 text-purple-600" />} />
                        <ActionButton onClick={() => { fetchVisits(); fetchPlans(); toast.success("รีเฟรชข้อมูลล่าสุดแล้ว") }} label="รีเฟรช" icon={<Zap className="w-4 h-4 mr-2 text-amber-500" />} />
                        {isAdmin && (
                            <div className="relative">
                                <input type="file" ref={fileInputRef} onChange={handleImportExcel} className="hidden" accept=".xlsx, .xls" />
                                <ActionButton onClick={() => fileInputRef.current?.click()} label="Import Excel" icon={<Upload className="w-4 h-4 mr-2" />} />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <ActionButton
                                onClick={handleClearAll}
                                disabled={isClearing}
                                label={isClearing ? 'กำลังลบ...' : 'ล้างข้อมูล'}
                                className="bg-red-500 hover:bg-red-600 text-white border-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                icon={<Trash2 className="w-4 h-4 mr-2 text-white" />}
                                variant="default"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ================== 1. CALENDAR ================== */}
            <div className="flex justify-center py-4">
                <Card className="dark:bg-[#0f172a] dark:border-slate-800 border-slate-100 shadow-2xl w-full border rounded-[2rem] overflow-hidden">
                    {/* Header */}
                    <CardHeader className="py-5 px-8 border-b dark:border-slate-800 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                                    <CalendarIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <span className="text-xl font-black dark:text-white text-slate-800 block leading-tight">
                                        {formatThaiDate(currentDate, 'MMMM yyyy')}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">ปฏิทินแผนงานและการเข้าพบ</span>
                                </div>
                            </div>
                            <div className="flex gap-1 bg-white/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <Button variant="ghost" size="icon" onClick={handlePrevious} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <ChevronLeft className="w-5 h-5 dark:text-slate-300" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={goToday} className="text-sm font-bold dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl px-3">
                                    วันนี้
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleNext} className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <ChevronRight className="w-5 h-5 dark:text-slate-300" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8 bg-white dark:bg-[#0f172a]">
                        {/* Legend */}
                        <div className="mb-6 flex gap-6 text-xs justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]"></div>
                                <span className="dark:text-slate-400 font-semibold text-slate-600">มีการวางแผน</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]"></div>
                                <span className="dark:text-slate-400 font-semibold text-slate-600">มีการเข้าพบ</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                                <span className="dark:text-slate-400 font-semibold text-slate-600">ปิดการขาย</span>
                            </div>
                        </div>

                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(val) => val && setCurrentDate(val)}
                            onDayClick={handleDateClick}
                            month={currentDate}
                            onMonthChange={(newMonth) => {
                                setCurrentDate(newMonth)
                                if (period === 'day' || period === 'week') setPeriod('month')
                            }}
                            locale={th}
                            weekStartsOn={1}
                            className="w-full bg-white dark:bg-[#0f172a] rounded-2xl border-0 p-0"
                            // Removed deprecated/buggy modifiers injection, logic moved inside DayButton itself.
                            components={{
                                DayButton: useCallback((props: any) => (
                                    <CalendarDayButton
                                        {...props}
                                        getPlansForDate={(date: Date) => plans.filter((p: any) => isSameDay(new Date(p.date || p.startDate), date))}
                                        getVisitsForDate={(date: Date) => displayVisits.filter((v: any) => isSameDay(new Date(v.date), date))}
                                    />
                                ), [plans, displayVisits])
                            }}
                            classNames={{
                                months: "w-full",
                                month: "w-full space-y-4",
                                caption: "hidden",
                                table: "w-full border-collapse",
                                head_row: "flex w-full mb-3",
                                head_cell: "w-full text-slate-400 dark:text-slate-500 font-black text-xs text-center uppercase tracking-widest",
                                row: "flex w-full mt-1.5 gap-1.5",
                                cell: "relative w-full p-0 flex-1 min-h-14",
                                day: cn(
                                    "h-full w-full min-h-14 p-1 text-sm font-semibold transition-all duration-150 rounded-xl flex items-center justify-center",
                                    "hover:bg-slate-100 dark:hover:bg-orange-800/80 dark:text-slate-200 border border-transparent",
                                    "aria-selected:text-white aria-selected:shadow-lg aria-selected:rounded-xl"
                                ),
                                day_today: " text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/30 rounded-xl ring-2 ring-blue-400/50",
                                day_outside: "text-slate-200 dark:text-slate-700 opacity-40",
                            }}
                        />
                    </CardContent>
                </Card>
            </div>



            {/* ================== 2. STATS (GENERATORS) ================== */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <Generator
                    icon={<MapPin className="text-blue-400" />}
                    label="ร้านค้าทั้งหมด"
                    value={stats.stores}
                    sub="Database"
                    glowColor="blue"
                />
                <Generator
                    icon={<Zap className="text-amber-400" />}
                    label="เข้าพบทั้งหมด"
                    value={stats.totalVisits}
                    sub="Total Visits"
                    glowColor="amber"
                    active={stats.totalVisits > 0}
                />
                <Generator
                    icon={<Target className="text-emerald-400" />}
                    label="ความสำเร็จ"
                    value={`${stats.successRate}%`}
                    sub="Conversion"
                    glowColor="emerald"
                />
                <Generator
                    icon={<Users className="text-violet-400" />}
                    label="ลูกค้าใหม่"
                    value={stats.newStores}
                    sub="New Leads"
                    glowColor="violet"
                />
                <Generator
                    icon={<AlertCircle className="text-rose-400" />}
                    label="แจ้งปัญหา"
                    value={stats.issues}
                    sub="Pending"
                    glowColor="rose"
                    active={stats.issues > 0}
                />
                <Generator
                    icon={<TrendingUp className="text-sky-400" />}
                    label="ปิดการขาย"
                    value={stats.closedDeals}
                    sub="Closed Deals"
                    glowColor="sky"
                    active={stats.closedDeals > 0}
                />
            </div>

            {/* ================== 3. CHARTS ================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="lg:col-span-1 min-h-[600px]">
                    <ChartCard
                        title="วัตถุประสงค์การเข้าพบ - รายเซลล์"
                        detail="แยกตามหัวข้อการเข้าพบ (Visit Topics)"
                        ran="ทั้งหมด"
                        data={visitTopicStats}
                        nameKey="name"
                        config={topicConfig}
                        type="grouped"
                        renderTooltip={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                                <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl z-50 min-w-[200px]">
                                    <p className="text-base font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b dark:border-slate-700">{label}</p>
                                    <div className="space-y-1.5 mb-3 border-b dark:border-slate-700 pb-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-bold">เข้าพบทั้งหมด</span>
                                            <span className="font-black text-blue-600 dark:text-blue-400">{data.total} ครั้ง</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        {Object.entries(topicConfig).map(([key, config]: [string, any]) => (
                                            data[key] > 0 && (
                                                <div key={key} className="flex justify-between text-[11px]">
                                                    <span className="text-slate-500 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                                                        {config.label}
                                                    </span>
                                                    <span className="font-bold">{data[key]}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">ร้านค้าที่เข้าพบ ({data.visitedStores.length})</div>
                                    <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                        {data.visitedStores.slice(0, 50).map((s: string, i: number) => (
                                            <div key={i} className="text-sm text-slate-600 dark:text-slate-300 truncate">• {s}</div>
                                        ))}
                                        {data.visitedStores.length > 50 && <div className="text-sm text-slate-400 italic font-medium">+ อีก {data.visitedStores.length - 50} ร้าน</div>}
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
                <div className="lg:col-span-1 min-h-[600px]">
                    <ChartCard
                        title={`แผนเข้าพบ${period === 'all' ? 'ทั้งหมด' : period === 'day' ? 'วันนี้' : period === 'week' ? 'สัปดาห์นี้' : period === 'month' ? 'เดือนนี้' : period === 'quarter' ? 'ไตรมาสนี้' : 'ปีนี้'}`}
                        detail={`แผนงานล่วงหน้าแยกตามวัตถุประสงค์ (${period === 'all' ? 'ประวัติทั้งหมด' : period === 'day' ? 'วันนี้' : period === 'week' ? 'สัปดาห์นี้' : period === 'month' ? 'เดือนนี้' : period === 'quarter' ? 'ไตรมาสนี้' : 'ปีนี้'})`}
                        ran="ทั้งหมด"
                        data={currentPeriodPlansStats}
                        nameKey="name"
                        config={topicConfig}
                        type="grouped"
                        renderTooltip={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                                <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl z-50 min-w-[200px]">
                                    <p className="text-base font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b dark:border-slate-700">{label}</p>
                                    <div className="space-y-1.5 mb-3 border-b dark:border-slate-700 pb-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-bold">แผนงานทั้งหมด</span>
                                            <span className="font-black text-indigo-600 dark:text-indigo-400">{data.total} แผน</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        {Object.entries(topicConfig).map(([key, config]: [string, any]) => (
                                            data[key] > 0 && (
                                                <div key={key} className="flex justify-between text-[11px]">
                                                    <span className="text-slate-500 flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                                                        {config.label}
                                                    </span>
                                                    <span className="font-bold">{data[key]}</span>
                                                </div>
                                            )
                                        ))}
                                    </div>

                                    <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">ร้านค้าที่วางแผน ({data.plannedStores.length})</div>
                                    <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                        {data.plannedStores.slice(0, 50).map((s: string, i: number) => (
                                            <div key={i} className="text-sm text-slate-600 dark:text-slate-300 truncate">• {s}</div>
                                        ))}
                                        {data.plannedStores.length > 50 && <div className="text-sm text-slate-400 italic font-medium">+ อีก {data.plannedStores.length - 50} ร้าน</div>}
                                    </div>
                                </div>
                            )
                        }}
                    />
                </div>
                <div className="lg:col-span-2 min-h-[600px]">
                    <ChartCard
                        title="ยอดปิดการขาย - รายเซลล์"
                        detail={`ปิดสำเร็จ ${stats.closedDeals} ครั้ง (${stats.successRate}%)`}
                        ran="ทั้งหมด"
                        data={closedBySalesData}
                        dataKey="value"
                        nameKey="name"
                        config={{ value: { label: "ปิดการขาย", color: "#f43f5e" } }}
                        type="bar"
                        renderTooltip={({ active, payload, label }: any) => {
                            if (!active || !payload?.length) return null
                            const data = payload[0].payload
                            return (
                                <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl z-50 min-w-[200px]">
                                    <p className="text-base font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b dark:border-slate-700">{label}</p>
                                    <div className="mb-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">ยอดปิดการขาย</span>
                                            <span className="font-bold text-emerald-500">{data.value} ครั้ง</span>
                                        </div>
                                    </div>
                                    {data.stores && data.stores.length > 0 && (
                                        <>
                                            <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">ร้านที่ปิดได้ ({data.stores.length})</div>
                                            <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                                {data.stores.slice(0, 50).map((s: string, i: number) => (
                                                    <div key={i} className="text-sm text-slate-600 dark:text-slate-300 truncate">• {s}</div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        }}
                    />
                </div>
            </div>

            {/* ================== 4. TABLES ================== */}
            <div className="grid gap-8">
                {/* Table 1: Performance */}
                <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-l-4 border-l-indigo-500 shadow-md">
                    <CardHeader className="py-4 border-b dark:border-slate-800 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-indigo-400" />
                            <CardTitle className="text-lg dark:text-indigo-100 text-slate-800">
                                ตารางสรุปผลงาน
                                <span className="text-sm font-normal text-slate-500 ml-2">
                                    ({period === 'day' ? 'วันนี้' : period === 'week' ? 'สัปดาห์นี้' : period === 'month' ? 'เดือนนี้' : period === 'quarter' ? 'ไตรมาสนี้' : 'ปีนี้'})
                                </span>
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPerformance}
                            className="font-bold text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400"
                        >
                            <Download className="w-4 h-4 mr-2" /> ส่งออก Excel
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table className="dark:text-slate-300">
                            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                <TableRow className="dark:border-slate-800 border-slate-100">
                                    <TableHead className="dark:text-slate-400 font-semibold text-center w-16 hidden lg:table-cell">ลำดับ</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold min-w-[120px]">เซลล์</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden sm:table-cell">เข้าพบทั้งหมด</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center text-blue-500 hidden md:table-cell">ร้านใหม่ N</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden md:table-cell">ร้านเดิม A</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden md:table-cell">ร้านเดิม B</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden md:table-cell text-slate-400">ร้านเก่าหยุดซื้อ S</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden lg:table-cell">พัฒนาออเดอร์ T</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center hidden lg:table-cell">ตัวแทนจำหน่าย D</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-center text-emerald-500">ปิดการขาย</TableHead>
                                    <TableHead className="dark:text-slate-400 font-semibold text-right hidden sm:table-cell">% สำเร็จ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesPerformance.length > 0 ? (
                                    <>
                                        {salesPerformance.map((row: any, i: number) => (
                                            <TableRow key={i} className="dark:border-slate-800 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <TableCell className="w-[60px] text-center font-bold text-slate-500 hidden lg:table-cell">{i + 1}</TableCell>
                                                <TableCell className="min-w-[120px] font-bold dark:text-indigo-200 text-indigo-700 break-words whitespace-normal">{row.name}</TableCell>
                                                <TableCell className="w-[80px] text-center font-bold text-slate-600 dark:text-slate-300 hidden sm:table-cell">{row.total}</TableCell>
                                                <TableCell className="w-[80px] text-center text-blue-500 dark:text-blue-400 font-bold hidden md:table-cell">{row.new}</TableCell>
                                                <TableCell className="w-[80px] text-center text-slate-600 dark:text-slate-400 font-medium hidden md:table-cell">{row.typeA}</TableCell>
                                                <TableCell className="w-[80px] text-center text-slate-600 dark:text-slate-400 font-medium hidden md:table-cell">{row.typeB}</TableCell>
                                                <TableCell className="w-[80px] text-center text-slate-400 dark:text-slate-500 font-medium hidden md:table-cell">{row.typeS}</TableCell>
                                                <TableCell className="w-[80px] text-center text-slate-600 dark:text-slate-400 font-medium hidden lg:table-cell">{row.typeT}</TableCell>
                                                <TableCell className="w-[80px] text-center text-slate-600 dark:text-slate-400 font-medium hidden lg:table-cell">{row.typeD}</TableCell>
                                                <TableCell className="w-[80px] text-center text-emerald-500 dark:text-emerald-400 font-bold">{row.closed}</TableCell>
                                                <TableCell className="w-[90px] text-right hidden sm:table-cell">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(row.percent) >= 50
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                        }`}>
                                                        {row.percent}%
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Grand Total Row */}
                                        <TableRow className="bg-slate-100 dark:bg-slate-800/80 font-black border-t-2 dark:border-slate-700">
                                            <TableCell className="text-center hidden lg:table-cell"></TableCell>
                                            <TableCell className="text-left font-black pr-2">รวมทั้งหมด</TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">{performanceTotals.total}</TableCell>
                                            <TableCell className="text-center text-blue-600 hidden md:table-cell">{performanceTotals.new}</TableCell>
                                            <TableCell className="text-center hidden md:table-cell">{performanceTotals.typeA}</TableCell>
                                            <TableCell className="text-center hidden md:table-cell">{performanceTotals.typeB}</TableCell>
                                            <TableCell className="text-center hidden md:table-cell text-slate-500">{performanceTotals.typeS}</TableCell>
                                            <TableCell className="text-center hidden lg:table-cell">{performanceTotals.typeT}</TableCell>
                                            <TableCell className="text-center hidden lg:table-cell">{performanceTotals.typeD}</TableCell>
                                            <TableCell className="text-center text-emerald-600">{performanceTotals.closed}</TableCell>
                                            <TableCell className="text-right hidden sm:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs font-black ${totalPercent >= 50
                                                    ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500 dark:text-white'
                                                    : 'bg-amber-200 text-amber-800 dark:bg-amber-500 dark:text-white'
                                                    }`}>
                                                    {totalPercent}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center h-24 text-slate-500">
                                            ไม่มีข้อมูลสำหรับช่วงเวลานี้
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Table 2: Store Type Summary */}
            <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-l-4 border-l-orange-500 shadow-md">
                <CardHeader className="py-4 border-b dark:border-slate-800 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-orange-400" />
                        <CardTitle className="text-lg dark:text-orange-100 text-slate-800">📈 สรุปตามประเภทกลุ่มลูกค้า</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table style={{ tableLayout: 'fixed', width: '100%' }} className="dark:text-slate-300">
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                            <TableRow className="dark:border-slate-800 border-slate-100">
                                <TableHead className="dark:text-slate-400 font-semibold text-center w-16 hidden md:table-cell">ลำดับ</TableHead>
                                <TableHead className="dark:text-slate-400 font-semibold min-w-[120px]">กลุ่มลูกค้า</TableHead>
                                <TableHead className="dark:text-slate-400 font-semibold text-center">จำนวนเข้าพบ</TableHead>
                                <TableHead className="dark:text-slate-400 font-semibold text-center text-blue-500 hidden sm:table-cell">ร้านใหม่ N</TableHead>
                                <TableHead className="dark:text-slate-400 font-semibold text-center text-emerald-500">ปิดการขาย</TableHead>
                                <TableHead className="dark:text-slate-400 font-semibold text-right hidden sm:table-cell">% ปิดการขาย</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {storeTypePerformance.length > 0 ? (
                                storeTypePerformance.map((row: any, i: number) => (
                                    <TableRow key={i} className="dark:border-slate-800 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell className="w-[60px] text-center font-bold text-slate-500 hidden md:table-cell">{i + 1}</TableCell>
                                        <TableCell className="min-w-[120px] font-bold dark:text-orange-200 text-orange-700 break-words whitespace-normal">{row.type}</TableCell>
                                        <TableCell className="w-[100px] text-center font-bold text-slate-600 dark:text-slate-300">{row.totalVisits}</TableCell>
                                        <TableCell className="w-[100px] text-center text-blue-500 dark:text-blue-400 font-bold hidden sm:table-cell">{row.newVisits}</TableCell>
                                        <TableCell className="w-[100px] text-center text-emerald-500 dark:text-emerald-400 font-bold">{row.closed}</TableCell>
                                        <TableCell className="w-[120px] text-right hidden sm:table-cell">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.percent >= 50
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                                }`}>
                                                {row.percent}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                                        ไม่มีข้อมูลสำหรับช่วงเวลานี้
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* ================== CALENDAR POPUP (Split Plans & Visits) ================== */}
            {
                showVisitPopup && popupDate && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
                        onClick={() => setShowVisitPopup(false)}
                    >
                        <Card
                            className="bg-white dark:bg-[#1e293b] dark:border-slate-700 border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CardHeader className="py-4 px-6 border-b dark:border-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl font-black dark:text-white flex items-center gap-2">
                                            <CalendarIcon className="w-5 h-5 text-indigo-500" />
                                            รายละเอียดข้อมูลประจำวัน
                                        </CardTitle>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                            {formatThaiDate(popupDate, 'PPPP')}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowVisitPopup(false)} className="hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 overflow-hidden flex-1 flex flex-col md:flex-row">
                                {/* Left Column: PLANS */}
                                <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 font-bold text-blue-700 dark:text-blue-400 flex justify-between items-center border-b border-blue-100 dark:border-blue-900/30">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                            แผนงานที่ตั้งไว้
                                        </span>
                                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full text-xs box-content">
                                            {selectedDatePlans.length} รายการ
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {selectedDatePlans.length > 0 ? selectedDatePlans.map((plan: any, idx: number) => (
                                            <div key={`plan-${idx}`} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                            {plan.store?.name || plan.storeName || plan.storeCode || "ไม่ระบุร้าน"}
                                                        </h4>
                                                        {plan.storeCode && <p className="text-xs text-slate-500 font-mono">#{plan.storeCode}</p>}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-md whitespace-nowrap">
                                                        {plan.visitCat || 'ลูกค้าทั่วไป'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                    <User className="w-3.5 h-3.5 text-blue-400" /> เซลล์: <span className="font-medium text-slate-700 dark:text-slate-300">{plan.sales || '-'}</span>
                                                </div>
                                                {plan.notes && (
                                                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 border-l-2 border-blue-400 pl-3 italic bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10 py-1">
                                                        "{plan.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 opacity-70">
                                                <Target className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                                                <p>ไม่มีการวางแผนในวันนี้</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: VISITS */}
                                <div className="flex-1 flex flex-col bg-white dark:bg-[#1e293b]">
                                    <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 font-bold text-orange-600 dark:text-orange-400 flex justify-between items-center border-b border-orange-100 dark:border-orange-900/30">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                            การเข้าพบจริง
                                        </span>
                                        <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full text-xs box-content">
                                            {selectedDateVisits.length} ร้าน
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                        {selectedDateVisits.length > 0 ? selectedDateVisits.map((visit: any, idx: number) => (
                                            <div key={`visit-${idx}`} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow ring-1 ring-inset ring-slate-100 dark:ring-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-800 dark:text-slate-200">
                                                                {visit.store?.name || visit.storeRef || "ไม่ระบุร้าน"}
                                                            </h4>
                                                            {visit.dealStatus === 'ปิดการขาย' || visit.dealStatus === 'closed' ? (
                                                                <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                                                                    ปิดการขาย
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-600">
                                                                    {visit.dealStatus}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 mt-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                            <div className="flex-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                                <User className="w-3.5 h-3.5 text-orange-400" /> <span className="truncate">{visit.sales || '-'}</span>
                                                            </div>
                                                            <div className="flex-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                                <MapPin className="w-3.5 h-3.5 text-orange-400" /> <span className="truncate">{visit.visitType || '-'}</span>
                                                            </div>
                                                        </div>

                                                        {(visit.notes?.text || visit.notes?.voice) && (
                                                            <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 border-l-2 border-orange-400 pl-3 py-1 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10">
                                                                {visit.notes?.text && <p className="italic">"{visit.notes.text}"</p>}
                                                                {visit.notes?.voice && <p className="text-xs text-orange-500 mt-1 flex items-center gap-1 font-medium"><Zap className="w-3 h-3" /> แนบไฟล์เสียง</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10 opacity-70">
                                                <MapPin className="w-12 h-12 mb-2 text-slate-300 dark:text-slate-600" />
                                                <p>ไม่มีข้อมูลเข้าพบในวันนี้</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
        </div >
    )
}

// THE GENERATOR COMPONENT (Compact, Full Width, Beautiful)
function Generator({ icon, label, value, sub, glowColor, active }: any) {
    const colors: any = {
        blue: "from-blue-500/20 to-blue-600/5 text-blue-500 border-blue-500/30",
        amber: "from-amber-500/20 to-amber-600/5 text-amber-500 border-amber-500/30",
        emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-500 border-emerald-500/30",
        violet: "from-violet-500/20 to-violet-600/5 text-violet-500 border-violet-500/30",
        rose: "from-rose-500/20 to-rose-600/5 text-rose-500 border-rose-500/30",
        sky: "from-sky-500/20 to-sky-600/5 text-sky-500 border-sky-500/30"
    }
    const colorClass = colors[glowColor] || colors.blue

    return (
        <div className={cn(
            "relative group overflow-hidden rounded-xl border p-3 transition-all duration-500",
            "bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl",
            active ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-amber-500 scale-[1.02]" : "hover:border-slate-500/50",
            colorClass.split(" ").pop() // Border color
        )}>
            {/* Inner Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", colorClass.split(" ")[0])} />

            <div className="relative z-10 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-slate-100 dark:bg-slate-800", colorClass.split(" ")[2])}>
                    {icon}
                </div>
                <div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">{label}</div>
                </div>
            </div>
            {/* Sparkle effect if active */}
            {active && <Zap className="absolute top-1 right-1 w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />}
        </div>
    )
}