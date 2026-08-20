import { IPODataProvider, ProviderResponse, DiscoveredIPOItem } from './types';

export class ExchangeIPODataProvider implements IPODataProvider {
  readonly code = 'EXCHANGE_FEED';
  readonly name = 'NSE Official Public Issue Feed';

  /**
   * Fetches session cookie from NSE main page if required
   */
  private async getNSESessionCookie(): Promise<string> {
    try {
      const res = await fetch('https://www.nseindia.com', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      const setCookie = res.headers.get('set-cookie');
      return setCookie || '';
    } catch {
      return '';
    }
  }

  async fetchIPODiscoveries(): Promise<ProviderResponse<DiscoveredIPOItem>> {
    const now = new Date();
    try {
      const cookie = await this.getNSESessionCookie();

      const res = await fetch('https://www.nseindia.com/api/ipo-current-issue', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
          ...(cookie ? { Cookie: cookie } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`NSE HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error('Unexpected NSE API response format');
      }

      const discoveries: DiscoveredIPOItem[] = json.map((item: any) => {
        const symbol = item.symbol || item.securitySymbol || 'IPO';
        const name = item.companyName || item.issueName || symbol;
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ipo`;

        const priceLow = parseFloat(item.priceBandLow || item.issuePrice || item.priceLow || '100');
        const priceHigh = parseFloat(item.priceBandHigh || item.issuePrice || item.priceHigh || '100');
        const lotSize = parseInt(item.lotSize || item.marketLot || '15', 10);
        const minInvestment = priceHigh * lotSize;

        const openDate = item.issueStartDate ? new Date(item.issueStartDate) : new Date();
        const closeDate = item.issueEndDate ? new Date(item.issueEndDate) : new Date(Date.now() + 3 * 86400000);
        const allotmentDate = item.allotmentDate ? new Date(item.allotmentDate) : new Date(closeDate.getTime() + 86400000);
        const listingDate = item.listingDate ? new Date(item.listingDate) : new Date(allotmentDate.getTime() + 2 * 86400000);

        let status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTMENT_PENDING' | 'ALLOTMENT_AVAILABLE' | 'LISTED' = 'OPEN';
        const rawStatus = (item.status || '').toUpperCase();
        if (rawStatus.includes('UPCOMING')) status = 'UPCOMING';
        else if (rawStatus.includes('CLOSED')) status = 'CLOSED';

        return {
          name,
          symbol,
          slug,
          marketType: item.issueType === 'SME' ? 'SME' : 'MAINBOARD',
          status,
          priceLow,
          priceHigh,
          lotSize,
          minInvestment,
          issueSize: item.issueSize ? `₹${item.issueSize} Cr` : '₹500 Cr',
          openDate,
          closeDate,
          allotmentDate,
          listingDate,
          registrarCode: (item.registrarName || '').toUpperCase().includes('LINK') ? 'LINK_INTIME' : 'KFINTECH',
        };
      });

      return {
        success: true,
        providerCode: this.code,
        data: discoveries,
        fetchedAt: now,
      };
    } catch (err: any) {
      console.warn(`ExchangeIPODataProvider fetch failed: ${err.message}`);
      return {
        success: false,
        providerCode: this.code,
        data: [],
        fetchedAt: now,
        errorMessage: err.message || 'Failed to fetch NSE IPO discovery feed',
      };
    }
  }
}
