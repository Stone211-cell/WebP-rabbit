"use client"

import { useEffect, useState } from "react"
import { format, addDays, startOfWeek, isSameDay, subWeeks, addWeeks } from "date-fns"
import { th } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatThaiDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Helpers
function getNextFriday22() {
  const now = new Date()
  const day = now.getDay() // 0-6 (Sun-Sat)

  // Calculate days until next Friday (5)
  let diff = 5 - day
  if (diff < 0 || (diff === 0 && now.getHours() >= 22)) {
    diff += 7
  }

  const target = new Date()
  target.setHours(22, 0, 0, 0)
  target.setDate(now.getDate() + diff)

  // Safety check if we already passed 22:00 today (if today is Friday)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7)
  }

  return target
}

const DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

export default function JobCard({ plans, visits }: any) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number }>({ d: 0, h: 0 })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [today] = useState(new Date())
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }))

  useEffect(() => {
    const updateTimer = () => {
      const target = getNextFriday22()
      const now = new Date()
      const diff = target.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0 })
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24))
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
        setTimeLeft({ d, h })
      }
    }

    updateTimer()
    const timer = setInterval(updateTimer, 60000) // Update every minute is enough for h/d
    return () => clearInterval(timer)
  }, [])

  // Helpers
  const normalizeName = (s: string) => s.replace(/\s*\(ยังไม่ลงทะเบียน\)\s*/g, '').toLowerCase().replace(/\s+/g, '')

  // Get current week (Sun-Sat as per image)
  const weekStart = currentWeekStart
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

  const goToPrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1))
  const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1))

  // Filter for the selected day
  const dayPlans = (plans || []).filter((p: any) => isSameDay(new Date(p.date), selectedDate))
  const dayVisits = (visits || []).filter((v: any) => isSameDay(new Date(v.date), selectedDate))

  // 1. Get all unique sales reps for this day (from plans and visits)
  const dayRepMap = new Map<string, string>() // norm -> display
  dayPlans.forEach((p: any) => {
    const name = (p.sales || "ไม่ระบุ").trim()
    dayRepMap.set(normalizeName(name), name)
  })
  dayVisits.forEach((v: any) => {
    const name = (v.sales || "ไม่ระบุ").trim()
    const norm = normalizeName(name)
    if (!dayRepMap.has(norm)) {
      dayRepMap.set(norm, name)
    }
  })

  // 2. Group data by salesperson
  const groupedData = Array.from(dayRepMap.entries()).map(([normName, displayName]) => {
    const repPlans = dayPlans.filter((p: any) => normalizeName(p.sales || "") === normName)
    const repVisits = dayVisits.filter((v: any) => normalizeName(v.sales || "") === normName)

    // Calculate progress: how many plans have a matching visit?
    const completedCount = repPlans.filter(p => {
      return repVisits.some((v: any) =>
        v.masterId === p.masterId ||
        (v.store?.code && v.store.code === p.storeCode) ||
        (v.storeRef && v.storeRef === p.storeRef)
      )
    }).length

    return {
      name: displayName,
      plans: repPlans,
      visits: repVisits,
      progress: `${completedCount}/${repPlans.length}`
    }
  })

  return (
    <div className="p-2 md:p-6 space-y-4 animate-in fade-in duration-700 bg-slate-50/30 dark:bg-[#0f172a]/20 min-h-screen">

      {/* GRADIENT BANNER: COUNTDOWN */}
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] p-4 md:p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group border border-white/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <span className="text-9xl">📋</span>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-indigo-100 font-bold uppercase tracking-[0.2em] text-[10px]">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(251,113,113,0.8)]" />
            Job Card หมดอายุใน
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-3xl md:text-5xl font-black tracking-tighter">{timeLeft.d} วัน {timeLeft.h} ชั่วโมง</span>
          </div>
          <p className="text-indigo-100/60 text-xs font-bold italic tracking-tight uppercase">ทุกศุกร์ เวลา 22:00 น.</p>
        </div>
      </div>

      {/* WEEK SELECTOR */}
      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-white/20 dark:border-slate-800/50 rounded-[2rem] shadow-lg overflow-hidden">
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={goToPrevWeek} className="h-8 w-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700">←</Button>
            <div className="flex items-center gap-2">
              <span className="text-lg">🗓️</span>
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">
                {formatThaiDate(weekStart, 'd MMM yyyy')} {weekStart.getMonth() !== addDays(weekStart, 6).getMonth() && `- ${formatThaiDate(addDays(weekStart, 6), 'd MMM yyyy')}`}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextWeek} className="h-8 w-8 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700">→</Button>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {weekDays.map((date) => {
              const isSelected = isSameDay(date, selectedDate)
              const isToday = isSameDay(date, today)
              const isFriday = date.getDay() === 5
              const hasPlans = (plans || []).some((p: any) => isSameDay(new Date(p.date), date))

              // Color Logic based on image
              let boxClass = "bg-slate-200/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-500"
              if (isToday) boxClass = "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
              else if (isFriday) boxClass = "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              else if (hasPlans) boxClass = "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"

              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center py-4 rounded-2xl transition-all relative border-t-2 border-transparent",
                    boxClass,
                    isSelected && !isToday && !isFriday && !hasPlans ? "ring-2 ring-slate-400 dark:ring-slate-600" : "",
                    isSelected ? "scale-105" : "hover:brightness-110 active:scale-95"
                  )}
                >
                  <span className="text-[10px] font-black uppercase mb-1 opacity-80">
                    {DAYS_TH[date.getDay()]}
                  </span>
                  <span className="text-xl font-black tracking-tighter">
                    {date.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          {/* LEGEND Indicators */}
          <div className="flex justify-center flex-wrap gap-6 pt-6 border-t border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-600 shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">วันนี้</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">มีแผน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-rose-500 shadow-sm" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">ศุกร์</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SALESPERSON GROUPS & PLANS */}
      <div className="space-y-10 pb-20">
        {groupedData.length > 0 ? (
          groupedData.map((repData, index) => {
            const { name, plans: salesPlans, progress } = repData
            const colors = ['bg-[#10b981]', 'bg-[#3b82f6]', 'bg-[#8b5cf6]', 'bg-[#f59e0b]']
            const headerColor = colors[index % colors.length]

            return (
              <div key={name} className="space-y-4 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 150}ms` }}>
                {/* SALESPERSON GROUP HEADER */}
                <div className={cn(
                  "flex justify-between items-center px-6 py-4 rounded-2xl text-white shadow-xl border border-white/20",
                  headerColor
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl ring-2 ring-white/30">
                      👤
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black tracking-tight">{name}</span>
                      <span className="text-[10px] font-medium opacity-70 uppercase tracking-widest">พนักงานขาย</span>
                    </div>
                  </div>
                  <div className="bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/10">
                    <span className="text-sm font-black italic">{progress}</span>
                  </div>
                </div>

                {/* PLAN CARDS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {salesPlans.length > 0 ? salesPlans.map((p: any, pIdx: number) => {
                    const isCompleted = (visits || []).some((v: any) =>
                      (v.masterId === p.masterId || (v.store?.code && v.store.code === p.storeCode)) &&
                      isSameDay(new Date(v.date), new Date(p.date))
                    )

                    return (
                      <Card key={p.id} className="bg-white/90 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative">
                        {/* Left Accent Bar */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1.5",
                          pIdx % 2 === 0 ? "bg-orange-500" : "bg-blue-500"
                        )} />

                        <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ตามแผนลำดับที่ {pIdx + 1}</span>
                              <h3 className="text-lg font-black text-slate-800 dark:text-white truncate max-w-[180px] group-hover:text-blue-500 transition-colors">
                                {p.store?.name || p.storeName || "Unknown Store"}
                              </h3>
                            </div>
                            <div className={cn(
                              "w-2.5 h-2.5 rounded-full shadow-[0_0_10px]",
                              isCompleted ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50 animate-pulse"
                            )} />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-3 py-1 text-[10px] font-black border-none">
                                📅 {DAYS_TH[new Date(p.date).getDay()]} {formatThaiDate(p.date, "dd/MM")}
                              </Badge>
                            </div>
                            <p className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">รหัส: {p.storeRef || p.storeCode || "N/A"}</p>
                          </div>

                          <div className="bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/50 group-hover:bg-blue-500/5 transition-colors">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <span className="text-base">🏢</span>
                              <span className="text-[10px] font-black uppercase truncate">{p.visitCat || "ทั่วไป"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 mt-2">
                            {isCompleted ? (
                              <>
                                <span className="text-lg">✅</span>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase italic">เข้าพบเรียบร้อย</span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg">⚠️</span>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase italic">ยังไม่เข้าพบ</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }) : (
                    <div className="col-span-full py-10 bg-slate-100/30 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center">
                      <span className="text-2xl mb-2">📍</span>
                      <p className="text-xs font-bold text-slate-500">ไม่มีแผนงาน แต่มีบันทึกการเข้าพบจริง</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 pb-32 text-center animate-in zoom-in duration-1000">
            <div className="w-32 h-32 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 flex items-center justify-center text-5xl shadow-inner mb-6 grayscale opacity-40">
              🗂️
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">ไม่มีแผนงานสำหรับวันนี้</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold italic mt-2">เลือกวันอื่นในตารางสัปดาห์ หรือวางแผนใหม่ที่เมนู "แผนสัปดาห์"</p>
          </div>
        )}
      </div>
    </div>
  )
}