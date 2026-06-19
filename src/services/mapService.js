import { assets, disturbances, pruningTasks, REGIONS } from './api';

const CABLE_ASSET_TYPES = ['FO Cable', 'Joint Closure'];

export function getMapAssets(filters = {}) {
  return assets.filter((a) => {
    if (filters.region_id !== undefined && filters.region_id !== 'All' && a.region_id !== parseInt(filters.region_id)) return false;
    if (filters.status && filters.status !== 'All' && a.status !== filters.status) return false;
    if (filters.asset_type && filters.asset_type !== 'All' && a.asset_type !== filters.asset_type) return false;
    return true;
  });
}

export function getCableMapAssets(filters = {}) {
  return getMapAssets(filters).filter((asset) => CABLE_ASSET_TYPES.includes(asset.asset_type));
}

export function getMapDisturbances(filters = {}) {
  return disturbances
    .filter((d) => !['resolved', 'closed'].includes(d.status))
    .filter((d) => {
      if (filters.region_id !== undefined && filters.region_id !== 'All' && d.region_id !== parseInt(filters.region_id)) return false;
      return true;
    });
}

export function getMapPruningTasks(filters = {}) {
  return pruningTasks
    .filter((task) => ['assigned', 'on_progress', 'waiting_validation'].includes(task.status))
    .filter((task) => {
      if (filters.region_id !== undefined && filters.region_id !== 'All' && task.region_id !== parseInt(filters.region_id)) return false;
      return true;
    });
}

export function getMapStats() {
  const cableAssets = assets.filter((asset) => CABLE_ASSET_TYPES.includes(asset.asset_type));
  return {
    totalAssets: assets.length,
    activeDisturbances: disturbances.filter((d) => !['resolved', 'closed'].includes(d.status)).length,
    cableAssets: cableAssets.length,
    foCables: cableAssets.filter((asset) => asset.asset_type === 'FO Cable').length,
    jointClosures: cableAssets.filter((asset) => asset.asset_type === 'Joint Closure').length,
  };
}
