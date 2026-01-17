import React from 'react';

/**
 * Returns JSX for a metric where:
 * - value is big
 * - unit is smaller
 * - if value is missing, underscores are shown instead
 * Used in MFDPageHeader for NAV metrics.
 */
export function formatMetric(
  value: number | string | null | undefined,
  unit?: string,
  length = 3,
  padChar = '_',
  placeholder?: string
): React.ReactElement {
  // Don't treat 0 or '0' as missing
  const isMissing = value === null || value === undefined || value === '';

  let displayValue: string;
  if (isMissing) {
    displayValue = placeholder ?? padChar.repeat(length);
  } else if (typeof value === 'number') {
    displayValue = value.toString().padStart(length, '0');
  } else {
    displayValue = value;
  }

  return (
    <>
      <span className="nav-value-main">{displayValue}</span>
      {unit && <span className="nav-value-unit">{unit}</span>}
    </>
  );
}
