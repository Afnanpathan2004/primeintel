'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  CheckCircle,
  FileText,
  Clock,
  Shield,
  Building,
  User,
  Calendar,
  Layers,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  Tag,
  Share2,
  RefreshCw,
  Eye,
  Lock,
} from 'lucide-react';

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
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading estimate details...
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-20 text-slate-600">
        <h3 className="font-bold text-lg">Estimate Not Found</h3>
        <Link href="/admin/estimates" className="text-blue-600 text-xs mt-2 inline-block">
          &larr; Back to Estimates
        </Link>
      </div>
    );
  }

  const structuredReq = JSON.parse(estimate.structuredRequirement || '{}');
  const assumptions: string[] = JSON.parse(estimate.assumptions || '[]');
  const unknowns: any[] = JSON.parse(estimate.unknowns || '[]');
  const breakdown: string[] = JSON.parse(estimate.calculationBreakdown || '[]');
  const benchmark = estimate.benchmarkComparison ? JSON.parse(estimate.benchmarkComparison) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/estimates"
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 font-mono">
                {estimate.estimateNumber}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                {estimate.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Created for {estimate.customerName} ({estimate.companyName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <select
            value={estimate.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="GENERATED">Generated</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="SENT">Sent to Client</option>
            <option value="ASSESSMENT_REQUESTED">Assessment Requested</option>
            <option value="WON">Project Won</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Print Proposal Button */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation (No-print) */}
      <div className="flex gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'proposal'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Customer Proposal View (Client-Safe)
        </button>

        <button
          onClick={() => setActiveTab('internal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'internal'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Internal Technical Breakdown (Admin Only)
        </button>
      </div>

      {/* TAB 1: CUSTOMER PROPOSAL VIEW */}
      {(activeTab === 'proposal' || typeof window === 'undefined') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 space-y-10 print:border-none print:shadow-none print:p-0">
          {/* Proposal Header & PrimeCore Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                  PC
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    PrimeCore Solutions
                  </h1>
                  <p className="text-[11px] text-slate-500 uppercase font-medium tracking-wider">
                    Cloud Consulting & DevOps Engineering
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                https://primecoreinfo.com • solutions@primecoreinfo.com
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                Indicative Project Estimate
              </span>
              <div className="text-lg font-bold font-mono text-slate-900">
                {estimate.estimateNumber}
              </div>
              <div className="text-xs text-slate-500">
                Date: {new Date(estimate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Client Details & Scope Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Prepared For
              </h3>
              <div className="font-semibold text-slate-900 text-sm">{estimate.customerName}</div>
              <div className="text-xs text-slate-600 font-medium">{estimate.companyName}</div>
              {estimate.email && <div className="text-xs text-slate-500 mt-1">{estimate.email}</div>}
              {estimate.phone && <div className="text-xs text-slate-500">{estimate.phone}</div>}
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Engagement Overview
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed">
                {structuredReq.summary || 'Cloud Infrastructure Architecture and Delivery'}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold">Target Environment:</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-medium text-[11px]">
                  {structuredReq.targetEnvironment?.value || 'AWS'}
                </span>
              </div>
            </div>
          </div>

          {/* Commercial Estimate Box */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Indicative Commercial Envelope
                </span>
                <div className="text-3xl md:text-4xl font-bold font-mono tracking-tight text-white mt-1">
                  ₹{(estimate.indicativeLow / 100000).toFixed(2)}L – ₹{(estimate.indicativeHigh / 100000).toFixed(2)}L
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-md">
                  Indicative fee based on identified workload scale and technical scope. Subject to final architectural discovery.
                </p>
              </div>

              <div className="md:border-l md:border-slate-800 md:pl-8 space-y-3 shrink-0">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Delivery Timeline</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {estimate.timelineWeeksMin} – {estimate.timelineWeeksMax} Weeks
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Delivery Methodology</div>
                  <div className="text-xs text-slate-200 font-medium">Sprint-based Milestone Releases</div>
                </div>
              </div>
            </div>
          </div>

          {/* Included Architectural Deliverables */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Included Technical Scope & Deliverables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(structuredReq.technicalRequirements || [
                'Target Cloud Landing Zone & VPC Architecture',
                'Compute & Workload Migration Delivery',
                'Multi-AZ High Availability Design',
                'Disaster Recovery Failover Drill Automation',
                'Modular Infrastructure as Code (Terraform)',
                'Automated CI/CD Delivery Pipelines',
                'Centralized Observability & Metric Monitoring',
              ]).map((req: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-slate-700"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Project Assumptions */}
          {assumptions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                Technical Assumptions
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                {assumptions.map((asm, i) => (
                  <li key={i} className="leading-relaxed">
                    {asm}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps Card */}
          <div className="p-6 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-xs text-blue-900 uppercase tracking-wide">
                Recommended Next Step: Technical Discovery Assessment
              </h4>
              <p className="text-xs text-blue-800/80 mt-1 max-w-xl">
                A 3-day deep dive by a PrimeCore Principal Cloud Architect to audit workload dependencies, databases, network sizing, and formalize exact milestone pricing.
              </p>
            </div>
            <button
              onClick={() => handleStatusChange('ASSESSMENT_REQUESTED')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs whitespace-nowrap shadow-sm no-print"
            >
              Request Assessment Drill
            </button>
          </div>

          {/* Legal / Professional Disclaimer (Section 56) */}
          <div className="border-t border-slate-100 pt-6 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-600">Estimate Disclaimer: </span>
            This is an indicative estimate based on the information available at the time of calculation. Final pricing is subject to technical assessment, scope validation, and formal proposal. Infrastructure consumption costs levied by cloud providers (such as AWS, Azure, GCP) are billed directly to the customer and are not included in consulting fees.
          </div>
        </div>
      )}

      {/* TAB 2: INTERNAL TECHNICAL BREAKDOWN (ADMIN ONLY) */}
      {activeTab === 'internal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Internal Pricing Audit & Engine Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confidential commercial details. Never exposed on customer-facing exports.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Pricing Version</span>
              <div className="font-mono text-xs font-bold text-emerald-700">
                v{estimate.pricingVersion?.version || '2026.10.01'}
              </div>
            </div>
          </div>

          {/* Mathematical Line-Item Breakdown */}
          <div className="p-5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Deterministic Formula Resolution
            </h4>
            <div className="space-y-1.5 text-[11px]">
              {breakdown.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-bold text-white">
              <span>Final Recorded Price:</span>
              <span className="text-blue-400">₹{estimate.finalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Benchmark Comparison Layer (Section 13, 14, 15) */}
          {benchmark && (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Market Benchmark Context
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Market Range</span>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5">
                    ₹{(benchmark.benchmarkLow / 100000).toFixed(1)}L – ₹{(benchmark.benchmarkHigh / 100000).toFixed(1)}L
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Source & Region</span>
                  <div className="text-slate-700 mt-0.5">{benchmark.sourceName} ({benchmark.region})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Variance Analysis</span>
                  <div className="text-emerald-700 font-medium mt-0.5">{benchmark.varianceVsRecommended}</div>
                </div>
              </div>
            </div>
          )}

          {/* Identified Unknowns & Suggested Questions */}
          {unknowns.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Detected Unknowns & Clarification Questions
              </h4>
              <div className="space-y-2">
                {unknowns.map((unk: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
                    <div className="font-semibold text-amber-900">{unk.field}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{unk.description}</div>
                    <div className="mt-1.5 font-medium text-blue-700">
                      Suggested Question: &ldquo;{unk.suggestedQuestion}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Customer Text */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              Raw Customer Requirement (Original Text)
            </h4>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
              {estimate.rawRequirement}
            </div>
          </div>

          {/* Internal Estimator Notes */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
              Internal Commercial Notes
            </h4>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add confidential notes for sales team (e.g. customer budget range, competitor context)..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-sans"
            />
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
            >
              {savedNotes ? 'Saved!' : 'Save Internal Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
