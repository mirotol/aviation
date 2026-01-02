/**
 * Formats a numeric timestamp into a clean HH:mm:ss string (Zulu/UTC).
 */
export const formatZuluTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  const s = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${h}:${m}:${s}`;
};