'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useCRM } from '@/components/hooks/useCRM';
import { useUser } from '@clerk/nextjs';
import { axiosInstance } from '@/lib/axios';
import './crm.css';

import Dashboard from '@/components/pagecomponents/Dashboard/Dashboard';
import VisitForm from '@/components/pagecomponents/VisitForm/VisitForm';


import PlanForm from '@/components/pagecomponents/PlanForm/PlanForm';
import ForecastForm from '@/components/pagecomponents/ForecastForm/ForecastForm';
import JobCard from '@/components/pagecomponents/JobCard/JobCard';
import Alerts from '@/components/pagecomponents/Alerts/Alerts';
import OrderTracking from '@/components/pagecomponents/OrderTracking/OrderTracking';
import FAQ from '@/components/pagecomponents/FAQ/FAQ';
import Fine from '@/components/pagecomponents/Fine/Fine';



import StoreInformation from '@/components/pagecomponents/StoreInformation/StoreInformation';



export default function CRMPage() {
  const {
    stores, visits, plans, forecasts, issues, profiles,
    fetchStores, fetchVisits, fetchPlans, fetchForecasts, fetchIssues,
    createIssue, updateIssue, deleteIssue
  } = useCRM();
  const { user, isLoaded } = useUser();

  // Determine permissions
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const hasProfile = profiles.some(p => p.clerkId === user?.id);

  const [storageInfo, setStorageInfo] = useState<any>({ usedMB: 0, maxMB: 500, percentage: 0 });


  // Fetch storage usage from Supabase
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const res = await fetch('/api/storage-usage');
        const data = await res.json();
        setStorageInfo(data);
      } catch (e) {
        console.error('Failed to load storage info', e);
      }
    };
    loadStorage();
  }, []);

  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('crm_active_page') || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('crm_active_page', activePage);
  }, [activePage]);

  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };



  return (
    <>
      <header className='dark:bg-[#0f172a]'>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Cowphet CRM 2029</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </header>
      <main className="dark:bg-[#0f172a]">
        <div className="sidebar dark:bg-[#0f172a] dark:border-gray-700">
          <div className="sidebar-header dark:border-gray-700">
            <div className="logo dark:bg-[#0f172a] ">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:fill-white ">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="logo-text-container dark:text-white dark:border-gray-700">
                <div className="logo-text dark:text-white ">COWPHET CRM</div>
                <div className="logo-sub dark:text-gray-300">Sales Force Management</div>
              </div>
            </div>
          </div>
          <div className="nav dark:bg-[#0f172a] dark:border-gray-700">
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
              ❓ FAQ
            </button>
            <button
              className={`nav-tab ${activePage === 'fine' ? 'active' : ''}`}
              onClick={() => setActivePage('fine')}
            >
              🔍 ค้นหา
            </button>





          </div>
          <div className="sidebar-footer dark:bg-[#0f172a] dark:border-gray-700">
            <div className="storage-status dark:bg-[#0f172a] dark:text-white dark:border-gray-700" id="storageStatus">
              <div className="storage-label">💾 พื้นที่จัดเก็บ</div>
              <div className="storage-bar">
                <div
                  className="storage-fill"
                  id="storageFill"
                  style={{
                    width: `${Math.min(storageInfo.percentage || 0, 100)}%`,
                    backgroundColor: (storageInfo.percentage || 0) > 80 ? '#ef4444' : (storageInfo.percentage || 0) > 50 ? '#f59e0b' : '#22c55e',
                    transition: 'width 0.5s ease, background-color 0.5s ease'
                  }}
                ></div>
              </div>
              <div className="storage-text" id="storageText">
                {storageInfo.usedMB > 0
                  ? `${storageInfo.usedMB} MB / ${storageInfo.maxMB} MB (${storageInfo.percentage}%)`
                  : 'กำลังโหลด...'}
              </div>
            </div>
            {/*  */}
            <button className="dark-toggle dark:bg-[#0f172a]" onClick={toggleTheme}>
              <span id="darkIcon">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span id="darkText">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>

        <div className="main-content dark:bg-[#0f172a]">
          <div className="header dark:bg-[#0f172a]  dark:text-white dark:border-gray-700">
            <div className="page-title dark:bg-[#0f172a]  dark:text-white" id="pageTitle">
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

            {/* Pages will be rendered here                 */}
            <div id="dashboard" className="page active w-full" style={{ display: activePage === 'dashboard' ? 'block' : 'none' }}>
              <Dashboard
                stores={stores}
                visits={visits}
                summary={plans}
                profiles={profiles}
                isAdmin={isAdmin}
              />
            </div>

            {/* ข้อมูลร้านค้า */}
            <div id="masterdb" className="page" style={{ display: activePage === 'masterdb' ? 'block' : 'none' }}>
              <StoreInformation
                stores={stores}
                onRefresh={fetchStores}
                isAdmin={isAdmin}
              />
            </div>

            {/* บันทึกเข้าพบ */}
            <div id="visit" className="page" style={{ display: activePage === 'visit' ? 'block' : 'none' }}>
              <VisitForm
                stores={stores}
                visits={visits}
                profiles={profiles}
                onRefresh={fetchVisits}
                isAdmin={isAdmin}
                hasProfile={hasProfile}
              />
            </div>

            {/* แผนสัปดาห์ */}
            <div id="plan" className="page" style={{ display: activePage === 'plan' ? 'block' : 'none' }}>
              <PlanForm
                stores={stores}
                plans={plans}
                profiles={profiles}
                onRefresh={fetchPlans}
                isAdmin={isAdmin}
              />
            </div>

            {/* คาดการณ์รายสัปดาห์ */}
            <div id="forecast" className="page" style={{ display: activePage === 'forecast' ? 'block' : 'none' }}>
              <ForecastForm
                stores={stores}
                forecasts={forecasts}
                onRefresh={fetchForecasts}
                isAdmin={isAdmin}
              />
            </div>

            {/* jobcard */}
            <div id="jobcard" className="page" style={{ display: activePage === 'jobcard' ? 'block' : 'none' }}>
              <JobCard plans={plans} visits={visits} />
            </div>

            {/* แจ้งเตือนนัดหมาย */}
            <div id="alerts" className="page" style={{ display: activePage === 'alerts' ? 'block' : 'none' }}>
              <Alerts stores={stores} visits={visits} forecasts={forecasts} />
            </div>

            {/* ส่วนเสริมใหม่จ้า api ยังไม่ต่อ ติดตามคำสั่งซื้อ */}
            <div id="OrderTracking" className="page" style={{ display: activePage === 'ordertracking' ? 'block' : 'none' }}>
              <OrderTracking stores={stores} visits={visits} />
            </div>

            {/* คำถามที่พบบ่อย */}
            <div id="FAQ" className="page" style={{ display: activePage === 'faq' ? 'block' : 'none' }}>
              <FAQ
                stores={stores}
                issues={issues}
                profiles={profiles}
                onRefresh={fetchIssues}
                onCreate={createIssue}
                onUpdate={updateIssue}
                onDelete={deleteIssue}
                isAdmin={isAdmin}
              />
            </div>

            {/* ค้นหา ข้อมูลทั้งหมด */}
            <div id="Fine" className="page" style={{ display: activePage === 'fine' ? 'block' : 'none' }}>
              <Fine stores={stores} visits={visits} plans={plans} />
            </div>

            {/* จัดการสินค้า (NEW) */}
            {/* <div id="products" className="page" style={{ display: activePage === 'products' ? 'block' : 'none' }}>
              <ProductManagement />
            </div> */}

          </section>
        </div>
      </main>
    </>
  );
}

// Component placeholders - ฉันจะสร้างอันต่อไป

