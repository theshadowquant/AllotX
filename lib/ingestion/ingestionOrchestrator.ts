import { db } from '../db';
import { ExchangeIPODataProvider } from '../providers/IPODataProvider';
import { ConsensusGMPProvider, FallbackGMPProvider } from '../providers/GMPProvider';
import { ExchangeSubscriptionProvider } from '../providers/SubscriptionProvider';
import { validateDiscoveredIPO, validateGMPQuote, validateSubscription } from './validator';
import { calculateGMPConsensus } from './gmpEngine';
import { deriveIPOEventsAndStatus } from './eventEngine';

export interface IngestionExecutionSummary {
  success: boolean;
  durationMs: number;
  ipoDiscoveries: { fetched: number; accepted: number; rejected: number };
  gmpUpdates: { fetched: number; accepted: number; rejected: number };
  subscriptionUpdates: { fetched: number; accepted: number; rejected: number };
  eventsDerived: { updatedCount: number; eventsCreated: number };
  errors: string[];
}

/**
 * Ensures data source records exist in database
 */
async function ensureDataSources() {
  const sources = [
    { code: 'EXCHANGE_FEED', name: 'Exchange Official Data Feed', refreshIntervalMs: 3600000 },
    { code: 'GMP_CONSENSUS_FEED', name: 'Grey Market Premium Consensus Feed', refreshIntervalMs: 900000 },
    { code: 'SUBSCRIPTION_EXCHANGE_FEED', name: 'Exchange Subscription Bidding Feed', refreshIntervalMs: 1800000 },
  ];

  for (const s of sources) {
    await db.dataSource.upsert({
      where: { code: s.code },
      update: {},
      create: {
        code: s.code,
        name: s.name,
        refreshIntervalMs: s.refreshIntervalMs,
        status: 'HEALTHY',
      },
    });
  }
}

/**
 * Master Idempotent Data Ingestion Orchestrator
 */
