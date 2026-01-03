/**
 * Formats a numeric timestamp into a clean HH:mm:ss string (Zulu/UTC).
 * If a baseTimestamp is provided, it will add a day-offset indicator (e.g. +1D)
 * if the date has changed relative to the start.
 */
export const formatZuluTime = (timestamp: number, baseTimestamp?: number): string => {
  const date = new Date(timestamp);
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');

  let prefix = '';

  if (baseTimestamp) {
    const startDate = new Date(baseTimestamp);
    // Set both to midnight UTC to compare full days accurately
    const d1 = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    );
    const d2 = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    const dayDiff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    if (dayDiff > 0) {
      prefix = `+${dayDiff}D `;
    }
  }

  return `${prefix}${h}:${m}:${s}`;
};
