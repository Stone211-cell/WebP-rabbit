'use client'

import { useEffect, useState, useRef, useMemo } from "react"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ActionButton, FilterButton } from "@/components/crmhelper/helper"

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year'

export default function Dashboard({ stores: initialStores, visits: initialVisits, summary }: any) {
  // --- REAL DATA INTEGRATION ---
  const { stores, visits, setVisits, plans, issues, fetchVisits, fetchPlans } = useCRM()

  // Use provided initial props if hook data is empty (SSR/prop hydration)
  const displayStores = stores.length > 0 ? stores : (initialStores || [])
  const displayVisits = visits.length > 0 ? visits : (initialVisits || [])

  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [summaryState, setSummaryState] = useState<any[]>(Array.isArray(summary) ? summary : [])
  const [period, setPeriod] = useState<Period>('month')

  // Calendar Visit Popup State
  const [showVisitPopup, setShowVisitPopup] = useState(false)
  const [selectedDateVisits, setSelectedDateVisits] = useState<any[]>([])
  const [popupDate, setPopupDate] = useState<Date | null>(null)

  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initial Fetch (Client Side)
  useEffect(() => {
    // Fetch fresh data on mount
    fetchVisits()
    fetchPlans()
  }, [fetchVisits, fetchPlans])

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
      case 'day': return `วันที่: ${format(currentDate, 'd MMM yyyy', options)}`
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 })
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `วันที่: ${format(start, 'd MMM yyyy', options)} - ${format(end, 'd MMM yyyy', options)}`
      }
      case 'month': return `เดือน: ${format(currentDate, 'MMMM yyyy', options)}`
      case 'quarter': return `ไตรมาส: ${format(startOfQuarter(currentDate), 'd MMM', options)} - ${format(endOfQuarter(currentDate), 'd MMM yyyy', options)}`
      case 'year': return `ปี: ${format(currentDate, 'yyyy', options)}`
      default: return ''
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

  // --- CALENDAR VISIT HELPERS ---
  const getVisitsForDate = (date: Date) => {
    return displayVisits.filter((visit: any) => {
      const visitDate = new Date(visit.date)
      return isSameDay(visitDate, date)
    })
  }

  const handleDateClick = (date: Date) => {
    const visitsOnDate = getVisitsForDate(date)
    if (visitsOnDate.length > 0) {
      setSelectedDateVisits(visitsOnDate)
      setPopupDate(date)
      setShowVisitPopup(true)
    }
  }

  // --- FILTERING & AGGREGATION ---

  const filteredVisits = useMemo(() => {
    return displayVisits.filter((visit: any) => {
      const visitDate = new Date(visit.date)
      switch (period) {
        case 'day':
          return isSameDay(visitDate, currentDate)
        case 'week':
          return (
            visitDate >= startOfWeek(currentDate, { weekStartsOn: 1 }) &&
            visitDate <= endOfWeek(currentDate, { weekStartsOn: 1 })
          )
        case 'month':
          return isSameMonth(visitDate, currentDate)
        case 'year':
          return visitDate.getFullYear() === currentDate.getFullYear()
        case 'quarter':
          return (
            visitDate >= startOfQuarter(currentDate) &&
            visitDate <= endOfQuarter(currentDate)
          )
        default:
          return true
      }
    })
  }, [displayVisits, period, currentDate])

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const closedDealsCount = filteredVisits.filter((v: any) => v.dealStatus === 'closed').length
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

  // --- EXPORT / IMPORT HANDLERS ---
  const handleExportVisits = () => {
    const ws = XLSX.utils.json_to_sheet(displayVisits)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Visits")
    XLSX.writeFile(wb, `visits_export_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    toast.success("Export เข้าพบเรียบร้อย")
  }

  const handleExportPlans = () => {
    const ws = XLSX.utils.json_to_sheet(plans || [])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Plans")
    XLSX.writeFile(wb, `plans_export_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    toast.success("Export แผนเรียบร้อย")
  }

  const handleExportAll = () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(displayVisits), "Visits")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(plans || []), "Plans")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(displayStores), "Stores")
    XLSX.writeFile(wb, `backup_full_${format(new Date(), 'yyyyMMdd')}.xlsx`)
    toast.success("Export ข้อมูลทั้งหมดเรียบร้อย")
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('📁 File selected:', file.name)
    toast.loading('กำลังอ่านไฟล์...', { id: 'import-toast' })

    const reader = new FileReader()
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        // Modern readAsArrayBuffer
        const wb = XLSX.read(bstr, { type: 'array' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)

        console.log("📊 Imported Data:", data.length, "rows")
        toast.loading(`กำลังประมวลผล ${data.length} รายการ (Fast Mode ⚡)...`, { id: 'import-toast' })

        // 1. Pre-fetch ALL stores AND Profiles for lookup (Performance Optimization)
        const [storesResponse, profilesResponse] = await Promise.all([
          fetch('/api/stores?limit=999999'),
          fetch('/api/profile')
        ])

        const stores = await storesResponse.json()
        const storeMap = new Map(stores.map((s: any) => [s.code, s.id]))

        const profiles = await profilesResponse.json()
        const validSales = new Set(profiles.map((p: any) => p.name))

        console.log(`📚 Loaded ${storeMap.size} stores and ${validSales.size} profiles`)

        // 2. Identify NEW stores to create
        const uniqueStoreCodes = new Set<string>()
        const newStoresToCreate: any[] = []

        data.forEach((row: any) => {
          // Helper to get value from row with fuzzy key matching (Scoped for this block)
          const getValue = (obj: any, candidates: string[]) => {
            const keys = Object.keys(obj)
            const foundKey = keys.find(k => candidates.includes(k.trim().toLowerCase()))
            return foundKey ? obj[foundKey] : undefined
          }

          const code = getValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน'])
          if (code && !storeMap.has(code) && !uniqueStoreCodes.has(code)) {
            uniqueStoreCodes.add(code)
            newStoresToCreate.push({
              code: code,
              name: getValue(row, ['ชื่อร้าน', 'name', 'store_name']) || code,
              owner: getValue(row, ['เจ้าของ', 'owner']) || null,
              type: getValue(row, ['ประเภทร้าน', 'type', 'store_type']) || 'general',
              customerType: getValue(row, ['ประเภทลูกค้า', 'customertype']) || null,
              phone: getValue(row, ['เบอร์โทร', 'phone', 'tel']) || null,
              address: getValue(row, ['ที่อยู่', 'address']) || null,
              status: 'active'
            })
          }
        })

        if (newStoresToCreate.length > 0) {
          toast.loading(`กำลังสร้างร้านใหม่ ${newStoresToCreate.length} ร้าน...`, { id: 'import-toast' })
          console.log(`🆕 Creating ${newStoresToCreate.length} new stores...`)

          // Parallel creation of stores
          const createStorePromises = newStoresToCreate.map(async (storeData) => {
            try {
              const res = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(storeData)
              })
              if (res.ok) {
                const created = await res.json()
                storeMap.set(created.code, created.id) // Update map
              }
            } catch (err) {
              console.error('Failed to create store:', storeData.code, err)
            }
          })

          await Promise.all(createStorePromises)
          console.log('✅ All new stores created')
        }

        // 3. Create Visits in Parallel
        toast.loading(`กำลังบันทึกการเข้าพบ ${data.length} รายการ (ตรวจสอบรายชื่อเซลล์)...`, { id: 'import-toast' })

        let successCount = 0
        let errorCount = 0

        const newVisits: any[] = []

        const visitPromises = data.map(async (row: any) => {
          try {
            // Helper to get value from row with fuzzy key matching
            const getValue = (obj: any, candidates: string[]) => {
              const keys = Object.keys(obj)
              const foundKey = keys.find(k => candidates.includes(k.trim().toLowerCase()))
              return foundKey ? obj[foundKey] : undefined
            }

            const storeCode = getValue(row, ['รหัส', 'code', 'store_code', 'รหัสร้าน'])
            const storeId = storeCode ? (storeMap.get(storeCode) || null) : null

            // Check Sales Name with fuzzy matching
            let rawSales = getValue(row, ['เซลล์', 'sales', 'sale', 'sales_name', 'พนักงานขาย'])
            let salesName = rawSales || 'ไม่ระบุ'

            if (salesName !== 'ไม่ระบุ') {
              salesName = String(salesName).trim() // Ensure string and trim
              if (!validSales.has(salesName)) {
                salesName = `${salesName} (ยังไม่ลงทะเบียน)`
              }
            }

            const visitData = {
              date: getValue(row, ['วันที่', 'date', 'visit_date']) || new Date().toISOString(),
              sales: salesName,
              storeRef: storeCode || null,
              masterId: storeId, // Resolve ID from map
              visitCat: getValue(row, ['หัวข้อเข้าพบ', 'ประเภทลูกค้า', 'customertype', 'visit_cat']) || null,
              visitType: getValue(row, ['ประเภทเข้าพบ', 'visittype', 'visit_type']) || 'general',
              dealStatus: getValue(row, ['สถานะ', 'status', 'deal_status']) || 'pending',
              closeReason: getValue(row, ['เหตุผล', 'reason', 'close_reason']) || null,
              notes: {
                text: getValue(row, ['บันทึก', 'notes', 'note', 'details']) || null
              },
              order: getValue(row, ['คำสั่งซื้อ', 'order', 'order_amount']) || null
            }

            const res = await fetch('/api/visits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(visitData)
            })

            if (res.ok) {
              const createdVisit = await res.json()
              newVisits.push(createdVisit) // Collect created visits
              successCount++
            } else {
              errorCount++
            }

          } catch (err) {
            errorCount++
          }
        })

        await Promise.all(visitPromises)

        // Optimize: Update Local State directly instead of re-fetching ALL data
        if (newVisits.length > 0) {
          console.log(`� Manually updating ${newVisits.length} visits in state...`)
          setVisits((prev: any) => [...newVisits, ...prev]) // Prepend new visits
        }

        // Only fetch plans (usually smaller dataset)
        await fetchPlans()

        toast.success(`Import เสร็จสิ้น: สำเร็จ ${successCount}, ล้มเหลว ${errorCount}`, { id: 'import-toast' })
      } catch (err) {
        console.error('❌ Import error:', err)
        toast.error(`ไฟล์ไม่ถูกต้อง: ${err}`, { id: 'import-toast' })
      }
    }

    reader.onerror = () => {
      console.error('❌ FileReader error')
      toast.error('ไม่สามารถอ่านไฟล์ได้', { id: 'import-toast' })
    }

    // Modern: readAsArrayBuffer
    reader.readAsArrayBuffer(file)

    // Reset input
    e.target.value = ''
  }

  // --- CHART CONFIG (Colors & Labels for Stacked Bar) ---
  const chartConfig = {
    typeA: { label: "ร้านเดิม A", color: "#3b82f6" }, // Blue
    typeB: { label: "ร้านเดิม B", color: "#06b6d4" }, // Cyan
    new: { label: "ร้านใหม่ N", color: "#22c55e" },   // Green
    closed: { label: "ปิดการขาย", color: "#ef4444" },  // Red
    typeT: { label: "พัฒนา T", color: "#eab308" },    // Yellow
    typeD: { label: "ตัวแทน D", color: "#a855f7" },    // Purple
    general: { label: "ทั่วไป", color: "#94a3b8" }     // Slate
  }

  // --- AGGREGATION: Sales Performance (Real Data) ---
  // Group by Sales Rep -> Then by Type (Stacked)
  const salesPerformance = useMemo(() => {
    return filteredVisits.reduce((acc: any[], visit: any) => {
      const name = (visit.sales || "ไม่ระบุ").trim() // Sales Rep Name
      let rep = acc.find((item: any) => item.name === name)

      if (!rep) {
        rep = {
          name,
          total: 0,
          // Stacked Data properties (initialize - ensure numbers)
          typeA: 0, typeB: 0, new: 0, closed: 0, typeT: 0, typeD: 0, general: 0,
          plans: 0
        }
        acc.push(rep)
      }

      rep.total++

      // Categorize Visit
      const cat = visit.visitCat || visit.store?.customerType || ""
      const status = visit.dealStatus
      const lowerCat = cat.toLowerCase()

      // Determine which stack to increment - Priority Logic
      if (status === 'closed') {
        rep.closed++
      } else if (lowerCat.includes('a')) {
        rep.typeA++
      } else if (lowerCat.includes('b')) {
        rep.typeB++
      } else if (lowerCat.includes('ใหม่') || lowerCat.includes('n') || visit.visitType === 'new') {
        rep.new++
      } else if (lowerCat.includes('t')) {
        rep.typeT++
      } else if (lowerCat.includes('d')) {
        rep.typeD++
      } else {
        rep.general++
      }

      return acc
    }, [])
  }, [filteredVisits])

  // Merge Plans Count to salesPerformance (for Table view if needed)
  // But strictly for the "Future Plans" Chart, we need a separate structure grouped by Rep -> Type

  const plansStats = useMemo(() => {
    if (!plans) return []
    return plans.reduce((acc: any[], plan: any) => {
      const name = plan.sales || "ไม่ระบุ"
      let rep = acc.find((item: any) => item.name === name)

      if (!rep) {
        rep = {
          name,
          total: 0,
          typeA: 0, typeB: 0, new: 0, closed: 0, typeT: 0, typeD: 0, general: 0
        }
        acc.push(rep)
      }

      rep.total++

      const cat = plan.visitCat || plan.store?.customerType || ""
      const lowerCat = cat.toLowerCase()

      // Logic for plans categorization
      if (lowerCat.includes('a')) rep.typeA++
      else if (lowerCat.includes('b')) rep.typeB++
      else if (lowerCat.includes('ใหม่') || lowerCat.includes('n')) rep.new++
      else if (lowerCat.includes('t')) rep.typeT++
      else if (lowerCat.includes('d')) rep.typeD++
      else rep.general++

      return acc
    }, [])
  }, [plans])


  // Calculate Percentages for Table
  salesPerformance.forEach((item: any) => {
    item.percent = item.total > 0 ? Math.round((item.closed / item.total) * 100) : 0
  })

  // 3. CLOSED DEALS DATA (For Charts)
  const closedBySalesData = salesPerformance.map((item: any) => ({
    name: item.name,
    value: item.closed
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
    <div className="min-h-screen space-y-6 p-6 dark:bg-[#0f172a] bg-slate-50 text-slate-900 dark:text-slate-100 font-sans">

      {/* ================== TOP CONTROLS ================== */}
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="grid grid-cols-5 gap-2 bg-white dark:bg-[#1e293b] p-2 rounded-xl border dark:border-slate-800 shadow-sm">
          {['day', 'week', 'month', 'quarter', 'year'].map(p => (
            <FilterButton
              key={p}
              active={period === p}
              onClick={() => setPeriod(p as Period)}
              icon={p === 'year' ? <BarChart2 className="w-4 h-4 mr-2" /> : p === 'quarter' ? <PieChart className="w-4 h-4 mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
              label={p === 'day' ? 'วันนี้' : p === 'week' ? 'สัปดาห์นี้' : p === 'month' ? 'เดือนนี้' : p === 'quarter' ? 'ไตรมาสนี้' : 'ปีนี้'}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex  flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <ActionButton onClick={handleExportVisits} label="Export เข้าพบ" icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />} />
            <ActionButton onClick={handleExportPlans} label="Export แผน" icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />} />
            <ActionButton onClick={handleExportAll} label="Export ทั้งหมด" icon={<Database className="w-4 h-4 mr-2 text-purple-600" />} />
            <ActionButton onClick={() => { fetchVisits(); fetchPlans(); toast.success("รีเฟรชข้อมูลล่าสุดแล้ว") }} label="รีเฟรช" icon={<Zap className="w-4 h-4 mr-2 text-amber-500" />} />
            <div className="relative">
              <input type="file" ref={fileInputRef} onChange={handleImportExcel} className="hidden" accept=".xlsx, .xls" />
              <ActionButton onClick={() => fileInputRef.current?.click()} label="Import Excel" icon={<Upload className="w-4 h-4 mr-2" />} />
            </div>
          </div>
          <div className="flex gap-2">
            <ActionButton
              onClick={handleExportPlans}
              label="ล้างข้อมูล"
              className="bg-red-500 hover:bg-red-600 text-white border-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              icon={<FileSpreadsheet className="w-4 h-4 mr-2 text-white" />}
              variant="default"
            />

          </div>
        </div>
      </div>

      {/* ================== 1. CALENDAR (Centered & Compact) ================== */}
      <div className="flex justify-center py-4">
        <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-slate-200 shadow-xl w-full max-w-3xl border-t-4 border-t-blue-500">
          <CardHeader className="py-3 px-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold dark:text-blue-100 text-slate-800">
                ปฏิทินแผนงาน - {format(currentDate, 'MMMM yyyy', { locale: th })}
              </span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeft className="w-5 h-5 dark:text-slate-300" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())} className="text-sm dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">วันนี้</Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRight className="w-5 h-5 dark:text-slate-300" /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-white dark:bg-[#0f172a]">
            {/* Legend */}
            <div className="mb-4 flex gap-4 text-xs justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="dark:text-slate-400">มีการเข้าพบ</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="dark:text-slate-400">ปิดการขาย</span>
              </div>
            </div>

            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(val) => val && setCurrentDate(val)}
              onDayClick={handleDateClick}
              month={currentDate}
              locale={th}
              weekStartsOn={1}
              className="w-full"
              modifiers={{
                hasVisit: (date) => displayVisits.some((v: any) => isSameDay(new Date(v.date), date)),
                hasClosedDeal: (date) => displayVisits.some((v: any) => isSameDay(new Date(v.date), date) && v.dealStatus === 'closed')
              }}
              modifiersClassNames={{
                hasVisit: "bg-red-500 dark:bg-red-500 text-white dark:text-orange-300 font-bold hover:bg-orange-500 dark:hover:bg-red-300 rounded-md",
                hasClosedDeal: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800/60 rounded-md"
              }}
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                caption: "hidden",
                table: "w-full border-collapse",
                head_row: "flex w-full mb-4",
                head_cell: "w-full text-slate-500 dark:text-slate-400 font-semibold text-sm text-center uppercase tracking-wide",
                row: "flex w-full mt-2 gap-1",
                cell: "relative w-full p-0 flex-1 aspect-square",
                day: cn(
                  "h-full w-full p-1 text-sm font-medium transition-all rounded-lg flex items-center justify-center",
                  "hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 border border-transparent",
                  "aria-selected:bg-blue-600 aria-selected:text-white aria-selected:hover:bg-blue-700 aria-selected:shadow-md"
                ),
                day_today: "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md",
                day_outside: "text-slate-300 dark:text-slate-700 opacity-50",
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* ================== CALENDAR POPUP (Fixed Z-Index & Styling) ================== */}
      {showVisitPopup && popupDate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowVisitPopup(false)}
          />

          {/* Modal Content */}
          <Card className="relative w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-0 ring-1 ring-white/10 dark:bg-[#1e293b] bg-white animate-in zoom-in-95 duration-200">
            <CardHeader className="flex-none flex flex-row items-center justify-between py-4 px-5 border-b dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 w-1.5 h-8 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                <div>
                  <CardTitle className="text-lg font-bold dark:text-slate-100 flex items-center gap-2">
                    รายละเอียดการเข้าพบ
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-normal text-slate-600 dark:text-slate-400">
                      {selectedDateVisits.length} ร้าน
                    </span>
                  </CardTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {format(popupDate, 'PPPP', { locale: th })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVisitPopup(false)}
                className="h-9 w-9 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              <div className="divide-y dark:divide-slate-700/50">
                {selectedDateVisits.length > 0 ? selectedDateVisits.map((visit: any, i: number) => (
                  <div key={i} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${visit.dealStatus === 'closed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-500'}`}></div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                            {visit.store?.name || visit.storeRef || "ไม่ระบุร้าน"}
                          </h4>
                          {visit.store?.code && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                              #{visit.store.code}
                            </span>
                          )}
                        </div>
                      </div>

                      {visit.dealStatus === 'closed' ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ปิดการขาย
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                          {visit.dealStatus}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mt-3 bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{visit.sales}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{visit.visitType}</span>
                      </div>
                    </div>

                    {(visit.notes?.text || visit.notes?.voice) && (
                      <div className="mt-3 text-sm">
                        {visit.notes?.text && (
                          <div className="flex gap-2 items-start text-slate-600 dark:text-slate-300 pl-1 border-l-2 border-blue-500/30">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                            <p className="italic">"{visit.notes.text}"</p>
                          </div>
                        )}
                        {visit.notes?.voice && (
                          <div className="flex items-center gap-2 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md w-max">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            มีการบันทึกเสียงแนบมา
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    <p>ไม่พบข้อมูลการเข้าพบ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================== 2. STATS (GENERATORS) ================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-[400px]">
          <ChartCard
            title="ผลงานรายเซลล์ - จำแนกตามภารกิจ"
            detail="เปรียบเทียบภารกิจรายบุคคล (สัปดาห์นี้)"
            ran="ทั้งหมด"
            data={salesPerformance}
            nameKey="name"

            config={chartConfig}
            type="stacked"
          />
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <ChartCard
            title="แผนเข้าพบ - เป้าหมายรายเซลล์"
            detail="แผนงานแยกตามประเภทลูกค้า"
            ran="ทั้งหมด"
            data={plansStats}
            nameKey="name"
            config={chartConfig}
            type="stacked"
          />
        </div>
        <div className="lg:col-span-1 h-[400px]">
          <ChartCard
            title="ยอดปิดการขาย - รายเซลล์"
            detail={`ปิดสำเร็จ ${stats.closedDeals} ครั้ง (${stats.successRate}%)`}
            ran="ทั้งหมด"
            data={closedBySalesData}
            dataKey="value"
            nameKey="name"
            config={{ value: { label: "ปิดการขาย", color: "#f43f5e" } }}
            type="bar"
          />
        </div>
      </div>

      {/* ================== 4. TABLES ================== */}
      <div className="grid gap-8">
        {/* Table 1: Performance */}
        <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-l-4 border-l-indigo-500 shadow-md">
          <CardHeader className="py-4 border-b dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-lg dark:text-indigo-100 text-slate-800">ตารางสรุปผลงานรายบุคคล</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="dark:text-slate-300">
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="dark:border-slate-800 border-slate-100">
                  <TableHead className="dark:text-slate-400 font-semibold">เซลล์</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">เข้าพบทั้งหมด</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">งานใหม่</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">ปิดการขาย</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-right">% สำเร็จ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesPerformance.length > 0 ? salesPerformance.map((row: any, i: number) => (
                  <TableRow key={i} className="dark:border-slate-800 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium dark:text-indigo-200 text-indigo-700">{row.name}</TableCell>
                    <TableCell className="text-center">{row.total}</TableCell>
                    <TableCell className="text-center text-blue-500 dark:text-blue-400">{row.new}</TableCell>
                    <TableCell className="text-center text-emerald-500 dark:text-emerald-400 font-bold">{row.closed}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(row.percent) >= 50
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                        {row.percent}%
                      </span>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                      ไม่มีข้อมูลสำหรับช่วงเวลานี้
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Table 2: Store Types Summary (New) */}
        <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-md">
          <CardHeader className="py-4 border-b dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-lg dark:text-emerald-100 text-slate-800">สรุปตามประเภทร้าน</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="dark:text-slate-300">
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow className="dark:border-slate-800 border-slate-100">
                  <TableHead className="dark:text-slate-400 font-semibold">ประเภทร้าน</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">จำนวนร้าน</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">สัดส่วน</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-center">จำนวนปิดงาน</TableHead>
                  <TableHead className="dark:text-slate-400 font-semibold text-right">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeTypesData.map((type: any, i: number) => (
                  <TableRow key={i} className="dark:border-slate-800 border-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium dark:text-emerald-200 text-emerald-700">{type.name}</TableCell>
                    <TableCell className="text-center">{type.value}</TableCell>
                    <TableCell className="text-center text-blue-500 dark:text-blue-400">
                      {Math.round((type.value / (stats.stores || 1)) * 100)}%
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-400">-</TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                        ปกติ
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Visit Details Popup Modal */}
      {showVisitPopup && popupDate && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowVisitPopup(false)}
        >
          <Card
            className="dark:bg-[#1e293b] dark:border-slate-700 border-slate-200 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="py-4 px-6 border-b dark:border-slate-700 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <CardTitle className="text-lg dark:text-white">
                    รายละเอียดวันที่ ({selectedDateVisits.length} ร้าน)
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVisitPopup(false)}
                  className="hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {format(popupDate, 'd MMMM yyyy', { locale: th })}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[60vh]">
              <div className="divide-y dark:divide-slate-700">
                {selectedDateVisits.map((visit: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-orange-400">
                            {visit.storeRef || visit.masterId || 'ไม่ระบุรหัส'}
                          </span>
                          {visit.dealStatus === 'closed' && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                              ปิดการขาย
                            </span>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-3 h-3" />
                            <span>เซลล์: {visit.sales || 'ไม่ระบุ'}</span>
                          </div>
                          {visit.visitType && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span>ประเภท: {visit.visitType}</span>
                            </div>
                          )}
                          {visit.notes && Object.keys(visit.notes).length > 0 && (
                            <div className="text-xs text-slate-500 mt-2 italic">
                              {Object.values(visit.notes)[0] as string}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
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
          <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mt-1">{label}</div>
        </div>
      </div>
      {/* Sparkle effect if active */}
      {active && <Zap className="absolute top-1 right-1 w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />}
    </div>
  )
}