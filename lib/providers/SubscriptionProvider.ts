import { SubscriptionProvider, ProviderResponse, RawSubscriptionMetrics } from './types';

function parseSubscriptionValue(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

export class ExchangeSubscriptionProvider implements SubscriptionProvider {
  readonly code = 'SUBSCRIPTION_EXCHANGE_FEED';
  readonly name = 'NSE Category Subscription Feed';

  async fetchSubscriptions(): Promise<ProviderResponse<RawSubscriptionMetrics>> {
    const now = new Date();
    try {
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

      const items: RawSubscriptionMetrics[] = json.map((item: any) => {
        const retail = parseSubscriptionValue(item.retailSubscription);
        const nii = parseSubscriptionValue(item.niiSubscription);
        const qib = parseSubscriptionValue(item.qibSubscription);
        const overall = parseSubscriptionValue(item.overallSubscription);
        const isAvailable = overall !== null || retail !== null;

        return {
          symbolOrName: item.symbol || item.companyName || 'IPO',
          retail,
          nii,
          qib,
          employee: parseSubscriptionValue(item.employeeSubscription),
          shareholder: parseSubscriptionValue(item.shareholderSubscription),
          overall,
          status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
          snapshotDay: item.dayNumber ? `Day ${item.dayNumber}` : undefined,
          snapshotTime: item.snapshotTime || undefined,
          source: 'NSE India Feed',
          fetchedAt: now,
        };
      });

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
