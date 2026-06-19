export function getRegionLabel(feature) {
  return feature?.properties?.region_name || feature?.properties?.area_name || feature?.properties?.name || '-';
}

export function getRegionValue(feature) {
  return feature?.properties?.region_code || String(feature?.properties?.id || '');
}

export function featureContainsPoint(feature, latitude, longitude) {
  if (!feature || latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }

  const geometry = feature.geometry || {};

  if (geometry.type === 'Polygon') {
    return polygonContainsPoint(geometry.coordinates, latitude, longitude);
  }

  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContainsPoint(polygon, latitude, longitude));
  }

  return false;
}

export function findRegionFeature(features, latitude, longitude) {
  return (features || []).find((feature) => featureContainsPoint(feature, latitude, longitude)) || null;
}

function polygonContainsPoint(polygonCoordinates, latitude, longitude) {
  if (!Array.isArray(polygonCoordinates) || polygonCoordinates.length === 0) return false;

  const [outerRing, ...holes] = polygonCoordinates;
  const point = [longitude, latitude];

  if (!ringContainsPoint(outerRing, point)) return false;

  return !holes.some((hole) => ringContainsPoint(hole, point));
}

function ringContainsPoint(ring, point) {
  if (!Array.isArray(ring) || ring.length < 3) return false;

  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]);
    const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]);
    const yj = Number(ring[j][1]);

    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
}
