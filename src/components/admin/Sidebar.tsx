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
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'Estimates', href: '/admin/estimates', icon: FileSpreadsheet },
      { name: 'New Estimate', href: '/admin/estimates/new', icon: Calculator },
      { name: 'Leads & Pipeline', href: '/admin/leads', icon: Users },
    ],
  },
  {
    title: 'Commercial',
    items: [
      { name: 'Pricing Rules', href: '/admin/pricing', icon: Sliders },
      { name: 'Market Benchmarks', href: '/admin/benchmarks', icon: BarChart3 },
    ],
  },
  {
    title: 'Governance',
    items: [
      { name: 'Audit Logs', href: '/admin/audit', icon: History },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0 no-print">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-border gap-2.5">
        <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-bold text-xs tracking-tight shrink-0">
          PI
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-ink text-xs tracking-tight truncate">
            PrimeIntel
          </div>
          <div className="text-[10px] text-ink-muted leading-tight truncate">
            Estimation Intelligence
          </div>
        </div>
      </div>

      {/* Internal System Mode Indicator */}
      <div className="px-3 py-2 bg-subtle border-b border-border text-[10px] text-ink-muted flex items-center justify-between">
        <span className="font-medium">System Mode</span>
        <span className="font-mono text-[9px] text-primary font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-subtle border border-primary/20">
          Internal
        </span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href) && (item.href !== '/admin/estimates' || pathname === '/admin/estimates' || pathname.startsWith('/admin/estimates/')));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white font-semibold'
                      : 'text-ink hover:bg-subtle hover:text-ink'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-ink-muted'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Meta */}
      <div className="p-3 border-t border-border bg-subtle text-[10px] text-ink-muted space-y-1">
        <div className="flex items-center justify-between">
          <span>Engine</span>
          <span className="font-mono text-ink font-medium">Deterministic</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Environment</span>
          <span className="font-mono text-primary font-medium">Production Eval</span>
        </div>
      </div>
    </aside>
  );
}
