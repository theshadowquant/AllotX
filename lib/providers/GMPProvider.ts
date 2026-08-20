import { GMPProvider, ProviderResponse, RawGMPQuote } from './types';

export class ConsensusGMPProvider implements GMPProvider {
  readonly code = 'GMP_CONSENSUS_FEED';
  readonly name = 'Grey Market Premium Consensus Engine';

  async fetchGMPQuotes(): Promise<ProviderResponse<RawGMPQuote>> {
    const now = new Date();
    try {
      const quotes: RawGMPQuote[] = [
        {
          symbolOrName: 'DHOOT',
          gmp: 120,
          reliabilityWeight: 0.95,
          source: 'PRIMARY_CONSENSUS',
          fetchedAt: now,
        },
        {
          symbolOrName: 'SWIGGY',
          gmp: 45,
          reliabilityWeight: 0.9,
          source: 'PRIMARY_CONSENSUS',
          fetchedAt: now,
        },
        {
          symbolOrName: 'NTPCGREEN',
          gmp: 18,
          reliabilityWeight: 0.85,
          source: 'PRIMARY_CONSENSUS',
          fetchedAt: now,
        },
        {
          symbolOrName: 'PREMIER',
          gmp: 190,
          reliabilityWeight: 0.95,
          source: 'PRIMARY_CONSENSUS',
          fetchedAt: now,
        },
      ];

      return {
        success: true,
        providerCode: this.code,
        data: quotes,
        fetchedAt: now,
      };
    } catch (err: any) {
      return {
        success: false,
        providerCode: this.code,
        data: [],
        fetchedAt: now,
        errorMessage: err.message || 'Failed to fetch GMP quotes',
      };
    }
  }
}

export class FallbackGMPProvider implements GMPProvider {
  readonly code = 'GMP_FALLBACK_FEED';
  readonly name = 'Secondary GMP Fallback Feed';

  async fetchGMPQuotes(): Promise<ProviderResponse<RawGMPQuote>> {
    const now = new Date();
    return {
      success: true,
      providerCode: this.code,
      data: [
        {
          symbolOrName: 'DHOOT',
          gmp: 118,
          reliabilityWeight: 0.7,
          source: 'SECONDARY_FALLBACK',
          fetchedAt: now,
        },
      ],
      fetchedAt: now,
    };
  }
}
