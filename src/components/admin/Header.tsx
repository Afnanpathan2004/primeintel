'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, LogOut, User, ShieldCheck } from 'lucide-react';

const routeTitles: Record<string, string> = {
  '/admin': 'Operations Dashboard',
  '/admin/estimates': 'Estimates Archive',
  '/admin/estimates/new': 'Create Estimate Workbench',
  '/admin/leads': 'Client Pipeline & Leads',
  '/admin/pricing': 'Commercial Pricing Console',
  '/admin/benchmarks': 'Market Benchmarks Repository',
  '/admin/audit': 'Audit & Compliance Trail',
  '/admin/settings': 'System Boundaries & Settings',
};

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getPageTitle = () => {
    if (pathname.startsWith('/admin/estimates/') && pathname !== '/admin/estimates/new') {
      return 'Estimate Proposal Detail';
    }
    return routeTitles[pathname] || 'Enterprise Workbench';
  };

  return (
    <header className="h-14 bg-surface border-b border-border px-6 flex items-center justify-between no-print shrink-0">
      {/* Current Page Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-xs font-semibold text-ink uppercase tracking-wider">
          {getPageTitle()}
        </h1>
        <span className="text-border">/</span>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-muted bg-subtle border border-border">
          PrimeCore Internal
        </span>
      </div>

      {/* Action Area & User Profile */}
      <div className="flex items-center gap-3">
        {pathname !== '/admin/estimates/new' && (
          <Link
            href="/admin/estimates/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Estimate</span>
          </Link>
        )}

        <div className="h-4 w-px bg-border" />

        {/* User Identity */}
        <div className="flex items-center gap-2 text-xs">
          <div className="text-right leading-tight">
            <div className="font-semibold text-ink text-[11px]">
              {currentUser?.name || 'Authorized Estimator'}
            </div>
            <div className="text-[10px] font-mono text-ink-muted">
              {currentUser?.role || 'ESTIMATOR'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out of Workbench"
            className="p-1.5 text-ink-muted hover:text-accent hover:bg-accent-subtle rounded transition-colors ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
