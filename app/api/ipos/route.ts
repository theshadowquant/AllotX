import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const marketType = searchParams.get('marketType');

    const now = new Date();
    const whereClause: any = {};

    if (marketType && marketType.toUpperCase() !== 'ALL') {
      whereClause.marketType = marketType.toUpperCase();
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { symbol: { contains: search } },
      ];
    }

    const ipos = await db.iPO.findMany({
      where: whereClause,
      include: {
        registrar: true,
        gmpHistory: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        subscription: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ openDate: 'desc' }],
    });

    let formattedIPOs = ipos.map((ipo) => {
      const latestGMP = ipo.gmpHistory[0] || null;
      const latestSub = ipo.subscription[0] || null;

      return {
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
        allotmentDate: ipo.allotmentDate ? ipo.allotmentDate.toISOString() : null,
        refundDate: ipo.refundDate ? ipo.refundDate.toISOString() : null,
        dematDate: ipo.dematDate ? ipo.dematDate.toISOString() : null,
        listingDate: ipo.listingDate ? ipo.listingDate.toISOString() : null,
        registrar: {
          id: ipo.registrar.id,
          code: ipo.registrar.code,
          name: ipo.registrar.name,
          officialUrl: ipo.registrar.officialUrl,
        },
        gmp: latestGMP
          ? {
              value: latestGMP.gmp,
              estimatedListing: latestGMP.estimatedListing,
              percent: latestGMP.gmpPercent,
              trend: latestGMP.trend,
              confidence: latestGMP.confidence,
              updatedAt: latestGMP.recordedAt.toISOString(),
            }
          : null,
        subscription: latestSub
          ? {
              overall: latestSub.overall,
              retail: latestSub.retail,
              nii: latestSub.nii,
              qib: latestSub.qib,
              employee: latestSub.employee,
              shareholder: latestSub.shareholder,
              snapshotDay: latestSub.snapshotDay,
              snapshotTime: latestSub.snapshotTime,
            }
          : null,
      };
    });

    // Enforce strict date-based status filtering
    if (status && status.toUpperCase() !== 'ALL') {
      const targetStatus = status.toUpperCase();
      const nowTs = now.getTime();

      if (targetStatus === 'OPEN' || targetStatus === 'CURRENT') {
        formattedIPOs = formattedIPOs.filter((i) => {
          const openTs = new Date(i.openDate).getTime();
          const closeTs = new Date(i.closeDate).getTime();
          const listingTs = i.listingDate ? new Date(i.listingDate).getTime() : null;
          return openTs <= nowTs && nowTs <= closeTs && (!listingTs || nowTs < listingTs);
        });
      } else if (targetStatus === 'UPCOMING') {
        formattedIPOs = formattedIPOs.filter((i) => {
          const openTs = new Date(i.openDate).getTime();
          return openTs > nowTs;
        });
      } else if (targetStatus === 'CLOSED') {
        formattedIPOs = formattedIPOs.filter((i) => {
          const closeTs = new Date(i.closeDate).getTime();
          const listingTs = i.listingDate ? new Date(i.listingDate).getTime() : null;
          return closeTs < nowTs && (!listingTs || nowTs < listingTs);
        });
      } else if (targetStatus === 'LISTED') {
        formattedIPOs = formattedIPOs.filter((i) => {
          const listingTs = i.listingDate ? new Date(i.listingDate).getTime() : null;
          return listingTs ? listingTs <= nowTs : i.status === 'LISTED';
        });
      } else {
        formattedIPOs = formattedIPOs.filter((i) => i.status === targetStatus);
      }
    }

    return NextResponse.json({
      success: true,
      count: formattedIPOs.length,
      data: formattedIPOs,
    });
  } catch (error: any) {
    console.error('Error fetching IPOs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch IPO listings' },
      { status: 500 }
    );
  }
}
