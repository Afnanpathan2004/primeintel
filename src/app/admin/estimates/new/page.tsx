'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Check,
  ChevronDown,
  Building,
  User,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';
import { StructuredRequirement } from '@/lib/ai/types';
import { PricingCalculationResult } from '@/lib/pricing/types';
import { formatCurrency, formatCurrencyRange, formatCompactCurrency } from '@/lib/currency';

export default function NewEstimatePage() {
  const router = useRouter();

  // Account State
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rawRequirement, setRawRequirement] = useState('');

  // Active Pricing Verification
  const [pricingActive, setPricingActive] = useState<boolean | null>(null);
  const [activeVersionName, setActiveVersionName] = useState<string>('');
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StructuredRequirement | null>(null);

  // Admin Adjustable Parameters
  const [serviceKey, setServiceKey] = useState('cloud-migration');
  const [environmentCode, setEnvironmentCode] = useState('aws');
  const [scaleCode, setScaleCode] = useState('26_50');
  const [complexityCode, setComplexityCode] = useState('medium');
  const [timelineCode, setTimelineCode] = useState('standard');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  // Commercial & Pricing State
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [adminOverridePrice, setAdminOverridePrice] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>('');

  const [calculating, setCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<PricingCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkPricingStatus() {
      try {
        const res = await fetch('/api/pricing');
        const json = await res.json();
        if (json.success) {
          const active = json.data.versions?.find((v: any) => v.status === 'ACTIVE' || v.isActive);
          setPricingActive(!!active);
          setActiveVersionName(active?.version || '');
          setServicesCatalog(json.data.services || []);
          if (json.data.services?.length > 0) {
            setServiceKey(json.data.services[0].key);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkPricingStatus();
  }, []);

  // Step 1: AI Analysis
  const handleAnalyze = async () => {
    if (!rawRequirement.trim()) {
      setErrorMsg('Please input customer project requirements prior to running analysis.');
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
      if (!res.ok) throw new Error(data.error || 'Requirement analysis failed');

      const req: StructuredRequirement = data.data;
      setAnalysisResult(req);

      // Map extracted values to admin controls
      setServiceKey(req.primaryServiceKey.value || 'cloud-migration');
      setEnvironmentCode(req.environmentCode.value || 'aws');
      setScaleCode(req.scaleCode.value || '26_50');
      setComplexityCode(req.complexityCode.value || 'medium');
      setTimelineCode(req.timelineCode.value || 'standard');
      setSelectedAddOns(req.detectedAddOnCodes.value || []);

      if (pricingActive) {
        triggerCalculation({
          serviceKey: req.primaryServiceKey.value || 'cloud-migration',
          environmentCode: req.environmentCode.value || 'aws',
          scaleCode: req.scaleCode.value || '26_50',
          complexityCode: req.complexityCode.value || 'medium',
          timelineCode: req.timelineCode.value || 'standard',
          addOnCodes: req.detectedAddOnCodes.value || [],
          discountPercentage: discountPercent,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Requirement analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 2: Deterministic Calculation
  const triggerCalculation = async (overrideParams?: any) => {
    if (!pricingActive) {
      setErrorMsg('No active pricing version. Activate a configuration snapshot in Commercial Settings before calculating.');
      return;
    }

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

  // Step 3: Save Estimate & Proposal
  const handleSaveEstimate = async () => {
    if (!customerName.trim() || !companyName.trim()) {
      setErrorMsg('Customer name and company name are required to generate an estimate.');
      return;
    }
    if (!calculationResult) {
      setErrorMsg('Please run the estimate calculation before saving.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        customerName: customerName.trim(),
        companyName: companyName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        rawRequirement: rawRequirement.trim(),
        structuredRequirement: analysisResult,
        calculationResult,
        overrideReason: overrideReason || null,
        internalNotes: internalNotes.trim() || null,
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
    if (pricingActive) {
      triggerCalculation({ addOnCodes: updated });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
            Internal Estimation Pipeline
          </div>
          <h2 className="text-xl font-bold text-ink tracking-tight">
            Create Project Estimate
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Transform customer requirements into verified scopes and deterministic financial envelopes.
          </p>
        </div>

        {calculationResult && (
          <button
            onClick={handleSaveEstimate}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save & Generate Proposal</span>
          </button>
        )}
      </div>

      {/* System Warning if No Active Pricing */}
      {pricingActive === false && (
        <div className="p-3.5 rounded bg-accent-subtle border border-accent/30 text-accent text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Pricing Configuration Inactive</span>
            <p className="text-accent/90 mt-0.5 leading-relaxed">
              No active pricing baseline was found in the database. An administrator must activate a version under Commercial Settings before calculations can run.
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded bg-accent-subtle border border-accent/30 text-accent text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two-Column Workbench Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: REQUIREMENTS & ANALYSIS (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Customer Account Details */}
          <div className="bg-surface p-4 rounded border border-border space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1.5 flex items-center justify-between">
              <span>1. Customer & Account Context</span>
              <span className="text-[10px] text-ink-muted font-normal">Required for proposal</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Customer Contact Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Enterprises"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Requirement Input */}
          <div className="bg-surface p-4 rounded border border-border space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink border-b border-border pb-1.5 flex items-center justify-between">
              <span>2. Customer Requirement Brief</span>
              <span className="text-[10px] text-ink-muted font-mono">Unstructured Text</span>
            </div>

            <textarea
              rows={6}
              value={rawRequirement}
              onChange={(e) => setRawRequirement(e.target.value)}
              placeholder="Paste customer project requirements, scope emails, infrastructure summaries, RFP requirements..."
              className="w-full p-2.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <span className="text-ink-muted">
                Length capped (6,000 chars) • Prompt-injection shielded
              </span>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzing || !rawRequirement.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Scope...</span>
                  </>
                ) : (
                  <span>Analyze Requirements</span>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Structured AI Analysis (Restrained Enterprise Style) */}
          {analysisResult && (
            <div className="bg-surface p-4 rounded border border-border space-y-4">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink">
                    3. Requirement Understanding & Verification
                  </h3>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    Analysis complete — structured parameters extracted with source attribution.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-subtle border border-border text-ink font-medium">
                  Confidence: {analysisResult.complexity.confidence}
                </span>
              </div>

              {/* Attribution Grid with Restrained Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded bg-subtle border border-border">
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Target Cloud</div>
                  <div className="font-semibold text-ink mt-0.5">{analysisResult.targetEnvironment.value}</div>
                  <div className="text-[9px] font-mono text-ink-muted mt-1 uppercase">
                    {analysisResult.targetEnvironment.source === 'EXPLICIT' ? 'EXPLICIT' : 'INFERRED'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-subtle border border-border">
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Scale</div>
                  <div className="font-semibold text-ink mt-0.5">
                    {analysisResult.workloadCount.value ? `${analysisResult.workloadCount.value} Servers` : 'Unspecified'}
                  </div>
                  <div className="text-[9px] font-mono text-ink-muted mt-1 uppercase">
                    {analysisResult.workloadCount.source === 'EXPLICIT' ? 'EXPLICIT' : 'INFERRED'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-subtle border border-border">
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Complexity</div>
                  <div className="font-semibold text-ink mt-0.5 capitalize">{analysisResult.complexity.value}</div>
                  <div className="text-[9px] font-mono text-ink-muted mt-1 uppercase">
                    {analysisResult.complexity.source === 'EXPLICIT' ? 'EXPLICIT' : 'INFERRED'}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-subtle border border-border">
                  <div className="text-[10px] text-ink-muted uppercase font-semibold">Timeline</div>
                  <div className="font-semibold text-ink mt-0.5">{analysisResult.timeline.value}</div>
                  <div className="text-[9px] font-mono text-ink-muted mt-1 uppercase">
                    {analysisResult.timeline.source === 'EXPLICIT' ? 'EXPLICIT' : 'INFERRED'}
                  </div>
                </div>
              </div>

              {/* Unknowns / Missing Information (Section 17 & 18) */}
              {analysisResult.unknowns.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-accent flex items-center justify-between">
                    <span>Missing Information & Uncertainty ({analysisResult.unknowns.length} items)</span>
                    <span className="text-[10px] font-mono text-accent">REQUIRES CONFIRMATION</span>
                  </div>

                  <div className="space-y-1.5">
                    {analysisResult.unknowns.map((unk, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded bg-accent-subtle/50 border border-accent/20 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-accent">{unk.field}</span>
                          {unk.affectsPricing && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface border border-accent/30 text-accent font-medium">
                              Affects Pricing
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-muted">{unk.description}</p>
                        <div className="text-[11px] bg-surface p-1.5 rounded border border-border text-ink">
                          <span className="font-medium text-ink-muted">Suggested Question: </span>
                          &ldquo;{unk.suggestedQuestion}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Admin Human-in-the-Loop Controls */}
          <div className="bg-surface p-4 rounded border border-border space-y-4">
            <div className="border-b border-border pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink">
                  4. Commercial Parameter Adjustments
                </h3>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  Admin authority controls. Select parameters to recalculate deterministic pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => triggerCalculation()}
                disabled={calculating || !pricingActive}
                className="text-xs font-medium text-primary hover:text-primary-hover underline"
              >
                Recalculate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Primary Consulting Service
                </label>
                <select
                  value={serviceKey}
                  onChange={(e) => {
                    setServiceKey(e.target.value);
                    triggerCalculation({ serviceKey: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                >
                  {servicesCatalog.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.name} ({formatCurrency(s.basePrice)})
                    </option>
                  ))}
                  {servicesCatalog.length === 0 && (
                    <option value="cloud-migration">Cloud Migration</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Target Infrastructure
                </label>
                <select
                  value={environmentCode}
                  onChange={(e) => {
                    setEnvironmentCode(e.target.value);
                    triggerCalculation({ environmentCode: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                >
                  <option value="aws">AWS (Baseline 1.00×)</option>
                  <option value="azure">Azure (1.05×)</option>
                  <option value="gcp">GCP (1.05×)</option>
                  <option value="hybrid">Hybrid / Multi-Cloud (1.30×)</option>
                  <option value="on-prem">Private / On-Premise (1.15×)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Workload Scale
                </label>
                <select
                  value={scaleCode}
                  onChange={(e) => {
                    setScaleCode(e.target.value);
                    triggerCalculation({ scaleCode: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                >
                  <option value="scale_1_10">1 – 10 Workloads (1.00×)</option>
                  <option value="scale_11_25">11 – 25 Workloads (1.25×)</option>
                  <option value="scale_26_50">26 – 50 Workloads (1.60×)</option>
                  <option value="scale_51_100">51 – 100 Workloads (2.10×)</option>
                  <option value="scale_100_plus">100+ Workloads (2.80×)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Project Complexity
                </label>
                <select
                  value={complexityCode}
                  onChange={(e) => {
                    setComplexityCode(e.target.value);
                    triggerCalculation({ complexityCode: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                >
                  <option value="low">Low Complexity (0.85×)</option>
                  <option value="medium">Medium Standard (1.00×)</option>
                  <option value="high">High Complexity (1.35×)</option>
                  <option value="enterprise">Mission-Critical Enterprise (1.75×)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Timeline Urgency
                </label>
                <select
                  value={timelineCode}
                  onChange={(e) => {
                    setTimelineCode(e.target.value);
                    triggerCalculation({ timelineCode: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                >
                  <option value="flexible">Flexible (0.95×)</option>
                  <option value="standard">Standard 8–12 wks (1.00×)</option>
                  <option value="accelerated">Accelerated 4–6 wks (1.20×)</option>
                  <option value="urgent">Urgent &lt; 4 wks (1.45×)</option>
                </select>
              </div>
            </div>

            {/* Add-ons Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider">
                Technical Add-Ons & Architectural Modules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { code: 'ha', name: 'High Availability (Multi-AZ)' },
                  { code: 'dr', name: 'Disaster Recovery (Cross-Region)' },
                  { code: 'terraform', name: 'IaC (Terraform / OpenTofu)' },
                  { code: 'cicd', name: 'Automated CI/CD Pipelines' },
                  { code: 'monitoring', name: 'Centralized Monitoring' },
                  { code: 'security', name: 'Security Hardening' },
                  { code: 'support_24_7', name: '24/7 Managed Support Handover' },
                  { code: 'k8s', name: 'Kubernetes / Container Orchestration' },
                ].map((addon) => {
                  const checked = selectedAddOns.includes(addon.code);
                  return (
                    <label
                      key={addon.code}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                        checked ? 'bg-primary-subtle border-primary/40 text-primary font-medium' : 'bg-surface border-border text-ink hover:bg-subtle'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddOn(addon.code)}
                        className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span className="text-xs truncate">{addon.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FINANCIAL & ESTIMATION WORKSPACE (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-surface rounded border border-border p-4 space-y-4">
            <div className="border-b border-border pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  Deterministic Calculation
                </h3>
                <p className="text-[10px] text-ink-muted">
                  Version: {activeVersionName || 'Active'}
                </p>
              </div>
              {calculating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-ink-muted" />}
            </div>

            {calculationResult ? (
              <div className="space-y-4">
                {/* Financial Statement Line Items */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 text-ink-muted">
                    <span>Base Service Scope</span>
                    <span className="font-mono text-ink tabular-nums">
                      {formatCurrency(calculationResult.service.basePrice)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-ink-muted">
                    <span>Multipliers Compound</span>
                    <span className="font-mono text-ink tabular-nums">
                      {(
                        calculationResult.factors.environment.multiplier *
                        calculationResult.factors.scale.multiplier *
                        calculationResult.factors.complexity.multiplier *
                        calculationResult.factors.timeline.multiplier
                      ).toFixed(2)}×
                    </span>
                  </div>

                  <div className="flex justify-between py-1 text-ink-muted">
                    <span>Scaled Service Base</span>
                    <span className="font-mono text-ink tabular-nums">
                      {formatCurrency(calculationResult.scaledBasePrice)}
                    </span>
                  </div>

                  {calculationResult.addOns.map((addon) => (
                    <div key={addon.name} className="flex justify-between py-1 text-ink-muted">
                      <span className="truncate pr-2">+ {addon.name}</span>
                      <span className="font-mono text-ink tabular-nums">
                        {formatCurrency(addon.calculatedAmount)}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-border pt-2 flex justify-between font-semibold text-ink">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(calculationResult.subtotal)}
                    </span>
                  </div>

                  {/* Discount Controls */}
                  <div className="py-2 border-t border-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">Commercial Discount</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max={calculationResult.discount.maxAllowedPercentage || 20}
                          value={discountPercent}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDiscountPercent(val);
                            triggerCalculation({ discountPercentage: val });
                          }}
                          className="w-14 px-1.5 py-0.5 rounded border border-border text-right font-mono text-xs focus:outline-none focus:border-primary"
                        />
                        <span className="text-ink-muted font-mono text-xs">%</span>
                      </div>
                    </div>

                    {discountPercent > 0 && (
                      <div className="flex justify-between text-[11px] text-accent">
                        <span>Discount Deduction</span>
                        <span className="font-mono tabular-nums">
                          -{formatCurrency(calculationResult.discount.totalDiscountAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Final Calculation Banner */}
                  <div className="p-3 rounded bg-subtle border border-border space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                        PrimeCore Recommended
                      </span>
                      <span className="text-lg font-bold text-ink font-mono tabular-nums">
                        {formatCurrency(calculationResult.finalPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-ink-muted border-t border-border/60 pt-1.5">
                      <span>Indicative Envelope</span>
                      <span className="font-mono font-medium text-ink tabular-nums">
                        {formatCurrencyRange(calculationResult.indicativeLow, calculationResult.indicativeHigh)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Benchmark Side-by-Side (Section 19) */}
                {calculationResult.benchmarkComparison && calculationResult.benchmarkComparison.benchmarkFound && (
                  <div className="p-3 rounded bg-surface border border-border space-y-2 text-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-between">
                      <span>Market Benchmark</span>
                      <span className="font-mono text-[9px] text-primary">Verified</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-ink-muted">Industry Reference Range</span>
                      <span className="font-mono font-semibold text-ink tabular-nums">
                        {formatCurrencyRange(
                          calculationResult.benchmarkComparison.benchmarkLow || 0,
                          calculationResult.benchmarkComparison.benchmarkHigh || 0,
                          calculationResult.benchmarkComparison.currency
                        )}
                      </span>
                    </div>

                    <div className="text-[10px] text-ink-muted">
                      Source: {calculationResult.benchmarkComparison.sourceName || 'Verified Reference'} • Positioning:{' '}
                      <span className="font-semibold text-primary">
                        {calculationResult.benchmarkComparison.varianceVsRecommended || 'Aligned'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Internal Notes / Margin Analysis */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-medium text-ink">
                    Internal Commercial Notes (Confidential)
                  </label>
                  <textarea
                    rows={2}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Document margin assumptions, risk mitigations, or internal notes..."
                    className="w-full p-2 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleSaveEstimate}
                  disabled={saving}
                  className="w-full py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Estimate...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Generate Proposal</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-ink-muted text-xs">
                <FileText className="w-8 h-8 text-ink-faint mx-auto mb-2" />
                <div className="font-medium text-ink">Awaiting Calculation</div>
                <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1">
                  Input customer requirements on the left and click &ldquo;Analyze Requirements&rdquo; or select parameters to calculate.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
