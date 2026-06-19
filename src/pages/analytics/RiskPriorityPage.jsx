import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge, { SeverityBadge } from '../../components/ui/Badge';
import StatDetailModal from '../../components/ui/StatDetailModal';
import { disturbances, assets, REGIONS, DIST_TYPES, getAsset } from '../../services/api';
import { ShieldAlert, AlertTriangle, TrendingDown } from 'lucide-react';

function calcRiskScore(asset) {
  // PRD formula: severity 30%, frequency 25%, criticality 20%, impact 15%, age 10%
  const relatedDist = disturbances.filter((d) => d.asset_id === asset.id);
  const activeDist = relatedDist.filter((d) => !['resolved', 'closed'].includes(d.status));

  const maxSeverity = relatedDist.length ? Math.max(...relatedDist.map((d) => d.severity)) : 0;
  const severity = (maxSeverity / 5) * 30;

  const frequency = Math.min(relatedDist.length / 5, 1) * 25;

  const criticalTypes = ['cable_cut', 'odp_damage'];
  const hasCritical = relatedDist.some((d) => criticalTypes.includes(d.type));
  const criticality = (hasCritical ? 1 : asset.asset_type === 'STO' ? 0.8 : 0.4) * 20;

  const statusImpact = asset.status === 'damaged' ? 1 : ['monitoring', 'maintenance'].includes(asset.status) ? 0.6 : 0.2;
  const impact = statusImpact * 15;

  const installed = new Date(asset.installation_date);
  const ageYears = (Date.now() - installed) / (365.25 * 24 * 36e5);
  const age = Math.min(ageYears / 10, 1) * 10;

  const total = Math.round((severity + frequency + criticality + impact + age) * 10) / 10;

  return {
    asset,
    total,
    severity: Math.round(severity * 10) / 10,
    frequency: Math.round(frequency * 10) / 10,
    criticality: Math.round(criticality * 10) / 10,
    impact: Math.round(impact * 10) / 10,
    age: Math.round(age * 10) / 10,
    disturbanceCount: relatedDist.length,
    activeCount: activeDist.length,
  };
}