export async function runAutomatedDataIngestion(): Promise<IngestionExecutionSummary> {
  const startTime = Date.now();
  const summary: IngestionExecutionSummary = {
    success: true,
    durationMs: 0,
    ipoDiscoveries: { fetched: 0, accepted: 0, rejected: 0 },
    gmpUpdates: { fetched: 0, accepted: 0, rejected: 0 },
    subscriptionUpdates: { fetched: 0, accepted: 0, rejected: 0 },
    eventsDerived: { updatedCount: 0, eventsCreated: 0 },
    errors: [],
  };

  try {
    await ensureDataSources();

    // -------------------------------------------------------------
    // 1. IPO DISCOVERY PIPELINE
    // -------------------------------------------------------------
    const discoveryProvider = new ExchangeIPODataProvider();
    const discoveryRes = await discoveryProvider.fetchIPODiscoveries();
    summary.ipoDiscoveries.fetched = discoveryRes.data.length;

    if (discoveryRes.success) {
      for (const item of discoveryRes.data) {
        const valRes = validateDiscoveredIPO(item);
        if (!valRes.valid) {
          summary.ipoDiscoveries.rejected++;
          summary.errors.push(`Discovery rejection (${item.symbol}): ${valRes.reason}`);
          continue;
        }

        let registrar = await db.registrar.findUnique({
          where: { code: item.registrarCode },
        });

        if (!registrar) {
          registrar = (await db.registrar.findFirst()) || {
            id: 'mock-reg-id',
            code: 'MOCK',
            name: 'Mock Registrar',
            officialUrl: 'https://kfintech.com',
            active: true,
            healthStatus: 'OPERATIONAL',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        const slug = item.slug || `${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ipo`;

        const safeAllotmentDate = item.allotmentDate || item.closeDate;
        const safeListingDate = item.listingDate || item.closeDate;

        await db.iPO.upsert({
          where: { slug },
          update: {
            status: item.status,
            priceLow: item.priceLow,
            priceHigh: item.priceHigh,
            lotSize: item.lotSize,
            minInvestment: item.minInvestment,
            issueSize: item.issueSize || '₹1,000 Cr',
            openDate: item.openDate,
            closeDate: item.closeDate,
            allotmentDate: safeAllotmentDate,
            listingDate: safeListingDate,
          },
          create: {
            name: item.name,
            symbol: item.symbol,
            slug,
            marketType: item.marketType,
            status: item.status,
            priceLow: item.priceLow,
            priceHigh: item.priceHigh,
            lotSize: item.lotSize,
            minInvestment: item.minInvestment,
            issueSize: item.issueSize || '₹1,000 Cr',
            freshIssue: item.freshIssue,
            ofs: item.ofs,
            faceValue: item.faceValue || 10,
            openDate: item.openDate,
            closeDate: item.closeDate,
            allotmentDate: safeAllotmentDate,
            listingDate: safeListingDate,
            registrarId: registrar.id,
          },
        });

        summary.ipoDiscoveries.accepted++;
      }

      await db.dataSource.update({
        where: { code: 'EXCHANGE_FEED' },
        data: {
          status: 'HEALTHY',
          lastSuccessfulUpdate: new Date(),
          lastAttempt: new Date(),
          errorMessage: null,
        },
      });

      await db.dataUpdateLog.create({
        data: {
          sourceCode: 'EXCHANGE_FEED',
          targetType: 'IPO_DISCOVERY',
          status: 'SUCCESS',
          recordsFetched: summary.ipoDiscoveries.fetched,
          recordsAccepted: summary.ipoDiscoveries.accepted,
          recordsRejected: summary.ipoDiscoveries.rejected,
          durationMs: Date.now() - startTime,
        },
      });
    } else {
      summary.errors.push(`Discovery provider error: ${discoveryRes.errorMessage}`);
      await db.dataSource.update({
        where: { code: 'EXCHANGE_FEED' },
        data: {
          status: 'FAILED',
          lastAttempt: new Date(),
          errorMessage: discoveryRes.errorMessage,
        },
      });
    }

    // -------------------------------------------------------------
    // 2. GMP PIPELINE WITH FALLBACK & CONSENSUS
    // -------------------------------------------------------------
    let gmpProvider = new ConsensusGMPProvider();
    let gmpRes = await gmpProvider.fetchGMPQuotes();

    if (!gmpRes.success || gmpRes.data.length === 0) {
      summary.errors.push('Primary GMP provider failed, attempting fallback provider...');
      const fallbackProvider = new FallbackGMPProvider();
      gmpRes = await fallbackProvider.fetchGMPQuotes();
    }

    summary.gmpUpdates.fetched = gmpRes.data.length;

    if (gmpRes.success) {
      for (const quote of gmpRes.data) {
        if (quote.gmp === null || quote.status === 'UNAVAILABLE') {
          continue;
        }

        const ipo = await db.iPO.findFirst({
          where: {
            OR: [
              { symbol: quote.symbolOrName },
              { name: { contains: quote.symbolOrName } },
            ],
          },
          include: {
            gmpHistory: { orderBy: { recordedAt: 'desc' }, take: 1 },
          },
        });

        if (!ipo) {
          summary.gmpUpdates.rejected++;
          summary.errors.push(`GMP match not found for symbol: ${quote.symbolOrName}`);
          continue;
        }

        const valRes = validateGMPQuote(quote, ipo.priceHigh);
        if (!valRes.valid) {
          summary.gmpUpdates.rejected++;
          summary.errors.push(`GMP validation rejected (${ipo.symbol}): ${valRes.reason}`);
          continue;
        }

        const prevGMP = ipo.gmpHistory[0]?.gmp ?? null;
        const consensus = calculateGMPConsensus(
          [
            {
              source: quote.source,
              value: quote.gmp,
              timestamp: quote.fetchedAt.toISOString(),
              reliabilityWeight: quote.reliabilityWeight,
            },
          ],
          ipo.priceHigh,
          prevGMP
        );

        await db.iPOGMPHistory.create({
          data: {
            ipoId: ipo.id,
            gmp: consensus.gmp,
            estimatedListing: consensus.estimatedListing,
            gmpPercent: consensus.gmpPercent,
            trend: consensus.trend,
            source: quote.source,
            confidence: consensus.confidence,
            recordedAt: quote.fetchedAt,
          },
        });

        summary.gmpUpdates.accepted++;
      }

      await db.dataSource.update({
        where: { code: 'GMP_CONSENSUS_FEED' },
        data: {
          status: 'HEALTHY',
          lastSuccessfulUpdate: new Date(),
          lastAttempt: new Date(),
          errorMessage: null,
        },
      });

      await db.dataUpdateLog.create({
        data: {
          sourceCode: 'GMP_CONSENSUS_FEED',
          targetType: 'GMP',
          status: 'SUCCESS',
          recordsFetched: summary.gmpUpdates.fetched,
          recordsAccepted: summary.gmpUpdates.accepted,
          recordsRejected: summary.gmpUpdates.rejected,
          durationMs: Date.now() - startTime,
        },
      });
    }

    // -------------------------------------------------------------
    // 3. SUBSCRIPTION PIPELINE
    // -------------------------------------------------------------
    const subProvider = new ExchangeSubscriptionProvider();
    const subRes = await subProvider.fetchSubscriptions();
    summary.subscriptionUpdates.fetched = subRes.data.length;

    if (subRes.success) {
      for (const item of subRes.data) {
        if (item.overall === null || item.status === 'UNAVAILABLE') {
          continue;
        }

        const ipo = await db.iPO.findFirst({
          where: {
            OR: [
              { symbol: item.symbolOrName },
              { name: { contains: item.symbolOrName } },
            ],
          },
        });

        if (!ipo) {
          summary.subscriptionUpdates.rejected++;
          continue;
        }

        const valRes = validateSubscription(item);
        if (!valRes.valid) {
          summary.subscriptionUpdates.rejected++;
          summary.errors.push(`Subscription rejected (${ipo.symbol}): ${valRes.reason}`);
          continue;
        }

        await db.iPOSubscription.create({
          data: {
            ipoId: ipo.id,
            retail: item.retail || 0,
            nii: item.nii || 0,
            qib: item.qib || 0,
            employee: item.employee,
            shareholder: item.shareholder,
            overall: item.overall,
            snapshotDay: item.snapshotDay || 'Day 1',
            snapshotTime: item.snapshotTime || '05:00 PM',
            recordedAt: item.fetchedAt,
          },
        });

        summary.subscriptionUpdates.accepted++;
      }

      await db.dataSource.update({
        where: { code: 'SUBSCRIPTION_EXCHANGE_FEED' },
        data: {
          status: 'HEALTHY',
          lastSuccessfulUpdate: new Date(),
          lastAttempt: new Date(),
          errorMessage: null,
        },
      });

      await db.dataUpdateLog.create({
        data: {
          sourceCode: 'SUBSCRIPTION_EXCHANGE_FEED',
          targetType: 'SUBSCRIPTION',
          status: 'SUCCESS',
          recordsFetched: summary.subscriptionUpdates.fetched,
          recordsAccepted: summary.subscriptionUpdates.accepted,
          recordsRejected: summary.subscriptionUpdates.rejected,
          durationMs: Date.now() - startTime,
        },
      });
    }

    // -------------------------------------------------------------
    // 4. AUTOMATED EVENT & STATUS DERIVATION
    // -------------------------------------------------------------
    const eventRes = await deriveIPOEventsAndStatus();
    summary.eventsDerived = eventRes;
  } catch (err: any) {
    summary.success = false;
    summary.errors.push(`Master ingestion failure: ${err.message}`);
  } finally {
    summary.durationMs = Date.now() - startTime;
  }

  return summary;
}
