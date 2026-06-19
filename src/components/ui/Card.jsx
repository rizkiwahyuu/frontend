import React from 'react';

export default function Card({ children, className = '', noPadding = false }) {
  return (
    <div className={`bg-white rounded-card border border-slate-200 shadow-soft ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, iconBg = 'bg-brand-50 text-brand-600', valueColor = 'text-slate-900', onClick }) {
  const content = (
    <>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className={`text-3xl font-extrabold mt-1 ${valueColor}`}>{value}</h3>
      </div>
      {Icon && (
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={28} />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="stat-card w-full text-left bg-white p-5 rounded-card border border-slate-200 shadow-soft flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="stat-card bg-white p-5 rounded-card border border-slate-200 shadow-soft flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all">
      {content}
    </div>
  );
}
