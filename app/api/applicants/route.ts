import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptPAN, isValidPAN, maskPAN } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { groupId, name, pan } = body;

    if (!groupId || !name || !pan) {
      return NextResponse.json(
        { success: false, error: 'Group ID, applicant name, and PAN are required' },
        { status: 400 }
      );
    }

    const cleanPan = pan.trim().toUpperCase();

    if (!isValidPAN(cleanPan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid PAN format. PAN must be 10 characters (e.g. CPRPT3173B)' },
        { status: 400 }
      );
    }

    // Encrypt PAN at rest using AES-256-GCM
    const encryptedPan = encryptPAN(cleanPan);
    const panMasked = maskPAN(cleanPan);

    const newApplicant = await db.applicant.create({
      data: {
        groupId,
        name: name.trim(),
        encryptedPan,
        panMasked,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newApplicant.id,
        groupId: newApplicant.groupId,
        name: newApplicant.name,
        panMasked: newApplicant.panMasked,
        status: newApplicant.status,
        sharesAllotted: newApplicant.sharesAllotted,
        createdAt: newApplicant.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error adding applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add applicant' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Applicant ID is required' },
        { status: 400 }
      );
    }

    await db.applicant.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Applicant removed successfully',
    });
  } catch (error: any) {
    console.error('Error deleting applicant:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove applicant' },
      { status: 500 }
    );
  }
}
