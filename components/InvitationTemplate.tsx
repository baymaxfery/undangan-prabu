'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface InvitationConfig {
  theme: 'sage' | 'gold' | 'rose' | 'dark';
  font: 'font-script' | 'font-serif-elegant' | 'font-modern';
  groomName: string;
  groomParents: string;
  brideName: string;
  brideParents: string;
  eventDate: string;
  eventLocation: string;
  showResepsi: boolean;
  resepsiTime: string;
  resepsiLocation: string;
  quote: string;
  coverPhoto: string;
  showGallery?: boolean;
  galleryPhotos?: string[];
  showStory?: boolean;
  story1Title?: string;
  story1Desc?: string;
  story2Title?: string;
  story2Desc?: string;
  showMusic?: boolean;
  musicMode?: 'builtin' | 'custom';
  musicUrl?: string;
  showRsvp: boolean;
  showGift: boolean;
  bankName: string;
  bankNo: string;
  bankOwner: string;
}

interface RsvpItem {
  id: string;
  guest_name: string;
  attendance: string;
  message: string;
}

const THEMES = {
  sage: { bg: '#f3f6f4', text: '#2c3e35', card: '#ffffff', border: '#dbe4de', accent: '#5c7c67' },
  gold: { bg: '#fdfbf7', text: '#3d3122', card: '#ffffff', border: '#ede2cc', accent: '#b8860b' },
  rose: { bg: '#fff5f6', text: '#4a2c35', card: '#ffffff', border: '#f7dce1', accent: '#d46a7e' },
  dark: { bg: '#141417', text: '#f3f4f6', card: '#1f1f24', border: '#32323a', accent: '#d4af37' },
};

