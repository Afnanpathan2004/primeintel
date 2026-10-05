'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

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
      setErrorMsg(err.message || 'An error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Checking system security status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
          PI
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          PrimeIntel
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Internal Project Estimation & Commercial Architecture Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-800">
          <div className="mb-6 pb-4 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isBootstrap ? 'First-Run Setup (Initialize Admin)' : 'Secure Admin Portal'}
            </span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isBootstrap && (
            <div className="mb-5 p-3 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs">
              No administrator accounts detected. Please configure the initial Super Admin account to initialize PrimeIntel.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isBootstrap && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lead Architect"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@primecoreinfo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password {isBootstrap ? '(Min 8 chars)' : ''} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    {isBootstrap ? 'Initialize Super Admin' : 'Sign In to Workbench'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
            Internal Platform • Decoupled from public website • Role-enforced
          </div>
        </div>
      </div>
    </div>
  );
}
