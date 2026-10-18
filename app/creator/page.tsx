'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
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

type SelectedAudioFile = {
  file: File;
  previewUrl: string;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CreatorDashboard() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const [credits, setCredits] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<SelectedAudioFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [masteringBoost, setMasteringBoost] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previewUrl = selectedFiles[0]?.previewUrl ?? null;

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    void (async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace('/login?next=%2Fcreator');
        return;
      }

      setUserId(authData.user.id);
      const [{ data: profile, error: profileError }, { data: rows, error: tracksError }] = await Promise.all([
        supabase.from('profiles').select('upload_credits').eq('id', authData.user.id).single(),
        supabase.from('tracks').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: false }),
      ]);

      if (!active) return;
      if (profileError || tracksError) {
        setError(profileError?.message ?? tracksError?.message ?? 'Could not load your studio data.');
      } else {
        setCredits(profile.upload_credits);
        const hydratedTracks = await Promise.all((rows ?? []).map(async (track) => {
          const { data } = await supabase.storage.from('tracks').createSignedUrl(track.file_path, 3600);
          return { ...track, source: data?.signedUrl } as Track;
        }));
        if (active) setTracks(hydratedTracks);
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  const remainingLabel = useMemo(() => {
    if (credits <= 0) return 'No upload credits left';
    return `${credits} uploads remaining`;
  }, [credits]);

  const addFiles = (incomingFiles: FileList | File[]) => {
    const audioFiles = Array.from(incomingFiles).filter((file) => file.type.startsWith('audio/'));

    if (!audioFiles.length) {
      setError('Choose an audio file to upload.');
      return;
    }

    setError('');

    const additions = audioFiles
      .filter((file) => !selectedFiles.some((entry) => entry.file.name === file.name && entry.file.size === file.size))
      .map((file) => {
        const url = URL.createObjectURL(file);
        previewUrlsRef.current.add(url);
        return { file, previewUrl: url };
      });
    if (additions.length) setSelectedFiles((current) => [...current, ...additions]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addFiles(event.target.files);
      event.target.value = '';
    }
  };

  const handleUploadTrack = async () => {
    if (!supabase || !userId || !selectedFiles.length || credits <= 0 || uploading) {
      return;
    }

    const selectedAudio = selectedFiles[0];
    const file = selectedAudio.file;
    const name = uploadName.trim() || file.name.replace(/\.[^/.]+$/, '');
    setUploading(true);
    setError('');

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${userId}/${crypto.randomUUID()}-${safeFileName}`;
    const { error: storageError } = await supabase.storage.from('tracks').upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

    if (storageError) {
      setError(storageError.message);
      setUploading(false);
      return;
    }

    const { data: track, error: submitError } = await supabase.rpc('submit_track', {
      track_title: name,
      track_file_path: filePath,
      track_file_size: file.size,
      track_mastering: masteringBoost,
    });

    if (submitError) {
      await supabase.storage.from('tracks').remove([filePath]);
      setError(submitError.message);
      setUploading(false);
      return;
    }

    const fileUrl = selectedAudio.previewUrl;
    setTracks((current) => [{ ...track, source: fileUrl } as Track, ...current]);
    setSelectedFiles((current) => current.slice(1));
    setUploadName('');
    setCredits((value) => value - 1);
    setUploading(false);
    setIsPreviewing(false);
  };

  const totalSelectedSize = selectedFiles.reduce((total, entry) => total + entry.file.size, 0);

  const handleDownload = (track: Track) => {
    if (!track.source) return;

    const anchor = document.createElement('a');
    anchor.href = track.source;
    anchor.download = track.file_path.split('/').pop() ?? `${track.title}.audio`;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (!supabase) {
    return <DashboardMessage title="Studio setup required" message="Add the Supabase project URL and public anon key to the environment, then apply supabase/schema.sql in the Supabase SQL editor." />;
  }

  if (loading) {
    return <DashboardMessage title="Loading your studio" message="Checking your account and loading your music library." />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">
      <header className="max-w-6xl mx-auto flex flex-col gap-4 pb-6 mb-8 border-b border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-2xl font-black text-amber-400">
            ADDI<span className="text-white">STREAMS</span>
          </Link>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Creator Studio</p>
        </div>

        <Link href="/" className="text-sm text-slate-400 hover:text-white transition">
          ← Back to home
        </Link>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Upload Credits Remaining
            </h3>
            <p className="text-4xl font-black text-amber-400 mt-2">{credits}</p>
            <p className="text-xs text-slate-500 mt-1">1 credit = 1 track upload</p>
            <button
              disabled
              className="mt-4 w-full cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold py-2 rounded-xl"
            >
              Credit purchases unavailable
            </button>
            <p className="mt-2 text-[11px] text-slate-500">Connect Stripe to enable credit packs.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Tracks Submitted</h3>
            <p className="text-4xl font-black mt-2">{tracks.length}</p>
            <p className="text-xs text-slate-500 mt-1">Stored in your library</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Approved Tracks</h3>
            <p className="text-4xl font-black text-teal-400 mt-2">{tracks.filter((track) => track.status === 'Approved').length}</p>
            <p className="text-xs text-slate-500 mt-1">Revenue reporting is not connected</p>
          </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">Add songs</h2>
            <span className="text-xs text-slate-400">{selectedFiles.length} file(s) ready</span>
          </div>

          {error && <p role="alert" className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
              isDragging
                ? 'border-amber-400 bg-amber-400/5'
                : 'border-slate-700 bg-slate-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleInputChange}
              className="hidden"
              id="song-upload-input"
            />

            <label htmlFor="song-upload-input" className="cursor-pointer block">
              <div className="text-3xl mb-3">🎵</div>
              <p className="text-lg font-bold text-white">
                Drag & drop your songs here
              </p>
              <p className="mt-2 text-sm text-slate-400">
                or click to browse audio files from your device
              </p>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between pb-3">
                <p className="text-sm font-bold text-white">Selected songs</p>
                <span className="text-xs text-slate-400">{formatFileSize(totalSelectedSize)}</span>
              </div>

              <div className="space-y-2">
                {selectedFiles.map(({ file }, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const removed = selectedFiles[index];
                        URL.revokeObjectURL(removed.previewUrl);
                        previewUrlsRef.current.delete(removed.previewUrl);
                        setSelectedFiles((current) => current.filter((_, idx) => idx !== index));
                      }}
                      className="text-xs font-bold text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Track title
              </label>
              <input
                value={uploadName}
                onChange={(event) => setUploadName(event.target.value)}
                placeholder="Leave blank to use your file name"
                className="w-full bg-slate-950 border border-slate-700 px-3 py-3 rounded-xl text-sm text-white placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={handleUploadTrack}
              disabled={selectedFiles.length === 0 || credits <= 0 || uploading}
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/10 transition"
            >
              {uploading ? 'Uploading...' : '+ Upload Song'}
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Preview & mastering</p>
                  <h3 className="mt-1 text-lg font-black text-white">
                    {uploadName.trim() || selectedFiles[0].file.name.replace(/\.[^/.]+$/, '')}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewing((value) => !value)}
                  className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300"
                >
                  {isPreviewing ? 'Stop preview' : 'Listen preview'}
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Mastering gain</span>
                  <span>{masteringBoost > 0 ? `+${masteringBoost} dB` : `${masteringBoost} dB`}</span>
                </div>

                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={masteringBoost}
                  onChange={(event) => setMasteringBoost(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />

                <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                  <span>Lower</span>
                  <span>Balanced</span>
                  <span>Boost</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400"
                    style={{ width: `${((masteringBoost + 6) / 12) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isPreviewing ? 'Playing' : 'Standby'}
                </span>
              </div>

              {previewUrl && (
                <div className="mt-4 space-y-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950 p-3">
                  <audio controls src={previewUrl} className="w-full" />
                  <a
                    href={previewUrl}
                    download={`${uploadName.trim() || selectedFiles[0].file.name.replace(/\.[^/.]+$/, '')}.mp3`}
                    className="inline-flex rounded-lg bg-amber-400 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-950"
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
            <span>{remainingLabel}</span>
            <span className="text-amber-400">{credits <= 0 ? 'Purchase another pack' : 'Ready to distribute'}</span>
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black">Upload Queue</h2>
            <span className="text-xs text-slate-400">{tracks.length} tracks</span>
          </div>

          <div className="space-y-3">
            {tracks.map((track) => (
              <div key={track.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{track.title}</p>
                  <p className="text-xs text-slate-400">{new Date(track.created_at).toLocaleDateString()} • {formatFileSize(track.file_size)}</p>
                </div>

                <div className="flex items-center gap-2">
                  {track.source && (
                    <>
                      <audio controls src={track.source} className="h-8 w-48" />
                      <button
                        type="button"
                        onClick={() => handleDownload(track)}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:border-amber-400 hover:text-amber-300"
                      >
                        Download
                      </button>
                    </>
                  )}
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      track.status === 'Approved'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                        : track.status === 'Queued'
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                          : 'border-red-500/40 bg-red-500/10 text-red-300'
                    }`}
                  >
                    {track.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardMessage({ title, message }: { title: string; message: string }) {
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