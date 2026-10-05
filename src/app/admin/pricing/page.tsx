'use client';

import { useEffect, useState } from 'react';
import {
  Sliders,
  Layers,
  Save,
  CheckCircle,
  RefreshCw,
  PlusCircle,
  Shield,
  Tag,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function PricingRulesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'multipliers' | 'addons' | 'versions'>('services');

  // New Version form
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDesc, setNewVersionDesc] = useState('');
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
        setNotification(`Updated '${service.name}' pricing configuration.`);
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
        setNotification(`Updated multiplier '${m.label}' to ×${m.multiplier}.`);
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
        setNotification(`Updated add-on '${addon.name}' value.`);
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
          version: newVersionName,
          description: newVersionDesc,
        }),
      });
      if (res.ok) {
        setNewVersionName('');
        setNewVersionDesc('');
        setNotification(`Successfully created and activated pricing version snapshot '${newVersionName}'.`);
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
      <div className="flex items-center justify-center py-24 text-slate-500 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Loading pricing rules...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pricing Rules & Multipliers Engine
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure base catalog rates, multi-cloud adjustments, workload scale factors, and immutable version snapshots.
        </p>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Services Catalog ({data?.services?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('multipliers')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'multipliers'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Multipliers ({data?.multipliers?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'addons'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Technical Add-ons ({data?.addOns?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`px-4 py-2.5 border-b-2 transition-all ${
            activeTab === 'versions'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Version Snapshots ({data?.versions?.length || 0})
        </button>
      </div>

      {/* TAB 1: SERVICES */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Each service defines a baseline professional fee and boundary clamps (minimum floor and maximum ceiling).
          </div>
          <div className="space-y-4">
            {data?.services?.map((svc: any) => (
              <div
                key={svc.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{svc.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-slate-400">({svc.key})</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{svc.description}</p>
                  </div>
                  <button
                    onClick={() => handleUpdateService(svc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Rule
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Base Fee (INR)
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
                      className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Min Price Floor (INR)
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
                      className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                      Max Price Ceiling (INR)
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
                      className="w-full text-xs px-3 py-1.5 rounded border border-slate-300 font-mono"
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Multipliers scale the base service effort based on Environment, Workload Scale, Complexity, and Timeline Urgency.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.multipliers?.map((m: any) => (
              <div
                key={m.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-800">{m.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-medium">
                    Category: <span className="text-blue-600">{m.category}</span> • code: {m.code}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">×</span>
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
                    className="w-20 px-2 py-1 text-xs rounded border border-slate-300 font-mono text-center font-bold"
                  />
                  <button
                    onClick={() => handleUpdateMultiplier(m)}
                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    title="Save"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TECHNICAL ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Configure line-item values for technical features (Fixed INR or Percentage of base).
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.addOns?.map((addon: any) => (
              <div
                key={addon.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="font-semibold text-slate-800">{addon.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{addon.description}</div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono mt-1 inline-block">
                    {addon.pricingType}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono">₹</span>
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
                    className="w-28 px-2 py-1 text-xs rounded border border-slate-300 font-mono text-right font-bold"
                  />
                  <button
                    onClick={() => handleUpdateAddOn(addon)}
                    className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    title="Save"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERSION SNAPSHOTS (IMMUTABILITY) */}
      {activeTab === 'versions' && (
        <div className="space-y-6">
          {/* Create Version Snapshot Box */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6 space-y-4 bg-gradient-to-r from-blue-50/20 to-transparent">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Create & Activate New Pricing Version Snapshot
            </h3>
            <p className="text-xs text-slate-600">
              When business rates change, create a new version snapshot (e.g. <span className="font-mono font-bold">2026.11.01</span>). Existing estimates will forever remain linked to their original snapshot!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Version Identifier (e.g. 2026.11.01) *
                </label>
                <input
                  type="text"
                  placeholder="2026.11.01"
                  value={newVersionName}
                  onChange={(e) => setNewVersionName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Snapshot Notes & Justification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 2026 Cloud Rate Card Revision"
                  value={newVersionDesc}
                  onChange={(e) => setNewVersionDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
            <button
              onClick={handleCreateVersionSnapshot}
              disabled={creatingVersion || !newVersionName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {creatingVersion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
              Create & Activate Version Snapshot
            </button>
          </div>

          {/* Versions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase text-slate-500">
              Recorded Pricing Versions
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Version</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data?.versions?.map((v: any) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      v{v.version}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{v.description}</td>
                    <td className="py-4 px-6">
                      {v.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Active Model
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          Archived Snapshot
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {new Date(v.createdAt).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
