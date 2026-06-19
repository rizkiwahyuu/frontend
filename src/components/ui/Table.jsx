import React from 'react';

export default function Table({ columns, children, className = '' }) {
  return (
    <div className={`bg-white rounded-card border border-slate-200 overflow-hidden shadow-soft ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({ children, onClick, className = '' }) {
  return (
    <tr
      className={`hover:bg-brand-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '', align = 'left' }) {
  return (
    <td className={`px-6 py-3 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      {children}
    </td>
  );
}

export function EmptyState({ colSpan, message = 'Tidak ada data ditemukan' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400 text-sm">
        {message}
      </td>
    </tr>
  );
}
