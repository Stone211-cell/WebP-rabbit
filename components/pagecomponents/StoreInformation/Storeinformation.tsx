'use client';

export default function Storeinformation({ stores }: any) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0b1220] to-[#0a1020] text-white p-6">

      {/* TOP BAR */}
      {/* <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">ข้อมูลร้านค้า</h1>
        <div className="flex items-center gap-2 text-sm text-green-400">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Auto-save เปิดอยู่
        </div>
      </div> */}

      {/* CARD */}
      <div className="bg-[#1b2433] border border-white/10 rounded-xl p-5">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">ฐานข้อมูล ร้านค้า</h2>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
            ＋ เพิ่มร้านค้า
          </button>
        </div>

        {/* FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            placeholder="รหัส / ชื่อร้าน / เจ้าของ"
            className="bg-[#2a3444] border border-white/10 rounded-md px-3 py-2 text-sm outline-none"
          />

          <select className="bg-[#2a3444] border border-white/10 rounded-md px-3 py-2 text-sm">
            <option>ทั้งหมด</option>
          </select>

          <select className="bg-[#2a3444] border border-white/10 rounded-md px-3 py-2 text-sm">
            <option>ทั้งหมด</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-[#2a3444]">
              <tr>
                <th className="px-3 py-2 text-left">ลำดับ</th>
                <th className="px-3 py-2 text-left">รหัส</th>
                <th className="px-3 py-2 text-left">ชื่อร้าน</th>
                <th className="px-3 py-2 text-left">เจ้าของ</th>
                <th className="px-3 py-2 text-left">ประเภท</th>
                <th className="px-3 py-2 text-left">เบอร์โทร</th>
                <th className="px-3 py-2 text-left">ประเภทลูกค้า</th>
                <th className="px-3 py-2 text-left">สถานะ</th>
              </tr>
            </thead>

            <tbody>
              <tr className="bg-[#202a3a]">
                <td colSpan={8} className="text-center py-6 text-white/60">
                  ไม่มีข้อมูล
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}