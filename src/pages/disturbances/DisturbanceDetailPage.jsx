import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge, { SeverityBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { disturbances, REGIONS, DIST_TYPES, getAsset, getUser, fieldReports, persistUpdate } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { formatDateTime, calcDuration } from '../../utils/formatDate';
import { ArrowLeft, MapPin, User, CheckCircle } from 'lucide-react';

export default function DisturbanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const [, forceUpdate] = useState(0);

  const dist = disturbances.find((d) => d.id === parseInt(id));

  if (!dist) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <p className="text-slate-500 text-lg">Gangguan tidak ditemukan.</p>
        <Button onClick={() => navigate('/disturbances')} className="mt-4" variant="ghost" icon={ArrowLeft}>Kembali</Button>
      </div>
    );
  }

  const asset = dist.asset_id ? getAsset(dist.asset_id) : null;
  const reporter = getUser(dist.created_by);
  const assignee = dist.assigned_to ? getUser(dist.assigned_to) : null;
  const relatedReports = fieldReports.filter((r) => r.disturbance_id === dist.id);

  const handleStatusChange = (newStatus) => {
    dist.status = newStatus;
    if (newStatus === 'resolved' || newStatus === 'closed') {
      dist.resolved_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    persistUpdate('disturbances', dist.id, { status: dist.status, resolved_at: dist.resolved_at }).catch(console.error);
    forceUpdate((n) => n + 1);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate('/disturbances')} className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Daftar Gangguan
      </button>

      {/* Main Info */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{dist.disturbance_code}</h2>
            <p className="text-slate-500 mt-0.5">{DIST_TYPES[dist.type]}</p>
          </div>
          <div className="flex gap-2">
            <SeverityBadge level={dist.severity} />
            <Badge status={dist.status} />
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-700 bg-slate-50 rounded-xl p-4">{dist.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Wilayah', value: REGIONS[dist.region_id] },
            { label: 'Aset Terkait', value: asset ? `${asset.asset_code} - ${asset.asset_name}` : '-' },
            { label: 'Koordinat', value: `${dist.latitude}, ${dist.longitude}` },
            { label: 'Dilaporkan', value: formatDateTime(dist.reported_at) },
            { label: 'Diselesaikan', value: dist.resolved_at ? formatDateTime(dist.resolved_at) : '-' },
            { label: 'Durasi', value: calcDuration(dist.reported_at, dist.resolved_at) },
            { label: 'Pelapor', value: reporter?.name || '-' },
            { label: 'Ditugaskan', value: assignee?.name || 'Belum ditugaskan' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Admin Actions */}
        {isAdmin && !['closed'].includes(dist.status) && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
            {dist.status === 'open' && (
              <Button size="sm" onClick={() => handleStatusChange('on_progress')}>Proses</Button>
            )}
            {dist.status === 'on_progress' && (
              <Button size="sm" onClick={() => handleStatusChange('waiting_validation')}>Minta Validasi</Button>
            )}
            {['waiting_validation', 'resolved'].includes(dist.status) && (
              <Button size="sm" variant="dark" icon={CheckCircle} onClick={() => handleStatusChange('closed')}>Close</Button>
            )}
          </div>
        )}
      </Card>

      {/* Related Reports */}
      <Card noPadding>
        <div className="px-6 pt-6 pb-3">
          <h3 className="font-bold text-lg text-slate-800">Laporan Terkait</h3>
          <p className="text-xs text-slate-400">{relatedReports.length} laporan lapangan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">No.</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Tindakan</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {relatedReports.map((r, index) => {
                const op = getUser(r.operator_id);
                return (
                  <tr key={r.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-3 font-bold text-brand-700">{r.report_code}</td>
                    <td className="px-6 py-3 text-slate-600">{op?.name || '-'}</td>
                    <td className="px-6 py-3 text-slate-600 max-w-xs truncate">{r.action_taken}</td>
                    <td className="px-6 py-3"><Badge status={r.status} /></td>
                  </tr>
                );
              })}
              {relatedReports.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">Belum ada laporan terkait</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
