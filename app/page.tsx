'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { InvitationConfig } from '@/components/InvitationTemplate';

const DEFAULT_PHOTO =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';

const THEMES = {
  sage: { bg: '#f3f6f4', text: '#2c3e35', card: '#ffffff', accent: '#5c7c67' },
  gold: { bg: '#fdfbf7', text: '#3d3122', card: '#ffffff', accent: '#b8860b' },
  rose: { bg: '#fff5f6', text: '#4a2c35', card: '#ffffff', accent: '#d46a7e' },
  dark: { bg: '#141417', text: '#f3f4f6', card: '#1f1f24', accent: '#d4af37' },
};

export default function StudioEditorPage() {
  const [slug, setSlug] = useState('andi-sinta');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(DEFAULT_PHOTO);
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

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
    quote: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup agar kamu merasa tenteram.',
    coverPhoto: DEFAULT_PHOTO,
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

  async function handlePublish() {
    setLoading(true);
    try {
      let finalPhotoUrl = config.coverPhoto;

      // Upload foto ke Supabase Storage jika user memilih foto sendiri
      if (photoFile) {
        const ext = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('media')
          .upload(fileName, photoFile);

        if (uploadErr) throw new Error('Gagal upload foto: ' + uploadErr.message);

        const { data: pubData } = supabase.storage.from('media').getPublicUrl(fileName);
        finalPhotoUrl = pubData.publicUrl;
      }

      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          config: { ...config, coverPhoto: finalPhotoUrl },
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-20">
        <span className="font-bold text-xl">
          Undangan<span className="text-indigo-600">Prabu</span>
        </span>
        <button
          onClick={handlePublish}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Menyimpan...' : 'Publikasikan Undangan'}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Editor */}
        <section className="lg:col-span-7 bg-white p-6 rounded-2xl border space-y-5">
          <h1 className="text-lg font-bold">Kustomisasi Undangan</h1>

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
              <label className="text-xs font-semibold text-slate-500">Gaya Huruf</label>
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
            <label className="text-xs font-semibold text-slate-500">Upload Foto Sampul</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full mt-1 text-xs" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={config.groomName}
              onChange={(e) => updateField('groomName', e.target.value)}
              placeholder="Mempelai Pria"
              className="border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={config.brideName}
              onChange={(e) => updateField('brideName', e.target.value)}
              placeholder="Mempelai Wanita"
              className="border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={config.groomParents}
              onChange={(e) => updateField('groomParents', e.target.value)}
              placeholder="Ortu Pria"
              className="border rounded-xl px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={config.brideParents}
              onChange={(e) => updateField('brideParents', e.target.value)}
              placeholder="Ortu Wanita"
              className="border rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="datetime-local"
              value={config.eventDate}
              onChange={(e) => updateField('eventDate', e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={config.eventLocation}
              onChange={(e) => updateField('eventLocation', e.target.value)}
              placeholder="Lokasi Akad"
              className="border rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={config.bankName}
              onChange={(e) => updateField('bankName', e.target.value)}
              placeholder="Bank"
              className="border rounded-xl px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={config.bankNo}
              onChange={(e) => updateField('bankNo', e.target.value)}
              placeholder="No Rekening"
              className="border rounded-xl px-3 py-2 text-xs"
            />
            <input
              type="text"
              value={config.bankOwner}
              onChange={(e) => updateField('bankOwner', e.target.value)}
              placeholder="Atas Nama"
              className="border rounded-xl px-3 py-2 text-xs"
            />
          </div>
        </section>

        {/* Preview HP */}
        <aside className="lg:col-span-5 flex justify-center">
          <div
            className="w-[340px] h-[620px] rounded-[36px] border-8 border-slate-900 overflow-y-auto shadow-xl"
            style={{ backgroundColor: t.bg, color: t.text }}
          >
            <div className="relative h-64 flex flex-col justify-end p-6 text-center text-white">
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
                <p className="text-xs opacity-60">&</p>
                <p className="font-bold text-sm">{config.brideName}</p>
              </div>
              <div className="p-4 rounded-xl border text-xs" style={{ backgroundColor: t.card }}>
                <p className="font-bold mb-1">Lokasi Acara</p>
                <p>{config.eventLocation}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Modal Sukses */}
      {createdSlug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-bold text-emerald-600">Undangan Berhasil Dibuat!</h3>
            <p className="text-xs text-slate-500">Link undangan Anda sudah aktif dan siap disebar:</p>
            <div className="bg-slate-100 p-3 rounded-xl text-xs font-bold break-all">
              {window.location.origin}/{createdSlug}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCreatedSlug(null)}
                className="w-1/2 py-2.5 rounded-xl border text-xs font-semibold"
              >
                Tutup
              </button>
              <a
                href={`/${createdSlug}?to=Tamu+Spesial`}
                target="_blank"
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Buka Undangan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}