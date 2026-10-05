import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Users,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalValue = estimates.reduce((acc, curr) => acc + curr.finalPrice, 0);
  const activeCount = estimates.filter(
    (e) => e.status === 'SENT' || e.status === 'APPROVED' || e.status === 'REVIEWED'
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
          Commercial Pipeline
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">
          Client Pipeline & Account Records
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Prospective client relationships initiated through project requirement evaluations.
        </p>
      </div>

      {/* Subtle Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Total Client Accounts
          </div>
          <div className="text-2xl font-bold text-ink mt-1.5 tabular-nums">
            {estimates.length}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            Accounts with generated proposals
          </div>
        </div>

        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Aggregate Pipeline Value
          </div>
          <div className="text-2xl font-bold text-ink mt-1.5 font-mono tabular-nums">
            {totalValue > 0 ? formatCompactCurrency(totalValue) : '—'}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            {totalValue > 0 ? 'Calculated engagement pipeline' : 'No pipeline value logged'}
          </div>
        </div>

        <div className="bg-surface p-4 rounded border border-border">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Active Dialogues
          </div>
          <div className="text-2xl font-bold text-primary mt-1.5 tabular-nums">
            {activeCount}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">
            Proposals in active client review
          </div>
        </div>
      </div>

      {/* Structured Leads Table */}
      <div className="bg-surface rounded border border-border overflow-hidden">
        {estimates.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-muted">
            <Users className="w-8 h-8 text-ink-faint mx-auto mb-2" />
            <div className="font-semibold text-ink">No client accounts recorded</div>
            <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1">
              New client accounts will automatically populate here once an estimate is generated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-ink-muted border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Company & Client</th>
                  <th className="py-2.5 px-4">Contact Detail</th>
                  <th className="py-2.5 px-4">Estimate ID</th>
                  <th className="py-2.5 px-4 text-right">Value</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {estimates.map((lead) => {
                  const isApproved = lead.status === 'APPROVED' || lead.status === 'CLOSED';
                  const isWarning = lead.status === 'CANCELLED';

                  return (
                    <tr key={lead.id} className="hover:bg-subtle transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink text-xs">{lead.companyName}</div>
                        <div className="text-[11px] text-ink-muted">{lead.customerName}</div>
                      </td>
                      <td className="py-3 px-4 text-ink-muted text-[11px]">
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-ink-faint" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-ink-faint" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {!lead.email && !lead.phone && <span className="text-ink-faint">—</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-primary font-medium text-[11px]">
                        <Link href={`/admin/estimates/${lead.id}`} className="hover:underline">
                          {lead.estimateNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-ink tabular-nums text-xs">
                        {formatCurrency(lead.finalPrice, lead.currency)}
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
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/estimates/${lead.id}`}
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
