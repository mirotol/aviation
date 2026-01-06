export function shouldShowNavPoint(point: any, displayRangeNM: number): boolean {
  if (point.type === 'large_airport' || point.type === 'medium_airport') {
    return true;
  }

  if (point.type === 'small_airport') {
    return displayRangeNM <= 160;
  }

  if (point.type === 'VOR') {
    return displayRangeNM <= 100;
  }

  if (point.type === 'NDB') {
    return displayRangeNM <= 50;
  }

  if (point.type === 'FIX' || point.type === 'intersection') {
    return displayRangeNM <= 15;
  }

  if (point.type === 'user_waypoint') {
    return displayRangeNM <= 30;
  }

  return false;
}
