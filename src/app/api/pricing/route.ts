import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

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
    const currentUser = await getCurrentUser();
    const actorEmail = currentUser?.email || 'admin@primecoreinfo.com';

    // Server-side authorization check (Section 10, 11)
    if (currentUser && !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Pricing configuration requires ADMIN or SUPER_ADMIN role.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'CREATE_VERSION') {
      const { version, description, maxDiscountPercentage = 20, spreadPercentage = 0.08, currency = 'INR' } = body;
      if (!version) {
        return NextResponse.json({ error: 'Version name is required' }, { status: 400 });
      }

      // Gather current state of services, multipliers, addOns, benchmarks
      const [services, multipliers, addOns, benchmarks] = await Promise.all([
        prisma.service.findMany(),
        prisma.pricingMultiplier.findMany(),
        prisma.addOn.findMany(),
        prisma.marketBenchmark.findMany({ where: { status: 'VERIFIED' } }),
      ]);

      const snapshotJson = JSON.stringify({
        version,
        description: description || `Pricing snapshot version ${version}`,
        maxDiscountPercentage: Number(maxDiscountPercentage),
        spreadPercentage: Number(spreadPercentage),
        currency,
        services,
        multipliers,
        addOns,
        benchmarks,
      });

      // Atomic transition: Archive previous active versions and activate new
      const newVersion = await prisma.$transaction(async (tx) => {
        await tx.pricingVersion.updateMany({
          where: { status: 'ACTIVE' },
          data: { status: 'ARCHIVED', isActive: false },
        });

        const created = await tx.pricingVersion.create({
          data: {
            version,
            description: description || `Pricing snapshot version ${version}`,
            status: 'ACTIVE',
            isActive: true,
            maxDiscountPercentage: Number(maxDiscountPercentage),
            spreadPercentage: Number(spreadPercentage),
            currency,
            configSnapshot: snapshotJson,
            createdBy: actorEmail,
            approvedBy: actorEmail,
            approvedAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            actor: actorEmail,
            action: 'CREATE',
            entity: 'PRICING_VERSION',
            entityId: created.id,
            newValue: JSON.stringify({ version, description, currency }),
            reason: `Created and approved active pricing snapshot v${version}`,
          },
        });

        return created;
      });

      return NextResponse.json({ success: true, data: newVersion });
    }

    if (action === 'UPDATE_SERVICE') {
      const { id, basePrice, minPrice, maxPrice, active } = body;
      const oldService = await prisma.service.findUnique({ where: { id } });

      const updated = await prisma.$transaction(async (tx) => {
        const s = await tx.service.update({
          where: { id },
          data: {
            ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
            ...(minPrice !== undefined ? { minPrice: Number(minPrice) } : {}),
            ...(maxPrice !== undefined ? { maxPrice: Number(maxPrice) } : {}),
            ...(active !== undefined ? { active: Boolean(active) } : {}),
          },
        });

        await tx.auditLog.create({
          data: {
            actor: actorEmail,
            action: 'UPDATE',
            entity: 'SERVICE',
            entityId: id,
            oldValue: JSON.stringify(oldService),
            newValue: JSON.stringify(s),
            reason: `Updated commercial catalog rates for '${s.name}'`,
          },
        });

        return s;
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'UPDATE_MULTIPLIER') {
      const { id, multiplier, active } = body;
      const oldMult = await prisma.pricingMultiplier.findUnique({ where: { id } });

      const updated = await prisma.$transaction(async (tx) => {
        const m = await tx.pricingMultiplier.update({
          where: { id },
          data: {
            ...(multiplier !== undefined ? { multiplier: Number(multiplier) } : {}),
            ...(active !== undefined ? { active: Boolean(active) } : {}),
          },
        });

        await tx.auditLog.create({
          data: {
            actor: actorEmail,
            action: 'UPDATE',
            entity: 'MULTIPLIER',
            entityId: id,
            oldValue: JSON.stringify(oldMult),
            newValue: JSON.stringify(m),
            reason: `Updated multiplier factor for '${m.label}' to ×${m.multiplier}`,
          },
        });

        return m;
      });

      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'UPDATE_ADDON') {
      const { id, value, active } = body;
      const oldAddOn = await prisma.addOn.findUnique({ where: { id } });

      const updated = await prisma.$transaction(async (tx) => {
        const a = await tx.addOn.update({
          where: { id },
          data: {
            ...(value !== undefined ? { value: Number(value) } : {}),
            ...(active !== undefined ? { active: Boolean(active) } : {}),
          },
        });

        await tx.auditLog.create({
          data: {
            actor: actorEmail,
            action: 'UPDATE',
            entity: 'ADDON',
            entityId: id,
            oldValue: JSON.stringify(oldAddOn),
            newValue: JSON.stringify(a),
            reason: `Updated add-on value for '${a.name}' to ${a.value}`,
          },
        });

        return a;
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
