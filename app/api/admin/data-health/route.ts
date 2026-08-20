import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAutomatedDataIngestion } from '@/lib/ingestion/ingestionOrchestrator';

export async function GET(req: NextRequest) {
  try {
    const dataSources = await db.dataSource.findMany({
      orderBy: { code: 'asc' },
    });

    const updateLogs = await db.dataUpdateLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        source: { select: { name: true, code: true } },
      },
    });

    const totalIPOs = await db.iPO.count();
    const totalGMPRecords = await db.iPOGMPHistory.count();
    const totalSubRecords = await db.iPOSubscription.count();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 3600 * 1000);

    // Compute Subsystem Health Statuses
    const discoveryHealthy = totalIPOs > 0;
    const gmpHealthy = totalGMPRecords > 0;
    const subHealthy = totalSubRecords > 0;

    const pipelineBreakdown = [
      {
        component: 'IPO Discovery',
        code: 'DISCOVERY_PIPELINE',
        status: discoveryHealthy ? 'HEALTHY' : 'NO_DATA',
        records: totalIPOs,
        lastSuccess: now.toISOString(),
      },
      {
        component: 'GMP Intelligence',
        code: 'GMP_PIPELINE',
        status: gmpHealthy ? 'HEALTHY' : 'NO_DATA',
        records: totalGMPRecords,
        lastSuccess: now.toISOString(),
      },
      {
        component: 'Subscription Bidding',
        code: 'SUBSCRIPTION_PIPELINE',
        status: subHealthy ? 'HEALTHY' : 'NO_DATA',
        records: totalSubRecords,
        lastSuccess: now.toISOString(),
      },
      {
        component: 'Timeline & Dates',
        code: 'TIMELINE_PIPELINE',
        status: totalIPOs > 0 ? 'HEALTHY' : 'NO_DATA',
        records: totalIPOs,
        lastSuccess: now.toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalIPOs,
          totalGMPRecords,
          totalSubRecords,
        },
        pipelineBreakdown,
        dataSources: dataSources.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          status: s.status,
          lastSuccessfulUpdate: s.lastSuccessfulUpdate?.toISOString() || null,
          lastAttempt: s.lastAttempt?.toISOString() || null,
          errorMessage: s.errorMessage,
          refreshIntervalMs: s.refreshIntervalMs,
          active: s.active,
        })),
        recentLogs: updateLogs.map((l) => ({
          id: l.id,
          sourceCode: l.sourceCode,
          sourceName: l.source.name,
          targetType: l.targetType,
          status: l.status,
          recordsFetched: l.recordsFetched,
          recordsAccepted: l.recordsAccepted,
          recordsRejected: l.recordsRejected,
          durationMs: l.durationMs,
          errorMessage: l.errorMessage,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching data health:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data health metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'trigger_ingestion') {
      const summary = await runAutomatedDataIngestion();
      return NextResponse.json({
        success: summary.success,
        message: 'Manual data ingestion trigger completed',
        data: summary,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in admin data-health POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute data health action' },
      { status: 500 }
    );
  }
}
