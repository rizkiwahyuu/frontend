import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import { getAssets, createAsset, updateAsset, deleteAsset, exportAssetsCSV } from '../../services/assetService';
import { REGIONS, ASSET_TYPES, STATUS_LABELS } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDate } from '../../utils/formatDate';
import { Plus, Search, Download, Pencil, Trash2, Eye } from 'lucide-react';

export default function AssetListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate((n) => n + 1);

  const filteredAssets = useMemo(
    () => getAssets({ search, region_id: regionFilter, asset_type: typeFilter, status: statusFilter }),
    [search, regionFilter, typeFilter, statusFilter]
  );

  const regionOptions = [{ value: 'All', label: 'Semua Wilayah' }, ...REGIONS.map((r, i) => ({ value: String(i), label: r }))];
  const typeOptions = [{ value: 'All', label: 'Semua Tipe' }, ...ASSET_TYPES.map((t) => ({ value: t, label: t }))];
  const statusOptions = [
    { value: 'All', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Nonaktif' },
  ];

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (asset) => { setEditItem(asset); setModalOpen(true); };

  const handleSave = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      asset_code: fd.get('asset_code'),
      asset_name: fd.get('asset_name'),
      asset_type: fd.get('asset_type'),
      region_id: parseInt(fd.get('region_id')),
      latitude: parseFloat(fd.get('latitude')),
      longitude: parseFloat(fd.get('longitude')),
      address: fd.get('address'),
      status: fd.get('status'),
      installation_date: fd.get('installation_date'),
      notes: fd.get('notes'),
    };
    if (editItem) {
      updateAsset(editItem.id, data);
    } else {
      createAsset(data);
    }
    setModalOpen(false);
    refresh();
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
      deleteAsset(id);
      refresh();
    }
  };

  const handleExport = () => {
    const csv = exportAssetsCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aset_jaringan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Inventaris Aset Jaringan</h2>
          <p className="text-sm text-slate-500 mt-0.5">Total {filteredAssets.length} aset ditemukan</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button onClick={handleExport} variant="secondary" icon={Download}>Export CSV</Button>
          )}
          {isAdmin && (
            <Button onClick={openCreate} icon={Plus}>Tambah Aset</Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kode, nama, alamat..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Select options={regionOptions} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="w-44" />
        <Select options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
      </Card>

      {/* Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">Kode Aset</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tgl Pasang</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredAssets.map((a, index) => (
                <tr key={a.id} className="hover:bg-brand-50 transition-colors">
                  <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-3 font-bold text-brand-700">{a.asset_code}</td>
                  <td className="px-6 py-3 text-slate-800">{a.asset_name}</td>
                  <td className="px-6 py-3 text-slate-600">{a.asset_type}</td>
                  <td className="px-6 py-3 text-slate-600">{REGIONS[a.region_id]}</td>
                  <td className="px-6 py-3"><Badge status={a.status} /></td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{formatDate(a.installation_date)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/assets/${a.id}`)} className="p-1.5 hover:bg-brand-100 text-brand-600 rounded-lg" title="Detail">
                        <Eye size={16} />
                      </button>
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-1.5 hover:bg-red-100 text-danger rounded-lg" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Tidak ada aset ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Aset' : 'Tambah Aset Baru'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Kode Aset</label>
              <input name="asset_code" defaultValue={editItem?.asset_code || ''} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Nama Aset</label>
              <input name="asset_name" defaultValue={editItem?.asset_name || ''} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tipe</label>
              <select name="asset_type" defaultValue={editItem?.asset_type || 'ODP'} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Wilayah</label>
              <select name="region_id" defaultValue={editItem?.region_id ?? 0} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                {REGIONS.map((r, i) => <option key={i} value={i}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Latitude</label>
              <input name="latitude" type="number" step="any" defaultValue={editItem?.latitude || ''} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Longitude</label>
              <input name="longitude" type="number" step="any" defaultValue={editItem?.longitude || ''} required className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Alamat</label>
              <input name="address" defaultValue={editItem?.address || ''} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
              <select name="status" defaultValue={editItem?.status || 'active'} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                <option value="active">Aktif</option>
                <option value="monitoring">Monitoring</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tanggal Pasang</label>
              <input name="installation_date" type="date" defaultValue={editItem?.installation_date || ''} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Catatan</label>
              <textarea name="notes" rows={2} defaultValue={editItem?.notes || ''} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">{editItem ? 'Simpan Perubahan' : 'Tambah Aset'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
