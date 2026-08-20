import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ipo = await db.iPO.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        registrar: true,
        gmpHistory: {
          orderBy: { recordedAt: 'asc' },
        },
        subscription: {
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!ipo) {
      return NextResponse.json(
        { success: false, error: 'IPO not found' },
        { status: 404 }
      );
    }

    const latestGMP = ipo.gmpHistory.length > 0 ? ipo.gmpHistory[ipo.gmpHistory.length - 1] : null;
    const latestSub = ipo.subscription.length > 0 ? ipo.subscription[0] : null;

    // Format historical GMP data points for Recharts visualization
    const gmpChartData = ipo.gmpHistory.map((item) => ({
      date: new Date(item.recordedAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      }),
      gmp: item.gmp,
      estimatedListing: item.estimatedListing,
      gmpPercent: item.gmpPercent,
      trend: item.trend,
      confidence: item.confidence,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: ipo.id,
        name: ipo.name,
        slug: ipo.slug,
        symbol: ipo.symbol,
        marketType: ipo.marketType,
        status: ipo.status,
        priceLow: ipo.priceLow,
        priceHigh: ipo.priceHigh,
        lotSize: ipo.lotSize,
        minInvestment: ipo.minInvestment,
        issueSize: ipo.issueSize,
        freshIssue: ipo.freshIssue,
        ofs: ipo.ofs,
        faceValue: ipo.faceValue,
        openDate: ipo.openDate.toISOString(),
        closeDate: ipo.closeDate.toISOString(),
        allotmentDate: ipo.allotmentDate.toISOString(),
        refundDate: ipo.refundDate ? ipo.refundDate.toISOString() : null,
        dematDate: ipo.dematDate ? ipo.dematDate.toISOString() : null,
        listingDate: ipo.listingDate.toISOString(),
        registrar: {
          id: ipo.registrar.id,
          code: ipo.registrar.code,
          name: ipo.registrar.name,
          officialUrl: ipo.registrar.officialUrl,
          healthStatus: ipo.registrar.healthStatus,
        },
        latestGMP: latestGMP
          ? {
              value: latestGMP.gmp,
              estimatedListing: latestGMP.estimatedListing,
              percent: latestGMP.gmpPercent,
              trend: latestGMP.trend,
              confidence: latestGMP.confidence,
              updatedAt: latestGMP.recordedAt.toISOString(),
            }
          : null,
        gmpHistory: gmpChartData,
        latestSubscription: latestSub
          ? {
              overall: latestSub.overall,
              retail: latestSub.retail,
              nii: latestSub.nii,
              qib: latestSub.qib,
              employee: latestSub.employee,
              shareholder: latestSub.shareholder,
              snapshotDay: latestSub.snapshotDay,
              snapshotTime: latestSub.snapshotTime,
              updatedAt: latestSub.recordedAt.toISOString(),
            }
          : null,
        disclaimer:
          'GMP (Grey Market Premium) is unofficial market sentiment and does not guarantee the actual listing price or returns. Verify allotment status on official registrar systems.',
      },
    });
  } catch (error: any) {
    console.error('Error fetching IPO detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IPO detail' },
      { status: 500 }
    );
  }
}
