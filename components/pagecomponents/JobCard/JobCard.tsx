"use client"

import { useEffect, useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import { th } from "date-fns/locale"
import { Card } from "@/components/ui/card"

function getNextFriday22() {
  const now = new Date()
  const day = now.getDay()

  const diff = (5 - day + 7) % 7
  const friday = new Date(now)
  friday.setDate(now.getDate() + diff)
  friday.setHours(22, 0, 0, 0)

  if (friday < now) {
    friday.setDate(friday.getDate() + 7)
  }

  return friday
}

export default function JobCard({ plans, visits }: any) {
  const [timeLeft, setTimeLeft] = useState("")
  const [today, setToday] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      const target = getNextFriday22()
      const now = new Date()
      const diff = target.getTime() - now.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)

      setTimeLeft(`${days} วัน ${hours} ชั่วโมง`)
      setToday(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }).map((_, i) =>
    addDays(weekStart, i)
  )

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-[#0f172a]">

      {/* GRADIENT HEADER */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 mb-6 border-none">
        <div className="text-center">
          <p className="text-sm opacity-80">📌 Job Card หมดอายุใน</p>
          <h1 className="text-3xl font-bold mt-2">{timeLeft}</h1>
          <p className="text-sm opacity-80 mt-1">
            ทุกศุกร์ เวลา 22:00 น.
          </p>
        </div>
      </Card>

      {/* WEEK */}
      <Card className="p-6 bg-white dark:bg-[#1e293b] border">
        <h2 className="text-center font-semibold mb-4 text-gray-700 dark:text-white">
          📅 สัปดาห์นี้
        </h2>

        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => {
            const isToday =
              format(day, "yyyy-MM-dd") ===
              format(today, "yyyy-MM-dd")

            const isFriday = day.getDay() === 5
            const isSaturday = day.getDay() === 6

            return (
              <div
                key={day.toString()}
                className={`
                  rounded-lg p-4 text-center text-sm font-medium
                  ${
                    isFriday
                      ? "bg-red-500 text-white"
                      : isSaturday
                      ? "bg-blue-500 text-white"
                      : isToday
                      ? "bg-blue-400 text-white"
                      : "bg-gray-200 dark:bg-slate-700 dark:text-white"
                  }
                `}
              >
                <p>
                  {format(day, "EEE", { locale: th })}
                </p>
                <p className="text-lg font-bold">
                  {format(day, "d")}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-400 rounded-sm" />
            วันนี้
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            มีแผน
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            ศุกร์
          </div>
        </div>
      </Card>

      {/* EMPTY STATE */}
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="font-semibold">ยังไม่มีแผนสัปดาห์นี้</h3>
        <p className="text-sm mt-1">
          ไปที่ "แผนสัปดาห์" เพื่อสร้างแผน
        </p>
      </div>

    </div>
  )
}