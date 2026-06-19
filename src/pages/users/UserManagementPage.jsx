import React, { useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import StatDetailModal from '../../components/ui/StatDetailModal';
import { getUsers, createUser, updateUser, toggleUserStatus } from '../../services/userService';
import { REGIONS } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Edit2, Plus, Search, ShieldCheck, ToggleLeft, ToggleRight, UserRound } from 'lucide-react';

const roleOptions = [
  { value: 'All', label: 'Semua Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'operator', label: 'Operator' },
];

const statusOptions = [
  { value: 'All', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

export default function UserManagementPage() {
  const currentUser = useAuthStore((s) => s.user);
  const setSessionUser = useAuthStore((s) => s.setUser);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeStat, setActiveStat] = useState(null);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate((n) => n + 1);

  const filteredUsers = useMemo(
    () => getUsers({ search, role: roleFilter, status: statusFilter }),
    [search, roleFilter, statusFilter]
  );

  const stats = useMemo(() => {
    const all = getUsers();
    return {
      total: all.length,
      admin: all.filter((user) => user.role === 'admin').length,
      operator: all.filter((user) => user.role === 'operator').length,
      active: all.filter((user) => user.is_active).length,
    };
  }, [filteredUsers.length]);

  const statDetails = useMemo(() => {
    const all = getUsers();
    const columns = [
      { label: 'Nama', render: (user) => user.name },
      { label: 'Email', render: (user) => user.email },
      { label: 'Role', render: (user) => user.role },
      { label: 'Wilayah', render: (user) => REGIONS[user.region_id] || 'Semua Wilayah' },
      { label: 'Kontak', render: (user) => user.phone || '-' },
      { label: 'Status', render: (user) => <Badge status={user.is_active ? 'active' : 'inactive'} /> },
    ];

    return {
      total: { title: 'Total User', description: 'Semua user yang terdaftar.', rows: all, columns },
      admin: { title: 'Admin', description: 'User dengan role admin.', rows: all.filter((user) => user.role === 'admin'), columns },
      operator: { title: 'Operator', description: 'User dengan role operator.', rows: all.filter((user) => user.role === 'operator'), columns },
      active: { title: 'User Aktif', description: 'User yang saat ini aktif.', rows: all.filter((user) => user.is_active), columns },
    };
  }, [filteredUsers.length]);
  const selectedStat = activeStat ? statDetails[activeStat] : null;

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditItem(user);
    setModalOpen(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const payload = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      role: form.get('role'),
      region_id: parseInt(form.get('region_id')),
      is_active: form.get('is_active') === 'true',
    };

    const password = form.get('password');
    if (password) payload.password = password;

    const saved = editItem
      ? updateUser(editItem.id, payload, currentUser.id)
      : createUser(payload, currentUser.id);

    if (saved?.id === currentUser.id) {
      setSessionUser(saved);
    }

    setModalOpen(false);
    refresh();
  };

  const handleToggle = (user) => {
    if (user.id === currentUser.id) return;
    toggleUserStatus(user.id, currentUser.id);
    refresh();
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Kelola admin dan operator lapangan Infranexia FiberOps.</p>
        </div>
        <Button onClick={openCreate} icon={Plus}>Tambah User</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStat label="Total User" value={stats.total} icon={UserRound} onClick={() => setActiveStat('total')} />
        <MiniStat label="Admin" value={stats.admin} icon={ShieldCheck} color="text-brand-600 bg-brand-50" onClick={() => setActiveStat('admin')} />
        <MiniStat label="Operator" value={stats.operator} icon={UserRound} color="text-purple bg-purple/10" onClick={() => setActiveStat('operator')} />
        <MiniStat label="Aktif" value={stats.active} icon={ToggleRight} color="text-success bg-emerald-50" onClick={() => setActiveStat('active')} />
      </div>

      <Card className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, email, atau nomor HP..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Select options={roleOptions} value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-44" />
        <Select options={statusOptions} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-44" />
      </Card>

      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">No.</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-brand-50 transition-colors">
                  <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-3">
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className="capitalize text-slate-700 font-semibold">{user.role}</span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{REGIONS[user.region_id] || 'Semua Wilayah'}</td>
                  <td className="px-6 py-3 text-slate-600">{user.phone || '-'}</td>
                  <td className="px-6 py-3">
                    <Badge status={user.is_active ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 hover:bg-amber-100 text-amber-600 rounded-lg" title="Edit user">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggle(user)}
                        disabled={user.id === currentUser.id}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        title={user.is_active ? 'Nonaktifkan user' : 'Aktifkan user'}
                      >
                        {user.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400">Tidak ada user ditemukan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit User' : 'Tambah User'} maxWidth="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nama">
              <input name="name" defaultValue={editItem?.name || ''} required className="input-field" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={editItem?.email || ''} required className="input-field" />
            </Field>
            <Field label="Nomor HP">
              <input name="phone" defaultValue={editItem?.phone || ''} className="input-field" />
            </Field>
            <Field label={editItem ? 'Password Baru' : 'Password'}>
              <input
                name="password"
                type="password"
                placeholder={editItem ? 'Kosongkan jika tidak diganti' : 'Default otomatis jika kosong'}
                className="input-field"
              />
            </Field>
            <Field label="Role">
              <select name="role" defaultValue={editItem?.role || 'operator'} className="select-field">
                <option value="admin">Admin</option>
                <option value="operator">Operator</option>
              </select>
            </Field>
            <Field label="Wilayah">
              <select name="region_id" defaultValue={editItem?.region_id ?? 0} className="select-field">
                {REGIONS.map((region, index) => <option key={region} value={index}>{region}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select name="is_active" defaultValue={String(editItem?.is_active ?? true)} className="select-field">
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit">{editItem ? 'Simpan Perubahan' : 'Tambah User'}</Button>
          </div>
        </form>
      </Modal>

      <StatDetailModal detail={selectedStat} onClose={() => setActiveStat(null)} />
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, color = 'text-slate-700 bg-slate-50', onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-card">
      <Card className="flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={22} />
      </div>
      </Card>
    </button>
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
