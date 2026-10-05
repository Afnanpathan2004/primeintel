'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, ShieldCheck, LogOut, User } from 'lucide-react';

export function Header() {
  const router = useRouter();
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between no-print shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-slate-800">
          PrimeIntel Workbench
        </h1>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Internal Mode
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Estimate
        </Link>
        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300">
            {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'PI'}
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-800">
              {currentUser?.name || 'Authorized Estimator'}
            </div>
            <div className="text-[10px] text-blue-600 font-mono font-medium">
              {currentUser?.role || 'ESTIMATOR'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
