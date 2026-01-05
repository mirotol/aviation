export interface NavPoint {
  ident: string;
  type: string;
  latitude: number;  // Matched to Java NavPoint
  longitude: number; // Matched to Java NavPoint
}

/**
 * Converts NavPoints to a GeoJSON FeatureCollection for MapLibre.
 */
export function pointsToGeoJSON(points: NavPoint[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude], // GeoJSON is [lon, lat]
      },
      properties: {
        ident: p.ident,
        type: p.type,
      },
    })),
  };
}
