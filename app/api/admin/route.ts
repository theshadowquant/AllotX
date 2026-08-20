import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const registrars = await db.registrar.findMany({
      orderBy: { name: 'asc' },
    });

    const recentChecks = await db.allotmentCheck.findMany({
      take: 15,
      orderBy: { checkedAt: 'desc' },
      include: {
        applicant: { select: { name: true, panMasked: true } },
        ipo: { select: { name: true, symbol: true } },
      },
    });

    const totalIPOs = await db.iPO.count();
    const totalApplicants = await db.applicant.count();
    const totalChecks = await db.allotmentCheck.count();

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalIPOs,
          totalApplicants,
          totalChecks,
        },
        registrars: registrars.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          officialUrl: r.officialUrl,
          active: r.active,
          healthStatus: r.healthStatus,
        })),
        recentChecks: recentChecks.map((c) => ({
          id: c.id,
          applicantName: c.applicant.name,
          panMasked: c.applicant.panMasked,
          ipoName: c.ipo.name,
          registrarCode: c.registrarCode,
          status: c.status,
          durationMs: c.durationMs,
          errorCode: c.errorCode,
          checkedAt: c.checkedAt.toISOString(),
        })),
        dataProvider: process.env.DATA_PROVIDER || 'production',
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ipoData, registrarCode, healthStatus } = body;

    if (action === 'update_registrar_health') {
      if (!registrarCode || !healthStatus) {
        return NextResponse.json(
          { success: false, error: 'registrarCode and healthStatus required' },
          { status: 400 }
        );
      }

      await db.registrar.update({
        where: { code: registrarCode },
        data: { healthStatus },
      });

      return NextResponse.json({
        success: true,
        message: `Registrar ${registrarCode} health updated to ${healthStatus}`,
      });
    }

    if (action === 'create_ipo') {
      const { name, symbol, marketType, status, priceLow, priceHigh, lotSize, issueSize, registrarCode } = ipoData;

      const registrar = await db.registrar.findUnique({ where: { code: registrarCode } });
      if (!registrar) {
        return NextResponse.json({ success: false, error: 'Invalid registrar code' }, { status: 400 });
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-ipo';
      const minInvestment = (priceHigh || priceLow || 100) * (lotSize || 1);

      const newIPO = await db.iPO.create({
        data: {
          name,
          symbol: symbol.toUpperCase(),
          slug,
          marketType: marketType || 'MAINBOARD',
          status: status || 'UPCOMING',
          priceLow: parseFloat(priceLow),
          priceHigh: parseFloat(priceHigh),
          lotSize: parseInt(lotSize),
          minInvestment,
          issueSize: issueSize || '₹500 Cr',
          openDate: new Date(),
          closeDate: new Date(Date.now() + 3 * 86400000),
          allotmentDate: new Date(Date.now() + 4 * 86400000),
          listingDate: new Date(Date.now() + 7 * 86400000),
          registrarId: registrar.id,
        },
      });

      return NextResponse.json({ success: true, data: newIPO });
    }

    return NextResponse.json({ success: false, error: 'Unknown admin action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing admin action:', error);
    return NextResponse.json(
      { success: false, error: 'Admin action failed' },
      { status: 500 }
    );
  }
}
