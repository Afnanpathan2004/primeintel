'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isBootstrap, setIsBootstrap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
          router.push('/admin');
          return;
        }
        setIsBootstrap(!data.systemInitialized);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const endpoint = isBootstrap ? '/api/auth/bootstrap' : '/api/auth/login';
      const body = isBootstrap ? { email, name, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication request failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-ink-muted text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Checking system security status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-9 h-9 rounded bg-primary mx-auto flex items-center justify-center text-white font-bold text-sm tracking-tight">
          PI
        </div>
        <h2 className="mt-3 text-lg font-bold tracking-tight text-ink">
          PrimeIntel Workbench
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Internal Estimation Intelligence Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-6 px-6 sm:px-8 rounded border border-border shadow-none space-y-5">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink uppercase tracking-wider">
              {isBootstrap ? 'First-Run Setup (Initialize Admin)' : 'Authorized Sign In'}
            </span>
            <span className="font-mono text-[10px] text-primary uppercase font-medium">
              Internal
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-accent-subtle border border-accent/20 text-accent text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isBootstrap && (
            <div className="p-3 rounded bg-subtle border border-border text-ink-muted text-xs leading-relaxed">
              No administrator accounts were detected in the database. Please configure the initial Super Admin account to initialize the system.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isBootstrap && (
              <div>
                <label className="block text-[11px] font-medium text-ink mb-1">
                  Administrator Full Name *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Architect"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@primecoreinfo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink mb-1">
                Password {isBootstrap ? '(Minimum 8 characters)' : ''} *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded border border-border bg-surface text-ink text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isBootstrap ? 'Initialize Super Admin' : 'Sign In to Workbench'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-border text-[10px] text-ink-muted text-center leading-relaxed">
            Strictly internal operations • Decoupled from public website • Scrypt-secured
          </div>
        </div>
      </div>
    </div>
  );
}
