import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  FileSpreadsheet,
  PlusCircle,
  Building,
  ArrowRight,
  Clock,
  Filter,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EstimatesListPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pricingVersion: { select: { version: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Estimates Archive
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of all generated client estimates and proposals with pricing snapshot history.
          </p>
        </div>

        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Estimate
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {estimates.length === 0 ? (
          <div className="py-20 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 text-sm">No estimates found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Create your first estimate by pasting a customer requirement.
            </p>
            <Link
              href="/admin/estimates/new"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white inline-block"
            >
              Start New Estimate
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-6">Estimate ID</th>
                  <th className="py-3 px-6">Customer & Company</th>
                  <th className="py-3 px-6">Timeline</th>
                  <th className="py-3 px-6">Final Calculated</th>
                  <th className="py-3 px-6">Indicative Envelope</th>
                  <th className="py-3 px-6">Pricing Version</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {estimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-blue-600">
                      <Link href={`/admin/estimates/${est.id}`} className="hover:underline">
                        {est.estimateNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{est.customerName}</div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                        <Building className="w-3 h-3 text-slate-400" />
                        {est.companyName}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {est.timelineWeeksMin}–{est.timelineWeeksMax} wks
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-slate-900">
                      ₹{est.finalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      ₹{(est.indicativeLow / 100000).toFixed(1)}L – ₹{(est.indicativeHigh / 100000).toFixed(1)}L
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                      v{est.pricingVersion.version}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          est.status === 'WON'
                            ? 'bg-emerald-100 text-emerald-800'
                            : est.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : est.status === 'ASSESSMENT_REQUESTED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : est.status === 'REVIEWED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {est.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/estimates/${est.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-[11px]"
                      >
                        View Proposal
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
