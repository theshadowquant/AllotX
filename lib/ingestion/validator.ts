import { DiscoveredIPOItem, RawGMPQuote, RawSubscriptionMetrics } from '../providers/types';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateDiscoveredIPO(ipo: DiscoveredIPOItem): ValidationResult {
  if (!ipo.name || !ipo.symbol) {
    return { valid: false, reason: 'Missing company name or symbol' };
  }

  if (ipo.priceLow <= 0 || ipo.priceHigh <= 0 || ipo.priceLow > ipo.priceHigh) {
    return { valid: false, reason: `Invalid price band ₹${ipo.priceLow}–₹${ipo.priceHigh}` };
  }

  if (ipo.lotSize <= 0) {
    return { valid: false, reason: `Invalid lot size ${ipo.lotSize}` };
  }

  const openTs = new Date(ipo.openDate).getTime();
  const closeTs = new Date(ipo.closeDate).getTime();

  if (openTs > closeTs) {
    return { valid: false, reason: 'openDate cannot be after closeDate' };
  }

  return { valid: true };
}

export function validateGMPQuote(quote: RawGMPQuote, upperPrice: number): ValidationResult {
  if (quote.gmp === null || quote.status === 'UNAVAILABLE') {
    return { valid: true };
  }

  if (upperPrice <= 0) {
    return { valid: false, reason: 'Invalid IPO upper price band' };
  }

  if (quote.gmp < -upperPrice * 0.9) {
    return { valid: false, reason: `GMP ₹${quote.gmp} is unrealistically negative` };
  }

  if (quote.gmp > upperPrice * 2.5) {
    return { valid: false, reason: `GMP ₹${quote.gmp} exceeds 250% of issue price ₹${upperPrice}` };
  }

  return { valid: true };
}

export function validateSubscription(sub: RawSubscriptionMetrics): ValidationResult {
  if (sub.overall === null || sub.status === 'UNAVAILABLE') {
    return { valid: true };
  }

  if (sub.overall < 0) {
    return { valid: false, reason: 'Subscription overall bidding multiple cannot be negative' };
  }

  if (sub.retail !== undefined && sub.retail !== null && sub.retail < 0) {
    return { valid: false, reason: 'Retail subscription cannot be negative' };
  }

  if (sub.qib !== undefined && sub.qib !== null && sub.qib < 0) {
    return { valid: false, reason: 'QIB subscription cannot be negative' };
  }

  if (sub.nii !== undefined && sub.nii !== null && sub.nii < 0) {
    return { valid: false, reason: 'NII subscription cannot be negative' };
  }

  return { valid: true };
}
