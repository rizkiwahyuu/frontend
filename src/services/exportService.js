import { activityLogs, assets, disturbances, fieldReports, pruningTasks, REGIONS, users } from './api';

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}

function flatReport(report) {
  const operator = users.find((u) => u.id === report.operator_id);
  return {
    ...report,
    operator: operator?.name || '',
    attachments: report.attachments?.length || 0,
  };
}

export function getExportSets() {
  return {
    assets: assets.map((asset) => ({ ...asset, region: REGIONS[asset.region_id] })),
    disturbances: disturbances.map((dist) => ({ ...dist, region: REGIONS[dist.region_id] })),
    pruningTasks: pruningTasks.map((task) => ({ ...task, region: REGIONS[task.region_id] })),
    fieldReports: fieldReports.map(flatReport),
    users: users.map(({ password, ...user }) => user),
    activityLogs,
  };
}

export function exportDataset(key) {
  const sets = getExportSets();
  return toCSV(sets[key] || []);
}

export function downloadCSV(filename, csv) {
  if (!csv) return false;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
