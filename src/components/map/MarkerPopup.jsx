import React from 'react';

export default function MarkerPopup({ title, subtitle, details = [], isAlert = false }) {
  return (
    <div className="min-w-[160px]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <p className={`font-bold text-sm ${isAlert ? 'text-red-600' : 'text-brand-700'}`}>{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      {details.length > 0 && (
        <div className="mt-2 space-y-1">
          {details.map((d, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-slate-400">{d.label}:</span>
              <span className="font-semibold text-slate-700">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
