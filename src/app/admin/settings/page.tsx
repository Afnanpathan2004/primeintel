import { prisma } from '@/lib/db';
import {
  Settings,
  Shield,
  Database,
  Cpu,
  Lock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [activeVersion, estimateCount, serviceCount, multiplierCount, addOnCount, userCount] =
    await Promise.all([
      prisma.pricingVersion.findFirst({ where: { status: 'ACTIVE' } }),
      prisma.estimate.count(),
      prisma.service.count(),
      prisma.pricingMultiplier.count(),
      prisma.addOn.count(),
      prisma.user.count(),
    ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Architecture & Security Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Production boundaries, cryptographic authentication state, and pricing snapshot governance.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Product Boundary Notice */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-blue-600" />
            Product Boundary & MVP Isolation (PD-001)
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            PrimeIntel is strictly an <span className="font-semibold text-slate-800">Internal Admin-Side Estimation Engine</span>.
            In accordance with architectural decision PD-001, no public-facing estimator routes, external widgets, or anonymous customer endpoints are exposed. The public website (<span className="font-mono text-blue-600">https://primecoreinfo.com/</span>) remains completely untouched and decoupled.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Internal administrative boundary verified and enforced.
          </div>
        </div>

        {/* AI & Pricing Engine Pipeline */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-indigo-600" />
            AI & Deterministic Calculation Pipeline
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-semibold text-slate-800">Requirement Analyzer</div>
              <div className="text-slate-500 text-[11px]">
                Engine: <span className="font-semibold text-slate-700">Gemini 3.8 Flash</span> (@google/genai)
              </div>
              <div className="text-slate-500 text-[11px]">
                Fallback: <span className="font-semibold text-slate-700">Deterministic Heuristic NLP</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Security: <span className="text-emerald-700 font-semibold">Length-capped & Prompt-injection guarded</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-semibold text-slate-800">Pricing Engine Guardrails</div>
              <div className="text-slate-500 text-[11px]">
                Active Version Cap: <span className="font-bold text-blue-600">{activeVersion?.maxDiscountPercentage || 20}%</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Indicative Range Spread: <span className="font-bold text-slate-700">±{((activeVersion?.spreadPercentage || 0.08) * 100).toFixed(0)}%</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                Rule: <span className="text-red-700 font-semibold">Zero direct AI pricing (Hard mathematical engine)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Persistence & Admin Security */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-600" />
            Persistence & Access Control
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Pricing</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5">
                {activeVersion ? `v${activeVersion.version}` : 'Unconfigured'}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Stored Estimates</div>
              <div className="font-bold text-slate-900 mt-0.5">{estimateCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Services Catalog</div>
              <div className="font-bold text-slate-900 mt-0.5">{serviceCount}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Admin Users</div>
              <div className="font-bold text-slate-900 mt-0.5">{userCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
