import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [services, multipliers, addOns, benchmarks, versions] = await Promise.all([
      prisma.service.findMany({ orderBy: { name: 'asc' } }),
      prisma.pricingMultiplier.findMany({ orderBy: [{ category: 'asc' }, { multiplier: 'asc' }] }),
      prisma.addOn.findMany({ orderBy: { name: 'asc' } }),
      prisma.marketBenchmark.findMany({ orderBy: { serviceKey: 'asc' } }),
      prisma.pricingVersion.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        services,
        multipliers,
        addOns,
        benchmarks,
        versions,
      },
    });
  } catch (error: any) {
    console.error('[API:pricing GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_VERSION') {
      const { version, description } = body;
      if (!version) {
        return NextResponse.json({ error: 'Version name is required' }, { status: 400 });
      }

      // Gather current state of services, multipliers, addOns, benchmarks
      const [services, multipliers, addOns, benchmarks] = await Promise.all([
        prisma.service.findMany(),
        prisma.pricingMultiplier.findMany(),
        prisma.addOn.findMany(),
        prisma.marketBenchmark.findMany(),
      ]);

      const snapshotJson = JSON.stringify({
        version,
        description: description || `Pricing snapshot version ${version}`,
        maxDiscountPercentage: 20,
        spreadPercentage: 0.08,
        services,
        multipliers,
        addOns,
        benchmarks,
      });

      // Deactivate older active versions
      await prisma.pricingVersion.updateMany({
        data: { isActive: false },
      });

      const newVersion = await prisma.pricingVersion.create({
        data: {
          version,
          description: description || `Pricing snapshot version ${version}`,
          isActive: true,
          configSnapshot: snapshotJson,
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: 'PRICING_RULE',
          entityId: newVersion.id,
          action: 'CREATE',
          performedBy: 'PrimeCore Admin',
          newValue: JSON.stringify({ version, description }),
          reason: `Created and activated new pricing version snapshot: ${version}`,
        },
      });

      return NextResponse.json({ success: true, data: newVersion });
    }

    if (action === 'UPDATE_SERVICE') {
      const { id, basePrice, minPrice, maxPrice, active } = body;
      const oldService = await prisma.service.findUnique({ where: { id } });

      const updated = await prisma.service.update({
        where: { id },
        data: {
          ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
          ...(minPrice !== undefined ? { minPrice: Number(minPrice) } : {}),
          ...(maxPrice !== undefined ? { maxPrice: Number(maxPrice) } : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: 'PRICING_RULE',
          entityId: id,
          action: 'UPDATE',
          performedBy: 'PrimeCore Admin',
          oldValue: JSON.stringify(oldService),
          newValue: JSON.stringify(updated),
          reason: `Updated base commercial pricing bounds for service '${updated.name}'`,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'UPDATE_MULTIPLIER') {
      const { id, multiplier, active } = body;
      const oldMult = await prisma.pricingMultiplier.findUnique({ where: { id } });

      const updated = await prisma.pricingMultiplier.update({
        where: { id },
        data: {
          ...(multiplier !== undefined ? { multiplier: Number(multiplier) } : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: 'PRICING_RULE',
          entityId: id,
          action: 'UPDATE',
          performedBy: 'PrimeCore Admin',
          oldValue: JSON.stringify(oldMult),
          newValue: JSON.stringify(updated),
          reason: `Updated multiplier factor for '${updated.label}' to ×${updated.multiplier}`,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'UPDATE_ADDON') {
      const { id, value, active } = body;
      const oldAddOn = await prisma.addOn.findUnique({ where: { id } });

      const updated = await prisma.addOn.update({
        where: { id },
        data: {
          ...(value !== undefined ? { value: Number(value) } : {}),
          ...(active !== undefined ? { active: Boolean(active) } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: 'PRICING_RULE',
          entityId: id,
          action: 'UPDATE',
          performedBy: 'PrimeCore Admin',
          oldValue: JSON.stringify(oldAddOn),
          newValue: JSON.stringify(updated),
          reason: `Updated add-on value for '${updated.name}' to ${updated.value}`,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Unrecognized action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API:pricing POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to modify pricing configuration', details: error.message },
      { status: 500 }
    );
  }
}
