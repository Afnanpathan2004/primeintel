'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calculator,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  DollarSign,
  Calendar,
  Building,
  User,
  Mail,
  Phone,
  Check,
  ChevronDown,
} from 'lucide-react';
import { StructuredRequirement } from '@/lib/ai/types';
import { PricingCalculationResult } from '@/lib/pricing/types';

const SAMPLE_SCENARIOS = [
  {
    title: 'Scenario 1: 40 Servers AWS Migration (Prompt Baseline)',
    text: 'The customer currently has around 40 servers on-premise and wants to migrate them to AWS. They need high availability, automated backups, disaster recovery, monitoring, Terraform and CI/CD. They want the migration completed within two months.',
    company: 'AcroPulse Technologies',
    contact: 'Vikram Sharma',
    email: 'vikram.s@acropulse.tech',
  },
  {
    title: 'Scenario 2: 70 Physical Servers with 24/7 Support',
    text: 'We have 70 physical servers and want to move to AWS. Around 20 applications are running on them. We need HA, DR, centralized monitoring and automated deployment. We currently deploy manually and want Terraform and CI/CD. We also need 24/7 support after migration.',
    company: 'FinTrack Digital',
    contact: 'Pooja Iyer',
    email: 'pooja@fintrackdigital.com',
  },
  {
    title: 'Scenario 3: Kubernetes Modernization on EKS',
    text: 'We are looking to modernize 15 legacy microservices currently running on disparate virtual machines into Amazon EKS. We require Helm charts, CI/CD with GitHub Actions, Prometheus/Grafana observability, and automated DR failover drills. Timeline is urgent (under 4 weeks).',
    company: 'LogixFlow Logistics',
    contact: 'Rajesh Mehta',
    email: 'rmehta@logixflow.in',
  },
];

