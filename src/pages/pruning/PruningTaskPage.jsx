import React, { useMemo, useState } from 'react';
import Badge, { PriorityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { StatCard } from '../../components/ui/Card';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import StatDetailModal from '../../components/ui/StatDetailModal';
import {
  createPruningTask,
  getOperators,
  getPruningReports,
  getPruningStats,
  getPruningTasks,
  updatePruningStatus,
  updatePruningTask,
} from '../../services/pruningService';
import { createReport } from '../../services/reportService';
import { assets, getAsset, getRegion, getUser, REGIONS } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Edit2,
  FileText,
  Play,
  Plus,
  Search,
  Scissors,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

const statusOptions = [
  { value: 'All', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'on_progress', label: 'On Progress' },
  { value: 'waiting_validation', label: 'Menunggu Validasi' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const priorityOptions = [
  { value: 'All', label: 'Semua Prioritas' },
  { value: 'low', label: 'Rendah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'high', label: 'Tinggi' },
  { value: 'critical', label: 'Kritis' },
];

export default function PruningTaskPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reportTask, setReportTask] = useState(null);
  const [activeStat, setActiveStat] = useState(null);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate((n) => n + 1);

  const tasks = useMemo(
    () => getPruningTasks({ search, region_id: regionFilter, status: statusFilter, priority: priorityFilter }, user),
    [search, regionFilter, statusFilter, priorityFilter, user]
  );

  const stats = useMemo(() => getPruningStats(user), [tasks.length, user]);
  const statDetails = useMemo(() => {
    const scoped = getPruningTasks({}, user);
    const today = new Date();
    const columns = [
      { label: 'Kode', render: (task) => task.task_code },
      { label: 'Judul', render: (task) => task.title },
      { label: 'Wilayah', render: (task) => getRegion(task.region_id) },
      { label: 'Operator', render: (task) => getUser(task.assigned_to)?.name || 'Belum ditugaskan' },
      { label: 'Prioritas', render: (task) => <PriorityBadge priority={task.priority} /> },
      { label: 'Status', render: (task) => <Badge status={task.status} /> },
      { label: 'Deadline', render: (task) => formatDate(task.due_date) },
    ];

    return {
      total: {
        title: 'Total Tugas',
        description: 'Semua tugas pemangkasan sesuai akses pengguna.',
        rows: scoped,
        columns,
      },
      active: {
        title: 'Tugas Aktif',
        description: 'Tugas dengan status assigned, on progress, atau waiting validation.',
        rows: scoped.filter((task) => ['assigned', 'on_progress', 'waiting_validation'].includes(task.status)),
        columns,
      },
      waitingValidation: {
        title: 'Menunggu Validasi',
        description: 'Tugas yang menunggu validasi admin.',
        rows: scoped.filter((task) => task.status === 'waiting_validation'),
        columns,
      },
      overdue: {
        title: 'Tugas Terlambat',
        description: 'Tugas yang melewati deadline dan belum selesai.',
        rows: scoped.filter((task) => task.due_date && new Date(task.due_date) < today && !['completed', 'rejected'].includes(task.status)),
        columns,
      },
    };
  }, [tasks.length, user]);
  const selectedStat = activeStat ? statDetails[activeStat] : null;
  const operators = getOperators();
  const regionOptions = [{ value: 'All', label: 'Semua Wilayah' }, ...REGIONS.map((region, index) => ({ value: String(index), label: region }))];

  const openCreate = () => {
    setEditTask(null);
    setTaskModalOpen(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setTaskModalOpen(true);
  };

  const syncSelected = (taskId) => {
    const next = getPruningTasks({}, user).find((task) => task.id === taskId);
    setSelectedTask(next || null);
  };

  const handleTaskSave = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const assignedTo = form.get('assigned_to') ? parseInt(form.get('assigned_to')) : null;
    const selectedAsset = form.get('asset_id') ? getAsset(form.get('asset_id')) : null;
    const payload = {
      title: form.get('title'),
      description: form.get('description'),
      asset_id: form.get('asset_id') ? parseInt(form.get('asset_id')) : null,
      region_id: parseInt(form.get('region_id')),
      assigned_to: assignedTo,
      priority: form.get('priority'),
      due_date: form.get('due_date'),
      latitude: parseFloat(form.get('latitude') || selectedAsset?.latitude || '-7.28'),
      longitude: parseFloat(form.get('longitude') || selectedAsset?.longitude || '112.73'),
    };

    if (editTask) {
      if (editTask.status === 'draft' && assignedTo) payload.status = 'assigned';
      updatePruningTask(editTask.id, payload, user.id);
      syncSelected(editTask.id);
    } else {
      createPruningTask(payload, user.id);
    }

    setTaskModalOpen(false);
    refresh();
  };

  const handleStatus = (task, status) => {
    updatePruningStatus(task.id, status, user.id);
    syncSelected(task.id);
    refresh();
  };

  const handleReportSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    createReport({
      task_id: reportTask.id,
      disturbance_id: null,
      asset_id: reportTask.asset_id,
      operator_id: user.id,
      report_type: 'pruning',
      condition_before: form.get('condition_before'),
      action_taken: form.get('action_taken'),
      condition_after: form.get('condition_after'),
      latitude: parseFloat(form.get('latitude') || reportTask.latitude),
      longitude: parseFloat(form.get('longitude') || reportTask.longitude),
    });
    setReportTask(null);
    syncSelected(reportTask.id);
    refresh();
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{isAdmin ? 'Manajemen Pemangkasan' : 'Tugas Pemangkasan Saya'}</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isAdmin ? 'Kelola inspeksi dan pemangkasan vegetasi dekat jaringan fiber.' : 'Pantau tugas lapangan dan kirim laporan penyelesaian.'}
          </p>
        </div>
        {isAdmin && <Button onClick={openCreate} icon={Plus}>Buat Tugas</Button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tugas" value={stats.total} icon={Scissors} onClick={() => setActiveStat('total')} />
        <StatCard label="Aktif" value={stats.active} icon={Clock} iconBg="bg-brand-50 text-brand-600" onClick={() => setActiveStat('active')} />
        <StatCard label="Menunggu Validasi" value={stats.waitingValidation} icon={ClipboardCheck} iconBg="bg-amber-50 text-warning" valueColor={stats.waitingValidation ? 'text-warning' : 'text-slate-900'} onClick={() => setActiveStat('waitingValidation')} />
        <StatCard label="Terlambat" value={stats.overdue} icon={ShieldAlert} iconBg="bg-red-50 text-danger" valueColor={stats.overdue ? 'text-danger' : 'text-slate-900'} onClick={() => setActiveStat('overdue')} />
      </div>

      <Card className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode, judul, deskripsi, atau aset..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Select options={regionOptions} value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} className="w-48" />
        <Select options={statusOptions} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-48" />
        <Select options={priorityOptions} value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="w-48" />
      </Card>

      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Tugas</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4">Prioritas</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Deadline</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {tasks.map((task, index) => {
                const asset = task.asset_id ? getAsset(task.asset_id) : null;
                const assignee = task.assigned_to ? getUser(task.assigned_to) : null;
                return (
                  <tr key={task.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-3 font-bold text-brand-700">{task.task_code}</td>
                    <td className="px-6 py-3 min-w-[220px]">
                      <p className="font-bold text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[320px]">{asset?.asset_code || 'Tanpa aset'} - {task.description}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{getRegion(task.region_id)}</td>
                    <td className="px-6 py-3 text-slate-600">{assignee?.name || 'Belum ditugaskan'}</td>
                    <td className="px-6 py-3"><PriorityBadge priority={task.priority} /></td>
                    <td className="px-6 py-3"><Badge status={task.status} /></td>
                    <td className="px-6 py-3 text-xs text-slate-500">{formatDate(task.due_date)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedTask(task)} className="p-1.5 hover:bg-brand-100 text-brand-600 rounded-lg" title="Detail">
                          <FileText size={16} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => openEdit(task)} className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg" title="Edit">
                            <Edit2 size={16} />
                          </button>
                        )}
                        {!isAdmin && task.status === 'assigned' && (
                          <button onClick={() => handleStatus(task, 'on_progress')} className="p-1.5 hover:bg-brand-100 text-brand-600 rounded-lg" title="Mulai">
                            <Play size={16} />
                          </button>
                        )}
                        {!isAdmin && ['on_progress', 'rejected'].includes(task.status) && (
                          <button onClick={() => setReportTask(task)} className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded-lg" title="Submit laporan">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-slate-400">Tidak ada tugas pemangkasan ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.task_code}
        subtitle={selectedTask?.title}
        actions={selectedTask && (
          <>
            {isAdmin && <Button variant="secondary" className="flex-1" onClick={() => openEdit(selectedTask)} icon={Edit2}>Edit</Button>}
            {isAdmin && selectedTask.status === 'waiting_validation' && (
              <>
                <Button className="flex-1" onClick={() => handleStatus(selectedTask, 'completed')} icon={CheckCircle2}>Complete</Button>
                <Button variant="danger" className="flex-1" onClick={() => handleStatus(selectedTask, 'rejected')} icon={XCircle}>Reject</Button>
              </>
            )}
            {!isAdmin && selectedTask.status === 'assigned' && <Button className="flex-1" onClick={() => handleStatus(selectedTask, 'on_progress')} icon={Play}>Mulai</Button>}
            {!isAdmin && ['on_progress', 'rejected'].includes(selectedTask.status) && <Button className="flex-1" onClick={() => setReportTask(selectedTask)} icon={FileText}>Buat Laporan</Button>}
          </>
        )}
      >
        {selectedTask && <TaskDetail task={selectedTask} />}
      </Drawer>

      <Modal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} title={editTask ? 'Edit Tugas Pemangkasan' : 'Buat Tugas Pemangkasan'} maxWidth="max-w-2xl">
        <TaskForm task={editTask} operators={operators} onSubmit={handleTaskSave} onCancel={() => setTaskModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!reportTask} onClose={() => setReportTask(null)} title="Submit Laporan Pemangkasan" maxWidth="max-w-xl">
        {reportTask && (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Tugas</p>
              <p className="font-bold text-slate-800">{reportTask.task_code} - {reportTask.title}</p>
            </div>
            <Field label="Kondisi Sebelum">
              <textarea name="condition_before" rows={2} required className="input-field" defaultValue="Vegetasi mendekati jalur kabel fiber." />
            </Field>
            <Field label="Tindakan yang Diambil">
              <textarea name="action_taken" rows={3} required className="input-field" />
            </Field>
            <Field label="Kondisi Sesudah">
              <textarea name="condition_after" rows={2} required className="input-field" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input name="latitude" type="number" step="any" defaultValue={reportTask.latitude} className="input-field" />
              </Field>
              <Field label="Longitude">
                <input name="longitude" type="number" step="any" defaultValue={reportTask.longitude} className="input-field" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setReportTask(null)}>Batal</Button>
              <Button type="submit" icon={FileText}>Submit Laporan</Button>
            </div>
          </form>
        )}
      </Modal>

      <StatDetailModal detail={selectedStat} onClose={() => setActiveStat(null)} />
    </div>
  );
}

