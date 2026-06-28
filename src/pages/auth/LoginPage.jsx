import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

const LOGO_URL = '/infranexia-mark.svg';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2240%22%20height%3D%2240%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%200%2010%20L%2040%2010%20M%2010%200%20L%2010%2040%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.03)%22%20stroke-width%3D%221%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%2F%3E%3C%2Fsvg%3E')] opacity-80" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-20 rounded-2xl bg-white shadow-glow mb-4 border border-slate-100 overflow-hidden">
              <img src={LOGO_URL} alt="Infranexia" className="w-20 h-16 object-contain" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Infranexia FiberOps</h1>
            <p className="text-sm text-slate-500 mt-1">Monitoring aset, gangguan, dan pekerjaan lapangan berbasis peta.</p>
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mt-1">Fiber Operations Monitoring System</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@sigaptif.id"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-bold shadow-md hover:bg-brand-700 transition-colors hover:shadow-lg"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">Akun Demo</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('admin@sigaptif.id'); setPassword('admin123'); }}
                className="border border-brand-200 bg-brand-50 text-brand-700 rounded-xl py-2 px-3 font-semibold hover:bg-brand-100"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('budi@sigaptif.id'); setPassword('operator123'); }}
                className="border border-slate-200 bg-slate-50 text-slate-700 rounded-xl py-2 px-3 font-semibold hover:bg-slate-100"
              >
                Operator
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-navy-400 text-[10px] mt-6 tracking-wider">
          2026 Infranexia FiberOps - Local MVP Prototype
        </p>
      </div>
    </div>
  );
}
