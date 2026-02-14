"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function Fine({ stores, visits }: any) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])

  // ===== SEARCH FUNCTION =====
  const handleSearch = async () => {
    /*
    // 🔥 Axios (Client Side)
    const res = await axios.get("/api/search", {
      params: { q: query },
    })
    setResults(res.data)
    */

    console.log("Searching:", query)
  }

  /*
  // 🔥 Prisma (Server Side Example)
  // app/api/search/route.ts

  import { prisma } from "@/lib/prisma"

  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    const data = await prisma.store.findMany({
      where: {
        OR: [
          { name: { contains: q ?? "", mode: "insensitive" } },
          { owner: { contains: q ?? "", mode: "insensitive" } },
          { product: { contains: q ?? "", mode: "insensitive" } },
        ],
      },
    })

    return Response.json(data)
  }
  */

  return (
    <div className="min-h-screen bg-gray-100  p-4 md:p-10 transition-colors duration-300 dark:bg-[#0f172a]">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-lg md:text-xl font-semibold text-zinc-700 dark:text-zinc-200 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          ค้นหา ข้อมูลทั้งหมด
        </h1>

        {/* SEARCH CARD */}
        <Card className="p-10 md:p-6 rounded-2xl shadow-sm bg-white dark:bg-[#1b2433] border-none">

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-15 h-5" />

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="ค้นหา: ชื่อร้าน, รหัส, เจ้าของ, สินค้า, วันที่, เซลล์..."
              className="pl-12 pr-12 h-12 rounded-xl text-base"
            />

            <Search
              onClick={handleSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 cursor-pointer"
            />
          </div>

          {/* EXAMPLES */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="text-zinc-400">💡 ตัวอย่าง:</span>
            {["สลิป", "ดรี", "โรงแรม", "เครดิต"].map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className="px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* EMPTY STATE */}
      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-zinc-400 dark:text-zinc-500 transition">
          <Search className="w-20 h-20 mb-4 opacity-60" />
          <h2 className="text-lg md:text-xl font-medium">
            ค้นหาข้อมูลทั้งหมด
          </h2>
          <p className="text-sm mt-2">
            พิมพ์คำค้นหา เช่น ชื่อร้าน, รหัส, สินค้า, วันที่, หรือเซลล์
          </p>
        </div>
      )}
    </div>
  )
}