import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, Map, Network, AlertTriangle, FileText,
  TrendingUp, ShieldAlert, Users, Download, Settings, LogOut, Scissors, X,
} from 'lucide-react';

const adminMenu = [
  { to: '/', icon: LayoutDashboard, label: 'Dasbor', end: true },
  { to: '/map', icon: Map, label: 'Map Monitoring' },
  { to: '/assets', icon: Network, label: 'Aset Jaringan' },
  { to: '/disturbances', icon: AlertTriangle, label: 'Gangguan' },
  { to: '/pruning', icon: Scissors, label: 'Pemangkasan' },
  { to: '/reports', icon: FileText, label: 'Laporan Lapangan' },
  { to: '/analytics', icon: TrendingUp, label: 'Analisis Temporal' },
  { to: '/risk', icon: ShieldAlert, label: 'Risk & Priority' },
  { divider: true, label: 'Sistem' },
  { to: '/users', icon: Users, label: 'User Management' },
  { to: '/export', icon: Download, label: 'Export Report' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const operatorMenu = [
  { to: '/', icon: LayoutDashboard, label: 'Dasbor', end: true },
  { to: '/map', icon: Map, label: 'Map Lokasi' },
  { to: '/pruning', icon: Scissors, label: 'Tugas Saya' },
  { to: '/reports', icon: FileText, label: 'Laporan Saya' },
  { to: '/disturbances', icon: AlertTriangle, label: 'Gangguan' },
  { to: '/settings', icon: Settings, label: 'Profil' },
];

const LOGO_URL = 'https://i.ibb.co/fGPMjTJ4/Infranexia-Primary-2-1.png';

export default function Sidebar({ open, collapsed, onClose }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const menu = user?.role === 'admin' ? adminMenu : operatorMenu;
  const initials = user?.name?.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase() || '??';

  return (
    <>
      <button
        type="button"
        aria-label="Tutup sidebar"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/45 transition-opacity duration-300 lg:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-gradient-to-b from-[#24456d] via-[#16365a] to-[#07172d] pt-3 pb-6 shadow-[0_24px_64px_rgba(3,10,25,0.35)] transition-all duration-300 lg:static lg:translate-x-0 lg:shadow-none ${
          collapsed ? 'lg:w-[92px]' : 'lg:w-[260px]'
        } ${open ? 'translate-x-0' : '-translate-x-full'} w-[min(18rem,calc(100vw-0.75rem))] max-w-[18rem]`}
      >
        <div className="mb-3 flex items-center justify-end px-4 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/10 p-2 text-white transition-colors hover:bg-white/15"
          >
            <X size={18} />
          </button>
        </div>

        <div className={`mx-4 mb-6 rounded-[1.6rem] border border-white/20 bg-gradient-to-b from-[#8ea9c8]/55 via-[#5e7fa6]/34 to-white/[0.06] px-2 py-2 shadow-[0_20px_44px_rgba(3,10,25,0.28)] backdrop-blur-sm ${collapsed ? 'lg:px-1' : ''}`}>
          <div className="flex items-center justify-center -mb-1">
            <img
              src={LOGO_URL}
              alt="Infranexia"
              className={`object-contain drop-shadow-[0_10px_22px_rgba(6,20,44,0.24)] transition-all duration-300 ${collapsed ? 'h-16 w-16 lg:h-14 lg:w-14' : 'h-24 w-full max-w-[220px]'}`}
            />
          </div>
          <div className={`mt-0 text-center ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="text-[12px] font-bold uppercase tracking-[0.34em] text-sky-50">FiberOps</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {menu.map((item, i) => {
            if (item.divider) {
              return (
                <div
                  key={`div-${i}`}
                  className={`pt-5 pb-2 px-4 uppercase text-[10px] font-bold text-navy-500 tracking-widest ${collapsed ? 'lg:hidden' : ''}`}
                >
                  {item.label}
                </div>
              );
            }

            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  className={`w-full flex items-center rounded-lg text-navy-600 cursor-not-allowed ${collapsed ? 'justify-center px-3 py-3 lg:px-0' : 'gap-3 px-4 py-2.5'}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} />
                  <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => onClose?.()}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `w-full rounded-lg transition-all text-left ${
                    collapsed
                      ? 'flex justify-center px-3 py-3 lg:px-0'
                      : 'flex items-center gap-3 px-4 py-2.5'
                  } ${
                    isActive
                      ? 'bg-navy-700 text-white border-l-4 border-brand-400'
                      : 'text-navy-200 hover:bg-white/[0.08]'
                  }`
                }
              >
                <item.icon size={20} />
                <span className={`text-sm font-medium ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className={`px-5 mt-auto pt-4 border-t border-white/10 ${collapsed ? 'lg:px-3' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="text-white text-sm font-bold truncate">{user?.name}</p>
              <p className="text-navy-400 text-xs truncate">{user?.role === 'admin' ? 'Administrator' : 'Operator'}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
