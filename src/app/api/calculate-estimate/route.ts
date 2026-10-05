import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateEstimate } from '@/lib/pricing/engine';
import { DEFAULT_PRICING_CONFIG } from '@/lib/pricing/defaults';
import { PricingConfigurationSnapshot } from '@/lib/pricing/types';

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
    let configSnapshot: PricingConfigurationSnapshot = DEFAULT_PRICING_CONFIG;

    if (pricingVersionId) {
      const dbVersion = await prisma.pricingVersion.findUnique({
        where: { id: pricingVersionId },
      });
      if (dbVersion && dbVersion.configSnapshot) {
        configSnapshot = JSON.parse(dbVersion.configSnapshot);
      }
    } else {
      const activeVersion = await prisma.pricingVersion.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (activeVersion && activeVersion.configSnapshot) {
        configSnapshot = JSON.parse(activeVersion.configSnapshot);
      }
    }

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
