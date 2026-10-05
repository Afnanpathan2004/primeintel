import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DEFAULT_PRICING_CONFIG } from '@/lib/pricing/defaults';

export async function GET(req: NextRequest) {
  try {
    const estimates = await prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pricingVersion: {
          select: { version: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: estimates });
  } catch (error: any) {
    console.error('[API:estimates GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estimates', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      companyName,
      email,
      phone,
      website,
      rawRequirement,
      structuredRequirement,
      calculationResult,
      overrideReason,
      internalNotes,
    } = body;

    if (!customerName || !companyName || !calculationResult) {
      return NextResponse.json(
        { error: 'Customer name, company name, and calculation result are required' },
        { status: 400 }
      );
    }

    // 1. Resolve Active Pricing Version
    let activeVersion = await prisma.pricingVersion.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeVersion) {
      activeVersion = await prisma.pricingVersion.create({
        data: {
          version: '2026.10.01',
          description: 'Default PrimeCore Pricing Model',
          isActive: true,
          configSnapshot: JSON.stringify(DEFAULT_PRICING_CONFIG),
        },
      });
    }

    // 2. Generate Next Estimate Number (e.g. PC-2026-0001)
    const count = await prisma.estimate.count();
    const sequence = String(count + 1).padStart(4, '0');
    const year = new Date().getFullYear();
    const estimateNumber = `PC-${year}-${sequence}`;

    // 3. Persist Estimate with Frozen Pricing Snapshot
    const estimate = await prisma.estimate.create({
      data: {
        estimateNumber,
        customerName,
        companyName,
        email: email || null,
        phone: phone || null,
        website: website || null,
        rawRequirement: rawRequirement || '',
        structuredRequirement: JSON.stringify(structuredRequirement || {}),
        pricingVersionId: activeVersion.id,
        pricingSnapshot: activeVersion.configSnapshot, // Frozen snapshot of rules
        status: 'GENERATED',
        calculatedBasePrice: calculationResult.scaledBasePrice,
        calculatedAddOnsTotal: calculationResult.addOnsTotal,
        calculatedSubtotal: calculationResult.subtotal,
        discountPercentage: calculationResult.discount.requestedPercentage,
        discountAmount: calculationResult.discount.totalDiscountAmount,
        adminOverridePrice: calculationResult.adminOverride?.overridePrice || null,
        overrideReason: overrideReason || calculationResult.adminOverride?.reason || null,
        finalPrice: calculationResult.finalPrice,
        indicativeLow: calculationResult.indicativeLow,
        indicativeHigh: calculationResult.indicativeHigh,
        timelineWeeksMin: calculationResult.timelineWeeks.min,
        timelineWeeksMax: calculationResult.timelineWeeks.max,
        assumptions: JSON.stringify(structuredRequirement?.assumptions || []),
        unknowns: JSON.stringify(structuredRequirement?.unknowns || []),
        calculationBreakdown: JSON.stringify(calculationResult.breakdownSummary || []),
        benchmarkComparison: calculationResult.benchmarkComparison
          ? JSON.stringify(calculationResult.benchmarkComparison)
          : null,
        internalNotes: internalNotes || null,
        createdBy: 'PrimeCore Estimator',
      },
    });

    // 4. Create Audit Log Entry
    await prisma.auditLog.create({
      data: {
        entityType: 'ESTIMATE',
        entityId: estimate.id,
        action: 'CREATE',
        performedBy: 'PrimeCore Estimator',
        newValue: JSON.stringify({
          estimateNumber,
          customer: customerName,
          company: companyName,
          finalPrice: calculationResult.finalPrice,
          discount: calculationResult.discount.totalDiscountAmount,
          override: calculationResult.adminOverride?.overridePrice || null,
        }),
        reason: overrideReason || 'Initial estimate generation from requirement analysis',
      },
    });

    return NextResponse.json({ success: true, data: estimate });
  } catch (error: any) {
    console.error('[API:estimates POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create estimate', details: error.message },
      { status: 500 }
    );
  }
}
