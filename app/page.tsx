import Link from "next/link";

const stats = [
  { label: "Streams this month", value: "2.4M" },
  { label: "Creator accounts", value: "1,284" },
  { label: "Avg. payout", value: "$4,860" },
];

const pillars = [
  {
    title: "Upload Studio",
    description:
      "Creators can drop tracks, assign metadata, and manage release-ready uploads without friction.",
    accent: "text-amber-300",
  },
  {
    title: "Distribution Network",
    description:
      "Push content to streaming platforms and build a wider audience with a lightweight distribution engine.",
    accent: "text-blue-300",
  },
  {
    title: "Monetization",
    description:
      "Offer $10 upload packs, free trials, and revenue tracking that keeps every creator deal clear.",
    accent: "text-emerald-300",
  },
  {
    title: "Owner Analytics",
    description:
      "See revenue, creator counts, trial performance, and approval queues from the master dashboard.",
    accent: "text-pink-300",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-6 py-6 md:px-8">
        <header className="flex items-center justify-between rounded-full border border-slate-800/80 bg-slate-900/70 px-4 py-3 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-500 text-sm font-black text-slate-950 shadow-lg shadow-amber-400/30">
              A
            </div>
            <h1 className="text-xl font-black tracking-[0.18em] text-amber-400 md:text-2xl">
              ADDI<span className="text-white">STREAMS</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login?next=/creator"
              className="rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-400/50 hover:text-amber-300"
            >
              Creator Login
            </Link>
            <Link
              href="/login?next=/admin"
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              👑 Admin Login
            </Link>
          </div>
        </header>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-10 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-7">
            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">
              Music distribution for modern creators
            </span>

            <h2 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Publish your sound.<br />
              Grow your audience.<br />
              Scale your income.
            </h2>

            <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
              Addistream gives artists and labels a streamlined path to upload tracks, monitor performance, approve content, and distribute music with a polished creator-first workflow.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login?next=/creator"
                className="rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 shadow-lg shadow-amber-500/20 transition hover:scale-[1.01]"
              >
                Launch Creator Portal
              </Link>
              <Link
                href="/login?next=/admin"
                className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                Owner Dashboard
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span>Upload-ready</span>
              <span>•</span>
              <span>Approval flow</span>
              <span>•</span>
              <span>Creator payouts</span>
            </div>
          </div>

          <div className="brand-glow rounded-[28px] border border-amber-400/20 bg-slate-900/80 p-5 shadow-2xl shadow-slate-950/70">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Live platform</p>
                <h3 className="mt-2 text-3xl font-black text-white">$18,420</h3>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                +18.2%
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                  <span className="text-sm text-slate-400">{stat.label}</span>
                  <span className="text-lg font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-500/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Revenue flow</p>
              <div className="mt-4 h-24 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-400/20 to-sky-400/20 p-3">
                <div className="flex h-full items-end gap-2">
                  {[25, 45, 30, 60, 38, 72, 84].map((height, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-xl bg-gradient-to-t from-amber-400 via-yellow-300 to-emerald-300"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">The four core pillars</p>
          <h3 className="mt-3 text-3xl font-black text-white">Built for the full creator lifecycle</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl shadow-slate-950/50 transition hover:-translate-y-1 hover:border-amber-500/30">
              <div className={`mb-4 inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${pillar.accent}`}>
                {pillar.title.split(" ")[0]}
              </div>
              <h4 className="text-xl font-black text-white">{pillar.title}</h4>
              <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-12 md:px-8">
          <div className="rounded-[32px] border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-8 text-center shadow-[0_30px_80px_rgba(251,191,36,0.08)]">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Ready to launch</p>
            <h3 className="mt-3 text-3xl font-black text-white">Turn streaming into a real business</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/login?next=/creator"
                className="rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950"
              >
                Open Creator Portal
              </Link>
              <Link
                href="/login?next=/admin"
                className="rounded-xl border border-slate-700 bg-slate-950/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white"
              >
                Open Owner Console
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

