import Link from 'next/link';
import { prisma } from '@/lib/db';
import {
  Calculator,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Clock,
  Building,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency, formatCurrencyRange } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [estimates, activeVersion, servicesCount] = await Promise.all([
    prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.pricingVersion.findFirst({
      where: { status: 'ACTIVE' },
    }),
    prisma.service.count({ where: { active: true } }),
  ]);

  const totalEstimates = await prisma.estimate.count();
  const wonEstimates = estimates.filter((e) => e.status === 'CLOSED' || e.status === 'APPROVED').length;
  const totalValue = estimates.reduce((acc, curr) => acc + curr.finalPrice, 0);
  const avgValue = totalEstimates > 0 ? Math.round(totalValue / totalEstimates) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              PrimeIntel Enterprise Workbench
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Deterministic Pricing Engine Active
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Project Estimation & Commercial Workbench
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Convert customer requirements into structured technical scopes, evaluate against market benchmarks, and produce explainable, bounded estimates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/estimates/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
          >
            <Calculator className="w-4 h-4" />
            Create New Estimate
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      {/* Unconfigured Pricing Alert if none active */}
      {!activeVersion && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-sm">System Notice: No Active Pricing Version</span>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              No pricing configuration is currently activated. Navigate to{' '}
              <Link href="/admin/pricing" className="underline font-semibold text-blue-700">
                Pricing & Services
              </Link>{' '}
              to activate a pricing snapshot before running production estimates.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards — Strictly calculated from real records (No fake numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Estimates</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {totalEstimates}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {totalEstimates === 0 ? 'No estimates recorded yet' : 'Logged historical records'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average Project Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {avgValue > 0 ? formatCompactCurrency(avgValue) : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalEstimates === 0 ? 'Awaiting initial estimate' : 'Calculated across estimates'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Services</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {servicesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Configured commercial offerings
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Pricing Version</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {activeVersion ? `v${activeVersion.version}` : 'Unconfigured'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activeVersion ? 'Immutable snapshot active' : 'Action required in settings'}
          </div>
        </div>
      </div>

      {/* Recent Estimates Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base">
              Recent Estimates
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, inspect internal line-item math, or export client-safe proposals.
            </p>
          </div>
          {totalEstimates > 0 && (
            <Link
              href="/admin/estimates"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View all ({totalEstimates})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {estimates.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">No estimates yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Paste an actual customer requirement to run AI scope extraction and deterministic pricing.
            </p>
            <Link
              href="/admin/estimates/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Create First Estimate
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
                  <th className="py-3 px-6">Final Estimate</th>
                  <th className="py-3 px-6">Indicative Band</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
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
                      {formatCurrency(est.finalPrice, est.currency)}
                      {est.discountAmount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          (-{est.discountPercentage}% discount)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {formatCurrencyRange(est.indicativeLow, est.indicativeHigh, est.currency)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
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
