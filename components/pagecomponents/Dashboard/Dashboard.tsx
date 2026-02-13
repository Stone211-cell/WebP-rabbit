'use client'

import { useEffect, useState } from "react"
// import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"



import ChartCard from "@/components/charts/ChartCard"



export default function Dashboard({ stores,visits,summary}: any) {

  const [storesState, setStoresState] = useState<any[]>(stores || [])
  const [summaryState, setSummaryState] = useState<any[]>(summary || [])

  useEffect(() => {

    // 🔵 ต่อ API เมื่อพร้อมใช้งาน
    /*
    const fetchData = async () => {
      try {
        const storeRes = await axios.get("/api/stores")
        const summaryRes = await axios.get("/api/summary")

        setStores(storeRes.data)
        setSummary(summaryRes.data)

      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
    */

  }, [])



  return (
    <div className="p-6 space-y-6 dark:bg-[#0f172a]">

      {/* ================== FILTER BUTTONS ================== */}
      <div className="flex   gap-2 bg-white p-6 rounded-xl shadow-sm dark:bg-[#1b2433]">
        <Button variant="default" className="bg-gray-95 border  border-gray-200 shadow-xl font-medium text-md px-15 py-8 text-black text-center  flex-1 ">📅 วันนี้</Button>
        <Button variant="default" className="bg-blue-500 dark:bg-blue-500 border-2  border-blue text-white px-15 py-8 flex-1 shadow-lg shadow-blue-500/50">📊 สัปดาห์นี้</Button>
        <Button variant="default" className="bg-gray-95 border  border-gray-200 shadow-xl font-medium text-md px-15 py-8 text-black text-center flex-1 ">📆 เดือนนี้</Button>
        <Button variant="default" className="bg-gray-95 border  border-gray-200 shadow-xl font-medium text-md px-15 py-8 text-black text-center flex-1 ">📈 ไตรมาสนี้</Button>
        <Button variant="default" className="bg-gray-95 border  border-gray-200 shadow-xl font-medium text-md px-15 py-8 text-black text-center flex-1 ">🗓 ปีนี้</Button>
      </div> 

      {/* ================== EXPORT BAR ================== */}
      <div className="flex gap-2 items-center">
        <Button variant="default">Export เข้าพบ</Button>
        <Button variant="default">Export แผน</Button>
        <Button variant="default">Export ทั้งหมด</Button>
        <Button variant="default">Import Excel</Button>

        <div className="ml-auto flex gap-2">
          <Button variant="default">สำรองข้อมูล</Button>
          <Button variant="destructive">ล้างข้อมูลทั้งหมด</Button>
        </div>
      </div>

      {/* ================== STAT CARDS ================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 ">
        <StatCard title="เป้าหมายทีม" value="160" sub="ร้าน / สัปดาห์นี้" sty="dark:border-t-4 dark:border-indigo-500 "/>
        <StatCard title="เข้าพบแล้ว" value="0" sub="สัปดาห์นี้" sty="dark:border-t-4 dark:border-blue-500"/>
        <StatCard title="ความสำเร็จ" value="0%" sub="ของเป้าหมาย" sty="dark:border-t-4 dark:border-green-500"/>
        <StatCard title="ร้านใหม่" value="0" sub="รวม ปิดการขาย" sty="dark:border-t-4 dark:border-sky-300"/>
        <StatCard title="ฐานข้อมูลร้านค้า" value="0" sub="ร้านทั้งหมด" sty="dark:border-t-4 dark:border-indigo-500"/>
        <StatCard title="ปิดการขาย" value="0" sub="ตลอดเวลา" sty="dark:border-t-4 dark:border-red-500"/>
      </div>

      {/* ================== CHART SECTION ================== */}
      <div className="grid md:grid-cols-3 gap-4">

        <ChartCard title="ผลงานรายเซลล์ – จำแนกตามภารกิจ" detail="รายละเอียด" ran="ร้าน1"  />
        <ChartCard title="แผนเข้าพบสัปดาห์ถัดไป" detail="รายละเอียด" ran="ร้าน1"  />
        <ChartCard title="ยอดปิดการขาย – รายเซลล์" detail="รายละเอียด"ran="ร้าน1"  />

      </div>


      {/* ================== SUMMARY TABLE ================== */}
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">📊 ตารางสรุปผลงาน</CardTitle>
        </CardHeader>
        <CardContent>

          <Table className="border-none dark:text-white dark:bg-[#1b2433]">
            <TableHeader className="dark:bg-[#475569] ">
              <TableRow >
                <TableHead>เซลล์</TableHead>
                <TableHead>เข้าพบทั้งหมด</TableHead>
                <TableHead>งานใหม่</TableHead>
                <TableHead>ปิดการขาย</TableHead>
                <TableHead>% สำเร็จ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="hover:bg-[#1b2433]">
              {summary.length === 0 ? (
                <TableRow >
                  <TableCell colSpan={5} className=" text-center hover:bg-[#1b2433] dark:text-white">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                summary.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell>{row.new}</TableCell>
                    <TableCell>{row.closed}</TableCell>
                    <TableCell>{row.percent}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

        </CardContent>
      </Card>


      {/* ================== SUMMARY TABLE ================== */}
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">📈 สรุปตามประเภทร้าน</CardTitle>
        </CardHeader>
        <CardContent>

          <Table className="dark:text-white dark:bg-[#0f172a]">
            <TableHeader className="rounded-lg dark:bg-[#475569] ">
              <TableRow className="rounded-lg">
                <TableHead>เซลล์</TableHead>
                <TableHead>เข้าพบทั้งหมด</TableHead>
                <TableHead>งานใหม่</TableHead>
                <TableHead>ปิดการขาย</TableHead>
                <TableHead>% สำเร็จ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="hover:bg-[#1b2433]">
              {summary.length === 0 ? (
                <TableRow >
                  <TableCell colSpan={5} className=" text-center hover:bg-[#1b2433] dark:text-white">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                summary.map((row: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.total}</TableCell>
                    <TableCell>{row.new}</TableCell>
                    <TableCell>{row.closed}</TableCell>
                    <TableCell>{row.percent}%</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

        </CardContent>
      </Card>

    </div>
  )
}

/* ================== COMPONENTS ================== */

function StatCard({ title, value, sub,sty}: any) {
  return (
    <Card className={`dark:bg-[#1b2433] dark:text-white dark:border-gray-700 ${sty}`}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  )
}

