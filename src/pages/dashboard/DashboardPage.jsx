import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { StatCard } from '../../components/ui/Card';
import LineTrendChart from '../../components/charts/LineTrendChart';
import Modal from '../../components/ui/Modal';
import { StatusBarChart, StatusDonutChart } from '../../components/charts/StatusBarChart';
import { assets, ASSET_TYPES, DIST_TYPES, disturbances, fieldReports, getAsset, getRegion, getUser, STATUS_LABELS } from '../../services/api';
import { calcDuration, formatDateTime } from '../../utils/formatDate';
import { AlertTriangle, BarChart3, Clock, FileText, Network, ShieldAlert, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeStat, setActiveStat] = useState(null);
  const monthWindow = useMemo(() => buildMonthWindow(6), []);

  const stats = useMemo(() => {
    const activeDisturbances = disturbances.filter((item) => !['resolved', 'closed'].includes(item.status));
    const criticalDisturbances = activeDisturbances.filter((item) => item.severity >= 4);
    const pendingReports = fieldReports.filter((item) => item.status === 'submitted');

    return {
      totalAssets: assets.length,
      activeDisturbances: activeDisturbances.length,
      criticalDisturbances: criticalDisturbances.length,
      pendingReports: pendingReports.length,
    };
  }, []);

  const statDetails = useMemo(() => ({
    assets: {
      title: 'Total Aset',
      description: 'Seluruh aset jaringan yang tersimpan di data lokal.',
      cta: 'Buka Aset',
      path: '/assets',
      rows: assets,
      columns: [
        { label: 'Kode', render: (item) => item.asset_code },
        { label: 'Nama', render: (item) => item.asset_name },
        { label: 'Tipe', render: (item) => item.asset_type },
        { label: 'Wilayah', render: (item) => getRegion(item.region_id) },
        { label: 'Status', render: (item) => <Badge status={item.status} /> },
      ],
    },
    activeDisturbances: {
      title: 'Gangguan Aktif',
      description: 'Gangguan dengan status open, on progress, atau waiting validation.',
      cta: 'Buka Gangguan',
      path: '/disturbances',
      rows: disturbances.filter((item) => !['resolved', 'closed'].includes(item.status)),
      columns: [
        { label: 'Kode', render: (item) => item.disturbance_code },
        { label: 'Tipe', render: (item) => DIST_TYPES[item.type] },
        { label: 'Aset', render: (item) => getAsset(item.asset_id)?.asset_code || '-' },
        { label: 'Severity', render: (item) => `${item.severity}/5` },
        { label: 'Status', render: (item) => <Badge status={item.status} /> },
      ],
    },
    criticalDisturbances: {
      title: 'Gangguan Kritis',
      description: 'Gangguan aktif dengan severity 4 atau 5.',
      cta: 'Buka Risk Priority',
      path: '/risk',
      rows: disturbances.filter((item) => !['resolved', 'closed'].includes(item.status) && item.severity >= 4),
      columns: [
        { label: 'Kode', render: (item) => item.disturbance_code },
        { label: 'Tipe', render: (item) => DIST_TYPES[item.type] },
        { label: 'Wilayah', render: (item) => getRegion(item.region_id) },
        { label: 'Severity', render: (item) => `${item.severity}/5` },
        { label: 'Status', render: (item) => <Badge status={item.status} /> },
      ],
    },
    pendingReports: {
      title: 'Laporan Pending',
      description: 'Laporan lapangan yang menunggu validasi admin.',
      cta: 'Buka Laporan',
      path: '/reports',
      rows: fieldReports.filter((item) => item.status === 'submitted'),
      columns: [
        { label: 'Kode', render: (item) => item.report_code },
        { label: 'Operator', render: (item) => getUser(item.operator_id)?.name || '-' },
        { label: 'Tipe', render: (item) => reportTypeLabel(item.report_type) },
        { label: 'Disubmit', render: (item) => formatDateTime(item.submitted_at) },
        { label: 'Status', render: (item) => <Badge status={item.status} /> },
      ],
    },
  }), []);

  const selectedDetail = activeStat ? statDetails[activeStat] : null;

  const distStatusData = useMemo(() => {
    const counts = { open: 0, on_progress: 0, waiting_validation: 0, resolved: 0, closed: 0 };
    disturbances.forEach((item) => { counts[item.status] += 1; });
    return {
      labels: ['Open', 'Progress', 'Validasi', 'Resolved', 'Closed'],
      values: [counts.open, counts.on_progress, counts.waiting_validation, counts.resolved, counts.closed],
      colors: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#94a3b8'],
    };
  }, []);

  const disturbanceRegionData = useMemo(() => ({
    labels: ['Utara', 'Selatan', 'Timur', 'Barat', 'Sidoarjo', 'Gresik'],
    data: REGIONS_SHORT.map((_, index) => disturbances.filter((item) => item.region_id === index).length),
  }), []);

  const disturbanceTypeData = useMemo(() => {
    const order = Object.keys(DIST_TYPES);
    const palette = ['#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#64748b'];
    return {
      labels: order.map((type) => DIST_TYPES[type]),
      values: order.map((type) => disturbances.filter((item) => item.type === type).length),
      colors: palette.slice(0, order.length),
    };
  }, []);

  const assetStatusData = useMemo(() => {
    const statusOrder = ['active', 'monitoring', 'maintenance', 'inactive'];
    return {
      labels: statusOrder.map((status) => STATUS_LABELS[status]),
      data: statusOrder.map((status) => assets.filter((item) => item.status === status).length),
    };
  }, []);

  const assetTypeData = useMemo(() => ({
    labels: ASSET_TYPES,
    values: ASSET_TYPES.map((type) => assets.filter((item) => item.asset_type === type).length),
    colors: ['#2563eb', '#0ea5e9', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#64748b'],
  }), []);

  const trendLabels = monthWindow.map((month) => month.label);
  const trendDatasets = useMemo(() => [
    {
      label: 'Gangguan Dilaporkan',
      data: monthWindow.map((month) => countByMonth(disturbances, 'reported_at', month.key, (item) => !['resolved', 'closed'].includes(item.status))),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.1)',
    },
    {
      label: 'Gangguan Selesai',
      data: monthWindow.map((month) => countByMonth(disturbances, 'resolved_at', month.key, (item) => Boolean(item.resolved_at))),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
    },
  ], [monthWindow]);

  const reportTrendDatasets = useMemo(() => [
    {
      label: 'Masuk',
      data: monthWindow.map((month) => countByMonth(fieldReports, 'submitted_at', month.key)),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.12)',
    },
    {
      label: 'Disetujui',
      data: monthWindow.map((month) => countByMonth(fieldReports, 'submitted_at', month.key, (item) => item.status === 'approved')),
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.12)',
    },
  ], [monthWindow]);

  const recentDisturbances = disturbances
    .filter((item) => !['resolved', 'closed'].includes(item.status))
    .sort((a, b) => new Date(b.reported_at) - new Date(a.reported_at))
    .slice(0, 5);

  const recentReports = fieldReports
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    .slice(0, 5);

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <button type="button" onClick={() => setActiveStat('assets')} className="text-left">
          <StatCard label="Total Aset" value={stats.totalAssets} icon={Network} iconBg="bg-brand-50 text-brand-600" />
        </button>
        <button type="button" onClick={() => setActiveStat('activeDisturbances')} className="text-left">
          <StatCard
            label="Gangguan Aktif"
            value={stats.activeDisturbances}
            icon={AlertTriangle}
            iconBg="bg-red-50 text-danger"
            valueColor={stats.activeDisturbances > 0 ? 'text-danger' : 'text-slate-900'}
          />
        </button>
        <button type="button" onClick={() => setActiveStat('criticalDisturbances')} className="text-left">
          <StatCard
            label="Kritis (>=4)"
            value={stats.criticalDisturbances}
            icon={ShieldAlert}
            iconBg="bg-orange-50 text-orange-600"
            valueColor={stats.criticalDisturbances > 0 ? 'text-orange-600' : 'text-slate-900'}
          />
        </button>
        <button type="button" onClick={() => setActiveStat('pendingReports')} className="text-left">
          <StatCard
            label="Laporan Pending"
            value={stats.pendingReports}
            icon={FileText}
            iconBg="bg-amber-50 text-warning"
            valueColor={stats.pendingReports > 0 ? 'text-warning' : 'text-slate-900'}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Tren Gangguan</h3>
              <p className="text-xs text-slate-400 mt-0.5">6 bulan terakhir</p>
            </div>
            <TrendingUp size={20} className="text-brand-500" />
          </div>
          <LineTrendChart labels={trendLabels} datasets={trendDatasets} height={260} />
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Status Gangguan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribusi saat ini</p>
            </div>
          </div>
          <StatusDonutChart
            labels={distStatusData.labels}
            data={distStatusData.values}
            colors={distStatusData.colors}
            height={180}
          />
          <div className="mt-4 grid grid-cols-2 gap-1">
            {distStatusData.labels.map((label, index) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: distStatusData.colors[index] }} />
                <span className="text-slate-500">{label}:</span>
                <span className="font-bold text-slate-700">{distStatusData.values[index]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Sebaran Gangguan per Wilayah</h3>
              <p className="text-xs text-slate-400 mt-0.5">Sebaran gangguan yang tercatat per area</p>
            </div>
            <BarChart3 size={20} className="text-brand-500" />
          </div>
          <StatusBarChart labels={disturbanceRegionData.labels} data={disturbanceRegionData.data} height={250} />
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Laporan Masuk vs Disetujui</h3>
              <p className="text-xs text-slate-400 mt-0.5">Alur verifikasi operasional</p>
            </div>
            <TrendingUp size={20} className="text-brand-500" />
          </div>
          <LineTrendChart labels={trendLabels} datasets={reportTrendDatasets} height={250} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Komposisi Gangguan per Jenis</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribusi jenis gangguan yang paling sering muncul</p>
            </div>
            <AlertTriangle size={20} className="text-brand-500" />
          </div>
          <StatusDonutChart
            labels={disturbanceTypeData.labels}
            data={disturbanceTypeData.values}
            colors={disturbanceTypeData.colors}
            height={240}
          />
          <div className="mt-4 grid grid-cols-2 gap-2">
            {disturbanceTypeData.labels.map((label, index) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: disturbanceTypeData.colors[index] }} />
                  <span className="text-xs font-semibold text-slate-700 truncate">{label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{disturbanceTypeData.values[index]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Status Aset</h3>
              <p className="text-xs text-slate-400 mt-0.5">Kesehatan inventaris jaringan</p>
            </div>
            <Network size={20} className="text-brand-500" />
          </div>
          <StatusBarChart labels={assetStatusData.labels} data={assetStatusData.data} height={220} />
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Komposisi Jenis Aset</h3>
              <p className="text-xs text-slate-400 mt-0.5">Distribusi tipe aset yang dimonitor</p>
            </div>
            <BarChart3 size={20} className="text-brand-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 items-center">
            <StatusDonutChart
              labels={assetTypeData.labels}
              data={assetTypeData.values}
              colors={assetTypeData.colors}
              height={240}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {assetTypeData.labels.map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: assetTypeData.colors[index] }} />
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{assetTypeData.values[index]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card noPadding>
          <div className="px-6 pt-6 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Gangguan Terbaru</h3>
              <p className="text-xs text-slate-400">Gangguan aktif terkini</p>
            </div>
            <button onClick={() => navigate('/disturbances')} className="text-brand-600 text-xs font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">No.</th>
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Durasi</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {recentDisturbances.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-brand-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/disturbances/${item.id}`)}
                  >
                    <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-3 font-bold text-brand-700">{item.disturbance_code}</td>
                    <td className="px-6 py-3 text-slate-600">{DIST_TYPES[item.type]}</td>
                    <td className="px-6 py-3"><Badge status={item.status} /></td>
                    <td className="px-6 py-3 text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {calcDuration(item.reported_at, item.resolved_at)}
                    </td>
                  </tr>
                ))}
                {recentDisturbances.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Tidak ada gangguan aktif</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card noPadding>
          <div className="px-6 pt-6 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-slate-800">Laporan Terbaru</h3>
              <p className="text-xs text-slate-400">Semua laporan masuk</p>
            </div>
            <button onClick={() => navigate('/reports')} className="text-brand-600 text-xs font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">No.</th>
                  <th className="px-6 py-3">Kode</th>
                  <th className="px-6 py-3">Operator</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {recentReports.map((report, index) => {
                  const operator = getUser(report.operator_id);
                  return (
                    <tr key={report.id} className="hover:bg-brand-50 transition-colors">
                      <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                      <td className="px-6 py-3 font-bold text-brand-700">{report.report_code}</td>
                      <td className="px-6 py-3 text-slate-600">{operator?.name || '-'}</td>
                      <td className="px-6 py-3"><Badge status={report.status} /></td>
                      <td className="px-6 py-3 text-slate-500 text-xs">{formatDateTime(report.submitted_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={!!selectedDetail} onClose={() => setActiveStat(null)} title={selectedDetail?.title || 'Detail Statistik'} maxWidth="max-w-5xl">
        {selectedDetail && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">{selectedDetail.description}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveStat(null);
                  navigate(selectedDetail.path);
                }}
              >
                {selectedDetail.cta}
              </Button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-center whitespace-nowrap">No.</th>
                    {selectedDetail.columns.map((column) => (
                      <th key={column.label} className="px-4 py-3 text-center whitespace-nowrap">{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {selectedDetail.rows.map((row, index) => (
                    <tr key={`${selectedDetail.title}-${row.id}`} className="hover:bg-brand-50">
                      <td className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">{index + 1}</td>
                      {selectedDetail.columns.map((column) => (
                        <td key={column.label} className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {selectedDetail.rows.length === 0 && (
                    <tr>
                      <td colSpan={selectedDetail.columns.length + 1} className="px-4 py-10 text-center text-slate-400">
                        Tidak ada data untuk statistik ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const REGIONS_SHORT = ['Utara', 'Selatan', 'Timur', 'Barat', 'Sidoarjo', 'Gresik'];

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