export default function NewEstimatePage() {
  const router = useRouter();

  // Form State
  const [customerName, setCustomerName] = useState('Vikram Sharma');
  const [companyName, setCompanyName] = useState('AcroPulse Technologies');
  const [email, setEmail] = useState('vikram.s@acropulse.tech');
  const [phone, setPhone] = useState('+91 98201 54321');
  const [rawRequirement, setRawRequirement] = useState(
    'The customer currently has around 40 servers on-premise and wants to migrate them to AWS. They need high availability, automated backups, disaster recovery, monitoring, Terraform and CI/CD. They want the migration completed within two months.'
  );

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StructuredRequirement | null>(null);

  // Admin Editable Parameters
  const [serviceKey, setServiceKey] = useState('cloud-migration');
  const [environmentCode, setEnvironmentCode] = useState('aws');
  const [scaleCode, setScaleCode] = useState('26_50');
  const [complexityCode, setComplexityCode] = useState('high');
  const [timelineCode, setTimelineCode] = useState('standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([
    'ha',
    'dr',
    'terraform',
    'cicd',
    'monitoring',
  ]);

  // Pricing State
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [adminOverridePrice, setAdminOverridePrice] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<PricingCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Scenario Quick Fill
  const loadScenario = (sc: typeof SAMPLE_SCENARIOS[0]) => {
    setRawRequirement(sc.text);
    setCompanyName(sc.company);
    setCustomerName(sc.contact);
    setEmail(sc.email);
    setAnalysisResult(null);
    setCalculationResult(null);
    setErrorMsg(null);
  };

  // Step 1: AI Requirement Analysis
  const handleAnalyze = async () => {
    if (!rawRequirement.trim()) {
      setErrorMsg('Please paste a customer requirement first.');
      return;
    }
    setErrorMsg(null);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: rawRequirement }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      const req: StructuredRequirement = data.data;
      setAnalysisResult(req);

      // Auto-populate admin editable controls with AI extracted baseline
      setServiceKey(req.primaryServiceKey.value || 'cloud-migration');
      setEnvironmentCode(req.environmentCode.value || 'aws');
      setScaleCode(req.scaleCode.value || '26_50');
      setComplexityCode(req.complexityCode.value || 'medium');
      setTimelineCode(req.timelineCode.value || 'standard');
      setSelectedAddOns(req.detectedAddOnCodes.value || []);

      // Auto calculate initial estimate for instantaneous admin feedback
      triggerCalculation({
        serviceKey: req.primaryServiceKey.value || 'cloud-migration',
        environmentCode: req.environmentCode.value || 'aws',
        scaleCode: req.scaleCode.value || '26_50',
        complexityCode: req.complexityCode.value || 'medium',
        timelineCode: req.timelineCode.value || 'standard',
        addOnCodes: req.detectedAddOnCodes.value || [],
        discountPercentage: discountPercent,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Requirement analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Deterministic Calculation
  const triggerCalculation = async (overrideParams?: any) => {
    setCalculating(true);
    setErrorMsg(null);

    const payload = {
      serviceKey: overrideParams?.serviceKey ?? serviceKey,
      environmentCode: overrideParams?.environmentCode ?? environmentCode,
      scaleCode: overrideParams?.scaleCode ?? scaleCode,
      complexityCode: overrideParams?.complexityCode ?? complexityCode,
      timelineCode: overrideParams?.timelineCode ?? timelineCode,
      addOnCodes: overrideParams?.addOnCodes ?? selectedAddOns,
      discountPercentage: overrideParams?.discountPercentage ?? discountPercent,
      adminOverridePrice: adminOverridePrice ? Number(adminOverridePrice) : undefined,
      overrideReason: overrideReason || undefined,
    };

    try {
      const res = await fetch('/api/calculate-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calculation failed');
      setCalculationResult(data.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Pricing calculation failed.');
    } finally {
      setCalculating(false);
    }
  };

  // Step 3: Save Estimate and Generate Proposal
  const handleSaveEstimate = async () => {
    if (!calculationResult) return;
    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        customerName,
        companyName,
        email,
        phone,
        rawRequirement,
        structuredRequirement: analysisResult,
        calculationResult,
        overrideReason,
        internalNotes,
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save estimate');

      router.push(`/admin/estimates/${data.data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save estimate.');
      setSaving(false);
    }
  };

  const toggleAddOn = (code: string) => {
    const updated = selectedAddOns.includes(code)
      ? selectedAddOns.filter((c) => c !== code)
      : [...selectedAddOns, code];
    setSelectedAddOns(updated);
    triggerCalculation({ addOnCodes: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <span>Admin Estimation Pipeline</span>
            <span>•</span>
            <span>Step-by-Step Workbench</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Project Estimate
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Paste natural language project requirements. The AI parses scope and unknowns; the deterministic engine computes reproducible pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {calculationResult && (
            <button
              onClick={handleSaveEstimate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save & Generate Proposal
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Left Column (Input & AI Review) / Right Column (Real-time Pricing & Commercials) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Lead Details Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-600" />
              1. Customer & Account Context
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Customer Contact Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Natural Language Input Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                2. Paste Customer Requirement
              </h3>
              <span className="text-[11px] text-slate-400">Natural language input</span>
            </div>

            {/* Quick Sample Selector */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="text-slate-400 self-center">Try prompt:</span>
              {SAMPLE_SCENARIOS.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => loadScenario(sc)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  {sc.title.split(':')[0]}
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              value={rawRequirement}
              onChange={(e) => setRawRequirement(e.target.value)}
              placeholder="Paste raw email, technical brief, or meeting notes here..."
              className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Prompt-injection guarded. Fact/inference attribution enabled.
              </p>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Scope...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze Requirements
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Extracted Scope & Uncertainty Box */}
          {analysisResult && (
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-5 bg-gradient-to-b from-blue-50/20 to-transparent">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  3. Extracted Requirements & Confidence Badges
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold uppercase">
                  Verified Schema
                </span>
              </div>

              {/* Attribution Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Cloud</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{analysisResult.targetEnvironment.value}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-medium">
                      {analysisResult.targetEnvironment.source}
                    </span>
                    <span className="text-[9px] text-slate-400">{analysisResult.targetEnvironment.confidence} Conf.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Workload Scale</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {analysisResult.workloadCount.value ? `${analysisResult.workloadCount.value} Servers` : 'Unspecified'}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-medium">
                      {analysisResult.workloadCount.source}
                    </span>
                    <span className="text-[9px] text-slate-400">{analysisResult.workloadCount.confidence} Conf.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Complexity</div>
                  <div className="font-semibold text-slate-800 mt-0.5 capitalize">{analysisResult.complexity.value}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                      {analysisResult.complexity.source}
                    </span>
                    <span className="text-[9px] text-slate-400">{analysisResult.complexity.confidence} Conf.</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Timeline</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{analysisResult.timeline.value}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-medium">
                      {analysisResult.timeline.source}
                    </span>
                    <span className="text-[9px] text-slate-400">{analysisResult.timeline.confidence} Conf.</span>
                  </div>
                </div>
              </div>

              {/* Missing Information & Unknowns (Prompt Section 9) */}
              {analysisResult.unknowns.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Missing Information & Uncertainty Detection ({analysisResult.unknowns.length} Identified)
                  </div>
                  <div className="space-y-2">
                    {analysisResult.unknowns.map((unk, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs ${
                          unk.isCritical
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold flex items-center gap-1.5">
                            {unk.isCritical && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                            )}
                            {unk.field}
                          </span>
                          {unk.affectsPricing && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                              Affects Pricing
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{unk.description}</p>
                        <div className="mt-2 text-[11px] bg-white/80 p-2 rounded border border-amber-100 text-slate-800">
                          <span className="font-semibold text-blue-700">Suggested Question: </span>
                          &ldquo;{unk.suggestedQuestion}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Human-in-the-Loop Override Panel (Section 10) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  4. Admin Review & Parameter Adjustment
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Admin is the final authority. Tweak parameters to adjust deterministic pricing in real time.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Primary Service
                </label>
                <select
                  value={serviceKey}
                  onChange={(e) => {
                    setServiceKey(e.target.value);
                    triggerCalculation({ serviceKey: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="cloud-migration">Cloud Infrastructure Migration (Base: ₹3.0L)</option>
                  <option value="cloud-architecture">Well-Architected Cloud Foundation (Base: ₹2.2L)</option>
                  <option value="devops-automation">DevOps & CI/CD Platform (Base: ₹1.8L)</option>
                  <option value="kubernetes-platform">Kubernetes Platform Engineering (Base: ₹2.6L)</option>
                  <option value="disaster-recovery">Disaster Recovery & Continuity (Base: ₹2.0L)</option>
                  <option value="cost-optimization">FinOps & Cloud Cost Optimization (Base: ₹1.5L)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Environment
                </label>
                <select
                  value={environmentCode}
                  onChange={(e) => {
                    setEnvironmentCode(e.target.value);
                    triggerCalculation({ environmentCode: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="aws">AWS (×1.00 standard)</option>
                  <option value="azure">Azure (×1.05)</option>
                  <option value="gcp">Google Cloud Platform (×1.05)</option>
                  <option value="hybrid">Hybrid / Multi-Cloud (×1.30)</option>
                  <option value="on_premise">Private Cloud / On-Premise (×1.15)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Workload Scale
                </label>
                <select
                  value={scaleCode}
                  onChange={(e) => {
                    setScaleCode(e.target.value);
                    triggerCalculation({ scaleCode: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="1_10">1 – 10 Workloads / VMs (×1.00)</option>
                  <option value="11_25">11 – 25 Workloads / VMs (×1.25)</option>
                  <option value="26_50">26 – 50 Workloads / VMs (×1.60)</option>
                  <option value="51_100">51 – 100 Workloads / VMs (×2.10)</option>
                  <option value="101_plus">101+ Workloads / Hyperscale (×2.80)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Technical Complexity
                </label>
                <select
                  value={complexityCode}
                  onChange={(e) => {
                    setComplexityCode(e.target.value);
                    triggerCalculation({ complexityCode: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="low">Low (Lift-and-shift, minimal DB) (×0.85)</option>
                  <option value="medium">Medium (Standard multi-tier) (×1.00)</option>
                  <option value="high">High (Complex topologies, clustering) (×1.35)</option>
                  <option value="enterprise">Enterprise (Mission-critical, zero downtime) (×1.75)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Timeline Urgency
                </label>
                <select
                  value={timelineCode}
                  onChange={(e) => {
                    setTimelineCode(e.target.value);
                    triggerCalculation({ timelineCode: e.target.value });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium text-slate-800 bg-white"
                >
                  <option value="flexible">Flexible (&gt; 12 weeks) (×0.95)</option>
                  <option value="standard">Standard (8 – 12 weeks) (×1.00)</option>
                  <option value="accelerated">Accelerated (4 – 7 weeks) (×1.20)</option>
                  <option value="urgent">Urgent (&lt; 4 weeks) (×1.45)</option>
                </select>
              </div>
            </div>

            {/* Technical Add-ons Checklist */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Technical Add-Ons & Architectural Modules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { code: 'ha', name: 'High Availability (Multi-AZ)', price: '₹40,000' },
                  { code: 'dr', name: 'Disaster Recovery (Cross-Region)', price: '₹60,000' },
                  { code: 'terraform', name: 'Infrastructure as Code (Terraform)', price: '₹30,000' },
                  { code: 'cicd', name: 'CI/CD Deployment Pipelines', price: '₹25,000' },
                  { code: 'monitoring', name: 'Centralized Observability & Alerts', price: '₹20,000' },
                  { code: 'security_hardening', name: 'Security Hardening & CIS Benchmarks', price: '₹45,000' },
                  { code: 'support_24_7', name: '24/7 Managed Support Setup', price: '₹50,000' },
                  { code: 'backup_automation', name: 'Automated Snapshot Policies', price: '₹20,000' },
                  { code: 'kubernetes', name: 'Kubernetes Platform Setup', price: '₹65,000' },
                ].map((addon) => {
                  const isChecked = selectedAddOns.includes(addon.code);
                  return (
                    <label
                      key={addon.code}
                      onClick={() => toggleAddOn(addon.code)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-[11px]">{addon.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500 font-normal">
                        +{addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Real-Time Deterministic Estimate & Commercials */}
        <div className="lg:col-span-5 space-y-6 sticky top-6">
          {/* Main Indicative Range Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Indicative Estimate
                </span>
                <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
                  {calculationResult ? (
                    <>
                      ₹{(calculationResult.indicativeLow / 100000).toFixed(2)}L – ₹
                      {(calculationResult.indicativeHigh / 100000).toFixed(2)}L
                    </>
                  ) : (
                    '₹— – ₹—'
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Timeline</span>
                <div className="font-semibold text-slate-200 text-xs mt-1">
                  {calculationResult?.timelineWeeks.label || '6 – 10 weeks'}
                </div>
              </div>
            </div>

            {/* Benchmark vs PrimeCore Price Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  Market Benchmark
                </div>
                <div className="font-mono font-semibold text-slate-200 mt-1">
                  {calculationResult?.benchmarkComparison?.benchmarkFound ? (
                    `₹${(calculationResult.benchmarkComparison.benchmarkLow! / 100000).toFixed(1)}L – ₹${(calculationResult.benchmarkComparison.benchmarkHigh! / 100000).toFixed(1)}L`
                  ) : (
                    'Benchmark Unavailable'
                  )}
                </div>
                <div className="text-[9px] text-slate-400 mt-1 truncate">
                  {calculationResult?.benchmarkComparison?.sourceName || 'Survey Index'}
                </div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-blue-500/30">
                <div className="text-[10px] text-blue-400 uppercase font-semibold">
                  PrimeCore Recommended
                </div>
                <div className="font-mono font-bold text-blue-300 mt-1">
                  {calculationResult
                    ? `₹${calculationResult.primeCoreRecommendedPrice.toLocaleString('en-IN')}`
                    : '—'}
                </div>
                <div className="text-[9px] text-emerald-400 mt-1">
                  {calculationResult?.discount.totalDiscountAmount
                    ? `Discount applied (-₹${calculationResult.discount.totalDiscountAmount.toLocaleString('en-IN')})`
                    : 'Standard Card Rate'}
                </div>
              </div>
            </div>

            {/* Commercial Adjustments & Discount Engine */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Commercial Discount (%)</span>
                <span className="font-mono text-blue-400 font-bold">{discountPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={discountPercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDiscountPercent(val);
                  triggerCalculation({ discountPercentage: val });
                }}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% Standard</span>
                <span className="text-amber-400 font-medium">Max Allowed Cap: 20%</span>
                <span>25%</span>
              </div>

              {discountPercent > 20 && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800 text-amber-300 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Discount exceeds 20% cap! Engine strictly clamps to 20% limit.</span>
                </div>
              )}

              {/* Admin Price Override */}
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Manual Final Override (INR) — Optional
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 520000"
                    value={adminOverridePrice}
                    onChange={(e) => {
                      setAdminOverridePrice(e.target.value);
                      triggerCalculation({ adminOverridePrice: e.target.value });
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                {adminOverridePrice && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Mandatory Reason: e.g. Strategic Anchor Client"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveEstimate}
                disabled={saving || !calculationResult}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Persisting Estimate...
                  </>
                ) : (
                  <>
                    Save Estimate & Review Proposal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Internal Line-Item Calculation Breakdown (Section 24) */}
          {calculationResult && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Internal Calculation Breakdown
                </h4>
                <span className="font-mono text-[10px] text-slate-400">
                  {calculationResult.pricingVersion}
                </span>
              </div>

              <div className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Base Service Fee:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{calculationResult.service.basePrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>
                    Environment Factor ({calculationResult.factors.environment.label}):
                  </span>
                  <span>×{calculationResult.factors.environment.multiplier}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Scale Factor ({calculationResult.factors.scale.label}):</span>
                  <span>×{calculationResult.factors.scale.multiplier}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>
                    Complexity Factor ({calculationResult.factors.complexity.label}):
                  </span>
                  <span>×{calculationResult.factors.complexity.multiplier}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Timeline Factor ({calculationResult.factors.timeline.label}):</span>
                  <span>×{calculationResult.factors.timeline.multiplier}</span>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-100 text-slate-800 font-medium">
                  <span>Scaled Infrastructure Base:</span>
                  <span>₹{calculationResult.scaledBasePrice.toLocaleString('en-IN')}</span>
                </div>

                {calculationResult.addOns.map((item) => (
                  <div key={item.code} className="flex justify-between text-slate-500">
                    <span>+ {item.name}:</span>
                    <span>₹{item.calculatedAmount.toLocaleString('en-IN')}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Subtotal:</span>
                  <span>₹{calculationResult.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {calculationResult.discount.totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({calculationResult.discount.requestedPercentage}%):</span>
                    <span>-₹{calculationResult.discount.totalDiscountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {calculationResult.adminOverride && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Admin Override:</span>
                    <span>₹{calculationResult.adminOverride.overridePrice.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t-2 border-slate-800 font-bold text-slate-900 text-xs">
                  <span>Final Calculated:</span>
                  <span className="text-blue-700">₹{calculationResult.finalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
