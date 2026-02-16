"use client"

import {
    ChartContainer,
    ChartTooltip,
    type ChartConfig,
} from "@/components/ui/chart"

import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Cell,
} from "recharts"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"



/* ================================
   🔥 เปลี่ยนสีตรงนี้ง่ายสุด
================================ */

const PRIMARY_COLOR = "#60a5fa"   // เปลี่ยนสีกราฟตรงนี้
const HOVER_COLOR = "#3b82f6"     // สีตอน hover (ถ้าอยากเปลี่ยน)



/* ================================
   CONFIG (ใช้กับ shadcn)
================================ */

const chartConfig = {
    mobile: {
        label: "จำนวน",
        color: PRIMARY_COLOR,
    },
} satisfies ChartConfig



/* ================================
   DATA
================================ */

const chartData = [
    { name: "ตรี", mobile: 12 },
    { name: "กร", mobile: 18 },
    { name: "นิว", mobile: 9 },
    { name: "หมูตุ๋น", mobile: 22 },
]



/* ================================
   CUSTOM TOOLTIP
================================ */

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null

    return (
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xl">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
                สรุปข้อมูลรายบุคคล
            </p>

            <div className="mt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
                {payload[0].value} ครั้ง
            </div>
        </div>
    )
}



/* ================================
   MAIN COMPONENT
================================ */

export default function ChartCard({
    title = "กราฟสรุปผลงาน",
    detail = "ข้อมูลล่าสุด",
    ran = "เดือนนี้",
    data = [],
    config = { mobile: { label: "จำนวน", color: "#60a5fa" } },
    dataKey = "mobile",
    nameKey = "name"
}: any) {
    // Fallback if no data
    const displayData = data.length > 0 ? data : [{ name: "ไม่มีข้อมูล", [dataKey]: 0 }]

    return (
        <Card className="shadow-lg flex flex-col h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]">
            <CardHeader>
                <CardTitle className="text-base text-slate-900 dark:text-white">{title}</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                    {detail} | ช่วง: {ran}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 min-h-[250px]">
                <ChartContainer
                    config={config}
                    className="h-full w-full aspect-auto"
                >
                    <BarChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-slate-200 dark:stroke-slate-700"
                        />

                        <XAxis
                            dataKey={nameKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="text-xs text-slate-600 dark:text-slate-400"
                            tick={{ fill: 'currentColor', opacity: 0.8 }}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            className="text-xs text-slate-600 dark:text-slate-400"
                            tick={{ fill: 'currentColor', opacity: 0.8 }}
                        />

                        <ChartTooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'transparent' }}
                        />

                        <Bar
                            dataKey={dataKey}
                            radius={[6, 6, 0, 0]}
                            fill={config[dataKey]?.color || "#60a5fa"}
                            fillOpacity={0.9}
                            activeBar={{
                                fillOpacity: 1,
                            }}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}