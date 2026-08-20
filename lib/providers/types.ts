export interface DiscoveredIPOItem {
  name: string;
  symbol: string;
  slug?: string;
  marketType: 'MAINBOARD' | 'SME';
  status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTMENT_PENDING' | 'ALLOTMENT_AVAILABLE' | 'LISTED';
  priceLow: number;
  priceHigh: number;
  lotSize: number;
  minInvestment: number;
  issueSize?: string;
  freshIssue?: string;
  ofs?: string;
  faceValue?: number;
  openDate: Date;
  closeDate: Date;
  allotmentDate: Date;
  refundDate?: Date;
  dematDate?: Date;
  listingDate: Date;
  registrarCode: string; // e.g. KFINTECH, LINK_INTIME, BIGSHARE, CAMEO
}

export interface RawGMPQuote {
  symbolOrName: string;
  gmp: number;
  estimatedListing?: number;
  gmpPercent?: number;
  trend?: 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'NO_DATA';
  source: string;
  reliabilityWeight: number; // 0.0 to 1.0
  fetchedAt: Date;
}

export interface RawSubscriptionMetrics {
  symbolOrName: string;
  retail?: number;
  nii?: number;
  qib?: number;
  employee?: number;
  shareholder?: number;
  overall: number;
  snapshotDay?: string;
  snapshotTime?: string;
  source: string;
  fetchedAt: Date;
}

export interface ProviderResponse<T> {
  success: boolean;
  providerCode: string;
  data: T[];
  fetchedAt: Date;
  errorMessage?: string;
}

export interface IPODataProvider {
  readonly code: string;
  readonly name: string;
  fetchIPODiscoveries(): Promise<ProviderResponse<DiscoveredIPOItem>>;
}

export interface GMPProvider {
  readonly code: string;
  readonly name: string;
  fetchGMPQuotes(): Promise<ProviderResponse<RawGMPQuote>>;
}

export interface SubscriptionProvider {
  readonly code: string;
  readonly name: string;
  fetchSubscriptions(): Promise<ProviderResponse<RawSubscriptionMetrics>>;
}
