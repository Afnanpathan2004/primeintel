import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  FileSpreadsheet,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatCurrencyRange } from '@/lib/currency';
import DatabaseErrorState from '@/components/admin/DatabaseErrorState';

export const dynamic = 'force-dynamic';

export default async function EstimatesListPage() {
  let estimates: any[] = [];
  try {
    estimates = await prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pricingVersion: { select: { version: true } },
      },
    });
  } catch (err: any) {
    console.error('[EstimatesListPage] Database query failure:', err?.message || err);
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
        <DatabaseErrorState />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
            Historical Registry
          </div>
          <h2 className="text-xl font-bold text-ink tracking-tight">
            Estimates Archive
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Immutable registry of generated estimates, client scopes, and calculation snapshots.
          </p>
        </div>

        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </Link>
      </div>

      {/* Structured Table */}
      <div className="bg-surface rounded border border-border overflow-hidden">
        {estimates.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-muted">
            <FileSpreadsheet className="w-8 h-8 text-ink-faint mx-auto mb-2" />
            <div className="font-semibold text-ink">No estimates recorded</div>
            <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1 mb-4">
              Enter customer requirements in the workbench to generate the first estimate proposal.
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
                  <th className="py-2.5 px-4">Estimate ID</th>
                  <th className="py-2.5 px-4">Client / Company</th>
                  <th className="py-2.5 px-4">Timeline</th>
                  <th className="py-2.5 px-4 text-right">Fee</th>
                  <th className="py-2.5 px-4">Indicative Range</th>
                  <th className="py-2.5 px-4">Pricing Snapshot</th>
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
                      <td className="py-3 px-4 text-ink-muted font-mono text-[11px]">
                        {est.timelineWeeksMin}–{est.timelineWeeksMax} wks
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-ink tabular-nums text-xs">
                        {formatCurrency(est.finalPrice, est.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-muted text-[11px] tabular-nums">
                        {formatCurrencyRange(est.indicativeLow, est.indicativeHigh, est.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-muted text-[11px]">
                        v{est.pricingVersion.version}
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
    </div>
  );
}
