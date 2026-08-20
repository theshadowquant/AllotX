export interface GMPSourceItem {
  source: string;
  value: number;
  timestamp: string;
  reliabilityWeight: number; // 0.0 to 1.0
}

export interface GMPCalculationResult {
  gmp: number;
  estimatedListing: number;
  gmpPercent: number;
  trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'NO_DATA';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_CONSENSUS';
}

/**
 * Reconciles multiple GMP inputs using weighted reliability, source hierarchy,
 * and statistical variance analysis.
 */
export function calculateGMPConsensus(
  sources: GMPSourceItem[],
  priceHigh: number,
  previousGMP: number | null
): GMPCalculationResult {
  if (!sources || sources.length === 0 || priceHigh <= 0) {
    return {
      gmp: 0,
      estimatedListing: priceHigh,
      gmpPercent: 0,
      trend: 'NO_DATA',
      confidence: 'NO_CONSENSUS',
    };
  }

  // 1. Calculate weighted consensus
  let totalWeight = 0;
  let weightedSum = 0;
  const values = sources.map((s) => s.value);

  for (const item of sources) {
    const weight = Math.max(0.1, Math.min(1.0, item.reliabilityWeight || 1.0));
    weightedSum += item.value * weight;
    totalWeight += weight;
  }

  const gmp = Math.round(weightedSum / totalWeight);

  // 2. Compute variance / spread to set Confidence level
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const spread = maxVal - minVal;
  const spreadRatio = gmp > 0 ? spread / gmp : spread;

  let confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_CONSENSUS' = 'HIGH';
  if (sources.length === 1) {
    confidence = 'MEDIUM';
  } else if (spreadRatio > 0.35) {
    confidence = 'NO_CONSENSUS';
  } else if (spreadRatio > 0.2) {
    confidence = 'LOW';
  } else if (spreadRatio > 0.1) {
    confidence = 'MEDIUM';
  }

  // 3. Compute listing estimation and percentage
  const estimatedListing = Math.round(priceHigh + gmp);
  const gmpPercent = parseFloat(((gmp / priceHigh) * 100).toFixed(2));

  // 4. Compute trend direction vs previous GMP
  let trend: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'NO_DATA' = 'STABLE';

  if (confidence === 'NO_CONSENSUS') {
    trend = 'VOLATILE';
  } else if (previousGMP !== null) {
    const diff = gmp - previousGMP;
    const pctChange = previousGMP > 0 ? (diff / previousGMP) * 100 : diff;

    if (pctChange >= 4) {
      trend = 'RISING';
    } else if (pctChange <= -4) {
      trend = 'FALLING';
    } else {
      trend = 'STABLE';
    }
  }

  return {
    gmp,
    estimatedListing,
    gmpPercent,
    trend,
    confidence,
  };
}
