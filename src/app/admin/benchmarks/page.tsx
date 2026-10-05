'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Plus,
  ExternalLink,
  ShieldAlert,
  RefreshCw,
  X,
} from 'lucide-react';
import { formatCurrency, formatCurrencyRange } from '@/lib/currency';

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
  const [confidence, setConfidence] = useState('High');
  const [status, setStatus] = useState('VERIFIED');
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
          sourceName: sourceName.trim(),
          sourceUrl: sourceUrl.trim() || undefined,
          scopeDescription: scopeDescription.trim(),
          confidence,
          status,
          assumptions: assumptions.trim() || undefined,
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
      <div className="flex items-center justify-center py-24 text-ink-muted text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading verified benchmarks...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
            Reference Data Console
          </div>
          <h2 className="text-xl font-bold text-ink tracking-tight">
            Market Benchmarks Repository
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Verified external rate card references and scope bands. Strict provenance required.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shrink-0"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{showForm ? 'Close Entry Form' : 'Add Benchmark'}</span>
        </button>
      </div>

      {/* Provenance Integrity Policy Note */}
      <div className="p-3.5 rounded bg-subtle border border-border text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
        <div className="text-ink leading-relaxed">
          <span className="font-semibold">Provenance Policy: </span>
          <span className="text-ink-muted">
            All benchmark entries require primary source attribution, geographic scope, and retrieval dates. Entries marked as Verified participate in comparative estimation.
          </span>
        </div>
      </div>

      {/* Add Benchmark Drawer/Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-surface p-5 rounded border border-border space-y-4 text-xs"
        >
          <div className="border-b border-border pb-2">
            <h3 className="font-bold text-ink text-xs uppercase tracking-wider">
              Record Verified Market Benchmark
            </h3>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Enter primary source metrics for third-party consulting rate bands.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2 rounded bg-accent-subtle text-accent text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Service Key *
              </label>
              <select
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
              >
                <option value="cloud-migration">Cloud Migration</option>
                <option value="cloud-architecture">Cloud Architecture</option>
                <option value="devops-automation">DevOps & CI/CD</option>
                <option value="kubernetes-platform">Kubernetes Platform</option>
                <option value="disaster-recovery">Disaster Recovery</option>
                <option value="cost-optimization">FinOps & Cost Optimization</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Region / Geography *
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Currency *
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Lower Bound Price *
              </label>
              <input
                type="number"
                placeholder="500000"
                value={lowPrice}
                onChange={(e) => setLowPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Upper Bound Price *
              </label>
              <input
                type="number"
                placeholder="750000"
                value={highPrice}
                onChange={(e) => setHighPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
              >
                <option value="VERIFIED">VERIFIED (Calculation Active)</option>
                <option value="DRAFT">DRAFT (Pending Review)</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Source Organization & Survey Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Indian Cloud Consulting Survey"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Source URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink mb-1">
              Scope of Work Included *
            </label>
            <input
              type="text"
              placeholder="e.g. 25-50 VM on-premise migration with HA, DR, and CI/CD"
              value={scopeDescription}
              onChange={(e) => setScopeDescription(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-border">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded border border-border bg-surface hover:bg-subtle text-ink font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 rounded bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Benchmark'}
            </button>
          </div>
        </form>
      )}

      {/* Structured Benchmarks Table (Section 20) */}
      <div className="bg-surface rounded border border-border overflow-hidden">
        {benchmarks.length === 0 ? (
          <div className="py-16 text-center text-xs text-ink-muted">
            <BarChart3 className="w-8 h-8 text-ink-faint mx-auto mb-2" />
            <div className="font-semibold text-ink">No market benchmarks recorded</div>
            <p className="text-[11px] text-ink-muted max-w-xs mx-auto mt-1 mb-4">
              Add primary industry rate cards to enable benchmark comparisons in estimates.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Benchmark</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle text-ink-muted border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4">Region</th>
                  <th className="py-2.5 px-4">Currency</th>
                  <th className="py-2.5 px-4">Low Bound</th>
                  <th className="py-2.5 px-4">High Bound</th>
                  <th className="py-2.5 px-4">Source & Scope</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-ink">
                {benchmarks.map((bm) => {
                  const isVerified = bm.status === 'VERIFIED';
                  const isExpired = bm.status === 'EXPIRED';

                  return (
                    <tr key={bm.id} className="hover:bg-subtle transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        {bm.serviceKey}
                      </td>
                      <td className="py-3 px-4 text-ink-muted">{bm.region}</td>
                      <td className="py-3 px-4 font-mono text-ink-muted">{bm.currency}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-ink tabular-nums">
                        {formatCurrency(bm.lowPrice, bm.currency)}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-ink tabular-nums">
                        {formatCurrency(bm.highPrice, bm.currency)}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-ink truncate flex items-center gap-1">
                          <span>{bm.sourceName}</span>
                          {bm.sourceUrl && (
                            <a
                              href={bm.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline inline-block"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted truncate">
                          {bm.scopeDescription}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            isVerified
                              ? 'bg-primary-subtle text-primary border border-primary/20'
                              : isExpired
                              ? 'bg-accent-subtle text-accent border border-accent/20'
                              : 'bg-subtle text-ink-muted border border-border'
                          }`}
                        >
                          {bm.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
