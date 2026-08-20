import { SubscriptionProvider, ProviderResponse, RawSubscriptionMetrics } from './types';

export class ExchangeSubscriptionProvider implements SubscriptionProvider {
  readonly code = 'SUBSCRIPTION_EXCHANGE_FEED';
  readonly name = 'NSE Category Subscription Feed';

  async fetchSubscriptions(): Promise<ProviderResponse<RawSubscriptionMetrics>> {
    const now = new Date();
    try {
      // Live fetch against exchange bidding endpoints
      const res = await fetch('https://www.nseindia.com/api/ipo-bid-details', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
        },
      });

      if (!res.ok) {
        throw new Error(`NSE Subscription HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error('Invalid subscription response format from exchange feed');
      }

      const items: RawSubscriptionMetrics[] = json.map((item: any) => ({
        symbolOrName: item.symbol || item.companyName || 'IPO',
        retail: parseFloat(item.retailSubscription || '0'),
        nii: parseFloat(item.niiSubscription || '0'),
        qib: parseFloat(item.qibSubscription || '0'),
        employee: item.employeeSubscription ? parseFloat(item.employeeSubscription) : undefined,
        shareholder: item.shareholderSubscription ? parseFloat(item.shareholderSubscription) : undefined,
        overall: parseFloat(item.overallSubscription || '0'),
        snapshotDay: item.dayNumber ? `Day ${item.dayNumber}` : 'Day 1',
        snapshotTime: item.snapshotTime || '05:00 PM',
        source: 'NSE_OFFICIAL_FEED',
        fetchedAt: now,
      }));

      return {
        success: true,
        providerCode: this.code,
        data: items,
        fetchedAt: now,
      };
    } catch (err: any) {
      console.warn(`ExchangeSubscriptionProvider fetch failed: ${err.message}`);
      return {
        success: false,
        providerCode: this.code,
        data: [],
        fetchedAt: now,
        errorMessage: err.message || 'Failed to fetch subscription metrics from exchange',
      };
    }
  }
}
