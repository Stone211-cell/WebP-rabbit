'use client'

import { useEffect, useState } from "react"
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
  endOfQuarter
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
  PieChart
} from "lucide-react"

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

type Period = 'day' | 'week' | 'month' | 'quarter' | 'year'

export default function Dashboard({ stores, visits, summary }: any) {
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState<Period>('day')

  // Data State
  const [storesState, setStoresState] = useState<any[]>(stores || [])
  const [summaryState, setSummaryState] = useState<any[]>(summary || [])

  // Mock Fetch Data
  useEffect(() => {
    // placeholder for fetching when period/currentDate change
  }, [period, currentDate])

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

  // helper nav for the small calendar (Today)
  const goToday = () => setCurrentDate(new Date())

  // Label Generators
  const getPeriodLabel = () => {
    const options = { locale: th }
    switch (period) {
      case 'day':
        return `วันที่: ${format(currentDate, 'd MMM yyyy', options)}`
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
        const end = endOfWeek(currentDate, { weekStartsOn: 1 })
        return `วันที่: ${format(start, 'd MMM yyyy', options)} - ${format(end, 'd MMM yyyy', options)}`
      }
      case 'month':
        return `เดือน: ${format(currentDate, 'MMMM yyyy', options)}`
      case 'quarter': {
        const start = startOfQuarter(currentDate)
        const end = endOfQuarter(currentDate)
        return `ไตรมาส: ${format(start, 'd MMM yyyy', options)} - ${format(end, 'd MMM yyyy', options)}`
      }
      case 'year':
        return `ปี: ${format(currentDate, 'yyyy', options)}`
      default:
        return ''
    }
  }

  const getPreviousLabel = () => {
    switch (period) {
      case 'day': return 'วันก่อนหน้า'
      case 'week': return 'สัปดาห์ก่อน'
      case 'month': return 'เดือนก่อน'
      case 'quarter': return 'ไตรมาสก่อน'
      case 'year': return 'ปีก่อน'
    }
  }

  const getNextLabel = () => {
    switch (period) {
      case 'day': return 'วันถัดไป'
      case 'week': return 'สัปดาห์ถัดไป'
      case 'month': return 'เดือนถัดไป'
      case 'quarter': return 'ไตรมาสถัดไป'
      case 'year': return 'ปีถัดไป'
    }
  }

  return (
    <div className="min-h-screen space-y-6 p-6 dark:bg-[#0f172a] bg-slate-50 text-slate-900 dark:text-slate-100">

      {/* ================== TOP FILTERS ================== */}
      <div className="grid grid-cols-5 gap-2 bg-white dark:bg-[#1e293b] p-2 rounded-xl border dark:border-slate-800 shadow-sm">
        <FilterButton
          active={period === 'day'}
          onClick={() => setPeriod('day')}
          icon={<CalendarIcon className="w-4 h-4 mr-2" />}
          label="วันนี้"
        />
        <FilterButton
          active={period === 'week'}
          onClick={() => setPeriod('week')}
          icon={<LayoutGrid className="w-4 h-4 mr-2" />}
          label="สัปดาห์นี้"
        />
        <FilterButton
          active={period === 'month'}
          onClick={() => setPeriod('month')}
          icon={<CalendarIcon className="w-4 h-4 mr-2" />}
          label="เดือนนี้"
        />
        <FilterButton
          active={period === 'quarter'}
          onClick={() => setPeriod('quarter')}
          icon={<PieChart className="w-4 h-4 mr-2" />}
          label="ไตรมาสนี้"
        />
        <FilterButton
          active={period === 'year'}
          onClick={() => setPeriod('year')}
          icon={<BarChart2 className="w-4 h-4 mr-2" />}
          label="ปีนี้"
        />
      </div>

      {/* ================== ACTION BAR ================== */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <ActionButton label="Export เข้าพบ" icon={<Download className="w-4 h-4 mr-2" />} />
          <ActionButton label="Export แผน" icon={<Download className="w-4 h-4 mr-2" />} />
          <ActionButton label="Export ทั้งหมด" icon={<Download className="w-4 h-4 mr-2" />} />
          <ActionButton label="Import Excel" icon={<Upload className="w-4 h-4 mr-2" />} />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/30">
            <Save className="w-4 h-4" /> ทดสอบการบันทึก
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="dark:bg-[#1e293b] dark:text-slate-200 border-slate-700 hover:bg-slate-800 gap-2">
            <Database className="w-4 h-4" /> สำรองข้อมูล
          </Button>
          <Button variant="destructive" className="gap-2 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30">
            <Trash2 className="w-4 h-4" /> ล้างข้อมูลทั้งหมด
          </Button>
        </div>
      </div>

      {/* ================== DATE NAVIGATION ================== */}
      <div className="flex items-center justify-center gap-4 py-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} className="dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300">
          <ChevronLeft className="w-4 h-4 mr-1" /> {getPreviousLabel()}
        </Button>

        <div className="text-lg font-medium dark:text-slate-200 min-w-[300px] text-center">
          {getPeriodLabel()}
        </div>

        <Button variant="outline" size="sm" onClick={handleNext} className="dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300">
          {getNextLabel()} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* ================== MAIN CONTENT (Calendar) ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-[#1e293b] dark:border-slate-800 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className=" flex items-center justify-between">
              <span>{format(currentDate, 'MMMM yyyy', { locale: th })}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-7 w-7 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300" onClick={() => setCurrentDate(new Date())}>วันนี้</Button>
                <Button variant="outline" size="icon" className="h-7 w-7 dark:bg-[#1e293b] dark:border-slate-700 dark:text-slate-300" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex justify-center p-6 bg-white dark:bg-[#1e293b] rounded-md border dark:border-slate-700">
            {/* Replaced calendar with styled version (supports light/dark) */}
            <div className="w-full max-w-[720px]">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(val) => val && setCurrentDate(val)}
                locale={th}
                weekStartsOn={1}
                className="w-full"
                classNames={{
                  months: "w-full",
                  month: "w-full space-y-6",

                  caption: "flex justify-between items-center text-slate-900 dark:text-white",
                  caption_label: "text-lg font-semibold",

                  nav: "flex gap-2",
                  nav_button:
                    "h-8 w-8 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md transition",
                  nav_button_previous: "",
                  nav_button_next: "",

                  table: "w-full border-collapse bg-transparent",
                  head_row: "border-b border-slate-200 dark:border-slate-700",

                  head_cell: `
  h-12
  bg-slate-100 dark:bg-[#2B3A4F]
  text-slate-800 dark:text-white
  font-medium
  text-center
`,

                  row: "grid grid-cols-7 gap-3 mt-3",

                  cell: "relative h-20",

                  day: `
                    h-20 w-full 
                    bg-slate-100 dark:bg-[#2B3A4F]
                    text-slate-800 dark:text-white
                    flex items-start justify-start
                     text-sm
                    hover:bg-slate-200 
                    transition
                  `,

                  day_today:
                    "border border-blue-500 text-blue-600 dark:text-blue-400 font-semibold",

                  day_selected: `
                    bg-blue-600
                    text-white
                    hover:bg-blue-600
                  `,

                  day_outside: "opacity-30",
                }}
              />

              {/* Today Button */}
              <div className="mt-4 flex justify-end">
                <Button onClick={goToday} className="bg-blue-600 hover:bg-blue-700 text-white">
                  วันนี้
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side placeholder or additional charts can go here */}
        <div className="hidden lg:block relative">
          {/* Space for future charts or detailed list */}
        </div>
      </div>

      {/* ================== STAT CARDS ================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="เป้าหมายทีม"
          value="23"
          sub="ร้าน / วันนี้"
          colorClass="border-indigo-500"
        />
        <StatCard
          title="เข้าพบแล้ว"
          value="0"
          sub="วันนี้"
          colorClass="border-blue-500"
        />
        <StatCard
          title="ความสำเร็จ"
          value="0%"
          sub="ของเป้าหมาย"
          colorClass="border-green-500"
        />
        <StatCard
          title="ร้านใหม่"
          value="0"
          sub="รวม ปิดการขาย (นับผลงาน)"
          colorClass="border-sky-400"
        />
        <StatCard
          title="ฐานข้อมูลร้านค้า"
          value="0"
          sub="ร้านทั้งหมด"
          colorClass="border-indigo-400"
        />
        <StatCard
          title="ปิดการขาย"
          value="0"
          sub="ตลอดเวลา"
          colorClass="border-red-500"
        />
      </div>

      {/* ================== EXISTING CHARTS & SUMMARY (Preserved) ================== */}
      <div className="grid md:grid-cols-3 gap-4">
        <ChartCard title="ผลงานรายเซลล์ – จำแนกตามภารกิจ" detail="รายละเอียด" ran="ร้าน1" />
        <ChartCard title="แผนเข้าพบสัปดาห์ถัดไป" detail="รายละเอียด" ran="ร้าน1" />
        <ChartCard title="ยอดปิดการขาย – รายเซลล์" detail="รายละเอียด" ran="ร้าน1" />
      </div>

      <Card className="dark:bg-[#1e293b] dark:border-slate-800">
        <CardHeader>
          <CardTitle className="dark:text-white">📊 ตารางสรุปผลงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="dark:text-slate-200">
            <TableHeader className="dark:bg-slate-800">
              <TableRow className="dark:border-slate-700">
                <TableHead className="dark:text-slate-300">เซลล์</TableHead>
                <TableHead className="dark:text-slate-300">เข้าพบทั้งหมด</TableHead>
                <TableHead className="dark:text-slate-300">งานใหม่</TableHead>
                <TableHead className="dark:text-slate-300">ปิดการขาย</TableHead>
                <TableHead className="dark:text-slate-300">% สำเร็จ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryState && summaryState.length > 0 ? summaryState.map((row: any, i: number) => (
                <TableRow key={i} className="dark:border-slate-700 hover:dark:bg-slate-800">
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.new}</TableCell>
                  <TableCell>{row.closed}</TableCell>
                  <TableCell>{row.percent}%</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  )
}

// ---------------- Helper Components ----------------

function FilterButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center py-4 px-4 rounded-lg text-sm font-medium transition-all duration-200 border
        ${active
          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
          : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}

function ActionButton({ label, icon }: { label: string, icon: React.ReactNode }) {
  return (
    <Button variant="outline" className="bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      {icon} {label}
    </Button>
  )
}

function StatCard({ title, value, sub, colorClass }: any) {
  return (
    <Card className={`dark:bg-[#1e293b] dark:text-white border-t-4 shadow-md dark:border-slate-800 ${colorClass}`}>
      <CardContent className="p-4">
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500">{sub}</div>
      </CardContent>
    </Card>
  )
}