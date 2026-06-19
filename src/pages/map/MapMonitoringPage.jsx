import React, { useEffect, useMemo, useRef, useState } from 'react';
import MonitoringMap from '../../components/map/MonitoringMap';
import MapLegend from '../../components/map/MapLegend';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import StatDetailModal from '../../components/ui/StatDetailModal';
import { pruningTasks } from '../../services/api';
import { REGIONS, DIST_TYPES, getAsset } from '../../services/api';
import { getCableMapAssets, getMapAssets, getMapDisturbances, getMapPruningTasks, getMapStats } from '../../services/mapService';
import { AlertTriangle, Cable, Expand, Filter, MapPinned, Minimize, Network, RotateCcw, Trees } from 'lucide-react';
import { findRegionFeature, getRegionLabel as getGeoRegionLabel, getRegionValue } from '../../utils/regionGeojson';

const mapModes = [
  { key: 'monitoring', label: 'Monitoring Gangguan', icon: AlertTriangle },
  { key: 'cable', label: 'Aset Kabel', icon: Cable },
];

export default function MapMonitoringPage() {
  const [mapMode, setMapMode] = useState('monitoring');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cableTypeFilter, setCableTypeFilter] = useState('All');
  const [komdigiFiberData, setKomdigiFiberData] = useState(null);
  const [regionGeoJson, setRegionGeoJson] = useState(null);
  const [komdigiLoadStatus, setKomdigiLoadStatus] = useState('loading');
  const [regionLoadStatus, setRegionLoadStatus] = useState('loading');
  const [activeMetric, setActiveMetric] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState({
    komdigi: true,
    disturbances: true,
  });
  const mapShellRef = useRef(null);

  const regionFeatures = useMemo(() => regionGeoJson?.features || [], [regionGeoJson]);

  const matchesRegionFilter = (item) => {
    if (regionFilter === 'All') return true;
    const feature = findRegionFeature(regionFeatures, item.latitude, item.longitude);
    return feature ? getRegionValue(feature) === regionFilter : false;
  };

  const getRegionName = (item) => {
    const feature = findRegionFeature(regionFeatures, item.latitude, item.longitude);
    return feature ? getGeoRegionLabel(feature) : REGIONS[item.region_id] || '-';
  };

  const filteredAssets = useMemo(
    () => getMapAssets({ status: statusFilter }).filter(matchesRegionFilter),
    [regionFilter, regionFeatures, statusFilter]
  );

  const filteredDisturbances = useMemo(
    () => getMapDisturbances({}).filter(matchesRegionFilter),
    [regionFilter, regionFeatures]
  );

  const cableAssets = useMemo(
    () => getCableMapAssets({ status: statusFilter, asset_type: cableTypeFilter }).filter(matchesRegionFilter),
    [cableTypeFilter, regionFilter, regionFeatures, statusFilter]
  );

  const filteredPruningTasks = useMemo(
    () => getMapPruningTasks({}).filter(matchesRegionFilter),
    [regionFilter, regionFeatures]
  );

  const regionOptions = useMemo(() => [
    { value: 'All', label: 'Semua Wilayah' },
    ...regionFeatures.map((feature) => ({ value: getRegionValue(feature), label: getGeoRegionLabel(feature) })),
  ], [regionFeatures]);

  const statusOptions = [
    { value: 'All', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Nonaktif' },
  ];

  const cableTypeOptions = [
    { value: 'All', label: 'Semua Kabel' },
    { value: 'FO Cable', label: 'FO Cable' },
    { value: 'Joint Closure', label: 'Joint Closure' },
  ];

  const stats = getMapStats();
  const activeMode = mapModes.find((mode) => mode.key === mapMode);
  const activeAssetRows = mapMode === 'monitoring' ? filteredAssets : cableAssets;
  const metricDetails = useMemo(() => {
    const assetColumns = [
      { label: 'Kode', render: (asset) => asset.asset_code },
      { label: 'Nama', render: (asset) => asset.asset_name },
      { label: 'Tipe', render: (asset) => asset.asset_type },
      { label: 'Wilayah', render: (asset) => getRegionName(asset) },
      { label: 'Status', render: (asset) => <Badge status={asset.status} /> },
    ];
    const disturbanceColumns = [
      { label: 'Kode', render: (item) => item.disturbance_code },
      { label: 'Tipe', render: (item) => DIST_TYPES[item.type] },
      { label: 'Aset', render: (item) => getAsset(item.asset_id)?.asset_code || '-' },
      { label: 'Wilayah', render: (item) => getRegionName(item) },
      { label: 'Status', render: (item) => <Badge status={item.status} /> },
    ];
    const komdigiRows = layerVisibility.komdigi
      ? (komdigiFiberData?.features || []).map((feature, index) => ({
          id: `komdigi-${index}`,
          name: feature.properties?.name || feature.properties?.Nama || `Jalur Komdigi ${index + 1}`,
          type: feature.geometry?.type || '-',
          source: 'Komdigi',
        }))
      : [];

    return {
      mode: {
        title: 'Mode Peta',
        description: 'Mode tampilan peta yang sedang aktif.',
        rows: [{ id: mapMode, label: activeMode?.label || '-', key: mapMode }],
        columns: [
          { label: 'Mode', render: (item) => item.label },
          { label: 'Kode', render: (item) => item.key },
        ],
      },
      assets: {
        title: 'Aset Tampil',
        description: 'Aset yang sedang masuk filter dan tampil di peta.',
        rows: activeAssetRows,
        columns: assetColumns,
      },
      disturbances: {
        title: 'Gangguan Aktif',
        description: 'Gangguan aktif yang sedang tampil di peta.',
        rows: filteredDisturbances,
        columns: disturbanceColumns,
      },
      pruning: {
        title: 'Titik Pruning Aktif',
        description: 'Tugas pruning aktif yang sedang tampil di peta.',
        rows: filteredPruningTasks,
        columns: [
          { label: 'Kode', render: (task) => task.task_code },
          { label: 'Judul', render: (task) => task.title },
          { label: 'Wilayah', render: (task) => getRegionName(task) },
          { label: 'Status', render: (task) => <Badge status={task.status} /> },
        ],
      },
      cables: {
        title: 'Data Kabel',
        description: 'Aset kabel internal dan layer Komdigi yang sedang ditampilkan.',
        rows: [...cableAssets.map((asset) => ({ ...asset, source: 'Aset Internal' })), ...komdigiRows],
        columns: [
          { label: 'Nama/Kode', render: (item) => item.asset_code || item.name },
          { label: 'Tipe', render: (item) => item.asset_type || item.type },
          { label: 'Sumber', render: (item) => item.source },
          { label: 'Wilayah', render: (item) => item.latitude === undefined ? '-' : getRegionName(item) },
        ],
      },
    };
  }, [activeAssetRows, activeMode, cableAssets, filteredAssets, filteredDisturbances, filteredPruningTasks, komdigiFiberData, layerVisibility.komdigi, mapMode, regionFeatures]);
  const selectedMetric = activeMetric ? metricDetails[activeMetric] : null;

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/data/komdigi-fiber-surabaya.geojson'),
      fetch('/data/regions-7-mainland.geojson'),
    ])
      .then(async ([fiberResponse, regionResponse]) => {
        if (!fiberResponse.ok) throw new Error('Data jaringan fiber lokal tidak tersedia.');
        const fiberData = await fiberResponse.json();
        let regionData = null;
        if (regionResponse.ok) {
          regionData = await regionResponse.json();
        }
        return { fiberData, regionData };
      })
      .then(({ fiberData, regionData }) => {
        if (!isMounted) return;
        setKomdigiFiberData(fiberData);
        setKomdigiLoadStatus('ready');
        if (regionData) {
          setRegionGeoJson(regionData);
          setRegionLoadStatus('ready');
        } else {
          setRegionLoadStatus('error');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setKomdigiLoadStatus('error');
        setRegionLoadStatus('error');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === mapShellRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!mapShellRef.current) return;

    if (document.fullscreenElement === mapShellRef.current) {
      await document.exitFullscreen?.();
      return;
    }

    await mapShellRef.current.requestFullscreen?.();
  };

  const toggleLayer = (key) => {
    setLayerVisibility((current) => ({ ...current, [key]: !current[key] }));
  };

  const resetFilters = () => {
    setRegionFilter('All');
    setStatusFilter('All');
    setCableTypeFilter('All');
    setLayerVisibility({
      komdigi: true,
      disturbances: true,
    });
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="px-4 py-1.5 flex flex-col gap-1.5">
          <div className="flex flex-col gap-1 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {mapModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = mapMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setMapMode(mode.key)}
                    className={`inline-flex h-[26px] items-center gap-1 rounded-lg border px-2 text-[10px] font-bold transition-colors ${
                      isActive
                        ? mode.key === 'monitoring'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={15} />
                    {mode.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-[30px] items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[10px] font-bold text-slate-700 transition hover:bg-white"
            >
              <RotateCcw size={12} />
              Reset Filter
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2">
            <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <Filter size={11} />
              Filter Peta
            </div>
            <div className="flex flex-wrap items-end gap-1.5">
              <Select
                label="Wilayah"
                options={regionOptions}
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                className="w-[150px]"
              />
              <Select
                label={mapMode === 'cable' ? 'Status Aset Kabel' : 'Status Aset'}
                options={statusOptions}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-[150px]"
              />
              {mapMode === 'cable' && (
                <Select
                  label="Jenis Aset Kabel"
                  options={cableTypeOptions}
                  value={cableTypeFilter}
                  onChange={(event) => setCableTypeFilter(event.target.value)}
                  className="w-[150px]"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[10px]">
            <MapMetric icon={activeMode?.icon || MapPinned} label="Mode" value={activeMode?.label} danger={mapMode === 'monitoring'} onClick={() => setActiveMetric('mode')} />
            <MapMetric icon={Network} label="Aset Tampil" value={activeAssetRows.length} onClick={() => setActiveMetric('assets')} />
            <MapMetric icon={AlertTriangle} label="Gangguan Aktif" value={filteredDisturbances.length} danger onClick={() => setActiveMetric('disturbances')} />
            <MapMetric icon={Trees} label="Pruning Aktif" value={filteredPruningTasks.length} onClick={() => setActiveMetric('pruning')} />
            <MapMetric icon={Cable} label="Layer Kabel" value={layerVisibility.komdigi ? `${komdigiFiberData?.features?.length || 0} Komdigi + ${stats.cableAssets} aset` : `${stats.cableAssets} aset`} onClick={() => setActiveMetric('cables')} />
          </div>
        </div>
      </div>

      <div ref={mapShellRef} className="relative flex-1 min-h-0 bg-slate-950">
        <MonitoringMap
          mode={mapMode}
          assets={filteredAssets}
          disturbances={filteredDisturbances}
          cableAssets={cableAssets}
          pruningTasks={filteredPruningTasks}
          layerVisibility={layerVisibility}
          komdigiFiberData={komdigiFiberData}
          regionFeatures={regionFeatures}
          getRegionLabel={getGeoRegionLabel}
        />
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-6 top-6 z-[1002] inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white/96 text-slate-700 shadow-xl backdrop-blur-md transition hover:bg-white"
          title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen map'}
        >
          {isFullscreen ? <Minimize size={18} /> : <Expand size={18} />}
        </button>
        <MapLegend layerVisibility={layerVisibility} onToggle={toggleLayer} />
        {layerVisibility.komdigi && (
          <div className="absolute bottom-6 left-6 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-2 text-xs font-semibold text-slate-600 shadow-xl backdrop-blur-md">
            {komdigiLoadStatus === 'ready' && 'Layer GeoJSON aktif: Komdigi'}
            {komdigiLoadStatus === 'loading' && 'Memuat layer GeoJSON...'}
            {komdigiLoadStatus === 'error' && 'Layer GeoJSON belum tersedia'}
          </div>
        )}
      </div>
      <StatDetailModal detail={selectedMetric} onClose={() => setActiveMetric(null)} />
    </div>
  );
}

function MapMetric({ icon: Icon, label, value, danger = false, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex h-[26px] items-center gap-1 rounded-lg border px-2 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
      danger ? 'border-red-200 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-700'
    }`}>
      <Icon size={12} />
      <span className="font-bold uppercase tracking-[0.10em]">{label}</span>
      <span className="font-extrabold text-slate-900">{value}</span>
    </button>
  );
}
