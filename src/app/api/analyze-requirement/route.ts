import { NextRequest, NextResponse } from 'next/server';
import { defaultAnalyzer } from '@/lib/ai/analyzer';

export const dynamic = 'force-dynamic';

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

    // Cost & Denial-of-Service Guardrail: Cap input length to 6,000 characters (Section 26)
    if (requirement.length > 6000) {
      return NextResponse.json(
        { error: 'Customer requirement exceeds maximum allowed length of 6,000 characters.' },
        { status: 400 }
      );
    }

    // Process extraction with timeout guard
    const structured = await defaultAnalyzer.analyze(requirement);
    return NextResponse.json({ success: true, data: structured });
  } catch (error: any) {
    console.error('[API:analyze-requirement] Error:', error);
    return NextResponse.json(
      {
        error: 'Requirement analysis failed. You can adjust parameters manually in the review panel.',
        details: error?.message || 'Internal analysis error',
      },
      { status: 500 }
    );
  }
}