function getRiskLevel(score) {
  if (score >= 60) return { label: 'Kritis', color: 'bg-red-100 text-red-800', bar: 'bg-red-500' };
  if (score >= 40) return { label: 'Tinggi', color: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' };
  if (score >= 20) return { label: 'Sedang', color: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' };
  return { label: 'Rendah', color: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' };
}

export default function RiskPriorityPage() {
  const [activeRisk, setActiveRisk] = useState(null);
  const riskData = useMemo(() => {
    return assets.map(calcRiskScore).sort((a, b) => b.total - a.total);
  }, []);

  const topRisks = riskData.slice(0, 5);
  const riskDistribution = useMemo(() => {
    const d = { kritis: 0, tinggi: 0, sedang: 0, rendah: 0 };
    riskData.forEach((r) => {
      const level = getRiskLevel(r.total);
      if (level.label === 'Kritis') d.kritis++;
      else if (level.label === 'Tinggi') d.tinggi++;
      else if (level.label === 'Sedang') d.sedang++;
      else d.rendah++;
    });
    return d;
  }, [riskData]);
  const riskDetails = useMemo(() => {
    const columns = [
      { label: 'Kode Aset', render: (item) => item.asset.asset_code },
      { label: 'Nama', render: (item) => item.asset.asset_name },
      { label: 'Tipe', render: (item) => item.asset.asset_type },
      { label: 'Wilayah', render: (item) => REGIONS[item.asset.region_id] },
      { label: 'Gangguan', render: (item) => `${item.disturbanceCount} (${item.activeCount} aktif)` },
      { label: 'Score', render: (item) => item.total },
      { label: 'Risk', render: (item) => {
        const level = getRiskLevel(item.total);
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${level.color}`}>{level.label}</span>;
      } },
    ];
    const byLevel = (label) => riskData.filter((item) => getRiskLevel(item.total).label === label);

    return {
      kritis: { title: 'Risk Kritis', description: 'Aset dengan skor risiko 60 atau lebih.', rows: byLevel('Kritis'), columns },
      tinggi: { title: 'Risk Tinggi', description: 'Aset dengan skor risiko 40 sampai 59.', rows: byLevel('Tinggi'), columns },
      sedang: { title: 'Risk Sedang', description: 'Aset dengan skor risiko 20 sampai 39.', rows: byLevel('Sedang'), columns },
      rendah: { title: 'Risk Rendah', description: 'Aset dengan skor risiko di bawah 20.', rows: byLevel('Rendah'), columns },
    };
  }, [riskData]);
  const selectedRisk = activeRisk ? riskDetails[activeRisk] : null;

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Risk & Priority Scoring</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Formula: Severity (30%) + Frequency (25%) + Criticality (20%) + Impact (15%) + Age (10%)
        </p>
      </div>

      {/* Distribution Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'kritis', label: 'Kritis (>=60)', value: riskDistribution.kritis, color: 'text-red-600', bg: 'bg-red-50' },
          { key: 'tinggi', label: 'Tinggi (40-59)', value: riskDistribution.tinggi, color: 'text-orange-600', bg: 'bg-orange-50' },
          { key: 'sedang', label: 'Sedang (20-39)', value: riskDistribution.sedang, color: 'text-amber-600', bg: 'bg-amber-50' },
          { key: 'rendah', label: 'Rendah (<20)', value: riskDistribution.rendah, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((item) => (
          <button key={item.label} type="button" onClick={() => setActiveRisk(item.key)} className={`${item.bg} rounded-card p-5 text-center hover:-translate-y-0.5 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-brand-500`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${item.color}`}>{item.value}</p>
          </button>
        ))}
      </div>

      {/* Top 5 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={20} className="text-red-500" />
          <h3 className="font-bold text-lg text-slate-800">Top 5 Aset Berisiko</h3>
        </div>
        <div className="space-y-3">
          {topRisks.map((r, i) => {
            const level = getRiskLevel(r.total);
            return (
              <div key={r.asset.id} className="flex items-center gap-4 bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{r.asset.asset_code}</p>
                    <span className="text-xs text-slate-400">{r.asset.asset_name}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div className={`h-full rounded-full ${level.bar}`} style={{ width: `${Math.min(r.total, 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-12 text-right">{r.total}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${level.color}`}>{level.label}</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 leading-relaxed shrink-0">
                  <div>Sev: {r.severity} | Freq: {r.frequency}</div>
                  <div>Crit: {r.criticality} | Imp: {r.impact} | Age: {r.age}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-soft overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <h3 className="font-bold text-lg text-slate-800">Ranking Lengkap</h3>
          <p className="text-xs text-slate-400">{riskData.length} aset dinilai</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Kode Aset</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Wilayah</th>
                <th className="px-6 py-4">Gangguan</th>
                <th className="px-6 py-4">Sev</th>
                <th className="px-6 py-4">Freq</th>
                <th className="px-6 py-4">Crit</th>
                <th className="px-6 py-4">Imp</th>
                <th className="px-6 py-4">Age</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Risk</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {riskData.map((r, i) => {
                const level = getRiskLevel(r.total);
                return (
                  <tr key={r.asset.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-6 py-3 font-bold text-brand-700">{r.asset.asset_code}</td>
                    <td className="px-6 py-3 text-slate-600">{r.asset.asset_type}</td>
                    <td className="px-6 py-3 text-slate-600">{REGIONS[r.asset.region_id]}</td>
                    <td className="px-6 py-3 font-bold">{r.disturbanceCount} <span className="text-slate-400 font-normal text-xs">({r.activeCount} aktif)</span></td>
                    <td className="px-6 py-3">{r.severity}</td>
                    <td className="px-6 py-3">{r.frequency}</td>
                    <td className="px-6 py-3">{r.criticality}</td>
                    <td className="px-6 py-3">{r.impact}</td>
                    <td className="px-6 py-3">{r.age}</td>
                    <td className="px-6 py-3 font-extrabold text-slate-900">{r.total}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${level.color}`}>{level.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StatDetailModal detail={selectedRisk} onClose={() => setActiveRisk(null)} />
    </div>
  );
}

