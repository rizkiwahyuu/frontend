import { assets, getNextId, REGIONS, getAsset, saveStore, addActivity, persistCreate, persistDelete, persistUpdate } from './api';

export function getAssets(filters = {}) {
  return assets.filter((a) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!`${a.asset_code} ${a.asset_name} ${a.address} ${REGIONS[a.region_id]}`.toLowerCase().includes(q)) return false;
    }
    if (filters.region_id !== undefined && filters.region_id !== 'All' && a.region_id !== parseInt(filters.region_id)) return false;
    if (filters.asset_type && filters.asset_type !== 'All' && a.asset_type !== filters.asset_type) return false;
    if (filters.status && filters.status !== 'All' && a.status !== filters.status) return false;
    return true;
  });
}

export function getAssetById(id) {
  return getAsset(parseInt(id));
}

export function createAsset(data) {
  const newAsset = { id: getNextId('assets'), ...data };
  assets.unshift(newAsset);
  addActivity(data.created_by, `Menambah aset ${newAsset.asset_code}`, 'assets');
  saveStore();
  persistCreate('assets', newAsset).catch(console.error);
  return newAsset;
}

export function updateAsset(id, data) {
  const idx = assets.findIndex((a) => a.id === parseInt(id));
  if (idx >= 0) {
    assets[idx] = { ...assets[idx], ...data };
    addActivity(data.updated_by, `Memperbarui aset ${assets[idx].asset_code}`, 'assets');
    saveStore();
    persistUpdate('assets', id, data).catch(console.error);
    return assets[idx];
  }
  return null;
}

export function deleteAsset(id) {
  const idx = assets.findIndex((a) => a.id === parseInt(id));
  if (idx >= 0) {
    const removed = assets.splice(idx, 1);
    addActivity(null, `Menghapus aset ${removed[0].asset_code}`, 'assets');
    saveStore();
    persistDelete('assets', id).catch(console.error);
    return removed[0];
  }
  return null;
}

export function exportAssetsCSV() {
  if (!assets.length) return null;
  const headers = Object.keys(assets[0]);
  let csv = headers.join(',') + '\n';
  assets.forEach((row) => {
    csv += headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',') + '\n';
  });
  return csv;
}
