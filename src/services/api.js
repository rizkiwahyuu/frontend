// =============================================
// Infranexia FiberOps - Laravel API bridge
// =============================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

export const REGIONS = [
  'Surabaya Utara',
  'Surabaya Selatan',
  'Surabaya Timur',
  'Surabaya Barat',
  'Sidoarjo',
  'Gresik',
];

export const DIST_TYPES = {
  backbone_down: 'Backbone Down',
  cable_cut: 'Kabel Putus',
  device_issue: 'Gangguan Perangkat',
  environment: 'Gangguan Lingkungan',
  high_loss: 'Redaman Tinggi',
  link_flap: 'Link Flapping',
  odp_damage: 'ODP Rusak',
  odc_issue: 'ODC Bermasalah',
  power_issue: 'Gangguan Daya',
  other: 'Lainnya',
};

export const ASSET_TYPES = ['ODP', 'ODC', 'Tiang', 'FO Cable', 'Joint Closure'];

export const PRIORITY_LABELS = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
};

export const STATUS_LABELS = {
  active: 'Aktif',
  monitoring: 'Monitoring',
  maintenance: 'Maintenance',
  damaged: 'Rusak',
  inactive: 'Nonaktif',
  open: 'Open',
  on_progress: 'On Progress',
  waiting_validation: 'Menunggu Validasi',
  resolved: 'Resolved',
  closed: 'Closed',
  draft: 'Draft',
  assigned: 'Assigned',
  completed: 'Completed',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const users = [];
export const assets = [];
export const disturbances = [];
export const pruningTasks = [];
export const fieldReports = [];
export const activityLogs = [];

const collections = {
  users,
  assets,
  disturbances,
  pruningTasks,
  fieldReports,
  activityLogs,
};

const endpoints = {
  users: 'users',
  assets: 'assets',
  disturbances: 'disturbances',
  pruningTasks: 'pruning-tasks',
  fieldReports: 'field-reports',
  activityLogs: 'activity-logs',
};

function normalizeRegionId(value) {
  if (value === null || value === undefined || value === '') return value;

  const regionId = Number(value);

  if (Number.isNaN(regionId)) return value;

  // Data CSV terbaru memakai region_id 6 untuk titik Gresik tambahan.
  // Frontend memakai indeks 0..5, jadi 6 dinormalisasi ke Gresik.
  if (regionId === 6) return 5;

  return regionId;
}

function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return record;
  return {
    ...record,
    id: Number(record.id),
    region_id: normalizeRegionId(record.region_id),
    asset_id: record.asset_id === null || record.asset_id === undefined ? record.asset_id : Number(record.asset_id),
    task_id: record.task_id === null || record.task_id === undefined ? record.task_id : Number(record.task_id),
    disturbance_id: record.disturbance_id === null || record.disturbance_id === undefined ? record.disturbance_id : Number(record.disturbance_id),
    operator_id: record.operator_id === null || record.operator_id === undefined ? record.operator_id : Number(record.operator_id),
    assigned_to: record.assigned_to === null || record.assigned_to === undefined ? record.assigned_to : Number(record.assigned_to),
    created_by: record.created_by === null || record.created_by === undefined ? record.created_by : Number(record.created_by),
    user_id: record.user_id === null || record.user_id === undefined ? record.user_id : Number(record.user_id),
    latitude: record.latitude === null || record.latitude === undefined ? record.latitude : Number(record.latitude),
    longitude: record.longitude === null || record.longitude === undefined ? record.longitude : Number(record.longitude),
    severity: record.severity === null || record.severity === undefined ? record.severity : Number(record.severity),
  };
}

function replaceCollection(target, data) {
  target.splice(0, target.length, ...(Array.isArray(data) ? data.map(normalizeRecord) : []));
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}/${path.replace(/^\/+/, '')}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || Object.values(payload?.errors || {})?.flat()?.[0] || 'Request API gagal.';
    throw new Error(message);
  }

  return payload;
}

export async function loadApiStore() {
  const [userRows, assetRows, disturbanceRows, taskRows, reportRows, activityRows] = await Promise.all([
    apiRequest(endpoints.users),
    apiRequest(endpoints.assets),
    apiRequest(endpoints.disturbances),
    apiRequest(endpoints.pruningTasks),
    apiRequest(endpoints.fieldReports),
    apiRequest(endpoints.activityLogs),
  ]);

  replaceCollection(users, userRows);
  replaceCollection(assets, assetRows);
  replaceCollection(disturbances, disturbanceRows);
  replaceCollection(pruningTasks, taskRows);
  replaceCollection(fieldReports, reportRows);
  replaceCollection(activityLogs, activityRows);
}

export function persistCreate(type, data, onSynced) {
  return apiRequest(endpoints[type], {
    method: 'POST',
    body: JSON.stringify(data),
  }).then((created) => {
    const normalized = normalizeRecord(created);
    const collection = collections[type];
    const idx = collection.findIndex((item) => item.id === data.id);
    if (idx >= 0) collection[idx] = normalized;
    onSynced?.(normalized);
    return normalized;
  });
}

export function persistUpdate(type, id, data, onSynced) {
  return apiRequest(`${endpoints[type]}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then((updated) => {
    const normalized = normalizeRecord(updated);
    const collection = collections[type];
    const idx = collection.findIndex((item) => item.id === Number(id));
    if (idx >= 0) collection[idx] = normalized;
    onSynced?.(normalized);
    return normalized;
  });
}

export function persistDelete(type, id) {
  return apiRequest(`${endpoints[type]}/${id}`, { method: 'DELETE' });
}

export function nowStamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 16);
}

export function saveStore() {
  // Kept for old service compatibility. Persistence now happens through Laravel API.
}

export function resetStore() {
  return loadApiStore();
}

export function getNextId(type) {
  const collection = collections[type] || [];
  return Math.max(0, ...collection.map((item) => Number(item.id) || 0)) + 1;
}

export function addActivity(userId, action, module = 'system') {
  const log = {
    id: getNextId('activityLogs'),
    user_id: userId || null,
    action,
    module,
    created_at: nowStamp(),
    updated_at: nowStamp(),
  };
  activityLogs.unshift(log);
  persistCreate('activityLogs', log).catch(console.error);
  return log;
}

export const getUser = (id) => users.find((u) => u.id === Number(id));
export const getAsset = (id) => assets.find((a) => a.id === Number(id));
export const getPruningTask = (id) => pruningTasks.find((t) => t.id === Number(id));
export const getRegion = (id) => REGIONS[normalizeRegionId(id)] ?? '-';
