export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * Converts geographic coordinates to a normalized Mercator projection.
 * Returns values where x/y are roughly in a 0-1 range for the visible area.
 */
export function toMercator(lat: number, lon: number): ScreenPoint {
  const x = (lon + 180) / 360;
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  return { x, y };
}

/**
 * Calculates the distance between two points in Nautical Miles (nm).
 */
export function getDistanceNM(p1: GeoPoint, p2: GeoPoint): number {
  const R = 3440.065; // Earth radius in Nautical Miles
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lon - p1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Projects a geographic point to screen coordinates relative to the aircraft (Ownship).
 * @param point The target point to project.
 * @param ownship The aircraft's current position.
 * @param rangeNM The current display range in nautical miles.
 * @param sizePx The size of the display in pixels.
 * @param trackDeg The current aircraft track/heading in degrees.
 */
export function projectToDisplay(
  point: GeoPoint,
  ownship: GeoPoint,
  rangeNM: number,
  sizePx: number,
  trackDeg: number
): ScreenPoint {
  const center = sizePx / 2;
  const scale = sizePx / (rangeNM * 2); // pixels per nautical mile

  // Simple approximation for small distances (lat/lon to NM)
  // 1 degree lat = 60nm. 1 degree lon = 60nm * cos(lat)
  const dLat = point.lat - ownship.lat;
  const dLon = point.lon - ownship.lon;

  const dy = dLat * 60;
  const dx = dLon * 60 * Math.cos((ownship.lat * Math.PI) / 180);

  // Convert to pixels
  let px = dx * scale;
  let py = -dy * scale; // Y is inverted in screen space

  // Rotate based on track (Track Up display)
  const angleRad = (trackDeg * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  const rotatedX = px * cosA - py * sinA;
  const rotatedY = px * sinA + py * cosA;

  return {
    x: center + rotatedX,
    y: center + rotatedY,
  };
}
