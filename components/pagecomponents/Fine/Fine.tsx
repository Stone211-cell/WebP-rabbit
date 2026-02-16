"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, MapPin, ClipboardList, Calendar, User, Tag, Heart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function Fine({ stores = [], visits = [], plans = [] }: any) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  // ===== SEARCH LOGIC =====
  const searchResults = useMemo(() => {
    if (!query.trim()) return { stores: [], visits: [], plans: [], total: 0 }

    const q = query.toLowerCase()

    const filteredStores = stores.filter((s: any) =>
      s.name?.toLowerCase().includes(q) ||
      s.code?.toLowerCase().includes(q) ||
      s.owner?.toLowerCase().includes(q) ||
      s.productUsed?.toLowerCase().includes(q)
    )

    const filteredVisits = visits.filter((v: any) =>
      v.store?.name?.toLowerCase().includes(q) ||
      v.sales?.toLowerCase().includes(q) ||
      v.visitCat?.toLowerCase().includes(q) ||
      (typeof v.notes === 'string' && v.notes.toLowerCase().includes(q)) ||
      (v.notes && typeof v.notes === 'object' && JSON.stringify(v.notes).toLowerCase().includes(q))
    )

    const filteredPlans = plans.filter((p: any) =>
      p.store?.name?.toLowerCase().includes(q) ||
      p.sales?.toLowerCase().includes(q) ||
      p.visitCat?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    )

    return {
      stores: filteredStores,
      visits: filteredVisits,
      plans: filteredPlans,
      total: filteredStores.length + filteredVisits.length + filteredPlans.length
    }
  }, [query, stores, visits, plans])

  // ===== SUGGESTIONS (Dynamic terms based on data) =====
  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()

    // Collect unique terms from names, categories, etc.
    const terms = new Set<string>()

    stores.forEach((s: any) => {
      if (s.name?.toLowerCase().includes(q)) terms.add(s.name)
      if (s.code?.toLowerCase().includes(q)) terms.add(s.code)
    })

    visits.forEach((v: any) => {
      if (v.sales?.toLowerCase().includes(q)) terms.add(v.sales)
      if (v.visitCat?.toLowerCase().includes(q)) terms.add(v.visitCat)
    })

    return Array.from(terms).slice(0, 6)
  }, [query, stores, visits])

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-700 select-none">

      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
            <Search className="w-5 h-5" />
          </div>
          <span className="tracking-tight">ค้นหา <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">ข้อมูลทั้งหมด</span></span>
        </h1>

        {/* SEARCH BOX CARD */}
        <Card className="p-1 border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-[2.5rem] overflow-visible relative z-50">
          <CardContent className="p-6 space-y-4">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
              </div>

              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="พิมพ์สิ่งที่ต้องการค้นหา... (ชื่อร้าน, รหัส, สินค้า, เซลล์, วันที่)"
                className="h-16 pl-16 pr-16 rounded-[1.8rem] bg-white dark:bg-slate-950/50 border-white/20 dark:border-slate-800 focus:ring-4 focus:ring-blue-500/10 text-lg font-bold placeholder:font-medium placeholder:text-slate-400 transition-all shadow-inner"
              />

              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2 font-mono text-[10px] font-black text-slate-400 opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
                <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 cursor-pointer active:scale-90 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-3xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/20">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Tag className="w-3 h-3" /> คำแนะนำการค้นหา
                    </span>
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setQuery(s); setShowSuggestions(false); }}
                      className="w-full text-left px-8 py-4 hover:bg-blue-500/10 dark:hover:bg-blue-500/5 transition-colors flex items-center justify-between group/item"
                    >
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{s}</span>
                      <Search className="w-4 h-4 text-slate-300 group-hover/item:text-blue-500 opacity-0 group-hover/item:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK EXAMPLES */}
            <div className="flex flex-wrap items-center gap-3 px-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" /> ตัวอย่าง:
              </span>
              {["สะโพก", "ดรี", "โรงแรม", "เครดิต"].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuery(example)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-[11px] font-black text-slate-600 dark:text-slate-400 border border-transparent hover:border-blue-500/30 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RESULTS SUMMARY BAR */}
        {query && (
          <div className="bg-white/80 dark:bg-slate-950/50 backdrop-blur-md rounded-2xl p-4 px-8 border border-white/20 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 animate-in zoom-in duration-500">
            <div className="flex items-center gap-3 font-bold text-sm text-slate-700 dark:text-slate-300">
              <span className="p-2 bg-rose-500/10 rounded-full">🎯</span>
              พบ <span className="text-blue-600 dark:text-blue-400">{searchResults.total}</span> รายการ ค้นหาจาก:
              <div className="flex gap-2 ml-2">
                <Badge variant="outline" className="rounded-lg bg-blue-500/5 border-blue-500/20 text-blue-600">ร้านค้า {searchResults.stores.length}</Badge>
                <Badge variant="outline" className="rounded-lg bg-emerald-500/5 border-emerald-500/20 text-emerald-600">การเข้าพบ {searchResults.visits.length}</Badge>
                <Badge variant="outline" className="rounded-lg bg-amber-500/5 border-amber-500/20 text-amber-600">แผนงาน {searchResults.plans.length}</Badge>
              </div>
            </div>
            <button onClick={() => setQuery("")} className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">ล้างการค้นหา</button>
          </div>
        )}

        {/* DATA DISPLAY GRID */}
        {!query ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 opacity-60">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
              <Search className="w-24 h-24 text-slate-300 dark:text-slate-700 relative z-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-300 dark:text-slate-700 uppercase tracking-tighter">Universal Search System</h2>
              <p className="max-w-xs mx-auto text-sm font-medium text-slate-400 italic">กรอกชื่อร้าน, รหัสพนักงาน, สินค้า หรือวันที่ เพื่อดึงข้อมูลเชิงลึกทั้งหมดจากทุกโมดูล</p>
            </div>
          </div>
        ) : searchResults.total === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <span className="text-6xl">🔍</span>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">ไม่พบข้อมูล</h3>
              <p className="text-sm text-slate-500 font-medium">โปรดตรวจสอบคำค้นหาหรือลองใช้คำที่สั้นลง</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* GROUP: PLANS */}
            {searchResults.plans.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 px-4 italic">
                  <Calendar className="w-3.5 h-3.5" /> แผนการเข้าพบ ({searchResults.plans.length})
                </h3>
                {searchResults.plans.map((p: any) => (
                  <Card key={p.id} className="group overflow-hidden bg-white/60 dark:bg-[#1b2433] backdrop-blur-xl border-white/20 dark:border-slate-800 shadow-xl rounded-[1.8rem] hover:ring-2 hover:ring-blue-500/30 transition-all active:scale-[0.99]">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-base group-hover:text-blue-500 transition-colors uppercase tracking-tight">{p.store?.name || "ไม่ระบุร้านค้า"}</h4>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(p.date).toLocaleDateString('th-TH')}</span>
                            <span className="flex items-center gap-1.5 text-indigo-500"><User className="w-3 h-3" /> {p.sales}</span>
                            <Badge variant="secondary" className="rounded-lg bg-emerald-500/10 text-emerald-600 border-none px-2">{p.visitCat}</Badge>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:rotate-12 transition-transform">📅</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 italic italic italic leading-relaxed">
                          📄 {p.notes || "ไม่มีบันทึกเพิ่มเติม"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* GROUP: STORES */}
            {searchResults.stores.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 px-4 italic">
                  <MapPin className="w-3.5 h-3.5" /> ร้านค้าที่เกี่ยวข้อง ({searchResults.stores.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.stores.map((s: any) => (
                    <Card key={s.id} className="bg-white/60 dark:bg-[#1b2433] backdrop-blur-xl border-white/20 dark:border-slate-800 shadow-xl rounded-[1.8rem] hover:shadow-2xl hover:translate-y-[-2px] transition-all">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-xl text-white shadow-lg">🏪</div>
                        <div className="flex-1 space-y-0.5">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase">{s.name}</h4>
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5 tracking-tighter">
                            <Badge variant="outline" className="rounded-md border-slate-200 dark:border-slate-800 px-1 py-0">{s.code}</Badge>
                            👤 {s.owner || "ไม่ระบุเจ้าของ"}
                          </p>
                        </div>
                        <Heart className="w-5 h-5 text-red-500 " />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* GROUP: VISITS */}
            {searchResults.visits.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 px-4 italic">
                  <ClipboardList className="w-3.5 h-3.5" /> บันทึกการเข้าพบ ({searchResults.visits.length})
                </h3>
                {searchResults.visits.map((v: any) => (
                  <Card key={v.id} className="bg-white/60 dark:bg-[#1b2433] backdrop-blur-xl border-white/20 dark:border-slate-800 shadow-xl rounded-[1.8rem] overflow-hidden border-l-4 border-l-rose-500 shadow-rose-500/5">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase">{v.store?.name}</h4>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                            <span>🗓️ {new Date(v.date).toLocaleDateString()}</span>
                            <span className="text-blue-500 uppercase tracking-widest">👤 {v.sales}</span>
                            <span className="p-1 px-2 bg-rose-500/10 text-rose-600 rounded-lg">{v.visitType}</span>
                          </div>
                        </div>
                        <div className="md:text-right">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-4 py-1 text-[10px] font-black">{v.dealStatus}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* CLICKS OUTSIDE SETUP */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}