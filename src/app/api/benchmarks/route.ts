import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const benchmarks = await prisma.marketBenchmark.findMany({
      orderBy: { serviceKey: 'asc' },
    });
    return NextResponse.json({ success: true, data: benchmarks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const actorEmail = currentUser?.email || 'admin@primecoreinfo.com';

    if (currentUser && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Adding benchmarks requires ADMIN or SUPER_ADMIN role.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      serviceKey,
      region = 'India',
      currency = 'INR',
      lowPrice,
      highPrice,
      sourceName,
      sourceUrl,
      scopeDescription,
      confidence = 'Medium',
      status = 'VERIFIED',
      assumptions,
      notes,
    } = body;

    if (!serviceKey || !lowPrice || !highPrice || !sourceName || !scopeDescription) {
      return NextResponse.json(
        { error: 'Service key, low/high price, source name, and scope description are required' },
        { status: 400 }
      );
    }

    const benchmark = await prisma.$transaction(async (tx) => {
      const b = await tx.marketBenchmark.create({
        data: {
          serviceKey,
          region,
          currency,
          lowPrice: Number(lowPrice),
          highPrice: Number(highPrice),
          sourceName: sourceName.trim(),
          sourceUrl: sourceUrl?.trim() || null,
          scopeDescription: scopeDescription.trim(),
          confidence,
          status,
          assumptions: assumptions?.trim() || null,
          notes: notes?.trim() || null,
          active: true,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: actorEmail,
          action: 'CREATE',
          entity: 'BENCHMARK',
          entityId: b.id,
          newValue: JSON.stringify(b),
          reason: `Recorded verified market benchmark for ${serviceKey} (${region})`,
        },
      });

      return b;
    });

    return NextResponse.json({ success: true, data: benchmark });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
