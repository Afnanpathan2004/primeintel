'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function PricingRulesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'multipliers' | 'addons' | 'versions'>('services');

  // New Version Form
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
  const [newMaxDiscount, setNewMaxDiscount] = useState('20');
  const [newCurrency, setNewCurrency] = useState('INR');
  const [creatingVersion, setCreatingVersion] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchPricingData = async () => {
    try {
      const res = await fetch('/api/pricing');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingData();
  }, []);

  const handleUpdateService = async (service: any) => {
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_SERVICE',
          id: service.id,
          basePrice: service.basePrice,
          minPrice: service.minPrice,
          maxPrice: service.maxPrice,
          active: service.active,
        }),
      });
      if (res.ok) {
        setNotification(`Updated configuration for ${service.name}.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMultiplier = async (m: any) => {
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_MULTIPLIER',
          id: m.id,
          multiplier: m.multiplier,
          active: m.active,
        }),
      });
      if (res.ok) {
        setNotification(`Updated multiplier ${m.label} to ×${m.multiplier}.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateAddOn = async (addon: any) => {
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_ADDON',
          id: addon.id,
          value: addon.value,
          active: addon.active,
        }),
      });
      if (res.ok) {
        setNotification(`Updated add-on value for ${addon.name}.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateVersionSnapshot = async () => {
    if (!newVersionName.trim()) return;
    setCreatingVersion(true);
    try {
      const res = await fetch('/api/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_VERSION',
          version: newVersionName.trim(),
          description: newVersionDesc.trim(),
          maxDiscountPercentage: Number(newMaxDiscount) || 20,
          currency: newCurrency,
        }),
      });
      if (res.ok) {
        setNewVersionName('');
        setNewVersionDesc('');
        setNotification(`Published and activated version snapshot ${newVersionName}.`);
        setTimeout(() => setNotification(null), 3000);
        await fetchPricingData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingVersion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-ink-muted text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading commercial pricing rules...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="text-[10px] font-mono text-ink-muted uppercase tracking-wider mb-0.5">
          Commercial Management Console
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">
          Pricing Rules & Calculation Factors
        </h2>
        <p className="text-xs text-ink-muted mt-0.5">
          Configure baseline engagement fees, complexity multipliers, add-on modules, and version snapshots.
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded bg-primary-subtle border border-primary/30 text-primary text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border text-xs font-medium">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'services'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Services Catalog ({data?.services?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('multipliers')}
          className={`px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'multipliers'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Factor Multipliers ({data?.multipliers?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'addons'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Technical Add-Ons ({data?.addOns?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'versions'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Version Snapshots ({data?.versions?.length || 0})
        </button>
      </div>

      {/* TAB 1: SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-surface rounded border border-border p-5 space-y-4">
          <div className="text-xs text-ink-muted">
            Define baseline professional fees and protective min/max boundaries for each service offering.
          </div>
          <div className="space-y-3">
            {data?.services?.map((svc: any) => (
              <div
                key={svc.id}
                className="p-3.5 rounded border border-border bg-subtle space-y-2.5 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-ink text-xs">{svc.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-ink-muted">({svc.key})</span>
                    <p className="text-[11px] text-ink-muted mt-0.5">{svc.description}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateService(svc)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted uppercase mb-1">
                      Base Fee ({svc.currency || 'INR'})
                    </label>
                    <input
                      type="number"
                      value={svc.basePrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) =>
                            s.id === svc.id ? { ...s, basePrice: val } : s
                          ),
                        }));
                      }}
                      className="w-full text-xs px-2.5 py-1 rounded border border-border bg-surface text-ink font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted uppercase mb-1">
                      Minimum Floor
                    </label>
                    <input
                      type="number"
                      value={svc.minPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) =>
                            s.id === svc.id ? { ...s, minPrice: val } : s
                          ),
                        }));
                      }}
                      className="w-full text-xs px-2.5 py-1 rounded border border-border bg-surface text-ink font-mono focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-ink-muted uppercase mb-1">
                      Maximum Ceiling
                    </label>
                    <input
                      type="number"
                      value={svc.maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) =>
                            s.id === svc.id ? { ...s, maxPrice: val } : s
                          ),
                        }));
                      }}
                      className="w-full text-xs px-2.5 py-1 rounded border border-border bg-surface text-ink font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MULTIPLIERS */}
      {activeTab === 'multipliers' && (
        <div className="bg-surface rounded border border-border p-5 space-y-4">
          <div className="text-xs text-ink-muted">
            Compound factor multipliers adjusting baseline cost by Target Environment, Scale, Complexity, and Timeline.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.multipliers?.map((m: any) => (
              <div
                key={m.id}
                className="p-3 rounded border border-border bg-subtle flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="font-semibold text-ink">{m.label}</div>
                  <div className="text-[10px] text-ink-muted uppercase font-mono mt-0.5">
                    Category: {m.category} • {m.code}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-ink-muted font-mono text-xs">×</span>
                  <input
                    type="number"
                    step="0.05"
                    value={m.multiplier}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setData((prev: any) => ({
                        ...prev,
                        multipliers: prev.multipliers.map((item: any) =>
                          item.id === m.id ? { ...item, multiplier: val } : item
                        ),
                      }));
                    }}
                    className="w-16 px-1.5 py-1 text-xs rounded border border-border bg-surface font-mono text-center font-bold text-ink focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleUpdateMultiplier(m)}
                    className="p-1 rounded bg-surface border border-border hover:bg-subtle text-ink transition-colors"
                    title="Save Multiplier"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="bg-surface rounded border border-border p-5 space-y-4">
          <div className="text-xs text-ink-muted">
            Modular architectural add-ons (Fixed amount in currency or Percentage of scaled base).
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.addOns?.map((addon: any) => (
              <div
                key={addon.id}
                className="p-3 rounded border border-border bg-subtle flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="font-semibold text-ink">{addon.name}</div>
                  <div className="text-[10px] text-ink-muted mt-0.5">{addon.description}</div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface border border-border text-ink-muted mt-1 inline-block">
                    {addon.pricingType}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={addon.value}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setData((prev: any) => ({
                        ...prev,
                        addOns: prev.addOns.map((item: any) =>
                          item.id === addon.id ? { ...item, value: val } : item
                        ),
                      }));
                    }}
                    className="w-24 px-1.5 py-1 text-xs rounded border border-border bg-surface font-mono text-right font-bold text-ink focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => handleUpdateAddOn(addon)}
                    className="p-1 rounded bg-surface border border-border hover:bg-subtle text-ink transition-colors"
                    title="Save Add-on"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERSION SNAPSHOTS */}
      {activeTab === 'versions' && (
        <div className="space-y-5">
          {/* Create Version Form */}
          <div className="bg-surface rounded border border-border p-5 space-y-3">
            <div className="border-b border-border pb-2">
              <h3 className="font-bold text-ink text-xs uppercase tracking-wider">
                Publish & Activate Version Snapshot
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                Snapshots freeze all active rates into an immutable configuration. Existing estimates remain permanently bound to their creation version.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Version Tag *
                </label>
                <input
                  type="text"
                  placeholder="2026.11.01"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Description / Business Justification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 2026 Enterprise Rate Card Baseline"
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Max Discount Policy Cap (%)
                </label>
                <input
                  type="number"
                  value={newMaxDiscount}
                  onChange={(e) => setNewMaxDiscount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-surface text-ink font-mono text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={handleCreateVersionSnapshot}
              disabled={creatingVersion || !newVersionName.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {creatingVersion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Publish & Activate Version</span>
            </button>
          </div>

          {/* Versions Table */}
          <div className="bg-surface rounded border border-border overflow-hidden">
            <div className="p-3 border-b border-border font-bold text-xs uppercase text-ink">
              Recorded Pricing Versions
            </div>

            {data?.versions?.length === 0 ? (
              <div className="py-12 text-center text-xs text-ink-muted">
                No pricing versions published yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-subtle text-ink-muted border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Version</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Discount Cap</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-ink">
                  {data?.versions?.map((v: any) => {
                    const isActive = v.status === 'ACTIVE' || v.isActive;

                    return (
                      <tr key={v.id} className="hover:bg-subtle transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-ink">
                          v{v.version}
                        </td>
                        <td className="py-3 px-4 text-ink-muted">{v.description || '—'}</td>
                        <td className="py-3 px-4 font-mono text-ink">
                          {v.maxDiscountPercentage || 20}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                              isActive
                                ? 'bg-primary-subtle text-primary border border-primary/20'
                                : 'bg-subtle text-ink-muted border border-border'
                            }`}
                          >
                            {isActive ? 'Active Baseline' : 'Archived'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-ink-muted font-mono text-[11px]">
                          {new Date(v.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
