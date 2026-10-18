'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoadingState />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginLoadingState() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl animate-pulse rounded-[32px] border border-slate-800 bg-slate-900/80 p-10">
        <div className="h-4 w-28 rounded bg-slate-700" />
        <div className="mt-6 h-10 w-2/3 rounded bg-slate-700" />
        <div className="mt-4 h-4 w-1/2 rounded bg-slate-700" />
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get('next') ?? '/creator';
  const nextPath = requestedPath.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/creator';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(nextPath);
    });
  }, [nextPath, router, supabase]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError('Authentication is not configured yet. Add the Supabase URL and public anon key to the deployment environment.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');

    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });

    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setNotice('Check your email to confirm your account, then sign in.');
      return;
    }

    router.push(nextPath);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_35%),linear-gradient(135deg,#020817_0%,#0f172a_45%,#111827_100%)] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-[0.18em] text-amber-300">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-500 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/30">A</span>
            <span>
              ADDI<span className="text-white">STREAMS</span>
            </span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-200 transition hover:border-slate-500"
          >
            Back home
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-amber-300">
              Creator-first workflow
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Sign in to manage uploads, approvals, and payouts.
            </h1>
            <p className="max-w-xl text-base text-slate-300 md:text-lg">
              Addistream keeps your music delivery pipeline simple: upload tracks, preview mastering, review approvals, and monitor payouts from one clean workspace.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Audio', 'Private storage'],
                ['Review', 'Admin controlled'],
                ['Access', 'Account protected'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/50">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.8)] backdrop-blur-sm">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Welcome back</p>
              <h2 className="mt-2 text-2xl font-black text-white">Log in</h2>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-xl border border-slate-700 bg-slate-950 p-1">
              <button type="button" onClick={() => setMode('signin')} className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider ${mode === 'signin' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}>
                Sign in
              </button>
              <button type="button" onClick={() => setMode('signup')} className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider ${mode === 'signup' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'}`}>
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  placeholder="you@addistream.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-amber-400"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </div>
              )}
              {notice && (
                <div role="status" className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {notice}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-105"
              >
                {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {!supabase && (
              <div role="status" className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
                Supabase is not configured for this deployment yet.
              </div>
            )}
            {mode === 'signup' && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
                Accounts are verified by email. New accounts start with 10 upload credits.
              </div>
            )}
            {mode === 'signin' && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
                Sign in with the email and password you used to create your account.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
