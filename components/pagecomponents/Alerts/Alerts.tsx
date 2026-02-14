"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { endOfMonth, differenceInDays, format } from "date-fns"
import axios from "axios"

interface StoreGoal {
  name: string
  goal: number
  done: number
  color: string
}

export default  function Alerts({ storestest, visits }: any){
  const [daysLeft, setDaysLeft] = useState(0)

  const [stores, setStores] = useState<StoreGoal[]>([
    { name: "ร้าน A", goal: 2, done: 0, color: "green" },
    { name: "ร้าน B", goal: 1, done: 0, color: "blue" },
    { name: "ร้าน T", goal: 3, done: 0, color: "red" },
  ])

  useEffect(() => {
    const now = new Date()
    const end = endOfMonth(now)
    const diff = differenceInDays(end, now) + 1
    setDaysLeft(diff)

    // =========================
    // 🔥 ตัวอย่างเชื่อม API (คอมเมนต์ไว้)
    // =========================
    /*
    axios.get("/api/monthly-goals")
      .then(res => {
        setStores(res.data)
      })
      .catch(err => {
        console.error(err)
      })
    */
  }, [])

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-[#0f172a]">

      {/* HEADER ORANGE */}
      <Card className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-8 mb-6 border-none">
        <div className="text-center">
          <p className="text-sm opacity-90">⏰ เหลือเวลาอีก</p>
          <h1 className="text-5xl font-bold">{daysLeft}</h1>
          <p className="text-lg">วัน</p>

          <div className="mt-4 border-t border-white/30 pt-3 text-sm opacity-90">
            จบสิ้นเดือน {format(new Date(), "MMMM yyyy")}
          </div>
        </div>
      </Card>

      {/* GOAL SECTION */}
      <Card className="p-6 bg-white dark:bg-[#1e293b] border">
        <h2 className="font-semibold mb-6 text-gray-700 dark:text-white">
          🎯 เป้าหมายการเข้าพบต่อเดือน
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {stores.map((store, index) => {
            const percent =
              store.goal === 0
                ? 0
                : Math.round((store.done / store.goal) * 100)

            return (
              <div
                key={index}
                className={`
                  rounded-xl p-5 bg-gray-100 dark:bg-slate-700
                  border-l-4
                  ${
                    store.color === "green"
                      ? "border-green-500"
                      : store.color === "blue"
                      ? "border-blue-500"
                      : "border-red-500"
                  }
                `}
              >
                <h3
                  className={`
                    font-semibold text-lg mb-2
                    ${
                      store.color === "green"
                        ? "text-green-600"
                        : store.color === "blue"
                        ? "text-blue-600"
                        : "text-red-500"
                    }
                  `}
                >
                  {store.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  เป้าหมาย: {store.goal} ครั้ง/เดือน
                </p>

                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600">✔ {store.done}</span>
                  <span className="text-orange-500">
                    ⌛ {store.goal - store.done}
                  </span>
                </div>

                <Progress value={percent} />

                <p className="text-center text-xs mt-2 text-gray-500 dark:text-gray-300">
                  {percent}%
                </p>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}