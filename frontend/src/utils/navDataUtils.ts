export interface NavPoint {
  ident: string;
  type: string;
  latitude: number; // Matched to Java NavPoint
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

export interface FlightPlan {
  activeLegIndex: number;
  waypoints: NavPoint[];
}

export type FlightPlanSegmentRole =
  | 'route'
  | 'pastLeg'
  | 'activeLeg'
  | 'futureLeg'
  | 'directTo'
  | 'discontinuity'
  | 'missedApproach';

/**
 * Converts a FlightPlan and current aircraft position into a GeoJSON FeatureCollection
 * with past legs, active leg, and future legs.
 */
export function flightPlanToGeoJSON(
  fpl: FlightPlan,
  aircraftPos: { latitude: number; longitude: number } | null
): GeoJSON.FeatureCollection {
  const { waypoints, activeLegIndex } = fpl;

  if (!waypoints || waypoints.length < 2) {
    return { type: 'FeatureCollection', features: [] };
  }

  const features: GeoJSON.Feature[] = [];

  // Past Legs: WP0 → WP(active-1)
  if (activeLegIndex > 1) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: waypoints.slice(0, activeLegIndex).map((wp) => [wp.longitude, wp.latitude]),
      },
      properties: {
        role: 'pastLeg' satisfies FlightPlanSegmentRole,
      },
    });
  }

  // Active Leg: Aircraft position → WP(active)
  if (aircraftPos && activeLegIndex > 0 && activeLegIndex < waypoints.length) {
    const nextWP = waypoints[activeLegIndex];
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [aircraftPos.longitude, aircraftPos.latitude],
          [nextWP.longitude, nextWP.latitude],
        ],
      },
      properties: {
        role: 'activeLeg' satisfies FlightPlanSegmentRole,
        index: activeLegIndex,
      },
    });
  }

  // Future Legs: WP(active) → last WP
  if (activeLegIndex < waypoints.length - 1) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: waypoints.slice(activeLegIndex).map((wp) => [wp.longitude, wp.latitude]),
      },
      properties: {
        role: 'futureLeg' satisfies FlightPlanSegmentRole,
      },
    });
  }

  // Full route for overview mode
  features.push({
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: waypoints.map((wp) => [wp.longitude, wp.latitude]),
    },
    properties: {
      role: 'route' satisfies FlightPlanSegmentRole,
    },
  });

  return { type: 'FeatureCollection', features };
}
