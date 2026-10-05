'use client';

import Link from 'next/link';
import { Database, AlertTriangle, RefreshCw } from 'lucide-react';

interface DatabaseErrorStateProps {
  title?: string;
  message?: string;
}

export function DatabaseErrorState({
  title = 'Database Service Unavailable',
  message = "We couldn't access the database right now. Please verify your PostgreSQL connection and try again.",
}: DatabaseErrorStateProps) {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 font-sans">
      <div className="bg-surface rounded border border-accent/40 p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3 text-accent border-b border-accent/20 pb-4">
          <div className="w-9 h-9 rounded bg-accent-subtle flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-accent">
              {title}
            </h2>
            <div className="text-[11px] font-mono text-ink-muted mt-0.5">
              Enterprise PostgreSQL Connection Status: UNAVAILABLE
            </div>
          </div>
        </div>

        <p className="text-xs text-ink leading-relaxed">
          {message}
        </p>

        <div className="p-3.5 rounded bg-subtle border border-border text-[11px] text-ink-muted space-y-1.5 font-mono">
          <div className="font-semibold text-ink">Diagnostic Checklist:</div>
          <div>1. Verify <span className="font-bold text-ink">DATABASE_URL</span> environment variable in your deployment settings.</div>
          <div>2. Ensure your managed PostgreSQL instance (Supabase, Neon, AWS RDS) is reachable and accepting connections.</div>
          <div>3. Confirm database migrations have been deployed via <span className="text-primary font-bold">npx prisma migrate deploy</span>.</div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/api/health"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface border border-border hover:bg-subtle text-ink text-xs font-medium transition-colors"
          >
            <span>View System Diagnostics (/api/health)</span>
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatabaseErrorState;
