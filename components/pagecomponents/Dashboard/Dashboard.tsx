'use client';

import './dashboard.css';
import DemoPage from './Table/gettable';




export default function Dashboard({ stores, visits }: any) {
  return (
    <div id="dashboard" className="page active w-full">

      {/* TIME FILTER BUTTONS */}
      <div className="time-filter-bar">
        <button className="time-filter-btn">📅 วันนี้</button>
        <button className="time-filter-btn active">📊 สัปดาห์นี้</button>
        <button className="time-filter-btn">📆 เดือนนี้</button>
        <button className="time-filter-btn">📈 ไตรมาสนี้</button>
        <button className="time-filter-btn">🗓️ ปีนี้</button>
      </div>

      {/* EXPORT BAR */}
      <div className="ebar">
        <button className="btn btn-o">⬇ Export เข้าพบ</button>
        <button className="btn btn-o">⬇ Export แผน</button>
        <button className="btn btn-o">⬇ Export ทั้งหมด</button>
        <label className="btn btn-o">⬆ Import Excel</label>
        <button className="btn btn-o" style={{ marginLeft: 'auto' }}>💾 สำรองข้อมูล</button>
        <button className="btn btn-o" style={{ background: 'var(--red)', color: '#fff' }}>
          🗑 ล้างข้อมูลทั้งหมด
        </button>
      </div>

      {/* WEEK NAV */}
      <div className="wnav">
        <button>← สัปดาห์ก่อน</button>
        <span id="weekLabel">สัปดาห์นี้: 8 ก.พ. 2569 – 14 ก.พ. 2569</span>
        <button>สัปดาห์ถัดไป →</button>
      </div>

      {/* CALENDAR */}
      <div className="cal" id="calendar">
        <div className="cal-head">
          <h3>กุมภาพันธ์ 2569</h3>
          <div className="cal-nav">
            <button>←</button>
            <button>วันนี้</button>
            <button>→</button>
          </div>
        </div>

        <div className="cal-grid">
          {['อา','จ','อ','พ','พฤ','ศ','ส'].map(d => (
            <div key={d} className="cal-day-label">{d}</div>
          ))}

          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`cal-day ${i === 8 ? 'today' : ''}`}
              style={{ position: 'relative' }}
            >
              <span className="cal-day-num">{i + 1}</span>
              <div className="cal-events"></div>
            </div>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div className="cards-row">
        <StatCard label="เป้าหมายทีม" value="160" sub="ร้าน / สัปดาห์นี้" />
        <StatCard label="เข้าพบแล้ว" value="0" sub="สัปดาห์นี้" />
        <StatCard label="ความสำเร็จ" value="0%" sub="ของเป้าหมาย" color="green" />
        <StatCard label="ร้านใหม่" value="0" sub="รวม ปิดการขาย" />
        <StatCard label="ฐานข้อมูลร้านค้า" value="0" sub="ร้านทั้งหมด" />
        <StatCard label="ปิดการขาย" value="0" sub="ตลอดเวลา" color="red" />
      </div>

      {/* CHART PLACEHOLDERS */}
      <div className="charts-grid">
        <ChartBox title="ผลงานรายเซลล์ – จำแนกตามภารกิจ" />
        <ChartBox title="แผนเข้าพบสัปดาห์ถัดไป" />
        <ChartBox title="ยอดปิดการขาย – รายเซลล์" />
      </div>

      {/* TABLE PLACEHOLDER */}

      {/* <DemoPage data={stores} /> */}
      <div style={{ marginTop: 32 }}>
        <h3 style={{ fontWeight: 700 }}>📊 ตารางสรุปผลงาน</h3>
        <div className="twrap">
          <table>
            <thead>
              <tr>
                <th>เซลล์</th>
                <th>เข้าพบทั้งหมด</th>
                <th>% สำเร็จ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ตรี</td>
                <td>0</td>
                <td>0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


{/* SUMMARY BY STORE TYPE */}
<div className="summary-box">
  <div className="summary-head">
    <span className="summary-icon">🧾</span>
    <span className="summary-title">สรุปตามประเภทร้าน</span>
  </div>

  <div className="twrap">
    <table className="summary-table">
      <thead>
        <tr>
          <th>ประเภทร้าน</th>
          <th>จำนวนเข้าพบ</th>
          <th>ร้านใหม่</th>
          <th>ปิดการขาย</th>
          <th>% ปิดการขาย</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={5} className="no-data">
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

function StatCard({ label, value, sub, color }: any) {
  return (
    <div className={`card ${color || ''}`}>
      <div className="card-accent" />
      <div className="c-label">{label}</div>
      <div className="c-val">{value}</div>
      <div className="c-sub">{sub}</div>
    </div>
  );
}

function ChartBox({ title }: { title: string }) {
  return (
    <div className="chart-wrap compact">
      <div className="chart-head">
        <div className="chart-title">{title}</div>
      </div>
      <div className="chart-canvas-wrap" style={{ height: 240 }} />
    </div>
  );
}