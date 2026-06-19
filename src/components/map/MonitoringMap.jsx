import React, { useEffect, useMemo } from 'react';
import { CircleMarker, GeoJSON, MapContainer, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { MARKER_COLORS } from '../../utils/statusColor';
import { DIST_TYPES, getAsset, getRegion, STATUS_LABELS } from '../../services/api';
import MarkerPopup from './MarkerPopup';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MonitoringMap({
  assets = [],
  disturbances = [],
  cableAssets = [],
  pruningTasks = [],
  center = [-7.28, 112.73],
  mode = 'monitoring',
  layerVisibility,
  komdigiFiberData = null,
}) {
  const cableLines = useMemo(() => buildCableLines(cableAssets), [cableAssets]);
  const showMonitoring = mode === 'monitoring';
  const showCable = mode === 'cable';

  return (
    <MapContainer center={center} zoom={12} className="w-full h-full" style={{ zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapUpdater center={center} />

      {layerVisibility.komdigi && komdigiFiberData && (
        <GeoJSON
          key={`komdigi-fiber-${komdigiFiberData.features?.length || 0}`}
          data={komdigiFiberData}
          style={() => ({
            color: '#0f766e',
            weight: 2.2,
            opacity: 0.82,
          })}
          onEachFeature={(feature, layer) => {
            const fid = feature.properties?.fid || feature.properties?.objectid || '-';
            layer.bindPopup(`
              <div style="font-family: Plus Jakarta Sans, sans-serif; min-width: 150px;">
                <p style="font-weight: 800; color: #0f766e; margin: 0 0 4px;">Jaringan Fiber Komdigi</p>
                <p style="font-size: 12px; color: #475569; margin: 0;">Feature ID: ${fid}</p>
                <p style="font-size: 11px; color: #64748b; margin: 6px 0 0;">Sumber data lokal: Satu Data Komdigi</p>
              </div>
            `);
          }}
        />
      )}

      {layerVisibility.assets && showMonitoring && assets.map((asset) => (
        <CircleMarker
          key={`asset-${asset.id}`}
          center={[asset.latitude, asset.longitude]}
          radius={6}
          pathOptions={{ color: '#fff', weight: 2, fillColor: MARKER_COLORS[asset.status] || '#94a3b8', fillOpacity: 1 }}
        >
          <Popup>
            <MarkerPopup
              title={asset.asset_code}
              subtitle={asset.asset_name}
              details={[
                { label: 'Tipe', value: asset.asset_type },
                { label: 'Status', value: STATUS_LABELS[asset.status] },
                { label: 'Wilayah', value: getRegion(asset.region_id) },
              ]}
            />
          </Popup>
        </CircleMarker>
      ))}

      {layerVisibility.disturbances && disturbances.map((disturbance) => {
        const asset = disturbance.asset_id ? getAsset(disturbance.asset_id) : null;
        return (
          <CircleMarker
            key={`dist-${disturbance.id}`}
            center={[disturbance.latitude, disturbance.longitude]}
            radius={9}
            pathOptions={{ color: '#fff', weight: 2, fillColor: MARKER_COLORS[disturbance.status] || '#ef4444', fillOpacity: 1 }}
          >
            <Popup>
              <MarkerPopup
                title={disturbance.disturbance_code}
                subtitle={DIST_TYPES[disturbance.type]}
                isAlert
                details={[
                  { label: 'Severity', value: `${disturbance.severity}/5` },
                  { label: 'Status', value: STATUS_LABELS[disturbance.status] },
                  { label: 'Wilayah', value: getRegion(disturbance.region_id) },
                  { label: 'Aset', value: asset?.asset_code || '-' },
                ]}
              />
            </Popup>
          </CircleMarker>
        );
      })}

      {layerVisibility.assets && showCable && cableLines.map((line) => (
        <Polyline
          key={`cable-line-${line.regionId}`}
          positions={line.positions}
          pathOptions={{ color: line.color, weight: 5, opacity: 0.78, dashArray: line.dashArray }}
        >
          <Popup>
            <MarkerPopup
              title={`Jalur Kabel ${getRegion(line.regionId)}`}
              subtitle={`${line.count} titik aset kabel`}
              details={[
                { label: 'Wilayah', value: getRegion(line.regionId) },
                { label: 'Tipe Jalur', value: line.types },
              ]}
            />
          </Popup>
        </Polyline>
      ))}

      {layerVisibility.assets && showCable && cableAssets.map((asset) => (
        <CircleMarker
          key={`cable-${asset.id}`}
          center={[asset.latitude, asset.longitude]}
          radius={8}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: asset.asset_type === 'FO Cable' ? '#8b5cf6' : '#0ea5e9',
            fillOpacity: 1,
          }}
        >
          <Popup>
            <MarkerPopup
              title={asset.asset_code}
              subtitle={asset.asset_name}
              details={[
                { label: 'Tipe', value: asset.asset_type },
                { label: 'Status', value: STATUS_LABELS[asset.status] },
                { label: 'Wilayah', value: getRegion(asset.region_id) },
                { label: 'Koordinat', value: `${asset.latitude}, ${asset.longitude}` },
              ]}
            />
          </Popup>
        </CircleMarker>
      ))}

      {layerVisibility.pruning && pruningTasks.map((task) => (
        <CircleMarker
          key={`pruning-${task.id}`}
          center={[task.latitude, task.longitude]}
          radius={7}
          pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#8b5cf6', fillOpacity: 0.95 }}
        >
          <Popup>
            <MarkerPopup
              title={task.task_code}
              subtitle={task.title}
              details={[
                { label: 'Status', value: STATUS_LABELS[task.status] },
                { label: 'Wilayah', value: getRegion(task.region_id) },
                { label: 'Aset', value: getAsset(task.asset_id)?.asset_code || '-' },
              ]}
            />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function buildCableLines(cableAssets) {
  const grouped = cableAssets.reduce((acc, asset) => {
    if (!acc[asset.region_id]) acc[asset.region_id] = [];
    acc[asset.region_id].push(asset);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([regionId, items], index) => {
      const sorted = [...items].sort((a, b) => a.asset_code.localeCompare(b.asset_code));
      return {
        regionId: parseInt(regionId),
        count: sorted.length,
        positions: sorted.map((asset) => [asset.latitude, asset.longitude]),
        color: index % 2 === 0 ? '#8b5cf6' : '#0ea5e9',
        dashArray: sorted.some((asset) => asset.asset_type === 'Joint Closure') ? '8 8' : null,
        types: [...new Set(sorted.map((asset) => asset.asset_type))].join(', '),
      };
    })
    .filter((line) => line.positions.length > 0);
}
