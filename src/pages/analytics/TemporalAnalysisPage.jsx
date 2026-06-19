import React, { useMemo, useState } from 'react';
import Card, { StatCard } from '../../components/ui/Card';
import LineTrendChart from '../../components/charts/LineTrendChart';
import { StatusBarChart } from '../../components/charts/StatusBarChart';
import Badge from '../../components/ui/Badge';
import StatDetailModal from '../../components/ui/StatDetailModal';
import { disturbances, fieldReports, REGIONS, DIST_TYPES, getAsset, getRegion, getUser } from '../../services/api';
import { calcDuration, formatDateTime } from '../../utils/formatDate';
import { TrendingUp, Clock, BarChart3, Zap, Lightbulb } from 'lucide-react';

const REGIONS_SHORT = ['Utara', 'Selatan', 'Timur', 'Barat', 'Sidoarjo', 'Gresik'];

export default function TemporalAnalysisPage() {
  const [activeStat, setActiveStat] = useState(null);
  const monthWindow = useMemo(() => buildMonthWindow(6), []);

  const kpis = useMemo(() => {
    const resolved = disturbances.filter((d) => d.resolved_at);
    const avgHours = resolved.length
      ? resolved.reduce((sum, d) => {
          const h = (new Date(d.resolved_at) - new Date(d.reported_at)) / 36e5;
          return sum + h;
        }, 0) / resolved.length
      : 0;
    const critical = disturbances.filter((d) => d.severity >= 4);
    const approvedReports = fieldReports.filter((r) => r.status === 'approved');
    return {
      totalDisturbances: disturbances.length,
      avgResolution: `${Math.round(avgHours * 10) / 10}j`,
      criticalCount: critical.length,
      reportApprovalRate: fieldReports.length
        ? `${Math.round((approvedReports.length / fieldReports.length) * 100)}%`
        : '0%',
    };
  }, []);

  const statDetails = useMemo(() => {
    const resolved = disturbances.filter((item) => item.resolved_at);
    const critical = disturbances.filter((item) => item.severity >= 4);
    const approvedReports = fieldReports.filter((item) => item.status === 'approved');
    const disturbanceColumns = [
      { label: 'Kode', render: (item) => item.disturbance_code },
      { label: 'Tipe', render: (item) => DIST_TYPES[item.type] },
      { label: 'Aset', render: (item) => getAsset(item.asset_id)?.asset_code || '-' },
      { label: 'Wilayah', render: (item) => getRegion(item.region_id) },
      { label: 'Severity', render: (item) => `${item.severity}/5` },
      { label: 'Status', render: (item) => <Badge status={item.status} /> },
      { label: 'Dilaporkan', render: (item) => formatDateTime(item.reported_at) },
    ];
    const reportColumns = [
      { label: 'Kode', render: (item) => item.report_code },
      { label: 'Operator', render: (item) => getUser(item.operator_id)?.name || '-' },
      { label: 'Tipe', render: (item) => reportTypeLabel(item.report_type) },
      { label: 'Status', render: (item) => <Badge status={item.status} /> },
      { label: 'Submit', render: (item) => formatDateTime(item.submitted_at) },
    ];

    return {
      totalDisturbances: {
        title: 'Total Gangguan',
        description: 'Seluruh gangguan yang tercatat di database.',
        rows: disturbances,
        columns: disturbanceColumns,
      },
      avgResolution: {
        title: 'Data Resolusi',
        description: 'Gangguan yang sudah selesai dan dipakai untuk menghitung rata-rata resolusi.',
        rows: resolved,
        columns: [
          ...disturbanceColumns,
          { label: 'Durasi', render: (item) => calcDuration(item.reported_at, item.resolved_at) },
        ],
      },
      criticalCount: {
        title: 'Gangguan Kritis',
        description: 'Gangguan dengan severity 4 atau 5.',
        rows: critical,
        columns: disturbanceColumns,
      },
      reportApprovalRate: {
        title: 'Laporan Approved',
        description: 'Laporan berstatus approved yang menjadi dasar approval rate.',
        rows: approvedReports,
        columns: reportColumns,
      },
    };
  }, []);
  const selectedStat = activeStat ? statDetails[activeStat] : null;

  const trendLabels = monthWindow.map((month) => month.label);
  const trendDatasets = useMemo(() => [
    {
      label: 'Gangguan Baru',
      data: monthWindow.map((month) => countByMonth(disturbances, 'reported_at', month.key)),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
    },
    {
      label: 'Diselesaikan',
      data: monthWindow.map((month) => countByMonth(disturbances, 'resolved_at', month.key, (item) => Boolean(item.resolved_at))),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'Laporan',
      data: monthWindow.map((month) => countByMonth(fieldReports, 'submitted_at', month.key)),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.08)',
    },
  ], [monthWindow]);

  const regionData = useMemo(() => ({
    labels: REGIONS_SHORT,
    values: REGIONS_SHORT.map((_, index) => disturbances.filter((d) => d.region_id === index).length),
  }), []);

  const typeData = useMemo(() => {
    const map = {};
    Object.entries(DIST_TYPES).forEach(([k, v]) => { map[k] = { label: v, count: 0 }; });
    disturbances.forEach((d) => { if (map[d.type]) map[d.type].count++; });
    const entries = Object.values(map).sort((a, b) => b.count - a.count);
    return { labels: entries.map((e) => e.label), values: entries.map((e) => e.count) };
  }, []);

  const insights = useMemo(() => {
    const lines = [];
    const regionCounts = REGIONS.map((name, index) => ({
      name,
      count: disturbances.filter((d) => d.region_id === index).length,
    }));
    const worst = [...regionCounts].sort((a, b) => b.count - a.count)[0];
    if (worst && worst.count > 0) {
      lines.push(`Wilayah dengan gangguan terbanyak: **${worst.name}** (${worst.count} kejadian).`);
    } else {
      lines.push('Belum ada data gangguan per wilayah.');
    }

    const typeCounts = Object.entries(DIST_TYPES)
      .map(([key, label]) => ({
        key,
        label,
        count: disturbances.filter((d) => d.type === key).length,
      }))
      .sort((a, b) => b.count - a.count);
    const topType = typeCounts[0];
    if (topType && topType.count > 0) {
      lines.push(`Gangguan "${topType.label}" mencapai **${topType.count}** kejadian — tipe paling sering.`);
    }

    const unresolved = disturbances.filter((d) => !['resolved', 'closed'].includes(d.status)).length;
    lines.push(`Saat ini masih ada **${unresolved}** gangguan aktif yang perlu ditangani.`);

    const avgResolved = disturbances.filter((d) => d.resolved_at);
    if (avgResolved.length > 0) {
      const avgHours = avgResolved.reduce((sum, d) => {
        const h = (new Date(d.resolved_at) - new Date(d.reported_at)) / 36e5;
        return sum + h;
      }, 0) / avgResolved.length;
      lines.push(`Rata-rata waktu resolusi gangguan: **${Math.round(avgHours * 10) / 10} jam**.`);
    }

    return lines;
  }, []);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Gangguan" value={kpis.totalDisturbances} icon={BarChart3} iconBg="bg-brand-50 text-brand-600" onClick={() => setActiveStat('totalDisturbances')} />
        <StatCard label="Rata-rata Resolusi" value={kpis.avgResolution} icon={Clock} iconBg="bg-emerald-50 text-emerald-600" onClick={() => setActiveStat('avgResolution')} />
        <StatCard label="Kritis (>=4)" value={kpis.criticalCount} icon={Zap} iconBg="bg-red-50 text-danger" valueColor="text-danger" onClick={() => setActiveStat('criticalCount')} />
        <StatCard label="Approval Rate" value={kpis.reportApprovalRate} icon={TrendingUp} iconBg="bg-amber-50 text-amber-600" onClick={() => setActiveStat('reportApprovalRate')} />
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Tren Bulanan</h3>
            <p className="text-xs text-slate-400">Gangguan vs Penyelesaian vs Laporan (6 bulan terakhir)</p>
          </div>
          <TrendingUp size={20} className="text-brand-500" />
        </div>
        <LineTrendChart labels={trendLabels} datasets={trendDatasets} height={300} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-1">Per Wilayah</h3>
          <p className="text-xs text-slate-400 mb-4">Distribusi gangguan per region</p>
          <StatusBarChart labels={regionData.labels} data={regionData.values} height={260} />
        </Card>
        <Card>
          <h3 className="font-bold text-lg text-slate-800 mb-1">Per Tipe</h3>
          <p className="text-xs text-slate-400 mb-4">Distribusi berdasar tipe gangguan</p>
          <StatusBarChart labels={typeData.labels} data={typeData.values} height={260} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={20} className="text-amber-500" />
          <h3 className="font-bold text-lg text-slate-800">Insight Otomatis</h3>
        </div>
        <ul className="space-y-2">
          {insights.map((line, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span className="text-brand-500 font-bold mt-0.5">•</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>') }} />
            </li>
          ))}
        </ul>
      </Card>

      <StatDetailModal detail={selectedStat} onClose={() => setActiveStat(null)} />
    </div>
  );
}

function reportTypeLabel(type) {
  if (type === 'disturbance') return 'Gangguan';
  if (type === 'inspection') return 'Inspeksi';
  if (type === 'pruning') return 'Pemangkasan';
  return type || '-';
}

function buildMonthWindow(monthCount) {
  const now = new Date();
  return Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
    };
  });
}

function countByMonth(rows, field, monthKey, predicate = () => true) {
  return rows.filter((item) => {
    if (!predicate(item)) return false;
    const value = item[field];
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return key === monthKey;
  }).length;
}
