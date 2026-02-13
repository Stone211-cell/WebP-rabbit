"use client"

import { useState } from "react"
import axios from "axios" // 👉 ใช้ถ้าจะต่อ API จริง
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from "date-fns"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { CalendarIcon } from "lucide-react"

export default
    function ForecastForm({ stores, forecasts }: any) {
    const [date, setDate] = useState<Date>(new Date())

    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 })

    const goPrevWeek = () => setDate(subWeeks(date, 1))
    const goNextWeek = () => setDate(addWeeks(date, 1))

    const handleCreate = async () => {
        try {
            const payload = {
                weekStart,
                weekEnd,
            }

            // 🔥 ต่อ API ตรงนี้
            // await axios.post("/api/forecast", payload)

            console.log(payload)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="min-h-screen p-6 dark:bg-[#0f172a] text-white">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-semibold">
                    คาดการณ์ <span className="text-blue-400">ลูกค้ารายสัปดาห์</span>
                </h2>

                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    + เพิ่มคาดการณ์
                </Button>
            </div>

            {/* WEEK NAV */}
            <div className="flex items-center justify-center gap-6 mb-12">

                <Button variant="outline" onClick={goPrevWeek}>
                    ← สัปดาห์ก่อน
                </Button>

                {/* POPUP CALENDAR */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="text-sm">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(weekStart, "d MMM yyyy")} -{" "}
                            {format(weekEnd, "d MMM yyyy")}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="bg-[#0f172a] border-gray-700">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(d) => d && setDate(d)}
                        />
                    </PopoverContent>
                </Popover>

                <Button variant="outline" onClick={goNextWeek}>
                    สัปดาห์ถัดไป →
                </Button>

            </div>

            {/* EMPTY STATE */}
            <Card className="bg-transparent border-none shadow-none">
                <div className="flex flex-col items-center justify-center py-20 text-center">

                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-30 mb-4" />

                    <h3 className="text-lg font-semibold text-gray-300">
                        ยังไม่มีข้อมูลคาดการณ์
                    </h3>

                    <p className="text-sm text-gray-400 mt-2">
                        คลิก "+ เพิ่มคาดการณ์" เพื่อเริ่มต้น
                    </p>

                </div>
            </Card>

        </div>
    )
}