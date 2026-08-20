import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = 'default-user';

    const items = await db.watchlist.findMany({
      where: { userId },
      include: {
        ipo: {
          include: {
            gmpHistory: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((w) => {
      const latestGMP = w.ipo.gmpHistory[0] || null;
      return {
        id: w.id,
        ipoId: w.ipo.id,
        name: w.ipo.name,
        slug: w.ipo.slug,
        symbol: w.ipo.symbol,
        marketType: w.ipo.marketType,
        status: w.ipo.status,
        openDate: w.ipo.openDate.toISOString(),
        closeDate: w.ipo.closeDate.toISOString(),
        allotmentDate: w.ipo.allotmentDate.toISOString(),
        gmp: latestGMP
          ? {
              value: latestGMP.gmp,
              percent: latestGMP.gmpPercent,
              estimatedListing: latestGMP.estimatedListing,
              trend: latestGMP.trend,
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch watchlist' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ipoId } = body;

    if (!ipoId) {
      return NextResponse.json({ success: false, error: 'ipoId is required' }, { status: 400 });
    }

    const item = await db.watchlist.upsert({
      where: {
        userId_ipoId: {
          userId: 'default-user',
          ipoId,
        },
      },
      update: {},
      create: {
        userId: 'default-user',
        ipoId,
      },
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save to watchlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ipoId = searchParams.get('ipoId');

    if (!ipoId) {
      return NextResponse.json({ success: false, error: 'ipoId required' }, { status: 400 });
    }

    await db.watchlist.deleteMany({
      where: {
        userId: 'default-user',
        ipoId,
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from watchlist' });
  } catch (error: any) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from watchlist' },
      { status: 500 }
    );
  }
}
