import { LayoutDashboard, Store, ClipboardList, Calendar, Moon, Sun } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }: any) {
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'masterdb', label: 'ข้อมูลร้านค้า', icon: Store },
    { id: 'visit', label: 'บันทึกเข้าพบ', icon: ClipboardList },
    { id: 'plan', label: 'แผนสัปดาห์', icon: Calendar },
  ];

  return (
    <aside className="w-[70px] md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full flex flex-col z-50 transition-colors">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <LayoutDashboard size={24} />
          </div>
          <div className="hidden md:block">
            <h1 className="font-bold text-navy dark:text-white leading-none">COWPHET CRM</h1>
            <span className="text-[10px] text-slate-400">Sales Management</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 flex flex-col gap-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all
              ${activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                : 'text-slate-500 hover:bg-blue-50 dark:hover:bg-slate-800'}`}
          >
            <item.icon size={20} />
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden md:block text-xs">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </aside>
  );
}