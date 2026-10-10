'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
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

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CreatorDashboard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [credits, setCredits] = useState(10);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [uploadName, setUploadName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [masteringBoost, setMasteringBoost] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('owner@addistream.com');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setTracks([
        { id: 1, name: 'Midnight Echo', status: 'Approved', date: 'Today', size: '4.2 MB', mastering: 2 },
        { id: 2, name: 'City Lights', status: 'Queued', date: 'Yesterday', size: '3.1 MB', mastering: -1 },
      ]);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Track[];
      setTracks(parsed);
    } catch {
      setTracks([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
    }
  }, [tracks]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromStorage = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      try {
        const parsed = JSON.parse(saved) as Track[];
        setTracks(parsed);
      } catch {
        setTracks([]);
      }
    };

    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  useEffect(() => {
    if (!selectedFiles[0]) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFiles[0]);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFiles]);

  const remainingLabel = useMemo(() => {
    if (credits <= 0) return 'No upload credits left';
    return `${credits} uploads remaining`;
  }, [credits]);

  const addFiles = (incomingFiles: FileList | File[]) => {
    const audioFiles = Array.from(incomingFiles).filter((file) => file.type.startsWith('audio/'));

    if (!audioFiles.length) return;

    setSelectedFiles((current) => {
      const merged = [...current];

      audioFiles.forEach((file) => {
        const exists = merged.some(
          (existing) => existing.name === file.name && existing.size === file.size,
        );

        if (!exists) merged.push(file);
      });

      return merged;
    });
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

  const handleBuyPack = () => {
    setCheckoutOpen((value) => !value);
  };

  const handleCheckout = () => {
    setCredits((value) => value + 10);
    setCheckoutOpen(false);
  };

  const handleUploadTrack = () => {
    if (!selectedFiles.length || credits <= 0 || uploading) {
      return;
    }

    const file = selectedFiles[0];
    const name = uploadName.trim() || file.name.replace(/\.[^/.]+$/, '');
    setUploading(true);

    window.setTimeout(() => {
      setTracks((current) => [
        {
          id: Date.now(),
          name,
          status: 'Queued',
          date: 'Just now',
          size: formatFileSize(file.size),
          mastering: masteringBoost,
          source: previewUrl ?? undefined,
        },
        ...current,
      ]);

      setSelectedFiles((current) => current.slice(1));
      setUploadName('');
      setCredits((value) => value - 1);
      setUploading(false);
      setIsPreviewing(false);
    }, 900);
  };

  const totalSelectedSize = selectedFiles.reduce((total, file) => total + file.size, 0);

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
              onClick={handleBuyPack}
              className="mt-4 w-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold py-2 rounded-xl transition"
            >
              Buy 10 Uploads Pack ($10)
            </button>

            {checkoutOpen && (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Checkout</p>
                  <p className="mt-2 text-lg font-black text-white">10 uploads • $10.00</p>
                </div>

                <input
                  type="email"
                  value={checkoutEmail}
                  onChange={(event) => setCheckoutEmail(event.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-sm text-white"
                />

                <button
                  onClick={handleCheckout}
                  className="w-full bg-amber-400 text-slate-950 font-black px-3 py-2 rounded-lg text-xs uppercase tracking-wider"
                >
                  Complete purchase
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Total Streams
            </h3>
            <p className="text-4xl font-black mt-2">24,830</p>
            <p className="text-xs text-emerald-400 mt-1">+12.4% this month</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Earnings
            </h3>
            <p className="text-4xl font-black text-teal-400 mt-2">$1,240.50</p>
            <p className="text-xs text-slate-500 mt-1">Payout in 3 days</p>
          </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">Add songs</h2>
            <span className="text-xs text-slate-400">{selectedFiles.length} file(s) ready</span>
          </div>

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
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles((current) => current.filter((_, idx) => idx !== index))}
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
                    {uploadName.trim() || selectedFiles[0].name.replace(/\.[^/.]+$/, '')}
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
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <audio controls src={previewUrl} className="w-full" />
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
                  <p className="font-semibold text-white">{track.name}</p>
                  <p className="text-xs text-slate-400">{track.date} • {track.size}</p>
                </div>

                <div className="flex items-center gap-3">
                  {track.source && (
                    <audio controls src={track.source} className="h-8 w-48" />
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