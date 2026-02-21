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
   MAIN COMPONENT (Upgraded for Stacked/Multi-Bar)
================================ */

export default function ChartCard({
    title = "กราฟสรุปผลงาน",
    detail = "ข้อมูลล่าสุด",
    ran = "เดือนนี้",
    data = [],
    config = { mobile: { label: "จำนวน", color: "#60a5fa" } },
    dataKey = "mobile",
    nameKey = "name",
    type = "bar", // 'bar' | 'stacked'
    xAxisLabel = false,
    renderTooltip // Optional custom tooltip renderer
}: any) {
    // Fallback if no data
    const displayData = data.length > 0 ? data : [{ name: "ไม่มีข้อมูล", [typeof dataKey === 'string' ? dataKey : 'value']: 0 }]

    // Determine keys for rendering bars
    // If 'stacked', config keys are used. If 'bar', dataKey is used.
    const barKeys = (type === 'stacked' || type === 'grouped') ? Object.keys(config) : [dataKey]

    return (
        <Card className="shadow-lg flex flex-col h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b]">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    {title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                    {detail}
                </CardDescription>

                {/* Custom Legend for Stacked/Grouped Chart */}
                {(type === 'stacked' || type === 'grouped') && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(config).map(([key, conf]: any) => (
                            <div key={key} className="flex items-center gap-1.5 min-w-max">
                                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: conf.color }}></div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{conf.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 min-h-[400px] p-4">
                <ChartContainer
                    config={config}
                    className="h-full w-full aspect-auto"
                >
                    <BarChart data={displayData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            className="stroke-slate-200 dark:stroke-slate-700"
                        />

                        <XAxis
                            dataKey={nameKey}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            className="text-sm text-slate-600 dark:text-slate-400 font-medium"
                            tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 13 }}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            className="text-sm text-slate-600 dark:text-slate-400"
                            tick={{ fill: 'currentColor', opacity: 0.8, fontSize: 13 }}
                            width={35}
                        />

                        <ChartTooltip
                            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload?.length) return null

                                // Use custom renderer if provided
                                if (renderTooltip) {
                                    return renderTooltip({ active, payload, label })
                                }

                                return (
                                    <div className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 shadow-xl z-50">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{label}</p>
                                        <div className="space-y-1">
                                            {payload.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{entry.value}</span>
                                                </div>
                                            ))}
                                            {(type === 'stacked' || type === 'grouped') && (
                                                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between gap-4 font-black text-sm text-slate-800 dark:text-slate-200">
                                                    <span>รวม</span>
                                                    <span>{payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            }}
                        />

                        {/* Render Bars based on Type */}
                        {barKeys.map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                name={config[key]?.label || key}
                                stackId={type === 'stacked' ? "a" : undefined}
                                fill={config[key]?.color || "#60a5fa"}
                                radius={
                                    (type === 'stacked' || type === 'grouped')
                                        ? [0, 0, 0, 0] // Stacked middle bars usually square
                                        : [4, 4, 0, 0] // Regular bars rounded top
                                }
                                maxBarSize={50}
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}