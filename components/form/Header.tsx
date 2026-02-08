'use client';

import React from 'react';

interface HeaderProps {
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  // ฟังก์ชันแปลง ID เป็นชื่อภาษาไทยที่สวยงาม
  const getPageTitle = (id: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard / ภาพรวมระบบ',
      masterdb: 'Master Database / ฐานข้อมูลหลัก',
      visit: 'Visit Record / บันทึกการเข้าพบ',
      report: 'Analytics Report / รายงานสรุป',
    };
    return titles[id] || 'System Management';
  };

  return (
    <header className="header">
      {/* ส่วนบน: Search และ User Profile */}
      <div className="h-top">
        <div className="sbox">
          <span className="si">🔍</span>
          <input 
            type="text" 
            placeholder="ค้นหาข้อมูลร้านค้า หรือ รายการเข้าพบ..." 
          />
        </div>
        
        <div className="user-p">
          <div className="u-info">
            <p className="u-name">Admin Name</p>
            <p className="u-role">System Administrator</p>
          </div>
          <div className="u-av">A</div>
        </div>
      </div>

      {/* ส่วนล่าง: Breadcrumb และ วันที่ปัจจุบัน */}
      <div className="h-btm">
        <div className="b-crumb">
          <span className="b-root">Main System</span>
          <span className="b-sep">/</span>
          <span className="b-curr">{getPageTitle(activeTab)}</span>
        </div>
        
        <div className="h-date">
          <span className="d-icon">📅</span>
          <span>{new Date().toLocaleDateString('th-TH', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;