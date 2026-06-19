import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { getAssetById } from '../../services/assetService';
import { REGIONS, disturbances, DIST_TYPES } from '../../services/api';
import { formatDate, formatDateTime, calcDuration } from '../../utils/formatDate';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const asset = getAssetById(parseInt(id));

  if (!asset) {
    return (
      <div className="p-8 text-center animate-fade-in">
        <p className="text-slate-500 text-lg">Aset tidak ditemukan.</p>
        <Button onClick={() => navigate('/assets')} className="mt-4" variant="ghost" icon={ArrowLeft}>Kembali</Button>
      </div>
    );
  }

  const assetDisturbances = disturbances.filter((d) => d.asset_id === asset.id);

  return (
    <div className="p-8 space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate('/assets')} className="text-brand-600 text-sm font-bold flex items-center gap-1 hover:underline">
        <ArrowLeft size={16} /> Kembali ke Daftar Aset
      </button>

      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{asset.asset_code}</h2>
            <p className="text-slate-500 mt-0.5">{asset.asset_name}</p>
          </div>
          <Badge status={asset.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Tipe Aset', value: asset.asset_type },
            { label: 'Wilayah', value: REGIONS[asset.region_id] },
            { label: 'Alamat', value: asset.address || '-' },
            { label: 'Koordinat', value: `${asset.latitude}, ${asset.longitude}` },
            { label: 'Tgl Instalasi', value: formatDate(asset.installation_date) },
            { label: 'Catatan', value: asset.notes || '-' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Disturbance History */}
      <Card noPadding>
        <div className="px-6 pt-6 pb-3">
          <h3 className="font-bold text-lg text-slate-800">Riwayat Gangguan</h3>
          <p className="text-xs text-slate-400">{assetDisturbances.length} gangguan tercatat</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">No.</th>
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Dilaporkan</th>
                <th className="px-6 py-3">Durasi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {assetDisturbances.map((d, index) => (
                <tr
                  key={d.id}
                  className="hover:bg-brand-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/disturbances/${d.id}`)}
                >
                  <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-3 font-bold text-brand-700">{d.disturbance_code}</td>
                  <td className="px-6 py-3 text-slate-600">{DIST_TYPES[d.type]}</td>
                  <td className="px-6 py-3 font-bold">{d.severity}/5</td>
                  <td className="px-6 py-3"><Badge status={d.status} /></td>
                  <td className="px-6 py-3 text-xs text-slate-500">{formatDateTime(d.reported_at)}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{calcDuration(d.reported_at, d.resolved_at)}</td>
                </tr>
              ))}
              {assetDisturbances.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">Tidak ada riwayat gangguan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
