/**
 * Format currency to Indian Rupee (INR) string
 * Example: 14950 -> ₹14,950
 */
export function formatINR(val?: number | null): string {
  if (val === undefined || val === null) return 'N/A';
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

/**
 * Format GMP percentage
 * Example: 18.46 -> +18.46%
 */
export function formatPercent(val?: number | null): string {
  if (val === undefined || val === null) return '0%';
  const rounded = parseFloat(val.toFixed(2));
  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
}

/**
 * Format short date (e.g. 24 Aug)
 */
export function formatShortDate(dateStr?: string | Date | null): string {
  if (!dateStr) return 'TBA';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return 'TBA';
  }
}

/**
 * Format full event date (e.g. 24 Aug 2026)
 */
export function formatEventDate(dateStr?: string | Date | null): string {
  if (!dateStr) return 'TBA';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'TBA';
  }
}
