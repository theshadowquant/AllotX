import { NextRequest, NextResponse } from 'next/server';
import { runAutomatedDataIngestion } from '@/lib/ingestion/ingestionOrchestrator';

export async function GET(req: NextRequest) {
  return handleCronIngestion(req);
}

export async function POST(req: NextRequest) {
  return handleCronIngestion(req);
}

async function handleCronIngestion(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET || 'allotx-cron-secret-key';

    // Verify cron authorization secret if set in production
    const isAuthorized =
      !process.env.CRON_SECRET ||
      secretParam === cronSecret ||
      authHeader === `Bearer ${cronSecret}`;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized cron request' },
        { status: 401 }
      );
    }

    const summary = await runAutomatedDataIngestion();

    return NextResponse.json({
      success: summary.success,
      message: 'Automated data ingestion cycle executed successfully',
      data: summary,
    });
  } catch (error: any) {
    console.error('Error in cron ingestion route:', error);
    return NextResponse.json(
      { success: false, error: 'Cron execution failed', details: error.message },
      { status: 500 }
    );
  }
}
