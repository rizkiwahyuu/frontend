import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge, { SeverityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { disturbances, REGIONS, DIST_TYPES, getNextId, getAsset, assets, persistCreate } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDateTime, calcDuration } from '../../utils/formatDate';
import { Plus, Search, AlertTriangle, Clock } from 'lucide-react';

export default function DisturbanceListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate((n) => n + 1);

  const filtered = useMemo(() => {
    return disturbances.filter((d) => {
      if (search) {
        const q = search.toLowerCase();
        const asset = d.asset_id ? getAsset(d.asset_id) : null;
        if (!`${d.disturbance_code} ${d.description} ${DIST_TYPES[d.type]} ${asset?.asset_code || ''}`.toLowerCase().includes(q)) return false;
      }
      if (regionFilter !== 'All' && d.region_id !== parseInt(regionFilter)) return false;
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;
      return true;
    });
  }, [search, regionFilter, statusFilter]);

  const regionOptions = [{ value: 'All', label: 'Semua Wilayah' }, ...REGIONS.map((r, i) => ({ value: String(i), label: r }))];
  const statusOptions = [
    { value: 'All', label: 'Semua Status' },
    { value: 'open', label: 'Open' },
    { value: 'on_progress', label: 'On Progress' },
    { value: 'waiting_validation', label: 'Menunggu Validasi' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleCreate = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      id: getNextId('disturbances'),
      disturbance_code: `GGN-2026-${String(disturbances.length + 1).padStart(3, '0')}`,
      asset_id: fd.get('asset_id') ? parseInt(fd.get('asset_id')) : null,
      region_id: parseInt(fd.get('region_id')),
      type: fd.get('type'),
      severity: parseInt(fd.get('severity')),
      status: 'open',
      latitude: parseFloat(fd.get('latitude') || '-7.28'),
      longitude: parseFloat(fd.get('longitude') || '112.73'),
      description: fd.get('description'),
      reported_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      resolved_at: null,
      created_by: user.id,
      assigned_to: fd.get('assigned_to') ? parseInt(fd.get('assigned_to')) : null,
    };
    disturbances.unshift(data);
    persistCreate('disturbances', data).catch(console.error);
    setModalOpen(false);
    refresh();
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Gangguan</h2>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} gangguan ditemukan</p>
        </div>
        {isAdmin && <Button onClick={() => setModalOpen(true)} icon={Plus}>Laporkan Gangguan</Button>}
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, deskripsi..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Select options={regionOptions} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="w-44" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-48" />
      </Card>

      {/* Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Kode</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dilaporkan</th>
                <th className="px-6 py-4">Durasi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filtered.map((d, index) => (
                <tr
                  key={d.id}
                  className="hover:bg-brand-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/disturbances/${d.id}`)}
                >
                  <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-3 font-bold text-brand-700">{d.disturbance_code}</td>
                  <td className="px-6 py-3 text-slate-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    {DIST_TYPES[d.type]}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{REGIONS[d.region_id]}</td>
                  <td className="px-6 py-3"><SeverityBadge level={d.severity} /></td>
                  <td className="px-6 py-3"><Badge status={d.status} /></td>
                  <td className="px-6 py-3 text-xs text-slate-500">{formatDateTime(d.reported_at)}</td>
                  <td className="px-6 py-3 text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {calcDuration(d.reported_at, d.resolved_at)}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Tidak ada gangguan ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Laporkan Gangguan Baru" maxWidth="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipe Gangguan</label>
              <select name="type" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                {Object.entries(DIST_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Severity (1-5)</label>
              <select name="severity" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Wilayah</label>
              <select name="region_id" required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                {REGIONS.map((r, i) => <option key={i} value={i}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Aset Terkait</label>
              <select name="asset_id" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="">— Tidak Ada —</option>
                {assets.map((a) => <option key={a.id} value={a.id}>{a.asset_code} - {a.asset_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Latitude</label>
              <input name="latitude" type="number" step="any" defaultValue="-7.28" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Longitude</label>
              <input name="longitude" type="number" step="any" defaultValue="112.73" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Deskripsi</label>
              <textarea name="description" rows={3} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">Laporkan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
