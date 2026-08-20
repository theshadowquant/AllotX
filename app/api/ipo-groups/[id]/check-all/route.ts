import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { allotmentQueueWorker } from '@/lib/worker/allotmentQueue';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const group = await db.iPOApplicationGroup.findUnique({
      where: { id },
      include: {
        ipo: { include: { registrar: true } },
        applicants: true,
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Application group not found' },
        { status: 404 }
      );
    }

    if (group.applicants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No applicants found in this group' },
        { status: 400 }
      );
    }

    // 1. Mark all applicants as CHECKING
    await db.applicant.updateMany({
      where: { groupId: group.id },
      data: { status: 'CHECKING' },
    });

    // 2. Queue all applicant tasks
    const tasks = group.applicants.map((a) => ({
      applicantId: a.id,
      groupId: group.id,
      ipoId: group.ipo.id,
      ipoName: group.ipo.name,
      ipoSymbol: group.ipo.symbol,
      panEncrypted: a.encryptedPan,
      registrarCode: group.ipo.registrar.code,
    }));

    // Trigger async processing in batch queue
    await allotmentQueueWorker.addGroupTasks(tasks);

    return NextResponse.json({
      success: true,
      message: `Batch check initiated for ${group.applicants.length} applicants`,
      queuedCount: group.applicants.length,
    });
  } catch (error: any) {
    console.error('Error initiating batch check:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate batch allotment check' },
      { status: 500 }
    );
  }
}
