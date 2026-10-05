'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Eye,
  GitBranch,
  RefreshCw,
  Building,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatCurrencyRange } from '@/lib/currency';

const LIFECYCLE_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CALCULATED', label: 'Calculated' },
  { value: 'REVIEWED', label: 'Reviewed by Estimator' },
  { value: 'APPROVED', label: 'Approved by Commercial Lead' },
  { value: 'EXPORTED', label: 'Exported / Proposal Generated' },
  { value: 'SENT', label: 'Sent to Customer' },
  { value: 'CLOSED', label: 'Closed / Won' },
  { value: 'CANCELLED', label: 'Cancelled / Lost' },
];

export default function EstimateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'proposal' | 'internal'>('proposal');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState(false);

  useEffect(() => {
    async function fetchEstimate() {
      try {
        const res = await fetch(`/api/estimates/${id}`);
        const data = await res.json();
        if (data.success) {
          setEstimate(data.data);
          setInternalNotes(data.data.internalNotes || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEstimate();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEstimate((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes }),
      });
      if (res.ok) {
        setSavedNotes(true);
        setTimeout(() => setSavedNotes(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-muted text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading estimate proposal...
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-20 text-ink-muted">
        <h3 className="font-bold text-sm text-ink">Estimate Not Found</h3>
        <Link href="/admin/estimates" className="text-primary text-xs mt-2 inline-block hover:underline">
          &larr; Back to Estimates Archive
        </Link>
      </div>
    );
  }

  const structuredReq = JSON.parse(estimate.structuredRequirement || '{}');
  const assumptions: string[] = JSON.parse(estimate.assumptions || '[]');
  const unknowns: any[] = JSON.parse(estimate.unknowns || '[]');
  const breakdown: string[] = JSON.parse(estimate.calculationBreakdown || '[]');
  const benchmark = estimate.benchmarkComparison ? JSON.parse(estimate.benchmarkComparison) : null;
  const revisions = estimate.revisions || [];

  const isApproved = estimate.status === 'APPROVED' || estimate.status === 'CLOSED';
  const isWarning = estimate.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 font-sans">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/estimates"
            className="p-1.5 rounded border border-border bg-surface hover:bg-subtle text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink font-mono">
                {estimate.estimateNumber}
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider ${
                  isApproved
                    ? 'bg-primary-subtle text-primary border border-primary/20'
                    : isWarning
                    ? 'bg-accent-subtle text-accent border border-accent/20'
                    : 'bg-subtle text-ink-muted border border-border'
                }`}
              >
                {estimate.status}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-subtle border border-border text-ink font-mono">
                Rev {estimate.revisionNumber || 1}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Account: {estimate.companyName} ({estimate.customerName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Lifecycle Dropdown */}
          <select
            value={estimate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="text-xs font-medium px-2.5 py-1.5 rounded border border-border bg-surface text-ink focus:outline-none focus:border-primary"
          >
            {LIFECYCLE_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Print Button */}
          <button
            onClick={() => {
              handleStatusChange('EXPORTED');
              window.print();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface border border-border hover:bg-subtle text-ink text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher (No-print) */}
      <div className="flex gap-1 border-b border-border no-print">
        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'proposal'
              ? 'border-primary text-primary bg-surface'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Client-Safe Proposal</span>
        </button>

        <button
          onClick={() => setActiveTab('internal')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'internal'
              ? 'border-primary text-primary bg-surface'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Internal Technical Audit (Admin)</span>
        </button>
      </div>

      {/* TAB 1: CLIENT-SAFE PROPOSAL */}
      {(activeTab === 'proposal' || typeof window === 'undefined') && (
        <div className="bg-surface rounded border border-border p-6 md:p-10 space-y-8 print:border-none print:p-0">
          {/* Proposal Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-border pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded bg-primary text-white font-bold text-xs flex items-center justify-center">
                  PC
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-ink">
                    PrimeCore Technologies
                  </h1>
                  <p className="text-[10px] text-ink-muted uppercase tracking-wider">
                    Infrastructure & Cloud Advisory
                  </p>
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                contact@primecoreinfo.com • https://primecoreinfo.com
              </p>
            </div>

            <div className="sm:text-right space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
                Project Estimate
              </span>
              <div className="text-base font-bold font-mono text-ink">
                {estimate.estimateNumber}
              </div>
              <div className="text-xs text-ink-muted">
                Date: {new Date(estimate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Account Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded bg-subtle border border-border text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Prepared For
              </div>
              <div className="font-semibold text-ink text-sm">{estimate.customerName}</div>
              <div className="text-ink-muted font-medium">{estimate.companyName}</div>
              {estimate.email && <div className="text-ink-muted mt-0.5">{estimate.email}</div>}
              {estimate.phone && <div className="text-ink-muted">{estimate.phone}</div>}
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1">
                Engagement Overview
              </div>
              <div className="text-ink leading-relaxed">
                {structuredReq.summary || 'Cloud Infrastructure Delivery & Architecture Services'}
              </div>
              <div className="mt-2 text-ink-muted flex items-center gap-2">
                <span>Target Cloud:</span>
                <span className="font-mono font-medium text-ink">
                  {structuredReq.targetEnvironment?.value || 'Target Cloud'}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Envelope Box */}
          <div className="p-6 rounded bg-subtle border border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
                  Indicative Commercial Envelope
                </span>
                <div className="text-2xl md:text-3xl font-bold font-mono tracking-tight text-ink mt-0.5 tabular-nums">
                  {formatCurrencyRange(estimate.indicativeLow, estimate.indicativeHigh, estimate.currency)}
                </div>
                <p className="text-xs text-ink-muted mt-1 max-w-md">
                  Indicative consulting fee based on stated scope and complexity. Final scope formalized during architectural discovery.
                </p>
              </div>

              <div className="md:border-l md:border-border md:pl-6 space-y-2 shrink-0 text-xs">
                <div>
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Estimated Timeline</div>
                  <div className="text-base font-bold text-ink font-mono mt-0.5">
                    {estimate.timelineWeeksMin} – {estimate.timelineWeeksMax} Weeks
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Delivery Model</div>
                  <div className="text-ink font-medium">Milestone Sprint Cadence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Included Deliverables */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink border-b border-border pb-1.5">
              Included Technical Deliverables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(structuredReq.technicalRequirements || [
                'Target Cloud Landing Zone & Network Topology',
                'Compute & Workload Delivery Architecture',
                'High Availability Redundancy Configuration',
                'Disaster Recovery Failover Drill Automation',
                'Infrastructure as Code (Terraform / OpenTofu)',
                'Automated CI/CD Deployment Pipelines',
                'Centralized Observability & Metric Monitoring',
              ]).map((req: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2 rounded bg-surface border border-border text-ink"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Assumptions */}
          {assumptions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink border-b border-border pb-1.5">
                Technical Assumptions & Prerequisites
              </h3>
              <ul className="space-y-1.5 text-xs text-ink-muted list-disc list-inside">
                {assumptions.map((asm, i) => (
                  <li key={i} className="leading-relaxed">
                    {asm}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-4 rounded border border-border bg-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-semibold text-ink">
                Recommended Action: Technical Discovery Assessment
              </div>
              <p className="text-ink-muted mt-0.5">
                Detailed architecture deep-dive by a Principal Cloud Consultant to evaluate databases, network topology, and milestone deliverables.
              </p>
            </div>
            <button
              onClick={() => handleStatusChange('APPROVED')}
              className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white font-medium text-xs whitespace-nowrap transition-colors no-print"
            >
              Confirm Scope
            </button>
          </div>

          {/* Legal Disclaimer */}
          <div className="border-t border-border pt-4 text-[10px] text-ink-muted leading-relaxed">
            <span className="font-semibold text-ink">Commercial Disclaimer: </span>
            This estimate is indicative and formulated based on information provided during initial requirements capture. Formal engagement scope is contingent upon technical discovery assessment and formal Statement of Work. Cloud provider infrastructure consumption fees are billed directly to customer accounts.
          </div>
        </div>
      )}

      {/* TAB 2: INTERNAL TECHNICAL AUDIT BREAKDOWN */}
      {activeTab === 'internal' && (
        <div className="bg-surface rounded border border-border p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Internal Pricing Audit & Formula Breakdown
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Confidential commercial metrics. Excluded from client proposal export.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-ink-muted uppercase font-semibold">Pricing Snapshot</span>
              <div className="font-mono text-xs font-bold text-primary">
                v{estimate.pricingVersion?.version}
              </div>
            </div>
          </div>

          {/* Line-item Math Breakdown */}
          <div className="p-4 rounded bg-subtle border border-border font-mono text-xs space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Calculation Engine Log
            </div>
            <div className="space-y-1 text-[11px] text-ink">
              {breakdown.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-between text-xs font-bold text-ink">
              <span>Final Recorded Baseline:</span>
              <span className="tabular-nums">{formatCurrency(estimate.finalPrice, estimate.currency)}</span>
            </div>
          </div>

          {/* Benchmark Evaluation */}
          {benchmark && (
            <div className="p-4 rounded border border-border space-y-2 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Market Benchmark Alignment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase">Market Range</span>
                  <div className="font-mono font-semibold text-ink mt-0.5 tabular-nums">
                    {benchmark.benchmarkFound
                      ? formatCurrencyRange(benchmark.benchmarkLow, benchmark.benchmarkHigh, benchmark.currency)
                      : 'Unavailable'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase">Source</span>
                  <div className="text-ink mt-0.5">{benchmark.sourceName || '—'} ({benchmark.region || 'India'})</div>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase">Variance vs Median</span>
                  <div className="text-primary font-medium mt-0.5">{benchmark.varianceVsRecommended || 'Aligned'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Revisions Trail */}
          {revisions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                Historical Revisions Trail ({revisions.length})
              </h4>
              <div className="space-y-1.5">
                {revisions.map((rev: any) => (
                  <div key={rev.id} className="p-2.5 rounded border border-border text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">Revision {rev.revisionNumber}</span>
                      <span className="text-[10px] text-ink-muted font-mono">
                        {new Date(rev.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-ink-muted">
                      Amount: {formatCurrency(rev.finalPrice, estimate.currency)} • By: {rev.changedBy}
                    </div>
                    {rev.changeReason && (
                      <div className="text-[11px] text-ink-muted italic">
                        Reason: &ldquo;{rev.changeReason}&rdquo;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Requirement Text */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">
              Raw Customer Requirement (Original Text)
            </h4>
            <div className="p-3 rounded border border-border bg-subtle text-xs text-ink whitespace-pre-wrap leading-relaxed font-sans">
              {estimate.rawRequirement}
            </div>
          </div>

          {/* Internal Notes Edit */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px]">
              Internal Commercial Notes
            </h4>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal margin analysis or notes..."
              className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink focus:outline-none focus:border-primary font-sans"
            />
            <button
              onClick={handleSaveNotes}
              className="px-3 py-1.5 rounded bg-surface border border-border hover:bg-subtle text-ink font-medium text-xs transition-colors"
            >
              {savedNotes ? 'Saved!' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