function TaskDetail({ task }) {
  const asset = task.asset_id ? getAsset(task.asset_id) : null;
  const assignee = task.assigned_to ? getUser(task.assigned_to) : null;
  const creator = task.created_by ? getUser(task.created_by) : null;
  const reports = getPruningReports(task.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deskripsi</p>
        <p className="text-sm text-slate-700 leading-6">{task.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Info label="Aset" value={asset ? `${asset.asset_code} - ${asset.asset_name}` : 'Tanpa aset'} />
        <Info label="Wilayah" value={getRegion(task.region_id)} />
        <Info label="Operator" value={assignee?.name || 'Belum ditugaskan'} />
        <Info label="Dibuat Oleh" value={creator?.name || '-'} />
        <Info label="Deadline" value={formatDate(task.due_date)} icon={CalendarDays} />
        <Info label="Update Terakhir" value={formatDateTime(task.updated_at)} />
      </div>

      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Koordinat</p>
        <p className="text-sm font-semibold text-slate-700">{task.latitude}, {task.longitude}</p>
      </div>

      <div>
        <h4 className="font-bold text-slate-900 mb-3">Laporan Terkait</h4>
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex justify-between gap-3">
                <p className="font-bold text-sm text-brand-700">{report.report_code}</p>
                <Badge status={report.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">{formatDateTime(report.submitted_at)}</p>
              <p className="text-sm text-slate-700 mt-2 line-clamp-2">{report.action_taken}</p>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">
              Belum ada laporan untuk tugas ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskForm({ task, operators, onSubmit, onCancel }) {
  const asset = task?.asset_id ? getAsset(task.asset_id) : null;
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Judul Tugas">
          <input name="title" defaultValue={task?.title || ''} required className="input-field" />
        </Field>
        <Field label="Prioritas">
          <select name="priority" defaultValue={task?.priority || 'medium'} className="select-field">
            <option value="low">Rendah</option>
            <option value="medium">Sedang</option>
            <option value="high">Tinggi</option>
            <option value="critical">Kritis</option>
          </select>
        </Field>
        <Field label="Aset Terkait">
          <select name="asset_id" defaultValue={task?.asset_id || ''} className="select-field">
            <option value="">Tidak ada aset</option>
            {assets.map((item) => <option key={item.id} value={item.id}>{item.asset_code} - {item.asset_name}</option>)}
          </select>
        </Field>
        <Field label="Wilayah">
          <select name="region_id" defaultValue={task?.region_id ?? asset?.region_id ?? 0} className="select-field">
            {REGIONS.map((region, index) => <option key={region} value={index}>{region}</option>)}
          </select>
        </Field>
        <Field label="Operator">
          <select name="assigned_to" defaultValue={task?.assigned_to || ''} className="select-field">
            <option value="">Belum ditugaskan</option>
            {operators.map((operator) => <option key={operator.id} value={operator.id}>{operator.name}</option>)}
          </select>
        </Field>
        <Field label="Deadline">
          <input name="due_date" type="date" defaultValue={task?.due_date || ''} required className="input-field" />
        </Field>
        <Field label="Latitude">
          <input name="latitude" type="number" step="any" defaultValue={task?.latitude || asset?.latitude || '-7.28'} className="input-field" />
        </Field>
        <Field label="Longitude">
          <input name="longitude" type="number" step="any" defaultValue={task?.longitude || asset?.longitude || '112.73'} className="input-field" />
        </Field>
        <Field label="Deskripsi">
          <textarea name="description" rows={3} defaultValue={task?.description || ''} required className="input-field md:col-span-2" />
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Batal</Button>
        <Button type="submit">{task ? 'Simpan Perubahan' : 'Buat Tugas'}</Button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {Icon && <Icon size={14} />}
        {value}
      </p>
    </div>
  );
}
