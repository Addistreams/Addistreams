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
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="max-w-6xl mx-auto flex justify-between items-center px-6 py-6 md:px-8">
        <h1 className="text-2xl font-black tracking-wider text-amber-400">
          ADDI<span className="text-white">STREAMS</span>
        </h1>

        <div className="flex gap-3">
          <Link
            href="/creator"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition"
          >
            Creator Dashboard
          </Link>
          <Link
            href="/admin"
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
          >
            👑 Master Admin
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pb-12 pt-10 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-amber-300">
              Media & Music Distribution
            </span>

            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Stream, Upload & Distribute Your Content
            </h2>

            <p className="max-w-xl text-base text-slate-400">
              Addistream gives creators a simple path to upload tracks, monetize content, and grow with a fast distribution engine built for modern music brands.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/creator"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider"
              >
                Launch Creator Portal
              </Link>
              <Link
                href="/admin"
                className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wider"
              >
                Owner Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live platform</p>
                <h3 className="mt-2 text-2xl font-black text-white">$18,420</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 text-[10px] font-bold uppercase text-emerald-400">
                +18.2%
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                  <span className="text-sm text-slate-400">{stat.label}</span>
                  <span className="font-black text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 md:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">The four core pillars</p>
          <h3 className="mt-3 text-3xl font-black">Built for the full creator lifecycle</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/40">
              <div className={`mb-4 inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${pillar.accent}`}>
                {pillar.title.split(" ")[0]}
              </div>
              <h4 className="text-xl font-black text-white">{pillar.title}</h4>
              <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-8">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Ready to launch</p>
            <h3 className="mt-3 text-3xl font-black">Turn streaming into a real business</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/creator"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider"
              >
                Open Creator Portal
              </Link>
              <Link
                href="/admin"
                className="border border-slate-700 bg-slate-950 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wider"
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

