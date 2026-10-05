import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateEstimate } from '@/lib/pricing/engine';
import { PricingConfigurationSnapshot } from '@/lib/pricing/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceKey,
      environmentCode,
      scaleCode,
      complexityCode,
      timelineCode,
      addOnCodes = [],
      discountPercentage = 0,
      discountFixed = 0,
      adminOverridePrice,
      overrideReason,
      pricingVersionId,
    } = body;

    // Load active or requested pricing version snapshot
    let dbVersion = null;
    if (pricingVersionId) {
      dbVersion = await prisma.pricingVersion.findUnique({
        where: { id: pricingVersionId },
      });
    } else {
      dbVersion = await prisma.pricingVersion.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!dbVersion || !dbVersion.configSnapshot) {
      return NextResponse.json(
        {
          error: 'Pricing is not configured. An administrator must activate a pricing configuration before estimates can be calculated.',
        },
        { status: 400 }
      );
    }

    const configSnapshot: PricingConfigurationSnapshot = JSON.parse(dbVersion.configSnapshot);

    const result = calculateEstimate(
      {
        serviceKey: serviceKey || 'cloud-migration',
        environmentCode: environmentCode || 'aws',
        scaleCode: scaleCode || '26_50',
        complexityCode: complexityCode || 'medium',
        timelineCode: timelineCode || 'standard',
        addOnCodes: Array.isArray(addOnCodes) ? addOnCodes : [],
        discountPercentage: Number(discountPercentage) || 0,
        discountFixed: Number(discountFixed) || 0,
        adminOverridePrice:
          adminOverridePrice && Number(adminOverridePrice) > 0
            ? Number(adminOverridePrice)
            : undefined,
        overrideReason: overrideReason || undefined,
      },
      configSnapshot
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API:calculate-estimate] Error:', error);
    return NextResponse.json(
      {
        error: 'The estimate could not be calculated. No estimate has been finalized.',
        details: error?.message || 'Pricing engine error',
      },
      { status: 400 }
    );
  }
}
