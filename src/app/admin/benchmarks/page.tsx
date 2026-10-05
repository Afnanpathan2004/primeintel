'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  RefreshCw,
  Building,
} from 'lucide-react';

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [serviceKey, setServiceKey] = useState('cloud-migration');
  const [region, setRegion] = useState('India');
  const [currency, setCurrency] = useState('INR');
  const [lowPrice, setLowPrice] = useState('');
  const [highPrice, setHighPrice] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [scopeDescription, setScopeDescription] = useState('');
  const [confidence, setConfidence] = useState('Medium');
  const [assumptions, setAssumptions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBenchmarks = async () => {
    try {
      const res = await fetch('/api/benchmarks');
      const json = await res.json();
      if (json.success) setBenchmarks(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey,
          region,
          currency,
          lowPrice: Number(lowPrice),
          highPrice: Number(highPrice),
          sourceName,
          sourceUrl: sourceUrl || undefined,
          scopeDescription,
          confidence,
          assumptions: assumptions || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save benchmark');

      setShowForm(false);
      setLowPrice('');
      setHighPrice('');
      setSourceName('');
      setScopeDescription('');
      fetchBenchmarks();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading market benchmarks...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Market Benchmark Repository
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            External industry rate card indexes and comparative consulting bands. Strict provenance required.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Market Benchmark'}
        </button>
      </div>

      {/* Strict Provenance Policy Alert (Section 13, 14) */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">PrimeCore Benchmark Provenance Policy:</span>
          <p className="text-blue-900/80 text-[11px] mt-0.5 leading-relaxed">
            Never fabricate industry data. Every benchmark entry must document its verified source, date retrieved, geographic region, methodology, and scope. If verified data is unavailable for a given niche, the engine reports &ldquo;Benchmark Unavailable&rdquo;.
          </p>
        </div>
      </div>

      {/* Add Benchmark Drawer/Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl border border-blue-200 shadow-md space-y-4 text-xs"
        >
          <h3 className="font-bold text-sm text-slate-900">Record New Benchmark Observation</h3>

          {errorMsg && <div className="text-red-600 font-medium">{errorMsg}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Service Catalog Key *
              </label>
              <select
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="cloud-migration">Cloud Infrastructure Migration</option>
                <option value="cloud-architecture">Well-Architected Cloud Foundation</option>
                <option value="devops-automation">DevOps & CI/CD Platform</option>
                <option value="kubernetes-platform">Kubernetes Platform Engineering</option>
                <option value="disaster-recovery">Disaster Recovery & Continuity</option>
                <option value="cost-optimization">FinOps & Cost Optimization</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Region & Geography *
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Currency *
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Low Price Bound *
              </label>
              <input
                type="number"
                placeholder="500000"
                value={lowPrice}
                onChange={(e) => setLowPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                High Price Bound *
              </label>
              <input
                type="number"
                placeholder="700000"
                value={highPrice}
                onChange={(e) => setHighPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Data Confidence Tier *
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              >
                <option value="High">High (Recent formal bids/surveys)</option>
                <option value="Medium">Medium (Rate card index)</option>
                <option value="Low">Low (Informal estimate)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Source Name & Organization *
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Cloud Consulting Survey 2026"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Source Reference URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Scope of Work Included in Benchmark *
            </label>
            <input
              type="text"
              placeholder="e.g. 25-50 VM on-prem to AWS migration with HA, DR, CI/CD"
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {submitting ? 'Saving...' : 'Save Benchmark Record'}
            </button>
          </div>
        </form>
      )}

      {/* Benchmarks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {benchmarks.map((bm) => (
          <div
            key={bm.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  {bm.serviceKey}
                </span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                  ₹{(bm.lowPrice / 100000).toFixed(1)}L – ₹{(bm.highPrice / 100000).toFixed(1)}L
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  bm.confidence === 'High'
                    ? 'bg-emerald-100 text-emerald-800'
                    : bm.confidence === 'Medium'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {bm.confidence} Confidence
              </span>
            </div>

            <div className="space-y-2 text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">Scope: </span>
                <span>{bm.scopeDescription}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Region: </span>
                <span>{bm.region} ({bm.currency})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Source: </span>
                <span>{bm.sourceName}</span>
                {bm.sourceUrl && (
                  <a
                    href={bm.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              {bm.assumptions && (
                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                  &ldquo;{bm.assumptions}&rdquo;
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
