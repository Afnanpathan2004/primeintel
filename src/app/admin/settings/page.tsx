import { prisma } from '@/lib/db';
import {
  Shield,
  Cpu,
  Database,
  CheckCircle2,
} from 'lucide-react';
import DatabaseErrorState from '@/components/admin/DatabaseErrorState';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let activeVersion = null;
  let estimateCount = 0;
  let serviceCount = 0;
  let multiplierCount = 0;
  let addOnCount = 0;
  let userCount = 0;

  try {
    const results = await Promise.all([
      prisma.pricingVersion.findFirst({ where: { status: 'ACTIVE' } }),
      prisma.estimate.count(),
      prisma.service.count(),
      prisma.pricingMultiplier.count(),
      prisma.addOn.count(),
      prisma.user.count(),
    ]);
    activeVersion = results[0];
    estimateCount = results[1];
    serviceCount = results[2];
    multiplierCount = results[3];
    addOnCount = results[4];
    userCount = results[5];
  } catch (err: any) {
    console.error('[SettingsPage] Database query failure:', err?.message || err);
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
        <DatabaseErrorState />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
          System Administration
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">
          System Boundaries & Security Settings
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Operational boundaries, cryptographic session state, and pricing snapshot governance.
        </p>
      </div>

      <div className="space-y-5">
        {/* Architectural Isolation Notice (PD-001) */}
        <div className="bg-surface p-5 rounded border border-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
            <Shield className="w-4 h-4 text-primary" />
            <span>Product Isolation Boundary (PD-001)</span>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            PrimeIntel is exclusively an <span className="font-semibold text-ink">Internal Admin-Side Estimation Engine</span>.
            In compliance with product decision PD-001, no public-facing estimator routes, external widgets, or anonymous customer endpoints are exposed. The public company website (<span className="font-mono text-primary font-medium">https://primecoreinfo.com/</span>) remains completely untouched and decoupled.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-primary bg-primary-subtle px-3 py-1.5 rounded border border-primary/20 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Internal administrative boundary verified and enforced.</span>
          </div>
        </div>

        {/* AI & Pricing Engine Specs */}
        <div className="bg-surface p-5 rounded border border-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-primary" />
            <span>AI & Deterministic Calculation Architecture</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded bg-subtle border border-border space-y-1.5">
              <div className="font-semibold text-ink">Requirement Analyzer</div>
              <div className="text-ink-muted text-[11px]">
                Engine: <span className="font-medium text-ink">Gemini 3.8 Flash</span> (@google/genai)
              </div>
              <div className="text-ink-muted text-[11px]">
                Fallback: <span className="font-medium text-ink">Deterministic Heuristic NLP</span>
              </div>
              <div className="text-ink-muted text-[11px]">
                Security: <span className="text-primary font-medium">Prompt-injection shielded & length-capped</span>
              </div>
            </div>

            <div className="p-3.5 rounded bg-subtle border border-border space-y-1.5">
              <div className="font-semibold text-ink">Pricing Calculation Engine</div>
              <div className="text-ink-muted text-[11px]">
                Active Discount Cap: <span className="font-bold text-ink font-mono">{activeVersion?.maxDiscountPercentage || 20}%</span>
              </div>
              <div className="text-ink-muted text-[11px]">
                Indicative Range Band: <span className="font-bold text-ink font-mono">±{((activeVersion?.spreadPercentage || 0.08) * 100).toFixed(0)}%</span>
              </div>
              <div className="text-ink-muted text-[11px]">
                Guardrail: <span className="text-accent font-medium">Zero direct AI pricing (Pure deterministic TS)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Persistence Summary */}
        <div className="bg-surface p-5 rounded border border-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
            <Database className="w-4 h-4 text-primary" />
            <span>Persistence & System Metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded bg-subtle border border-border">
              <div className="text-[10px] text-ink-muted uppercase font-semibold">Active Pricing</div>
              <div className="font-mono font-bold text-primary mt-1 text-sm">
                {activeVersion ? `v${activeVersion.version}` : 'None'}
              </div>
            </div>
            <div className="p-3 rounded bg-subtle border border-border">
              <div className="text-[10px] text-ink-muted uppercase font-semibold">Stored Estimates</div>
              <div className="font-bold text-ink mt-1 text-sm tabular-nums">{estimateCount}</div>
            </div>
            <div className="p-3 rounded bg-subtle border border-border">
              <div className="text-[10px] text-ink-muted uppercase font-semibold">Configured Services</div>
              <div className="font-bold text-ink mt-1 text-sm tabular-nums">{serviceCount}</div>
            </div>
            <div className="p-3 rounded bg-subtle border border-border">
              <div className="text-[10px] text-ink-muted uppercase font-semibold">Authorized Users</div>
              <div className="font-bold text-ink mt-1 text-sm tabular-nums">{userCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
