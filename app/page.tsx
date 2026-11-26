'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { InvitationConfig } from '@/components/InvitationTemplate';

// GANTI NOMOR WHATSAPP ANDA DI SINI (Awali dengan 62, contoh: 6281234567890)
const ADMIN_WHATSAPP = '6282282948311';

const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=500&q=80',
];

const THEMES = {
  sage: { bg: '#f3f6f4', text: '#2c3e35', card: '#ffffff', accent: '#5c7c67' },
  gold: { bg: '#fdfbf7', text: '#3d3122', card: '#ffffff', accent: '#b8860b' },
  rose: { bg: '#fff5f6', text: '#4a2c35', card: '#ffffff', accent: '#d46a7e' },
  dark: { bg: '#141417', text: '#f3f4f6', card: '#1f1f24', accent: '#d4af37' },
};

interface GalleryItem {
  url: string;
  file?: File;
}

export default function StudioEditorPage() {
  const [activeTab, setActiveTab] = useState<'design' | 'couple' | 'gallery' | 'extras'>('design');
  const [slug, setSlug] = useState('andi-sinta');
  const [guestNamePreview, setGuestNamePreview] = useState('Bpk. Budi Santoso & Partner');
  const [showCoverPreview, setShowCoverPreview] = useState(true);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(DEFAULT_PHOTO);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    DEFAULT_GALLERY.map((url) => ({ url }))
  );
  const [musicFile, setMusicFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [guestLinkInput, setGuestLinkInput] = useState('Pak Budi');

  const [config, setConfig] = useState<InvitationConfig>({
    theme: 'sage',
    font: 'font-script',
    groomName: 'Andi Pratama',
    groomParents: 'Putra dari Bpk. Hendra & Ibu Dewi',
    brideName: 'Sinta Maharani',
    brideParents: 'Putri dari Bpk. Santoso & Ibu Rina',
    eventDate: '2026-12-20T09:00',
    eventLocation: 'Masjid Agung Al-Azhar, Jakarta',
    showResepsi: true,
    resepsiTime: '11:00 - 14:00 WIB',
    resepsiLocation: 'Grand Ballroom Hotel Mulia, Jakarta',
    quote:
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu merasa tenteram.',
    coverPhoto: DEFAULT_PHOTO,
    showGallery: true,
    galleryPhotos: DEFAULT_GALLERY,
    showStory: true,
    story1Title: '2022 • Pertama Bertemu',
    story1Desc: 'Berawal dari pertemuan singkat di acara seminar kampus, kami mulai bertukar cerita.',
    story2Title: '2025 • Momen Lamaran',
    story2Desc: 'Setelah 3 tahun bersama, kami memantapkan hati melangkah ke jenjang pernikahan.',
    showMusic: true,
    musicMode: 'builtin',
    musicUrl: '',
    showRsvp: true,
    showGift: true,
    bankName: 'BCA',
    bankNo: '8830192831',
    bankOwner: 'Andi Pratama',
  });

  function updateField<K extends keyof InvitationConfig>(key: K, value: InvitationConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newItems = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
  }

  function removeGalleryItem(index: number) {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadToSupabase(file: File, prefix: string): Promise<string> {
    const supabase = getSupabase();
    const ext = file.name.split('.').pop() || 'bin';
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('media').upload(fileName, file);
    if (error) throw new Error('Gagal upload file: ' + error.message);
    const { data } = supabase.storage.from('media').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handlePublish() {
    setLoading(true);
    try {
      let finalPhotoUrl = config.coverPhoto;
      if (photoFile) {
        finalPhotoUrl = await uploadToSupabase(photoFile, 'cover');
      }

      const finalGalleryUrls: string[] = [];
      for (const item of galleryItems) {
        if (item.file) {
          finalGalleryUrls.push(await uploadToSupabase(item.file, 'gallery'));
        } else {
          finalGalleryUrls.push(item.url);
        }
      }

      let finalMusicUrl = config.musicUrl || '';
      if (config.musicMode === 'custom' && musicFile) {
        finalMusicUrl = await uploadToSupabase(musicFile, 'music');
      }

      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          config: {
            ...config,
            coverPhoto: finalPhotoUrl,
            galleryPhotos: finalGalleryUrls,
            musicUrl: finalMusicUrl,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      setCreatedSlug(data.slug);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  const t = THEMES[config.theme];
  const coupleShort = `${config.groomName.split(' ')[0]} & ${config.brideName.split(' ')[0]}`;
  const waHelpUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    'Halo Admin UndanganPrabu, saya sedang mencoba membuat undangan website.'
  )}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white border-b px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-bold text-xl">
            Undangan<span className="text-indigo-600">Prabu</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
            <span className="line-through text-slate-400 font-normal">Rp 99.000</span>
            GRATIS (Uji Coba)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={waHelpUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-emerald-600 px-3 py-2"
          >
            Chat Admin (WA)
          </a>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Mengupload & Menyimpan...' : 'Buat Gratis Sekarang'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PANEL KIRI: EDITOR 4 TAB */}
        <section className="lg:col-span-7 bg-white rounded-2xl border overflow-hidden h-fit">
          <div className="flex overflow-x-auto border-b bg-slate-50 px-2 pt-2 gap-1">
            {[
              { id: 'design', label: '1. Tema & Sampul' },
              { id: 'couple', label: '2. Mempelai & Acara' },
              { id: 'gallery', label: '3. Album & Cerita' },
              { id: 'extras', label: '4. Musik, Tamu & Hadiah' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-xs sm:text-sm rounded-t-xl whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white font-semibold'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {/* TAB 1 */}
            {activeTab === 'design' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pilih Tema Warna</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['sage', 'gold', 'rose', 'dark'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateField('theme', key)}
                        className={`p-3 rounded-xl text-xs font-semibold capitalize border ${
                          config.theme === key ? 'border-2 border-indigo-600 bg-indigo-50' : 'border-slate-200'
                        }`}
                      >
                        Tema {key}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Request Link Undangan</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
                      placeholder="andi-sinta"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Gaya Huruf Judul</label>
                    <select
                      value={config.font}
                      onChange={(e) => updateField('font', e.target.value as InvitationConfig['font'])}
                      className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
                    >
                      <option value="font-script">Klasik Sambung</option>
                      <option value="font-serif-elegant">Elegan Serif</option>
                      <option value="font-modern">Modern Bersih</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Upload Foto Sampul Utama</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full mt-1 text-xs border border-dashed rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Kutipan / Doa Pembuka</label>
                  <textarea
                    rows={2}
                    value={config.quote}
                    onChange={(e) => updateField('quote', e.target.value)}
                    className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {/* TAB 2 */}
            {activeTab === 'couple' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Mempelai Pria</p>
                    <input
                      type="text"
                      value={config.groomName}
                      onChange={(e) => updateField('groomName', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                      placeholder="Nama Mempelai Pria"
                    />
                    <input
                      type="text"
                      value={config.groomParents}
                      onChange={(e) => updateField('groomParents', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                      placeholder="Nama Orang Tua"
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                    <p className="text-xs font-bold text-indigo-600 uppercase">Mempelai Wanita</p>
                    <input
                      type="text"
                      value={config.brideName}
                      onChange={(e) => updateField('brideName', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                      placeholder="Nama Mempelai Wanita"
                    />
                    <input
                      type="text"
                      value={config.brideParents}
                      onChange={(e) => updateField('brideParents', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                      placeholder="Nama Orang Tua"
                    />
                  </div>
                </div>

                <div className="border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold">Acara 1 (Akad / Pemberkatan)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      value={config.eventDate}
                      onChange={(e) => updateField('eventDate', e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={config.eventLocation}
                      onChange={(e) => updateField('eventLocation', e.target.value)}
                      placeholder="Lokasi Akad"
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">Acara 2 (Resepsi)</p>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.showResepsi}
                        onChange={(e) => updateField('showResepsi', e.target.checked)}
                      />
                      Tampilkan Resepsi
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={config.resepsiTime}
                      onChange={(e) => updateField('resepsiTime', e.target.value)}
                      placeholder="Jam Resepsi"
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={config.resepsiLocation}
                      onChange={(e) => updateField('resepsiLocation', e.target.value)}
                      placeholder="Lokasi Resepsi"
                      className="border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ALBUM & CERITA */}
            {activeTab === 'gallery' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold">Album / Galeri Foto</label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.showGallery ?? true}
                        onChange={(e) => updateField('showGallery', e.target.checked)}
                      />
                      Aktifkan Album
                    </label>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="block w-full text-xs border border-dashed rounded-xl p-3 mb-3"
                  />
                  <div className="grid grid-cols-4 gap-2">
                    {galleryItems.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Cerita Cinta (Love Story)</label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.showStory ?? true}
                        onChange={(e) => updateField('showStory', e.target.checked)}
                      />
                      Aktifkan Cerita
                    </label>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                    <input
                      type="text"
                      value={config.story1Title || ''}
                      onChange={(e) => updateField('story1Title', e.target.value)}
                      className="w-full text-xs font-bold bg-white border rounded-lg px-2.5 py-1.5"
                    />
                    <textarea
                      rows={2}
                      value={config.story1Desc || ''}
                      onChange={(e) => updateField('story1Desc', e.target.value)}
                      className="w-full text-xs bg-white border rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border space-y-2">
                    <input
                      type="text"
                      value={config.story2Title || ''}
                      onChange={(e) => updateField('story2Title', e.target.value)}
                      className="w-full text-xs font-bold bg-white border rounded-lg px-2.5 py-1.5"
                    />
                    <textarea
                      rows={2}
                      value={config.story2Desc || ''}
                      onChange={(e) => updateField('story2Desc', e.target.value)}
                      className="w-full text-xs bg-white border rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MUSIK, TAMU & HADIAH */}
            {activeTab === 'extras' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Musik Latar Undangan</label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={config.showMusic ?? true}
                        onChange={(e) => updateField('showMusic', e.target.checked)}
                      />
                      Aktifkan Musik
                    </label>
                  </div>
                  <select
                    value={config.musicMode || 'builtin'}
                    onChange={(e) => updateField('musicMode', e.target.value as 'builtin' | 'custom')}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="builtin">Melodi Piano Romantis (Bawaan Studio)</option>
                    <option value="custom">Upload Lagu MP3 Sendiri</option>
                  </select>
                  {config.musicMode === 'custom' && (
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                      className="block w-full text-xs border border-dashed rounded-xl p-3"
                    />
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <label className="block text-sm font-semibold">
                    Dikirim Untuk Siapa? (Simulasi Nama Tamu)
                  </label>
                  <input
                    type="text"
                    value={guestNamePreview}
                    onChange={(e) => setGuestNamePreview(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    placeholder="Bpk. Budi Santoso"
                  />
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.showRsvp}
                        onChange={(e) => updateField('showRsvp', e.target.checked)}
                      />
                      Aktifkan Form RSVP & Ucapan
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.showGift}
                        onChange={(e) => updateField('showGift', e.target.checked)}
                      />
                      Aktifkan Amplop Digital
                    </label>
                  </div>

                  {config.showGift && (
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border">
                      <input
                        type="text"
                        value={config.bankName}
                        onChange={(e) => updateField('bankName', e.target.value)}
                        placeholder="Bank"
                        className="border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={config.bankNo}
                        onChange={(e) => updateField('bankNo', e.target.value)}
                        placeholder="No Rekening"
                        className="border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={config.bankOwner}
                        onChange={(e) => updateField('bankOwner', e.target.value)}
                        placeholder="Atas Nama"
                        className="border rounded-lg px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PANEL KANAN: LIVE PREVIEW */}
        <aside className="lg:col-span-5 flex flex-col items-center">
          <div className="w-[340px] flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Live Preview</span>
            <button
              type="button"
              onClick={() => setShowCoverPreview(!showCoverPreview)}
              className="text-xs bg-white border px-3 py-1 rounded-full font-medium shadow-sm"
            >
              {showCoverPreview ? 'Lihat Isi Undangan' : 'Lihat Sampul Tamu'}
            </button>
          </div>

          <div
            className="w-[340px] h-[620px] rounded-[36px] border-8 border-slate-900 overflow-y-auto shadow-xl relative"
            style={{ backgroundColor: t.bg, color: t.text }}
          >
            {/* Sampul Pembuka Preview */}
            {showCoverPreview && (
              <div className="absolute inset-0 z-10 flex flex-col justify-between items-center text-center p-6 text-white">
                <img src={photoPreview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10 mt-8">
                  <p className="text-[10px] uppercase tracking-widest opacity-80">Undangan Pernikahan</p>
                  <h2 className={`${config.font} text-4xl mt-1`}>{coupleShort}</h2>
                </div>
                <div className="relative z-10 w-full mb-6 space-y-3">
                  <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3">
                    <p className="text-[10px] opacity-80">Kepada Yth:</p>
                    <p className="text-xs font-bold">{guestNamePreview || 'Tamu Undangan'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCoverPreview(false)}
                    style={{ backgroundColor: t.accent }}
                    className="w-full py-2.5 rounded-full text-xs font-bold uppercase"
                  >
                    Buka Undangan
                  </button>
                </div>
              </div>
            )}

            {/* Isi Undangan Preview */}
            <div className="relative h-60 flex flex-col justify-end p-6 text-center text-white">
              <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
              <div className="relative z-10">
                <p className="text-[10px] uppercase tracking-widest">The Wedding Of</p>
                <h2 className={`${config.font} text-3xl`}>{coupleShort}</h2>
              </div>
            </div>

            <div className="p-5 text-center space-y-4">
              <p className="text-xs italic opacity-80">{config.quote}</p>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: t.card }}>
                <p className="font-bold text-sm">{config.groomName}</p>
                <p className="text-[10px] opacity-60">{config.groomParents}</p>
                <p className="text-xs opacity-60 my-1">&</p>
                <p className="font-bold text-sm">{config.brideName}</p>
                <p className="text-[10px] opacity-60">{config.brideParents}</p>
              </div>

              {(config.showGallery ?? true) && galleryItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase opacity-70">Album Foto</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {galleryItems.map((item, idx) => (
                      <img key={idx} src={item.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl border text-xs" style={{ backgroundColor: t.card }}>
                <p className="font-bold mb-1">Lokasi Acara</p>
                <p>{config.eventLocation}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* MODAL SUKSES + GENERATOR LINK TAMU */}
      {createdSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-emerald-600 text-center">Undangan Berhasil Dibuat!</h3>

            <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Dikirim untuk siapa? (Ketik nama tamu untuk membuat link khusus):
              </label>
              <input
                type="text"
                value={guestLinkInput}
                onChange={(e) => setGuestLinkInput(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-xs bg-white"
                placeholder="Misal: Pak Budi"
              />
              <div className="bg-white border p-2.5 rounded-lg text-[11px] font-mono break-all">
                {`${window.location.origin}/${createdSlug}?to=${encodeURIComponent(guestLinkInput || 'Tamu Spesial')}`}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const link = `${window.location.origin}/${createdSlug}?to=${encodeURIComponent(guestLinkInput || 'Tamu Spesial')}`;
                  navigator.clipboard.writeText(link);
                  alert('Link tamu berhasil disalin!');
                }}
                className="w-1/2 py-2.5 rounded-xl border text-xs font-semibold"
              >
                Salin Link Tamu
              </button>
              <a
                href={`/${createdSlug}?to=${encodeURIComponent(guestLinkInput || 'Tamu Spesial')}`}
                target="_blank"
                rel="noreferrer"
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold text-center"
              >
                Buka Undangan
              </a>
            </div>

            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
                `Halo Admin, saya sudah membuat undangan: ${window.location.origin}/${createdSlug}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs text-emerald-600 font-semibold hover:underline"
            >
              Chat Admin via WhatsApp
            </a>
            <button
              onClick={() => setCreatedSlug(null)}
              className="block w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}