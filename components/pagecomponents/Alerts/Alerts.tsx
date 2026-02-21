"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { endOfMonth, differenceInDays, format, startOfMonth, isWithinInterval } from "date-fns"
import { th } from "date-fns/locale"
import { cn, formatThaiDate } from "@/lib/utils"
import axios from "axios"

export default function Alerts({ stores, visits, forecasts }: any) {
  const [currentTime] = useState(new Date())
  const [products, setProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // 1. Fetch Products via Axios
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products")
        setProducts(res.data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  // 2. Calculate Time Stats
  const monthEnd = endOfMonth(currentTime)
  const daysLeft = differenceInDays(monthEnd, currentTime) + 1
  const totalDays = differenceInDays(monthEnd, startOfMonth(currentTime)) + 1
  const progressPercent = Math.round(((totalDays - daysLeft) / totalDays) * 100)

  // 3. Aggregate Monthly Data
  const monthlyStats = useMemo(() => {
    const start = startOfMonth(currentTime)
    const end = endOfMonth(currentTime)

    // Filter visits for current month
    const currentMonthVisits = (visits || []).filter((v: any) =>
      isWithinInterval(new Date(v.date), { start, end })
    )

    // Calculate Store Specific Activity
    const storeActivity = (stores || []).map((store: any) => {
      const storeForecasts = (forecasts || []).filter((f: any) =>
        f.masterId === store.id &&
        isWithinInterval(new Date(f.weekStart), { start, end })
      )

      const sampledForecast = storeForecasts[0]
      const productInfo = sampledForecast ? (products || []).find(p => p.code === sampledForecast.product) : null

      const monthlyGoal = storeForecasts.length > 0 ? Math.max(...storeForecasts.map((f: any) => f.targetMonth || 0)) : 0
      const doneVisits = currentMonthVisits.filter((v: any) => v.masterId === store.id).length

      return {
        id: store.id,
        name: store.name,
        code: store.code,
        productCode: sampledForecast?.product,
        productName: productInfo?.name,
        goal: monthlyGoal,
        done: doneVisits,
        percent: monthlyGoal > 0 ? Math.round((doneVisits / monthlyGoal) * 100) : (doneVisits > 0 ? 100 : 0),
        status: store.status,
        hasActivity: monthlyGoal > 0 || doneVisits > 0
      }
    }).filter((s: any) => s.hasActivity)

    const totalGoals = storeActivity.reduce((sum: number, s: any) => sum + s.goal, 0)
    const totalDone = storeActivity.reduce((sum: number, s: any) => sum + s.done, 0)
    const completionRate = totalGoals > 0 ? Math.round((totalDone / totalGoals) * 100) : 0

    return {
      storeActivity,
      totalGoals,
      totalDone,
      completionRate,
      activeStores: storeActivity.length
    }
  }, [stores, visits, forecasts, products, currentTime])

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 bg-slate-50/30 dark:bg-[#0f172a]/20 min-h-screen pb-20">

      {/* 1. PREMIUM HEADER: MONTHLY COUNTDOWN */}
      <div className="bg-gradient-to-br from-[#f59e0b] via-[#ea580c] to-[#c2410c] p-8 md:p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border border-white/20">
        <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-[2000ms]">
          <span className="text-[12rem] md:text-[18rem]">📊</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2 text-orange-100 font-black uppercase tracking-[0.3em] text-[10px]">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              Monthly Summary & Product Highlights
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
              {formatThaiDate(currentTime, "MMMM yyyy")}
            </h1>
            <p className="text-orange-100/70 text-sm font-bold italic">เหลือเวลาอีก {daysLeft} วัน สำหรับเป้าหมายเดือนนี้</p>
          </div>

          <div className="flex-1 w-full max-w-md bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-xs font-black uppercase tracking-widest text-orange-50">ความคืบหน้าของเวลา</span>
              <span className="text-2xl font-black">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3 bg-black/20" />
            <p className="text-[10px] text-orange-200/60 font-medium italic text-right">ข้อมูลอัปเดตแบบเรียลไทม์</p>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-xl group hover:scale-[1.02] transition-transform">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-3xl border border-emerald-500/20 group-hover:rotate-12 transition-transform">
              🏆
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] mb-1">ภาพรวมความสำเร็จ</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{monthlyStats.completionRate}%</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-xl group hover:scale-[1.02] transition-transform">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-3xl border border-blue-500/20 group-hover:-rotate-12 transition-transform">
              📦
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] mb-1">รายการสินค้าในระบบ</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{products.length} <span className="text-sm font-bold text-slate-400">SKUs</span></h4>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-xl group hover:scale-[1.02] transition-transform">
          <CardContent className="p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-3xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              🎯
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] mb-1">เป้าหมายคงค้าง</p>
              <h4 className="text-3xl font-black text-slate-900 dark:text-white">{Math.max(0, monthlyStats.totalGoals - monthlyStats.totalDone)} <span className="text-sm font-bold text-slate-400">ครั้ง</span></h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. ACTIVITY SUMMARY SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-10 bg-[#ea580c] rounded-full" />
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">สรุปกิจกรรมการเข้าพบประจำเดือน</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold italic">เปรียบเทียบการเข้าพบจริงกับเป้าหมายที่คาดการณ์ไว้ (Forecast)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthlyStats.storeActivity.length > 0 ? (
            monthlyStats.storeActivity.map((s: any, idx: number) => (
              <Card key={s.id} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-lg overflow-hidden group hover:shadow-2xl transition-all animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{s.code}</span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#ea580c] transition-colors">{s.name}</h4>
                      {s.productName && (
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                          <span>🏷️</span>
                          <span>เป้าหมายสินค้า: {s.productName}</span>
                        </div>
                      )}
                    </div>
                    <div className={cn(
                      "px-4 py-1.5 rounded-2xl text-[10px] font-black border uppercase italic shadow-sm",
                      s.status === "เปิดการขาย" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    )}>
                      {s.status}
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Target Goal</span>
                        <span className="text-xl font-black dark:text-white">{s.goal || "-"} <span className="text-[10px] font-bold opacity-40">ครั้ง</span></span>
                      </div>
                      <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Actual Done</span>
                        <span className="text-xl font-black text-emerald-500">{s.done} <span className="text-[10px] font-bold opacity-60">ครั้ง</span></span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em]">
                        <span className="text-slate-500">Monthly Progress</span>
                        <span className={cn(
                          s.percent >= 100 ? "text-emerald-500" : (s.goal > 0 ? "text-[#ea580c]" : "text-blue-500")
                        )}>{s.percent}%</span>
                      </div>
                      <Progress value={s.percent} className="h-2.5 bg-slate-200 dark:bg-black/20" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 italic">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {s.goal > 0 ? (
                      s.percent >= 100 ? "Goal achieved this month!" : `Remaining: ${Math.max(0, s.goal - s.done)} more visits`
                    ) : (
                      "No target goal set for this month"
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-24 text-center space-y-5 bg-white/20 dark:bg-white/5 backdrop-blur-sm rounded-[3rem] border border-white/10 italic animate-pulse">
              <div className="text-7xl grayscale opacity-20">📊</div>
              <div className="space-y-2">
                <div className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em] text-xs">ไม่พบเป้าหมายประจำเดือน</div>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium">กรุณากำหนดเป้าหมายในส่วน 'คาดการณ์รายตัวสัปดาห์' เพื่อดึงข้อมูลมาแสดงผลที่นี่</p>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}