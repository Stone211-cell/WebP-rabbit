'use client';

import { useState, useEffect } from 'react';
import { useCRM } from '@/components/hooks/useCRM';
import './crm.css';

import Dashboard from '@/components/pagecomponents/Dashboard/Dashboard';
import VisitForm from '@/components/pagecomponents/VisitForm/VisitForm';

import Storeinformation from '@/components/pagecomponents/StoreInformation/Storeinformation';

export default function CRMPage() {
  const { stores, visits, plans, forecasts, } = useCRM();
  const [activePage, setActivePage] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === '1';
    setDarkMode(isDark);
    if (isDark) document.body.classList.add('dark');
  }, []);

  const toggleDark = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('darkMode', newDark ? '1' : '0');
    if (newDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  return (
    <>
      <header>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cowphet CRM 2029</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </header>
      <main className={darkMode ? 'dark' : ''}>
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <div className="logo-text">COWPHET CRM</div>
                <div className="logo-sub">Sales Force Management</div>
              </div>
            </div>
          </div>
          <div className="nav">
            <button
              className={`nav-tab ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              📊 แดชบอร์ด
            </button>
            <button
              className={`nav-tab ${activePage === 'masterdb' ? 'active' : ''}`}
              onClick={() => setActivePage('masterdb')}
            >
              🏪 ข้อมูลร้านค้า
            </button>
            <button
              className={`nav-tab ${activePage === 'visit' ? 'active' : ''}`}
              onClick={() => setActivePage('visit')}
            >
              📝 บันทึกเข้าพบ
            </button>
            <button
              className={`nav-tab ${activePage === 'plan' ? 'active' : ''}`}
              onClick={() => setActivePage('plan')}
            >
              📅 แผนสัปดาห์
            </button>
            <button
              className={`nav-tab ${activePage === 'forecast' ? 'active' : ''}`}
              onClick={() => setActivePage('forecast')}
            >
              📈 คาดการณ์รายสัปดาห์
            </button>
            <button
              className={`nav-tab ${activePage === 'jobcard' ? 'active' : ''}`}
              onClick={() => setActivePage('jobcard')}
            >
              🎴 Job Card
            </button>
            <button
              className={`nav-tab ${activePage === 'alerts' ? 'active' : ''}`}
              onClick={() => setActivePage('alerts')}
            >
              🔔 แจ้งเตือนนัดหมาย
            </button>

            <button
              className={`nav-tab ${activePage === 'ordertracking' ? 'active' : ''}`}
              onClick={() => setActivePage('ordertracking')}
            >
              📦 ติดตามคำสั่งซื้อ
            </button>
            <button
              className={`nav-tab ${activePage === 'faq' ? 'active' : ''}`}
              onClick={() => setActivePage('faq')}
            >
              ❓ คำถามที่พบบ่อย
            </button>
            <button
              className={`nav-tab ${activePage === 'fine' ? 'active' : ''}`}
              onClick={() => setActivePage('fine')}
            >
              🔔 แจ้งเตือนนัดหมาย
            </button>


          </div>
          <div className="sidebar-footer">
            <div className="storage-status" id="storageStatus">
              <div className="storage-label">💾 พื้นที่จัดเก็บ</div>
              <div className="storage-bar">
                <div className="storage-fill" id="storageFill"></div>
              </div>
              <div className="storage-text" id="storageText">ดึงข้อมูล...</div>
            </div>
            <button className="dark-toggle" onClick={toggleDark}>
              <span id="darkIcon">{darkMode ? '☀️' : '🌙'}</span>
              <span id="darkText">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="header">
            <div className="page-title" id="pageTitle">
              {activePage === 'dashboard' && 'แดชบอร์ด'}
              {activePage === 'masterdb' && 'ข้อมูลร้านค้า'}
              {activePage === 'visit' && 'บันทึกเข้าพบ'}
              {activePage === 'plan' && 'แผนสัปดาห์'}
              {activePage === 'forecast' && 'คาดการณ์รายสัปดาห์'}
              {activePage === 'jobcard' && 'Job Card'}
              {activePage === 'alerts' && 'แจ้งเตือนนัดหมาย'}  
              {activePage === 'ordertracking' && 'ติดตามคำสั่งซื้อ'}
              {activePage === 'faq' && 'คำถามที่พบบ่อย'}
              {activePage === 'fine' && 'ค่าปรับการเข้าพบ'}   
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.75rem', color: 'var(--t3)' }}>
              <span style={{ color: 'var(--green)' }}>●</span> Auto-save เปิดอยู่
            </div>
          </div>
          <div className="toast" id="toast"></div>

        <section className=''>

          {/* Pages will be rendered here */}
          <div id="dashboard" className="page active w-full"  style={{ display: activePage === 'dashboard' ? 'block' : 'none' }}>
            <Dashboard stores={stores} visits={visits} plans={plans} />
          </div>
          <div id="masterdb" className="page" style={{ display: activePage === 'masterdb' ? 'block' : 'none' }}>
            <Storeinformation stores={stores} />
          </div>
          <div id="visit" className="page" style={{ display: activePage === 'visit' ? 'block' : 'none' }}>
            <VisitForm stores={stores} visits={visits} />
          </div>
          <div id="plan" className="page" style={{ display: activePage === 'plan' ? 'block' : 'none' }}>
            <PlanForm stores={stores} plans={plans} />
          </div>
          <div id="forecast" className="page" style={{ display: activePage === 'forecast' ? 'block' : 'none' }}>
            <ForecastForm stores={stores} forecasts={forecasts} />
          </div>
          <div id="jobcard" className="page" style={{ display: activePage === 'jobcard' ? 'block' : 'none' }}>
            <JobCard plans={plans} visits={visits} />
          </div>
          <div id="alerts" className="page" style={{ display: activePage === 'alerts' ? 'block' : 'none' }}>
            <Alerts stores={stores} visits={visits} />
          </div>

{/* ส่วนเสริมใหม่จ้า api ยังไม่ต่อ */}
          <div id="OrderTracking" className="page" style={{ display: activePage === 'ordertracking' ? 'block' : 'none' }}>
            <OrderTracking stores={stores} visits={visits} />
          </div>
          <div id="FAQ" className="page" style={{ display: activePage === 'faq' ? 'block' : 'none' }}>
            <FAQ stores={stores} visits={visits} />
          </div>

          <div id="Fine" className="page" style={{ display: activePage === 'fine' ? 'block' : 'none' }}>
            <Fine stores={stores} visits={visits} />
          </div>
        </section>
        </div>
      </main>
    </>
  );
}

// Component placeholders - ฉันจะสร้างอันต่อไป



function PlanForm({ stores, plans }: any) {
  return <div>PlanForm Component</div>;
}

function ForecastForm({ stores, forecasts }: any) {
  return <div>ForecastForm Component</div>;
}

function JobCard({ plans, visits }: any) {
  return <div>JobCard Component</div>;
}

function Alerts({ stores, visits }: any) {
  return <div>Alerts Component</div>;
}

function OrderTracking({ stores, visits }: any) {
  return <div>OrderTracking Component</div>;
}
function FAQ({ stores, visits }: any) {
  return <div>FAQ Component</div>;
}
function Fine({ stores, visits }: any) {
  return <div>Fine Component</div>;
}