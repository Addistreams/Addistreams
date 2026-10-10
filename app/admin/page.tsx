'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type UploadStatus = 'Queued' | 'Approved' | 'Rejected';

type Track = {
  id: number;
  name: string;
  status: UploadStatus;
  date: string;
  size: string;
  mastering: number;
  source?: string;
};

const STORAGE_KEY = 'addistream-creator-tracks';

export default function MasterDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'monetization' | 'approvals'>('overview');
  const [stripeSecretKey, setStripeSecretKey] = useState('sk_live_demo_123456');
  const [trialDays, setTrialDays] = useState(30);
  const [queue, setQueue] = useState<Track[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setQueue([
        { id: 1, name: 'Midnight Echo', status: 'Approved', date: 'Today', size: '4.2 MB', mastering: 2, source: '' },
        { id: 2, name: 'Velvet Signal', status: 'Queued', date: 'Today', size: '3.1 MB', mastering: -1, source: '' },
      ]);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Track[];
      setQueue(parsed);
    } catch {
      setQueue([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }
  }, [queue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncQueue = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved) as Track[];
        setQueue(parsed);
      } catch {
        setQueue([]);
      }
    };

    window.addEventListener('storage', syncQueue);
    return () => window.removeEventListener('storage', syncQueue);
  }, []);

  const totalRevenue = 1240.5;
  const activeCreators = 12;
  const uploadPacks = 48;

  const handleApprove = (id: number) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Approved' } : item,
      ),
    );
  };

  const handleReject = (id: number) => {
    setQueue((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Rejected' } : item,
      ),
    );
  };

  const pendingQueue = queue.filter((item) => item.status === 'Queued');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            Boss Access
          </span>
          <h1 className="text-xl font-black text-amber-400 tracking-wider">
            ADDI<span className="text-white">STREAMS</span> <span className="text-slate-500 font-normal text-xs">Admin Console</span>
          </h1>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition">
          Exit to Platform →
        </Link>
      </header>

      <div className="flex flex-col md:flex-row flex-1">
        <aside className="w-full md:w-64 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            📊 Platform Analytics
          </button>
          <button
            onClick={() => setActiveTab('monetization')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'monetization' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            💳 Payment & Trial Settings
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'approvals' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800/60'
            }`}
          >
            🎵 Content Moderation
          </button>
        </aside>

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-6xl">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black">Platform Overview</h2>
                <p className="text-xs text-slate-400 mt-1">Live metrics from the Addistream network.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total Revenue</span>
                  <p className="text-3xl font-black text-teal-400 mt-2">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Active Creators</span>
                  <p className="text-3xl font-black mt-2">{activeCreators}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Trial Members</span>
                  <p className="text-3xl font-black text-amber-400 mt-2">{Math.max(1, Math.round(activeCreators / 2))}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Upload Packs Sold</span>
                  <p className="text-3xl font-black mt-2">{uploadPacks}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monetization' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-black">Monetization & Pack Controls</h2>
                <p className="text-xs text-slate-400 mt-1">Configure creator trial rules and payment gateway integration.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-amber-400">1. Creator Free Trial Window</h3>
                <div className="flex items-center gap-4">
                  <label className="text-xs text-slate-300">Default Trial Period (Days):</label>
                  <input
                    type="number"
                    value={trialDays}
                    min={1}
                    onChange={(event) => setTrialDays(Number(event.target.value) || 1)}
                    className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-white w-24"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Creators upload freely during these {trialDays} days. Once expired, they must purchase the $10 Pack (10 credits) to upload.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-amber-400">2. Gateway Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Stripe Secret API Key</label>
                    <input
                      type="password"
                      placeholder="sk_live_..."
                      value={stripeSecretKey}
                      onChange={(event) => setStripeSecretKey(event.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-sm text-white"
                    />
                  </div>
                  <button className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition">
                    Save Gateway Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">Track Approvals Queue</h2>
              <div className="space-y-4">
                {pendingQueue.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
                    No pending content awaiting approval.
                  </div>
                ) : (
                  pendingQueue.map((item) => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">
                            {item.size} • Mastering {item.mastering > 0 ? `+${item.mastering}` : item.mastering} dB
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            {item.status}
                          </span>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            className="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      </div>

                      {item.source && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                          <audio controls src={item.source} className="w-full" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
