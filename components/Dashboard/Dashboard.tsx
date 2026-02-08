export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Export Bar */}
      <div className="flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:border-blue-500 transition-colors">
          ⬇ Export เข้าพบ
        </button>
        {/* ... */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="ร้านค้าทั้งหมด" value="1,240" sub="เพิ่มขึ้น 12% เดือนนี้" color="blue" />
        <StatCard label="ปิดการขายแล้ว" value="452" sub="จากเป้าหมาย 600" color="green" />
        <StatCard label="แผนสัปดาห์นี้" value="48" sub="รอดำเนินการ 12" color="amber" />
        <StatCard label="แจ้งเตือน" value="5" sub="นัดหมายวันนี้" color="red" />
      </div>

      {/* กราฟ (แนะนำให้ใช้ Recharts หรือ Chart.js) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold mb-4">ผลงานรายเซลล์</h3>
        <div className="h-[300px] flex items-center justify-center text-slate-400 italic">
          (ที่นี่ใส่ component กราฟ เช่น &lt;BarChart /&gt;)
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm">
      <div className={`absolute top-0 left-0 right-0 h-1 ${colors[color]}`} />
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}