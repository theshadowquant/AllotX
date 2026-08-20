import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { allotmentQueueWorker } from '@/lib/worker/allotmentQueue';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const applicant = await db.applicant.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            ipo: {
              include: { registrar: true },
            },
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, error: 'Applicant record not found' },
        { status: 404 }
      );
    }

    // Set state to CHECKING immediately
    await db.applicant.update({
      where: { id },
      data: { status: 'CHECKING' },
    });

    // Execute check via allotmentQueueWorker (which updates DB & writes to AllotmentCheck history table)
    const result = await allotmentQueueWorker.processApplicantCheck({
      applicantId: applicant.id,
      groupId: applicant.groupId,
      ipoId: applicant.group.ipo.id,
      ipoName: applicant.group.ipo.name,
      ipoSymbol: applicant.group.ipo.symbol,
      panEncrypted: applicant.encryptedPan,
      registrarCode: applicant.group.ipo.registrar.code,
    });

    return NextResponse.json({
      success: true,
      data: {
        applicantId: applicant.id,
        status: result.status,
        sharesAllotted: result.sharesAllotted,
        lotsAllotted: result.lotsAllotted,
        applicationNumber: result.applicationNumber,
        checkedAt: result.checkedAt,
        verificationSource: result.source,
        officialUrl: result.officialUrl || applicant.group.ipo.registrar.officialUrl,
        message: result.message,
        errorCode: result.errorCode,
      },
    });
  } catch (error: any) {
    console.error('Error executing single applicant allotment check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete allotment status check' },
      { status: 500 }
    );
  }
}
