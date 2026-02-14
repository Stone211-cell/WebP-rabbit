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
        <div className="rounded-xl bg-[oklch(28.2%_0.091_267.935)] p-4 shadow-xl">
            <p className="text-sm font-semibold dark:text-white">{label}</p>
            <p className="text-xs text-muted-foreground dark:text-gray-300">
                สรุปข้อมูลรายบุคคล
            </p>

            <div className="mt-2 text-lg font-bold dark:text-red-400">
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
}: any) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>
                    {detail} | ช่วง: {ran}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="min-h-[250px] w-full"
                >
                    <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />

                        <YAxis />

                        <ChartTooltip content={<CustomTooltip />} />

                        <Bar
                            dataKey="mobile"
                            radius={6}
                            fill={PRIMARY_COLOR}
                            fillOpacity={1}
                            activeBar={{
                                fill: HOVER_COLOR,
                                opacity: 1,
                            }}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}