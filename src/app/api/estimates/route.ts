import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    const currentUser = await getCurrentUser();
    const actorEmail = currentUser?.email || 'estimator@primecoreinfo.com';

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

    // 1. Resolve Active Pricing Version (Section 13, 14, 47)
    const activeVersion = await prisma.pricingVersion.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'Cannot record estimate: No active pricing version is configured in the system.' },
        { status: 400 }
      );
    }

    // 2. Validate Override Reason (Section 31)
    if (calculationResult.adminOverride?.overridePrice && !overrideReason && !calculationResult.adminOverride.reason) {
      return NextResponse.json(
        { error: 'A justification reason is required when setting an admin price override.' },
        { status: 400 }
      );
    }

    // 3. Generate Next Estimate Number (e.g. PC-2026-0001)
    const count = await prisma.estimate.count();
    const sequence = String(count + 1).padStart(4, '0');
    const year = new Date().getFullYear();
    const estimateNumber = `PC-${year}-${sequence}`;

    // 4. Atomic Transaction: Persist Estimate + Audit Log (Section 35)
    const estimate = await prisma.$transaction(async (tx) => {
      const created = await tx.estimate.create({
        data: {
          estimateNumber,
          revisionNumber: 1,
          customerName: customerName.trim(),
          companyName: companyName.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          website: website?.trim() || null,
          rawRequirement: rawRequirement || '',
          structuredRequirement: JSON.stringify(structuredRequirement || {}),
          pricingVersionId: activeVersion.id,
          pricingSnapshot: activeVersion.configSnapshot, // Frozen snapshot of rules
          status: 'CALCULATED',
          currency: activeVersion.currency || 'INR',
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
          createdBy: actorEmail,
        },
      });

      // Append-only audit record
      await tx.auditLog.create({
        data: {
          actor: actorEmail,
          action: 'CREATE',
          entity: 'ESTIMATE',
          entityId: created.id,
          newValue: JSON.stringify({
            estimateNumber,
            customer: customerName,
            company: companyName,
            finalPrice: calculationResult.finalPrice,
            discount: calculationResult.discount.totalDiscountAmount,
            override: calculationResult.adminOverride?.overridePrice || null,
          }),
          reason: overrideReason || 'Estimate generated from requirement analysis',
        },
      });

      return created;
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
