import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { resetStore } from '../../services/api';
import { updateUser } from '../../services/userService';
import { useAuthStore } from '../../stores/authStore';
import { DatabaseBackup, RotateCcw, Save, Settings, UserRound } from 'lucide-react';

const PREF_KEY = 'infranexia_fiberops_preferences';

function loadPreferences() {
  if (typeof window === 'undefined') return { compactTable: false, showHints: true };
  try {
    return { compactTable: false, showHints: true, ...JSON.parse(window.localStorage.getItem(PREF_KEY) || '{}') };
  } catch {
    return { compactTable: false, showHints: true };
  }
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const setSessionUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [prefs, setPrefs] = useState(loadPreferences);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const handleProfile = (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const saved = updateUser(user.id, {
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email'),
    }, user.id);
    if (saved) {
      setSessionUser(saved);
      setMessage('Profil berhasil disimpan.');
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset semua data demo ke kondisi awal?')) return;
    resetStore();
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">Kelola profil, preferensi tampilan, dan data demo lokal.</p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
              <UserRound size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Profil Pengguna</h3>
              <p className="text-xs text-slate-500">Informasi ini dipakai pada sesi lokal aplikasi.</p>
            </div>
          </div>

          <form onSubmit={handleProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nama">
              <input name="name" defaultValue={user?.name || ''} required className="input-field" />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={user?.email || ''} required className="input-field" />
            </Field>
            <Field label="Nomor HP">
              <input name="phone" defaultValue={user?.phone || ''} className="input-field" />
            </Field>
            <Field label="Role">
              <input value={user?.role === 'admin' ? 'Administrator' : 'Operator Lapangan'} disabled className="input-field disabled:text-slate-500" />
            </Field>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" icon={Save}>Simpan Profil</Button>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-xl bg-slate-50 text-slate-700">
              <Settings size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Preferensi</h3>
              <p className="text-xs text-slate-500">Disimpan di browser ini.</p>
            </div>
          </div>

          <div className="space-y-3">
            <Toggle
              label="Tabel compact"
              description="Kurangi jarak antar baris pada tampilan data."
              checked={prefs.compactTable}
              onChange={(checked) => setPrefs((current) => ({ ...current, compactTable: checked }))}
            />
            <Toggle
              label="Tampilkan hint"
              description="Pertahankan teks bantuan singkat pada halaman."
              checked={prefs.showHints}
              onChange={(checked) => setPrefs((current) => ({ ...current, showHints: checked }))}
            />
          </div>
        </Card>
      </div>

      <Card className="border-red-100 bg-red-50/50">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-white text-danger">
              <DatabaseBackup size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Data Demo Lokal</h3>
              <p className="text-sm text-slate-600 mt-1">
                Reset akan mengembalikan aset, gangguan, tugas, laporan, user, dan audit log ke data seed awal.
              </p>
            </div>
          </div>
          <Button variant="danger" onClick={handleReset} icon={RotateCcw}>Reset Data Demo</Button>
        </div>
      </Card>
    </div>
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

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
      />
      <span>
        <span className="block text-sm font-bold text-slate-800">{label}</span>
        <span className="block text-xs text-slate-500 mt-0.5">{description}</span>
      </span>
    </label>
  );
}
