import React, { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { getFieldReports, createReport, approveReport, rejectReport } from '../../services/reportService';
import { assets, DIST_TYPES, disturbances, getAsset, getPruningTask, getUser, pruningTasks } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDateTime } from '../../utils/formatDate';
import { CheckCircle, Eye, FileText, Plus, Search, XCircle } from 'lucide-react';

export default function FieldReportPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate((n) => n + 1);

  const reports = useMemo(
    () => getFieldReports({ search, status: statusFilter, operator_id: isAdmin ? undefined : user.id }),
    [search, statusFilter, isAdmin, user.id]
  );

  const activeDisturbances = disturbances.filter((disturbance) => disturbance.status !== 'closed');
  const activePruningTasks = pruningTasks.filter((task) => {
    if (isAdmin) return task.status !== 'completed';
    return task.assigned_to === user.id && ['assigned', 'on_progress', 'rejected'].includes(task.status);
  });

  const handleCreate = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const reportType = form.get('report_type');
    const taskId = reportType === 'pruning' && form.get('task_id') ? parseInt(form.get('task_id')) : null;
    const disturbanceId = reportType === 'disturbance' && form.get('disturbance_id') ? parseInt(form.get('disturbance_id')) : null;
    const relatedTask = taskId ? getPruningTask(taskId) : null;

    createReport({
      task_id: taskId,
      disturbance_id: disturbanceId,
      asset_id: form.get('asset_id') ? parseInt(form.get('asset_id')) : relatedTask?.asset_id || null,
      operator_id: user.id,
      report_type: reportType,
      condition_before: form.get('condition_before'),
      action_taken: form.get('action_taken'),
      condition_after: form.get('condition_after'),
      latitude: parseFloat(form.get('latitude') || relatedTask?.latitude || '-7.28'),
      longitude: parseFloat(form.get('longitude') || relatedTask?.longitude || '112.73'),
    });
    setCreateOpen(false);
    refresh();
  };

  const handleApprove = (id) => {
    approveReport(id);
    setViewReport(null);
    refresh();
  };

  const handleReject = (id) => {
    rejectReport(id, rejectNote);
    setShowRejectModal(null);
    setRejectNote('');
    setViewReport(null);
    refresh();
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isAdmin ? 'Laporan Lapangan' : 'Laporan Saya'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{reports.length} laporan ditemukan</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} icon={Plus}>Buat Laporan</Button>
      </div>

      <Card className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode, operator, atau tindakan..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white w-44"
        >
          <option value="All">Semua Status</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Terkait</th>
                <th className="px-6 py-4">Tindakan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Disubmit</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {reports.map((report, index) => {
                const operator = getUser(report.operator_id);
                const related = getRelatedLabel(report);
                return (
                  <tr key={report.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-3 font-bold text-brand-700">{report.report_code}</td>
                    <td className="px-6 py-3 text-slate-600">{operator?.name || '-'}</td>
                    <td className="px-6 py-3 text-slate-600">{getReportTypeLabel(report.report_type)}</td>
                    <td className="px-6 py-3 text-slate-600 max-w-[180px] truncate">{related}</td>
                    <td className="px-6 py-3 text-slate-600 max-w-[220px] truncate">{report.action_taken}</td>
                    <td className="px-6 py-3"><Badge status={report.status} /></td>
                    <td className="px-6 py-3 text-xs text-slate-500">{formatDateTime(report.submitted_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewReport(report)} className="p-1.5 hover:bg-brand-100 text-brand-600 rounded-lg" title="Detail">
                          <Eye size={16} />
                        </button>
                        {isAdmin && report.status === 'submitted' && (
                          <>
                            <button onClick={() => handleApprove(report.id)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => { setShowRejectModal(report.id); setRejectNote(''); }} className="p-1.5 hover:bg-red-100 text-danger rounded-lg" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reports.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Tidak ada laporan ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!viewReport} onClose={() => setViewReport(null)} title="Detail Laporan" maxWidth="max-w-2xl">
        {viewReport && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-slate-800">{viewReport.report_code}</h4>
                <p className="text-xs text-slate-500">{getReportTypeLabel(viewReport.report_type)} - {getRelatedLabel(viewReport)}</p>
              </div>
              <Badge status={viewReport.status} />
            </div>
            {[
              { label: 'Kondisi Sebelum', value: viewReport.condition_before },
              { label: 'Tindakan Diambil', value: viewReport.action_taken },
              { label: 'Kondisi Sesudah', value: viewReport.condition_after },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm text-slate-700">{item.value}</p>
              </div>
            ))}
            {viewReport.admin_note && (
              <div className={`rounded-xl p-4 ${viewReport.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Catatan Admin</p>
                <p className="text-sm">{viewReport.admin_note}</p>
              </div>
            )}
            {isAdmin && viewReport.status === 'submitted' && (
              <div className="flex gap-2 pt-2">
                <Button icon={CheckCircle} onClick={() => handleApprove(viewReport.id)}>Approve</Button>
                <Button variant="danger" icon={XCircle} onClick={() => setShowRejectModal(viewReport.id)}>Reject</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="Buat Laporan Lapangan" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tipe Laporan">
              <select name="report_type" required className="select-field">
                <option value="disturbance">Gangguan</option>
                <option value="inspection">Inspeksi</option>
                <option value="pruning">Pemangkasan</option>
              </select>
            </Field>
            <Field label="Gangguan Terkait">
              <select name="disturbance_id" className="select-field">
                <option value="">Tidak Ada</option>
                {activeDisturbances.map((disturbance) => (
                  <option key={disturbance.id} value={disturbance.id}>{disturbance.disturbance_code} - {DIST_TYPES[disturbance.type]}</option>
                ))}
              </select>
            </Field>
            <Field label="Tugas Pemangkasan Terkait" className="md:col-span-2">
              <select name="task_id" className="select-field">
                <option value="">Tidak Ada</option>
                {activePruningTasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.task_code} - {task.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Aset Terkait" className="md:col-span-2">
              <select name="asset_id" className="select-field">
                <option value="">Pilih Aset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.asset_code} - {asset.asset_name}</option>
                ))}
              </select>
            </Field>
            <Field label="Kondisi Sebelum" className="md:col-span-2">
              <textarea name="condition_before" rows={2} required className="input-field" />
            </Field>
            <Field label="Tindakan yang Diambil" className="md:col-span-2">
              <textarea name="action_taken" rows={2} required className="input-field" />
            </Field>
            <Field label="Kondisi Sesudah" className="md:col-span-2">
              <textarea name="condition_after" rows={2} required className="input-field" />
            </Field>
            <Field label="Latitude">
              <input name="latitude" type="number" step="any" defaultValue="-7.28" className="input-field" />
            </Field>
            <Field label="Longitude">
              <input name="longitude" type="number" step="any" defaultValue="112.73" className="input-field" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button type="submit" icon={FileText}>Submit Laporan</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showRejectModal} onClose={() => setShowRejectModal(null)} title="Tolak Laporan">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Berikan catatan alasan penolakan:</p>
          <textarea
            value={rejectNote}
            onChange={(event) => setRejectNote(event.target.value)}
            rows={3}
            placeholder="Contoh: Foto dokumentasi kurang lengkap."
            className="input-field"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowRejectModal(null)}>Batal</Button>
            <Button variant="danger" onClick={() => handleReject(showRejectModal)}>Tolak Laporan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function getReportTypeLabel(type) {
  if (type === 'disturbance') return 'Gangguan';
  if (type === 'inspection') return 'Inspeksi';
  if (type === 'pruning') return 'Pemangkasan';
  return type || '-';
}

function getRelatedLabel(report) {
  if (report.task_id) {
    const task = getPruningTask(report.task_id);
    return task ? `${task.task_code} - ${task.title}` : 'Tugas pemangkasan';
  }
  if (report.disturbance_id) {
    const disturbance = disturbances.find((item) => item.id === report.disturbance_id);
    return disturbance ? `${disturbance.disturbance_code} - ${DIST_TYPES[disturbance.type]}` : 'Gangguan';
  }
  if (report.asset_id) {
    const asset = getAsset(report.asset_id);
    return asset ? `${asset.asset_code} - ${asset.asset_name}` : 'Aset';
  }
  return '-';
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
      {children}
    </label>
  );
}
