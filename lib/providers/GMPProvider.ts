import { GMPProvider, ProviderResponse, RawGMPQuote } from './types';

export class ConsensusGMPProvider implements GMPProvider {
  readonly code = 'GMP_CONSENSUS_FEED';
  readonly name = 'Chittorgarh OTC GMP Feed';

  async fetchGMPQuotes(): Promise<ProviderResponse<RawGMPQuote>> {
    const now = new Date();
    try {
      const res = await fetch('https://www.chittorgarh.com/api/ipo_gmp.json', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html, */*',
        },
      });

      if (!res.ok) {
        throw new Error(`Chittorgarh GMP HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error('Unexpected GMP feed response structure');
      }

      const quotes: RawGMPQuote[] = json.map((item: any) => {
        const rawVal = item.gmp !== undefined && item.gmp !== null ? item.gmp : item.premium;
        const parsed = rawVal !== undefined && rawVal !== null && rawVal !== '' ? parseFloat(rawVal) : NaN;
        const isAvailable = !isNaN(parsed);

        return {
          symbolOrName: (item.name || item.company || '').toUpperCase().trim(),
          gmp: isAvailable ? parsed : null,
          status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
          trend: isAvailable ? 'STABLE' : 'UNAVAILABLE',
          reliabilityWeight: 0.9,
          source: 'Chittorgarh OTC Feed',
          fetchedAt: now,
        };
      });

      return {
        success: true,
        providerCode: this.code,
        data: quotes,
        fetchedAt: now,
      };
    } catch (err: any) {
      console.warn(`ConsensusGMPProvider fetch failed: ${err.message}`);
      return {
        success: false,
        providerCode: this.code,
        data: [],
        fetchedAt: now,
        errorMessage: err.message || 'Chittorgarh primary GMP feed unavailable',
      };
    }
  }
}

export class FallbackGMPProvider implements GMPProvider {
  readonly code = 'GMP_FALLBACK_FEED';
  readonly name = 'IPOWatch OTC GMP Feed';

  async fetchGMPQuotes(): Promise<ProviderResponse<RawGMPQuote>> {
    const now = new Date();
    try {
      const res = await fetch('https://ipowatch.in/api/gmp-list.json', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html, */*',
        },
      });

      if (!res.ok) {
        throw new Error(`IPOWatch GMP HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      if (!Array.isArray(json)) {
        throw new Error('Unexpected fallback GMP response format');
      }

      const quotes: RawGMPQuote[] = json.map((item: any) => {
        const rawVal = item.gmp;
        const parsed = rawVal !== undefined && rawVal !== null && rawVal !== '' ? parseFloat(rawVal) : NaN;
        const isAvailable = !isNaN(parsed);

        return {
          symbolOrName: (item.title || item.name || '').toUpperCase().trim(),
          gmp: isAvailable ? parsed : null,
          status: isAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
          trend: isAvailable ? 'STABLE' : 'UNAVAILABLE',
          reliabilityWeight: 0.75,
          source: 'IPOWatch OTC Feed',
          fetchedAt: now,
        };
      });

      return {
        success: true,
        providerCode: this.code,
        data: quotes,
        fetchedAt: now,
      };
    } catch (err: any) {
      console.warn(`FallbackGMPProvider fetch failed: ${err.message}`);
      return {
        success: false,
        providerCode: this.code,
        data: [],
        fetchedAt: now,
        errorMessage: err.message || 'IPOWatch secondary GMP feed unavailable',
      };
    }
  }
}
