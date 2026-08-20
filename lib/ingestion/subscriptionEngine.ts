export interface SubscriptionDataInput {
  retail: number;
  nii: number;
  qib: number;
  employee?: number;
  shareholder?: number;
  snapshotDay?: string;
  snapshotTime?: string;
}

export interface SubscriptionNormalizedResult {
  retail: number;
  nii: number;
  qib: number;
  employee?: number;
  shareholder?: number;
  overall: number;
  snapshotDay: string;
  snapshotTime: string;
}

/**
 * Normalizes subscription data across categories and calculates overall subscription multiplier.
 */
export function normalizeSubscriptionData(input: SubscriptionDataInput): SubscriptionNormalizedResult {
  const retail = Math.max(0, parseFloat((input.retail || 0).toFixed(2)));
  const nii = Math.max(0, parseFloat((input.nii || 0).toFixed(2)));
  const qib = Math.max(0, parseFloat((input.qib || 0).toFixed(2)));
  const employee = input.employee !== undefined ? Math.max(0, parseFloat(input.employee.toFixed(2))) : undefined;
  const shareholder = input.shareholder !== undefined ? Math.max(0, parseFloat(input.shareholder.toFixed(2))) : undefined;

  // Calculate weighted overall subscription estimate based on standard category allocations (QIB 50%, NII 15%, Retail 35%)
  const overallCalc = qib * 0.5 + nii * 0.15 + retail * 0.35;
  const overall = parseFloat(overallCalc.toFixed(2));

  return {
    retail,
    nii,
    qib,
    employee,
    shareholder,
    overall,
    snapshotDay: input.snapshotDay || 'Latest',
    snapshotTime: input.snapshotTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
