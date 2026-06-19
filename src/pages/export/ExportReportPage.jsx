import React, { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { downloadCSV, exportDataset, getExportSets } from '../../services/exportService';
import { Activity, AlertTriangle, Database, Download, FileText, Network, Scissors, Users } from 'lucide-react';

const datasetMeta = {
  assets: { label: 'Aset Jaringan', icon: Network, filename: 'aset-jaringan.csv' },
  disturbances: { label: 'Gangguan', icon: AlertTriangle, filename: 'gangguan.csv' },
  pruningTasks: { label: 'Tugas Pemangkasan', icon: Scissors, filename: 'tugas-pemangkasan.csv' },
  fieldReports: { label: 'Laporan Lapangan', icon: FileText, filename: 'laporan-lapangan.csv' },
  users: { label: 'User', icon: Users, filename: 'users.csv' },
  activityLogs: { label: 'Audit Log', icon: Activity, filename: 'audit-log.csv' },
};

export default function ExportReportPage() {
  const [selectedKey, setSelectedKey] = useState('assets');
  const sets = useMemo(() => getExportSets(), []);
  const selectedRows = sets[selectedKey] || [];
  const selectedMeta = datasetMeta[selectedKey];
  const headers = selectedRows[0] ? Object.keys(selectedRows[0]) : [];
  const previewRows = selectedRows.slice(0, 5);

  const handleDownload = (key = selectedKey) => {
    const meta = datasetMeta[key];
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCSV(`${stamp}-${meta.filename}`, exportDataset(key));
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Export Report</h2>
          <p className="text-sm text-slate-500 mt-0.5">Unduh dataset operasional dalam format CSV.</p>
        </div>
        <Button onClick={() => handleDownload()} icon={Download}>Download Dataset</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(datasetMeta).map(([key, meta]) => {
          const Icon = meta.icon;
          const isSelected = selectedKey === key;
          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`bg-white rounded-card border p-5 shadow-soft text-left transition-all ${
                isSelected ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={22} />
                </div>
                <span className="text-2xl font-extrabold text-slate-900">{sets[key]?.length || 0}</span>
              </div>
              <p className="font-bold text-slate-800 mt-4">{meta.label}</p>
              <p className="text-xs text-slate-500 mt-1">{sets[key]?.length || 0} baris siap diexport</p>
            </button>
          );
        })}
      </div>

      <Card noPadding>
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              {selectedMeta?.icon ? <selectedMeta.icon size={20} /> : <Database size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Preview {selectedMeta.label}</h3>
              <p className="text-xs text-slate-500">{selectedRows.length} baris, {headers.length} kolom</p>
            </div>
          </div>
          <Button variant="secondary" onClick={() => handleDownload()} icon={Download}>Download CSV</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                {headers.slice(0, 8).map((header) => (
                  <th key={header} className="px-6 py-4 whitespace-nowrap">{header.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {previewRows.map((row, index) => (
                <tr key={`${selectedKey}-${index}`} className="hover:bg-brand-50 transition-colors">
                  {headers.slice(0, 8).map((header) => (
                    <td key={header} className="px-6 py-3 text-slate-600 max-w-[240px] truncate">
                      {String(row[header] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
              {previewRows.length === 0 && (
                <tr><td colSpan={Math.max(headers.length, 1)} className="px-6 py-12 text-center text-slate-400">Dataset kosong</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
