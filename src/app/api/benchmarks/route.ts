import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
      assumptions,
      notes,
    } = body;

    if (!serviceKey || !lowPrice || !highPrice || !sourceName || !scopeDescription) {
      return NextResponse.json(
        { error: 'Service key, low/high price, source name, and scope description are required' },
        { status: 400 }
      );
    }

    const benchmark = await prisma.marketBenchmark.create({
      data: {
        serviceKey,
        region,
        currency,
        lowPrice: Number(lowPrice),
        highPrice: Number(highPrice),
        sourceName,
        sourceUrl: sourceUrl || null,
        scopeDescription,
        confidence,
        assumptions: assumptions || null,
        notes: notes || null,
        active: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'PRICING_RULE',
        entityId: benchmark.id,
        action: 'CREATE',
        performedBy: 'PrimeCore Admin',
        newValue: JSON.stringify(benchmark),
        reason: `Created new market benchmark data for ${serviceKey} (${region})`,
      },
    });

    return NextResponse.json({ success: true, data: benchmark });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
