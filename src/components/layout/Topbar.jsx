import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, TriangleAlert, Scissors, Activity, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import { activityLogs, disturbances, pruningTasks } from '../../services/api';

const LOGO_URL = '/infranexia-mark.svg';

const BREADCRUMBS = {
  '/': { title: 'Dasbor', crumb: 'Dasbor' },
  '/map': { title: 'Map Monitoring', crumb: 'Peta Geospasial' },
  '/assets': { title: 'Aset Jaringan', crumb: 'Inventaris Aset' },
  '/disturbances': { title: 'Manajemen Gangguan', crumb: 'Gangguan' },
  '/pruning': { title: 'Manajemen Pemangkasan', crumb: 'Tugas Lapangan' },
  '/reports': { title: 'Laporan Lapangan', crumb: 'Validasi Laporan' },
  '/analytics': { title: 'Analisis Temporal', crumb: 'Tren & Analitik' },
  '/risk': { title: 'Risk & Priority', crumb: 'Prioritas Risiko' },
  '/users': { title: 'User Management', crumb: 'Admin Pengguna' },
  '/export': { title: 'Export Report', crumb: 'Unduh Data' },
  '/settings': { title: 'Settings', crumb: 'Profil Pengguna' },
};

export default function Topbar({ sidebarOpen, sidebarCollapsed, onToggleSidebar, onToggleDesktopSidebar }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const basePath = '/' + (location.pathname.split('/')[1] || '');
  const meta = BREADCRUMBS[basePath] || { title: 'Infranexia FiberOps', crumb: '' };
  const notifications = useMemo(() => {
    const items = [
      ...disturbances
        .filter((item) => !['resolved', 'closed'].includes(item.status))
        .slice(0, 3)
        .map((item) => ({
          id: `dist-${item.id}`,
          icon: TriangleAlert,
          title: item.disturbance_code,
          text: item.description,
          tone: 'text-red-700',
        })),
      ...pruningTasks
        .filter((item) => ['assigned', 'on_progress', 'waiting_validation'].includes(item.status))
        .slice(0, 2)
        .map((item) => ({
          id: `task-${item.id}`,
          icon: Scissors,
          title: item.task_code,
          text: item.title,
          tone: 'text-violet-700',
        })),
      ...activityLogs
        .slice(0, 2)
        .map((item) => ({
          id: `log-${item.id}`,
          icon: Activity,
          title: item.module || 'system',
          text: item.action,
          tone: 'text-slate-700',
        })),
    ];
    return items.slice(0, 6);
  }, [activityLogs.length, disturbances.length, pruningTasks.length]);

  return (
    <header className="z-40 shrink-0 border-b border-slate-200 bg-white px-3 py-3 sm:px-4 md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:hidden"
            aria-label={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          >
            <Menu size={18} />
          </button>
          <button
            type="button"
            onClick={onToggleDesktopSidebar}
            className="hidden rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 lg:inline-flex"
            aria-label={sidebarCollapsed ? 'Tampilkan sidebar' : 'Sembunyikan sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
            <img
              src={LOGO_URL}
              alt="Infranexia"
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px] sm:tracking-[0.22em]">
                FiberOps
              </p>
              <p className="truncate text-sm font-bold text-slate-900 sm:text-[15px]">
                Infranexia
              </p>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="hidden truncate text-[16px] font-bold text-slate-900 md:text-[18px] lg:block">{meta.title}</h2>
          </div>
          <div className="hidden h-5 w-[1px] shrink-0 bg-slate-200 md:block" />
          <div className="hidden min-w-0 items-center gap-1.5 text-[11px] font-medium text-slate-500 md:flex">
            <span>Infranexia FiberOps</span>
            <span className="text-slate-300">/</span>
            <span className="text-brand-600 font-bold truncate">{meta.crumb}</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
          <div className="min-w-0 flex-1 lg:hidden">
            <p className="truncate text-xs font-semibold text-brand-600">{meta.crumb || meta.title}</p>
          </div>
          <div className="relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari data..."
              className="w-44 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500 md:w-48"
            />
          </div>
          <div className="relative">
            <button
              className="relative rounded-xl p-2 text-slate-600 transition-all hover:bg-slate-50"
              title="Notifikasi"
              onClick={() => setOpen((value) => !value)}
              type="button"
            >
              <Bell size={19} />
              {notifications.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-danger" />
              )}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-[min(320px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[320px]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Notifikasi</p>
                    <p className="text-[11px] text-slate-400">{notifications.length} item terbaru</p>
                  </div>
                  <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-400 hover:text-slate-700">Tutup</button>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-sm text-slate-500">Tidak ada notifikasi aktif.</div>
                  )}
                  {notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-start gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50">
                        <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                          <Icon size={14} className={item.tone} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">{item.title}</p>
                          <p className="truncate text-[11px] text-slate-500">{item.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
