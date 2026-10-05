import Link from 'next/link';
import { PlusCircle, Search, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between no-print shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-slate-800">
          PrimeCore Internal Workbench
        </h1>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Isolated Internal Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/estimates/new"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Estimate
        </Link>
        <div className="h-6 w-px bg-slate-200 mx-1" />
        <div className="flex items-center gap-2 pl-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-300">
            AE
          </div>
          <div className="text-left">
            <div className="text-xs font-medium text-slate-800">Afnan (Admin)</div>
            <div className="text-[10px] text-slate-500">Lead Cloud Estimator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