export default function InvitationTemplate({
  invitationId,
  config,
  guestName,
  initialRsvps,
}: {
  invitationId: string;
  config: InvitationConfig;
  guestName: string;
  initialRsvps: RsvpItem[];
}) {
  const [isOpened, setIsOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpItem[]>(initialRsvps);
  const [rsvpName, setRsvpName] = useState(guestName !== 'Bapak/Ibu/Saudara/i' ? guestName : '');
  const [attendance, setAttendance] = useState('hadir');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState({ d: '00', h: '00', m: '00', s: '00' });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const melodyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = THEMES[config.theme] || THEMES.sage;
  const coupleShort = `${config.groomName.split(' ')[0]} & ${config.brideName.split(' ')[0]}`;
  const showMusic = config.showMusic ?? true;
  const galleryPhotos = config.galleryPhotos ?? [];

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(config.eventDate).getTime() - Date.now();
      if (isNaN(diff) || diff <= 0) return;
      setCountdown({
        d: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config.eventDate]);

  useEffect(() => {
    return () => {
      if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  function startMusic() {
    if (!showMusic) return;
    setIsPlaying(true);

    if (config.musicMode === 'custom' && config.musicUrl && audioRef.current) {
      audioRef.current.play().catch(() => {});
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
    const ctx = audioCtxRef.current;
    const notes = [261.63, 329.63, 392.0, 493.88, 440.0, 392.0, 329.63, 293.66];
    let step = 0;

    const playNote = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[step % notes.length], ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
      step++;
    };

    playNote();
    if (melodyTimerRef.current) clearInterval(melodyTimerRef.current);
    melodyTimerRef.current = setInterval(playNote, 700);
  }

  function stopMusic() {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    if (melodyTimerRef.current) {
      clearInterval(melodyTimerRef.current);
      melodyTimerRef.current = null;
    }
  }

  function handleOpenInvitation() {
    setIsOpened(true);
    if (showMusic && !isPlaying) {
      startMusic();
    }
  }

  async function handleRsvpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rsvpName.trim() || !message.trim()) return;
    setSending(true);
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('rsvps')
      .insert({
        invitation_id: invitationId,
        guest_name: rsvpName.trim(),
        attendance,
        message: message.trim(),
      })
      .select()
      .single();

    setSending(false);
    if (!error && data) {
      setRsvps([data, ...rsvps]);
      setMessage('');
    }
  }

  const formattedDate = config.eventDate
    ? new Date(config.eventDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <div className="min-h-screen flex justify-center bg-slate-200">
      {config.musicMode === 'custom' && config.musicUrl && (
        <audio ref={audioRef} src={config.musicUrl} loop />
      )}

      <div
        className="w-full max-w-md min-h-screen shadow-2xl relative overflow-hidden"
        style={{ backgroundColor: t.bg, color: t.text }}
      >
        {/* Sampul Pembuka (Dikirim Untuk Siapa) */}
        {!isOpened && (
          <div className="fixed inset-0 z-50 flex justify-center bg-black/80">
            <div className="w-full max-w-md relative flex flex-col justify-between items-center text-center p-8 text-white">
              <img
                src={config.coverPhoto}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
              <div className="relative z-10 mt-12">
                <p className="text-xs uppercase tracking-[0.25em] opacity-85 mb-2">
                  Undangan Pernikahan
                </p>
                <h1 className={`${config.font} text-5xl`}>{coupleShort}</h1>
              </div>

              <div className="relative z-10 w-full mb-8 space-y-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                  <p className="text-xs opacity-80 mb-1">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                  <p className="text-base font-bold">{guestName}</p>
                </div>
                <button
                  onClick={handleOpenInvitation}
                  style={{ backgroundColor: t.accent }}
                  className="w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                >
                  Buka Undangan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tombol Musik Melayang */}
        {isOpened && showMusic && (
          <button
            onClick={() => (isPlaying ? stopMusic() : startMusic())}
            title={isPlaying ? 'Matikan Musik' : 'Putar Musik'}
            className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-black/75 text-white border border-white/30 flex items-center justify-center shadow-lg"
          >
            <svg
              className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '5s' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </button>
        )}

        {/* Hero */}
        <div className="relative h-96 flex flex-col justify-end p-8 text-center text-white">
          <img
            src={config.coverPhoto}
            alt="Mempelai"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.25em] opacity-90 mb-1">The Wedding Of</p>
            <h2 className={`${config.font} text-5xl leading-tight`}>{coupleShort}</h2>
            <p className="text-xs mt-2 opacity-90">{formattedDate}</p>
          </div>
        </div>

        {/* Isi Undangan */}
        <div className="p-6 space-y-6 text-center">
          <p className="text-xs italic leading-relaxed opacity-80">{config.quote}</p>

          {/* Countdown */}
          <div
            className="rounded-2xl p-5 border shadow-sm"
            style={{ backgroundColor: t.card, borderColor: t.border }}
          >
            <p className="text-[11px] uppercase tracking-widest font-semibold opacity-70 mb-3">
              Menuju Hari Bahagia
            </p>
            <div className="grid grid-cols-4 gap-2">
              <div><div className="text-xl font-bold">{countdown.d}</div><div className="text-[11px] opacity-70">Hari</div></div>
              <div><div className="text-xl font-bold">{countdown.h}</div><div className="text-[11px] opacity-70">Jam</div></div>
              <div><div className="text-xl font-bold">{countdown.m}</div><div className="text-[11px] opacity-70">Menit</div></div>
              <div><div className="text-xl font-bold">{countdown.s}</div><div className="text-[11px] opacity-70">Detik</div></div>
            </div>
          </div>

          {/* Mempelai */}
          <div className="space-y-4 py-2">
            <div>
              <div className="text-xl font-bold">{config.groomName}</div>
              <div className="text-xs opacity-70">{config.groomParents}</div>
            </div>
            <div className="text-lg font-serif-elegant italic opacity-60">&</div>
            <div>
              <div className="text-xl font-bold">{config.brideName}</div>
              <div className="text-xs opacity-70">{config.brideParents}</div>
            </div>
          </div>

          {/* Acara */}
          <div
            className="rounded-2xl p-5 border shadow-sm space-y-4"
            style={{ backgroundColor: t.card, borderColor: t.border }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest font-bold opacity-70">Akad / Pemberkatan</p>
              <p className="text-sm font-semibold mt-1">{formattedDate}</p>
              <p className="text-xs opacity-80 mt-0.5">{config.eventLocation}</p>
            </div>
            {config.showResepsi && (
              <div className="pt-4 border-t border-current/10">
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Resepsi</p>
                <p className="text-sm font-semibold mt-1">{config.resepsiTime}</p>
                <p className="text-xs opacity-80 mt-0.5">{config.resepsiLocation}</p>
              </div>
            )}
          </div>

          {/* Cerita Cinta */}
          {config.showStory && (
            <div
              className="rounded-2xl p-5 border shadow-sm text-left space-y-3"
              style={{ backgroundColor: t.card, borderColor: t.border }}
            >
              <p className="text-xs font-bold text-center uppercase tracking-wider opacity-80">
                Cerita Cinta
              </p>
              <div className="border-l-2 border-current/20 pl-3 space-y-3">
                <div>
                  <p className="text-xs font-bold">{config.story1Title}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{config.story1Desc}</p>
                </div>
                <div>
                  <p className="text-xs font-bold">{config.story2Title}</p>
                  <p className="text-[11px] opacity-75 mt-0.5">{config.story2Desc}</p>
                </div>
              </div>
            </div>
          )}

          {/* Album / Galeri Foto */}
          {config.showGallery && galleryPhotos.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Galeri Momen</p>
              <div className="grid grid-cols-2 gap-2.5">
                {galleryPhotos.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Galeri ${idx + 1}`}
                    className="w-full h-36 object-cover rounded-xl shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* RSVP */}
          {config.showRsvp && (
            <div
              className="rounded-2xl p-5 border shadow-sm text-left space-y-3"
              style={{ backgroundColor: t.card, borderColor: t.border }}
            >
              <p className="text-xs font-bold text-center uppercase tracking-wider opacity-80">
                RSVP & Ucapan Doa
              </p>
              <form onSubmit={handleRsvpSubmit} className="space-y-2.5">
                <input
                  type="text"
                  required
                  value={rsvpName}
                  onChange={(e) => setRsvpName(e.target.value)}
                  placeholder="Nama Anda"
                  className="w-full text-xs p-2.5 rounded-lg border bg-white text-slate-800"
                />
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border bg-white text-slate-800"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Berhalangan Hadir</option>
                </select>
                <textarea
                  required
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis ucapan & doa..."
                  className="w-full text-xs p-2.5 rounded-lg border bg-white text-slate-800"
                />
                <button
                  type="submit"
                  disabled={sending}
                  style={{ backgroundColor: t.accent }}
                  className="w-full text-white text-xs py-2.5 rounded-lg font-semibold"
                >
                  {sending ? 'Mengirim...' : 'Kirim Ucapan'}
                </button>
              </form>

              <div className="space-y-2 pt-2 max-h-48 overflow-y-auto">
                {rsvps.map((item) => (
                  <div key={item.id} className="bg-black/5 rounded-lg p-2.5 text-xs">
                    <span className="font-bold">{item.guest_name}</span>{' '}
                    <span className="text-[10px] opacity-60">({item.attendance})</span>
                    <p className="mt-1 opacity-85">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amplop Digital */}
          {config.showGift && (
            <div
              className="rounded-2xl p-5 border shadow-sm space-y-2"
              style={{ backgroundColor: t.card, borderColor: t.border }}
            >
              <p className="text-xs font-bold uppercase tracking-wider opacity-80">Amplop Digital</p>
              <p className="text-sm font-semibold">{config.bankName} - {config.bankNo}</p>
              <p className="text-xs opacity-75">a.n {config.bankOwner}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(config.bankNo);
                  alert('Nomor rekening disalin!');
                }}
                className="text-xs px-4 py-1.5 rounded-full border border-current/30 font-medium"
              >
                Salin Rekening
              </button>
            </div>
          )}

          <p className="text-[11px] opacity-50 pt-4 pb-6">Undangan Prabu Digital</p>
        </div>
      </div>
    </div>
  );
}