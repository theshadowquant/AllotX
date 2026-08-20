import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdHeader = req.headers.get('x-user-id');
    const userIdParam = searchParams.get('userId');
    const userId = userIdParam || userIdHeader || 'user-a';

    const groups = await db.iPOApplicationGroup.findMany({
      where: { userId },
      include: {
        ipo: {
          include: { registrar: true },
        },
        applicants: {
          include: {
            checks: {
              orderBy: { checkedAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedGroups = groups.map((g) => ({
      id: g.id,
      name: g.name,
      ipo: {
        id: g.ipo.id,
        name: g.ipo.name,
        symbol: g.ipo.symbol,
        marketType: g.ipo.marketType,
        status: g.ipo.status,
        registrarCode: g.ipo.registrar.code,
        registrarName: g.ipo.registrar.name,
        officialUrl: g.ipo.registrar.officialUrl,
      },
      applicants: g.applicants.map((a) => {
        const lastCheck = a.checks[0] || null;
        return {
          id: a.id,
          name: a.name,
          panMasked: a.panMasked,
          status: a.status,
          sharesAllotted: a.sharesAllotted,
          lotsAllotted: a.lotsAllotted,
          applicationNumber: a.applicationNumber,
          verificationSource: a.verificationSource || g.ipo.registrar.code,
          lastCheckedAt: a.lastCheckedAt ? a.lastCheckedAt.toISOString() : null,
          lastErrorMessage: a.lastErrorMessage,
          officialUrl: g.ipo.registrar.officialUrl,
          lastCheckMeta: lastCheck
            ? {
                durationMs: lastCheck.durationMs,
                errorCode: lastCheck.errorCode,
              }
            : null,
        };
      }),
    }));

    return NextResponse.json({
      success: true,
      data: formattedGroups,
    });
  } catch (error: any) {
    console.error('Error fetching IPO groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application groups' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, ipoId, userId: bodyUserId } = body;

    const userIdHeader = req.headers.get('x-user-id');
    const userId = bodyUserId || userIdHeader || 'user-a';

    if (!name || !ipoId) {
      return NextResponse.json(
        { success: false, error: 'Group name and ipoId are required' },
        { status: 400 }
      );
    }

    const newGroup = await db.iPOApplicationGroup.create({
      data: {
        userId,
        ipoId,
        name: name.trim(),
      },
      include: {
        ipo: { include: { registrar: true } },
        applicants: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newGroup,
    });
  } catch (error: any) {
    console.error('Error creating application group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create application group' },
      { status: 500 }
    );
  }
}
