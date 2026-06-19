import React from 'react';
import Modal from './Modal';

export default function StatDetailModal({ detail, onClose }) {
  return (
    <Modal isOpen={!!detail} onClose={onClose} title={detail?.title || 'Detail Statistik'} maxWidth="max-w-5xl">
      {detail && (
        <div className="space-y-4">
          {detail.description && <p className="text-center text-sm text-slate-500">{detail.description}</p>}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-center whitespace-nowrap">No.</th>
                  {detail.columns.map((column) => (
                    <th key={column.label} className="px-4 py-3 text-center whitespace-nowrap">{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {detail.rows.map((row, index) => (
                  <tr key={`${detail.title}-${row.id ?? index}`} className="hover:bg-brand-50">
                    <td className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">{index + 1}</td>
                    {detail.columns.map((column) => (
                      <td key={column.label} className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">
                        {column.render(row, index)}
                      </td>
                    ))}
                  </tr>
                ))}
                {detail.rows.length === 0 && (
                  <tr>
                    <td colSpan={detail.columns.length + 1} className="px-4 py-10 text-center text-slate-400">
                      Tidak ada data untuk statistik ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
