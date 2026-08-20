import { IPODataProvider, ProviderResponse, DiscoveredIPOItem } from './types';

/**
 * Parses NSE date format "20-Aug-2026" or "2026-08-20" into a valid JavaScript Date
 */
function parseNSEDate(dateStr: string, defaultDate: Date): Date {
  if (!dateStr) return defaultDate;

  try {
    // Format: DD-MMM-YYYY (e.g. 20-Aug-2026)
    const match = dateStr.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const monthStr = match[2];
      const year = parseInt(match[3], 10);

      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };

      const monthIndex = months[monthStr] !== undefined ? months[monthStr] : 7;
      return new Date(Date.UTC(year, monthIndex, day));
    }

    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? defaultDate : parsed;
  } catch {
    return defaultDate;
  }
}

/**
 * Parses NSE issue price format "Rs.285 to Rs.300" or "Rs.160"
 */
function parseNSEPrice(priceStr: string): { priceLow: number; priceHigh: number } {
  if (!priceStr) return { priceLow: 100, priceHigh: 100 };

  try {
    const matches = priceStr.match(/\d+(\.\d+)?/g);
    if (matches && matches.length >= 2) {
      const low = parseFloat(matches[0]);
      const high = parseFloat(matches[1]);
      return { priceLow: low, priceHigh: high };
    } else if (matches && matches.length === 1) {
      const val = parseFloat(matches[0]);
      return { priceLow: val, priceHigh: val };
    }
  } catch {
    // Fallback
  }

  return { priceLow: 100, priceHigh: 100 };
}

export class ExchangeIPODataProvider implements IPODataProvider {
  readonly code = 'EXCHANGE_FEED';
  readonly name = 'NSE Official Public Issue Feed';

  async fetchIPODiscoveries(): Promise<ProviderResponse<DiscoveredIPOItem>> {
    const now = new Date();
    try {
      const res = await fetch('https://www.nseindia.com/api/ipo-current-issue', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.nseindia.com/market-data/all-upcoming-issues-ipo',
        },
      });

      if (!res.ok) {
        throw new Error(`NSE HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error('Unexpected NSE API response structure');
      }

      const discoveries: DiscoveredIPOItem[] = json.map((item: any) => {
        const symbol = (item.symbol || item.securitySymbol || 'IPO').toUpperCase().trim();
        const name = item.companyName || item.issueName || symbol;
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ipo`;

        const { priceLow, priceHigh } = parseNSEPrice(item.issuePrice || item.priceBand || '');
        const lotSize = parseInt(item.lotSize || item.marketLot || '50', 10) || 50;
        const minInvestment = priceHigh * lotSize;

        const openDate = parseNSEDate(item.issueStartDate, now);
        const closeDate = parseNSEDate(item.issueEndDate, new Date(now.getTime() + 3 * 86400000));
        const allotmentDate = new Date(closeDate.getTime() + 86400000);
        const listingDate = new Date(allotmentDate.getTime() + 2 * 86400000);

        let status: 'UPCOMING' | 'OPEN' | 'CLOSED' | 'ALLOTMENT_PENDING' | 'ALLOTMENT_AVAILABLE' | 'LISTED' = 'OPEN';
        const rawStatus = (item.status || '').toUpperCase();
        if (rawStatus.includes('UPCOMING')) status = 'UPCOMING';
        else if (rawStatus.includes('CLOSED')) status = 'CLOSED';

        return {
          name,
          symbol,
          slug,
          marketType: item.series === 'SME' ? 'SME' : 'MAINBOARD',
          status,
          priceLow,
          priceHigh,
          lotSize,
          minInvestment,
          issueSize: item.issueSize ? `₹${(parseFloat(item.issueSize) / 10000000).toFixed(0)} Cr` : '₹500 Cr',
          openDate,
          closeDate,
          allotmentDate,
          listingDate,
          registrarCode: (item.companyName || '').toUpperCase().includes('LINK') ? 'LINK_INTIME' : 'KFINTECH',
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
