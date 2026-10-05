'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calculator,
  FileSpreadsheet,
  Users,
  Sliders,
  BarChart3,
  History,
  Settings,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'New Estimate', href: '/admin/estimates/new', icon: Calculator, highlight: true },
  { name: 'Estimates', href: '/admin/estimates', icon: FileSpreadsheet },
  { name: 'Leads & Pipeline', href: '/admin/leads', icon: Users },
  { name: 'Pricing & Services', href: '/admin/pricing', icon: Sliders },
  { name: 'Market Benchmarks', href: '/admin/benchmarks', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit', icon: History },
  { name: 'Settings & Snapshots', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 no-print">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold tracking-tight shadow-md">
          PC
        </div>
        <div>
          <div className="font-semibold text-white text-sm tracking-wide">
            PrimeCore
          </div>
          <div className="text-[11px] text-blue-400 font-medium uppercase tracking-wider flex items-center gap-1">
            Estimation Engine
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
        </div>
      </div>

      {/* Internal MVP Notice Badge */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-start gap-2 bg-slate-800/60 rounded-md p-2 text-[11px] text-slate-400 border border-slate-700/50">
          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Internal Admin MVP</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Air-gapped from public website. Deterministic pricing enabled.</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : item.highlight
                  ? 'text-blue-400 hover:bg-slate-800/80 hover:text-white border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="flex-1">{item.name}</span>
              {item.highlight && !isActive && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider">
                  New
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>Pricing Engine</span>
          <span className="font-mono text-emerald-400 font-medium">v2026.10.01</span>
        </div>
        <div className="flex items-center justify-between">
          <span>AI Engine</span>
          <span className="text-blue-400">Gemini 3.8 Flash</span>
        </div>
      </div>
    </aside>
  );
}
