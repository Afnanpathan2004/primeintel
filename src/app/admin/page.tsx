import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency, formatCurrencyRange } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [estimates, activeVersion, servicesCount, benchmarksCount] = await Promise.all([
    prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        pricingVersion: { select: { version: true } },
      },
    }),
    prisma.pricingVersion.findFirst({
      where: { status: 'ACTIVE' },
    }),
    prisma.service.count({ where: { active: true } }),
    prisma.marketBenchmark.count({ where: { status: 'VERIFIED' } }),
  ]);

  const totalEstimates = await prisma.estimate.count();
  const totalValue = estimates.reduce((acc, curr) => acc + curr.finalPrice, 0);
  const avgValue = totalEstimates > 0 ? Math.round(totalValue / totalEstimates) : 0;
  const approvedCount = estimates.filter((e) => e.status === 'APPROVED' || e.status === 'CLOSED').length;
  const inReviewCount = estimates.filter((e) => e.status === 'REVIEWED' || e.status === 'CALCULATED').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header & Operational Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight">
            Estimation Operations Overview
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Internal workbench for requirement extraction, deterministic pricing, and client proposals.
          </p>
        </div>

        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shrink-0 shadow-none"
        >
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </Link>
      </div>

      {/* System Warning if No Active Pricing */}
      {!activeVersion && (
        <div className="p-3.5 rounded bg-accent-subtle border border-accent/30 text-accent text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Action Required: No Active Pricing Version</span>
            <p className="text-accent/90 mt-0.5 leading-relaxed">
              Calculations cannot proceed without an active pricing baseline. Activate a pricing version in{' '}
              <Link href="/admin/pricing" className="underline font-semibold hover:text-accent-hover">
                Commercial Pricing Rules
              </Link>{' '}
              prior to evaluating estimates.
            </p>
          </div>
        </div>
      )}

      {/* Subtle Operational Metric Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Total Estimates
          </div>
          <div className="text-2xl font-bold text-ink mt-1.5 tabular-nums">
            {totalEstimates}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            {totalEstimates === 0 ? '0 recorded in registry' : `${inReviewCount} pending review`}
          </div>
        </div>

        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Average Estimate
          </div>
          <div className="text-2xl font-bold text-ink mt-1.5 tabular-nums font-mono">
            {avgValue > 0 ? formatCompactCurrency(avgValue) : '—'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            {totalEstimates === 0 ? 'Awaiting initial record' : 'Across calculated proposals'}
          </div>
        </div>

        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Commercial Baseline
          </div>
          <div className="text-2xl font-bold text-primary mt-1.5 font-mono">
            {activeVersion ? `v${activeVersion.version}` : 'None'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            {servicesCount} active services configured
          </div>
        </div>

        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Verified Benchmarks
          </div>
          <div className="text-2xl font-bold text-ink mt-1.5 tabular-nums">
            {benchmarksCount}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            Industry reference points
          </div>
        </div>
      </div>

      {/* Two-Column Operations Layout: Recent Estimates + System Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Recent Estimates Table (8 cols) */}
        <div className="lg:col-span-8 bg-surface rounded border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wider">
                Recent Estimates
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Calculated proposals with immutable snapshot history.
              </p>
            </div>
            {totalEstimates > 0 && (
              <Link
                href="/admin/estimates"
                className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                <span>View all ({totalEstimates})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {estimates.length === 0 ? (
            <div className="py-16 text-center px-4">
              <FileSpreadsheet className="w-8 h-8 text-ink-faint mx-auto mb-2" />
              <div className="text-xs font-semibold text-ink">No estimates yet</div>
              <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1 mb-4">
                Input genuine client project requirements to initiate the estimation pipeline.
              </p>
              <Link
                href="/admin/estimates/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Estimate</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle text-ink-muted border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">ID</th>
                    <th className="py-2.5 px-4">Client / Company</th>
                    <th className="py-2.5 px-4 text-right">Value</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-ink">
                  {estimates.map((est) => {
                    const isApproved = est.status === 'APPROVED' || est.status === 'CLOSED';
                    const isWarning = est.status === 'CANCELLED';

                    return (
                      <tr key={est.id} className="hover:bg-subtle transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-primary text-[11px]">
                          <Link href={`/admin/estimates/${est.id}`} className="hover:underline">
                            {est.estimateNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink text-xs">{est.companyName}</div>
                          <div className="text-[11px] text-ink-muted">{est.customerName}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-ink tabular-nums text-xs">
                          {formatCurrency(est.finalPrice, est.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                              isApproved
                                ? 'bg-primary-subtle text-primary border border-primary/20'
                                : isWarning
                                ? 'bg-accent-subtle text-accent border border-accent/20'
                                : 'bg-subtle text-ink-muted border border-border'
                            }`}
                          >
                            {est.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/estimates/${est.id}`}
                            className="inline-flex items-center gap-1 text-[11px] text-ink hover:text-primary font-medium transition-colors"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Operational Status / Needs Attention (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface rounded border border-border p-4 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="font-semibold text-ink text-xs uppercase tracking-wider">
                Operational Status
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                System configuration integrity check.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2 p-2 rounded bg-subtle border border-border/60">
                <div>
                  <div className="font-medium text-ink">Pricing Baseline</div>
                  <div className="text-[11px] text-ink-muted">
                    {activeVersion ? `Active: Version ${activeVersion.version}` : 'No active version set'}
                  </div>
                </div>
                {activeVersion ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                )}
              </div>

              <div className="flex items-start justify-between gap-2 p-2 rounded bg-subtle border border-border/60">
                <div>
                  <div className="font-medium text-ink">Market Benchmarks</div>
                  <div className="text-[11px] text-ink-muted">
                    {benchmarksCount > 0 ? `${benchmarksCount} verified sources` : '0 verified references'}
                  </div>
                </div>
                {benchmarksCount > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <span className="text-[10px] text-ink-muted font-mono">Unverified</span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2 p-2 rounded bg-subtle border border-border/60">
                <div>
                  <div className="font-medium text-ink">Calculation Engine</div>
                  <div className="text-[11px] text-ink-muted">
                    Deterministic Pure TypeScript
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/admin/pricing"
                className="block text-center text-xs font-medium py-1.5 rounded border border-border hover:bg-subtle text-ink transition-colors"
              >
                Configure Pricing Engine
              </Link>
            </div>
          </div>

          {/* Quick Help / Operational Protocol */}
          <div className="bg-surface rounded border border-border p-4 text-xs space-y-2">
            <div className="font-semibold text-ink text-[11px] uppercase tracking-wider">
              Estimation Protocol
            </div>
            <p className="text-[11px] text-ink-muted leading-relaxed">
              1. Paste genuine client requirement brief.<br />
              2. Review extracted scope and missing details.<br />
              3. Evaluate against market benchmark envelope.<br />
              4. Export customer proposal or audit breakdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
