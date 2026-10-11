'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';

const SESSION_KEY = 'addistream-session';

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
  const nextPath = searchParams.get('next') ?? '/creator';
  const [email, setEmail] = useState('creator@addistream.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved) {
      router.replace(nextPath);
    }
  }, [nextPath, router]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Enter both your email and password to continue.');
      return;
    }

    const session = {
      email: email.trim(),
      name: email.split('@')[0] || 'creator',
      role: email.includes('admin') ? 'admin' : 'creator',
      loggedInAt: new Date().toISOString(),
    };

    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setError('');
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
                ['Uploads', '2.4M tracks'],
                ['Approvals', '4.8k queued'],
                ['Payouts', '$18.4k / mo'],
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

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-105"
              >
                Sign in
              </button>
            </form>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
              <p className="font-bold uppercase tracking-[0.2em] text-slate-400">Demo access</p>
              <p className="mt-2">Try with any email and password, or use:</p>
              <p className="mt-2 text-amber-300">creator@addistream.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
