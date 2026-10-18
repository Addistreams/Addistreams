'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type UploadStatus = 'Queued' | 'Approved' | 'Rejected';

type Track = {
  id: string;
  title: string;
  status: UploadStatus;
  created_at: string;
  file_size: number;
  mastering: number;
  file_path: string;
  source?: string;
};

export default function MasterDashboard() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'monetization' | 'approvals'>('overview');
  const [queue, setQueue] = useState<Track[]>([]);
  const [activeCreators, setActiveCreators] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    void (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace('/login?next=%2Fadmin');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (!active) return;
      if (profileError || profile?.role !== 'admin') {
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      const [{ data: rows, error: tracksError }, { count, error: creatorsError }] = await Promise.all([
        supabase.from('tracks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'creator'),
      ]);

      if (!active) return;
      if (tracksError || creatorsError) {
        setError(tracksError?.message ?? creatorsError?.message ?? 'Could not load moderation data.');
      } else {
        setActiveCreators(count ?? 0);
        const hydratedTracks = await Promise.all((rows ?? []).map(async (track) => {
          const { data } = await supabase.storage.from('tracks').createSignedUrl(track.file_path, 3600);
          return { ...track, source: data?.signedUrl } as Track;
        }));
        if (active) setQueue(hydratedTracks);
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  const updateTrackStatus = async (id: string, status: UploadStatus) => {
    if (!supabase) return;
    const { error: updateError } = await supabase.from('tracks').update({ status }).eq('id', id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setQueue((current) => current.map((item) => item.id === id ? { ...item, status } : item));
  };

  const pendingQueue = queue.filter((item) => item.status === 'Queued');

  if (!supabase) {
    return <AdminMessage title="Admin setup required" message="Configure Supabase in the deployment environment and apply supabase/schema.sql before opening the moderation console." />;
  }

  if (loading) {
    return <AdminMessage title="Loading moderation" message="Checking administrator access and loading the track queue." />;
  }

  if (!isAdmin) {
    return <AdminMessage title="Administrator access required" message="This account does not have the admin role. Ask the project owner to grant access in Supabase." />;
  }

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
        <Link href="/creator" className="text-xs text-slate-400 hover:text-white transition">
          Creator Studio →
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
                <p className="text-xs text-slate-400 mt-1">Current counts from your Supabase project.</p>
              </div>

              {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Revenue</span>
                  <p className="text-lg font-black text-slate-300 mt-2">Stripe not connected</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Active Creators</span>
                  <p className="text-3xl font-black mt-2">{activeCreators}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Awaiting Review</span>
                  <p className="text-3xl font-black text-amber-400 mt-2">{pendingQueue.length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Tracks Submitted</span>
                  <p className="text-3xl font-black mt-2">{queue.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monetization' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-2xl font-black">Billing Integration</h2>
                <p className="text-xs text-slate-400 mt-1">Payment processing is not enabled for this project yet.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-amber-400">Stripe account required</h3>
                <p className="text-sm leading-6 text-slate-300">Credit pack payments need a Stripe account, server-side API key, and a verified webhook. Secret keys must be added to Vercel environment variables, never entered or stored in this dashboard.</p>
                <p className="text-xs text-slate-500">Until billing is connected, upload credit purchases remain disabled and no payment will be collected.</p>
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
                            <p className="font-bold text-white">{item.title}</p>
                          <p className="text-xs text-slate-400">
                            {new Date(item.created_at).toLocaleDateString()} • Mastering {item.mastering > 0 ? `+${item.mastering}` : item.mastering} dB
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            {item.status}
                          </span>
                          <button
                            onClick={() => void updateTrackStatus(item.id, 'Approved')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => void updateTrackStatus(item.id, 'Rejected')}
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

function AdminMessage({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-xl font-black text-amber-300">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">{message}</p>
        <Link href="/" className="mt-6 inline-block text-sm font-bold text-amber-300">Back to Addistream</Link>
      </section>
    </main>
  );
}
