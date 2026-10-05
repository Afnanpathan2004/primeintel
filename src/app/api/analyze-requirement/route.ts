import { NextRequest, NextResponse } from 'next/server';
import { defaultAnalyzer } from '@/lib/ai/analyzer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requirement } = body;

    if (!requirement || typeof requirement !== 'string' || requirement.trim().length === 0) {
      return NextResponse.json(
        { error: 'Requirement text is required' },
        { status: 400 }
      );
    }

    const structured = await defaultAnalyzer.analyze(requirement);
    return NextResponse.json({ success: true, data: structured });
  } catch (error: any) {
    console.error('[API:analyze-requirement] Error:', error);
    return NextResponse.json(
      {
        error: 'Requirement analysis failed. You can retry or adjust parameters manually.',
        details: error?.message || 'Internal analysis error',
      },
      { status: 500 }
    );
  }
}
