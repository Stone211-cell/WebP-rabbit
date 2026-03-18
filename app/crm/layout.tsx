'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCRMSession } from '@/components/hooks/useCRMSession';
import './crm.css';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isAdmin, isLoaded } = useCRMSession();
  
  const [storageInfo, setStorageInfo] = useState<any>({ usedMB: 0, maxMB: 500, percentage: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getPageTitle = () => {
    if (pathname.includes('/Dashboard')) return 'แดชบอร์ด';
    if (pathname.includes('/StoreInformation')) return 'ข้อมูลร้านค้า';
    if (pathname.includes('/Visits')) return 'บันทึกเข้าพบ';
    if (pathname.includes('/Plans')) return 'แผนสัปดาห์';
    if (pathname.includes('/ForecastStore')) return 'คาดการณ์รายสัปดาห์ร้านค้า';
    if (pathname.includes('/Forecast')) return 'คาดการณ์รายสัปดาห์ชิ้นส่วน';
    if (pathname.includes('/JobCard')) return 'Job Card';
    if (pathname.includes('/Alerts')) return 'แจ้งเตือนนัดหมาย';
    if (pathname.includes('/OrderTracking')) return 'ติดตามคำสั่งซื้อ';
    if (pathname.includes('/FAQ')) return 'คำถามที่พบบ่อย';
    if (pathname.includes('/Fine')) return 'ค่าปรับการเข้าพบ';
    return 'CRM แดชบอร์ด';
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
            <div className="logo dark:bg-[#0f172a]">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dark:fill-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div className="logo-text-container dark:text-white dark:border-gray-700">
                <div className="logo-text dark:text-white">COWPHET CRM</div>
                <div className="logo-sub dark:text-gray-300">Sales Force Management</div>
              </div>
            </div>
          </div>
          <div className="nav dark:bg-[#0f172a] dark:border-gray-700 flex flex-col pt-2">
            <Link href="/crm/Dashboard" className={`nav-tab ${pathname.includes('/Dashboard') ? 'active' : ''}`}>
              📊 แดชบอร์ด
            </Link>
            <Link href="/crm/StoreInformation" className={`nav-tab ${pathname.includes('/StoreInformation') ? 'active' : ''}`}>
              🏪 ข้อมูลร้านค้า
            </Link>
            <Link href="/crm/Visits" className={`nav-tab ${pathname.includes('/Visits') ? 'active' : ''}`}>
              📝 บันทึกเข้าพบ
            </Link>
            <Link href="/crm/Plans" className={`nav-tab ${pathname.includes('/Plans') ? 'active' : ''}`}>
              📅 แผนสัปดาห์
            </Link>
            <Link href="/crm/Forecast" className={`nav-tab ${pathname.includes('/Forecast') && !pathname.includes('/ForecastStore') ? 'active' : ''}`}>
              📈 คาดการณ์รายสัปดาห์ชิ้นส่วน
            </Link>
            <Link href="/crm/ForecastStore" className={`nav-tab ${pathname.includes('/ForecastStore') ? 'active' : ''}`}>
              📈 คาดการณ์รายสัปดาห์ร้านค้า
            </Link>
            <Link href="/crm/JobCard" className={`nav-tab ${pathname.includes('/JobCard') ? 'active' : ''}`}>
              🎴 Job Card
            </Link>
            <Link href="/crm/Alerts" className={`nav-tab ${pathname.includes('/Alerts') ? 'active' : ''}`}>
              🔔 แจ้งเตือนนัดหมาย
            </Link>
            <Link href="/crm/OrderTracking" className={`nav-tab ${pathname.includes('/OrderTracking') ? 'active' : ''}`}>
              📦 ติดตามคำสั่งซื้อ
            </Link>
            <Link href="/crm/FAQ" className={`nav-tab ${pathname.includes('/FAQ') ? 'active' : ''}`}>
              ❓ FAQ
            </Link>
            <Link href="/crm/Fine" className={`nav-tab ${pathname.includes('/Fine') ? 'active' : ''}`}>
              🔍 ค้นหา
            </Link>
          </div>
          
          <div className="sidebar-footer dark:bg-[#0f172a] dark:border-gray-700">
            {isAdmin && (
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
            )}
            {/* Theme Toggle */}
            <button className="dark-toggle dark:bg-[#0f172a]" onClick={toggleTheme}>
              {isMounted ? (
                <>
                  <span id="darkIcon">{theme === 'dark' ? '☀️' : '🌙'}</span>
                  <span id="darkText">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </>
              ) : (
                <div className="h-4 w-20 animate-pulse bg-slate-200 dark:bg-slate-700" />
              )}
            </button>
          </div>
        </div>

        <div className="main-content dark:bg-[#0f172a]">
          <div className="header dark:bg-[#0f172a] dark:text-white dark:border-gray-700">
            <div className="page-title dark:bg-[#0f172a] dark:text-white" id="pageTitle">
              {getPageTitle()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.75rem', color: 'var(--t3)' }}>
              <span style={{ color: 'var(--green)' }}>●</span> Auto-save เปิดอยู่
            </div>
          </div>
          <div className="toast" id="toast"></div>

          <section className='page active w-full'>
            {children}
          </section>
        </div>
      </main>
    </>
  );
}
