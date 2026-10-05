import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Users,
  Building,
  Mail,
  Phone,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalValue = estimates.reduce((acc, curr) => acc + curr.finalPrice, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Client Pipeline & Account Records
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Direct commercial relationships initiated from incoming customer estimate briefs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{estimates.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">From processed requirements</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Pipeline Value</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {totalValue > 0 ? formatCompactCurrency(totalValue) : '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalValue > 0 ? 'Aggregate calculated pipeline' : 'No pipeline value logged'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Active Proposals</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {estimates.filter((e) => e.status === 'SENT' || e.status === 'APPROVED' || e.status === 'REVIEWED').length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In active client dialogue</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {estimates.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <div className="font-semibold text-slate-700 text-sm">No leads recorded yet</div>
            <div className="text-slate-400 mt-1">
              When a new estimate is created with customer and company details, it automatically appears here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Company & Customer</th>
                  <th className="py-3 px-6">Contact Info</th>
                  <th className="py-3 px-6">Associated Estimate</th>
                  <th className="py-3 px-6">Indicative Value</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {estimates.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{lead.companyName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        {lead.customerName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {lead.email}
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-blue-600 font-medium">
                      <Link href={`/admin/estimates/${lead.id}`} className="hover:underline">
                        {lead.estimateNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                      {formatCurrency(lead.finalPrice, lead.currency)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/estimates/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-[11px]"
                      >
                        Open Lead & Proposal
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
