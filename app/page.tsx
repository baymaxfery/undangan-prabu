import Link from 'next/link';

// GANTI NOMOR WHATSAPP ANDA DI SINI (Awali dengan 62, contoh: 6281234567890)
const ADMIN_WHATSAPP = '6282282948311';

const FEATURES = [
  {
    title: 'Kustomisasi Sendiri (Live)',
    desc: 'Ubah tema, huruf, foto, dan teks acara secara langsung dengan tampilan pratinjau HP real-time.',
  },
  {
    title: 'Nama Tamu Tanpa Batas',
    desc: 'Buat link khusus dengan nama setiap tamu undangan Anda secara otomatis (?to=Nama+Tamu).',
  },
  {
    title: 'Album Foto & Cerita Cinta',
    desc: 'Tampilkan momen foto pre-wedding dan perjalanan kisah cinta Anda dalam tata letak elegan.',
  },
  {
    title: 'Musik Latar Sendiri',
    desc: 'Pilih melodi bawaan atau unggah lagu MP3 favorit Anda agar otomatis berputar saat dibuka.',
  },
  {
    title: 'RSVP & Ucapan Online',
    desc: 'Tamu dapat mengonfirmasi kehadiran dan mengirim doa langsung yang tersimpan rapi.',
  },
  {
    title: 'Amplop Digital',
    desc: 'Tampilkan nomor rekening bank atau e-wallet dengan tombol salin instan untuk tamu.',
  },
];

const THEMES = [
  {
    name: 'Minimalist Sage',
    tag: 'Populer',
    bg: 'bg-[#f3f6f4]',
    accent: 'bg-[#5c7c67]',
    text: 'text-[#2c3e35]',
    desc: 'Nuansa hijau sage yang lembut, bersih, dan menenangkan.',
  },
  {
    name: 'Classic Gold',
    tag: 'Elegan',
    bg: 'bg-[#fdfbf7]',
    accent: 'bg-[#b8860b]',
    text: 'text-[#3d3122]',
    desc: 'Kesan hangat dan klasik dengan sentuhan warna emas mewah.',
  },
  {
    name: 'Romantic Rose',
    tag: 'Manis',
    bg: 'bg-[#fff5f6]',
    accent: 'bg-[#d46a7e]',
    text: 'text-[#4a2c35]',
    desc: 'Nuansa merah muda lembut yang romantis dan modern.',
  },
  {
    name: 'Luxury Dark',
    tag: 'Eksklusif',
    bg: 'bg-[#141417]',
    accent: 'bg-[#d4af37]',
    text: 'text-white',
    desc: 'Latar gelap elegan dengan aksen emas untuk tampilan premium.',
  },
];

export default function LandingPage() {
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    'Halo Admin UndanganPrabu, saya ingin bertanya seputar pembuatan undangan website.'
  )}`;

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
            Undangan<span className="text-indigo-600">Prabu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-indigo-600 transition">Fitur</a>
            <a href="#tema" className="hover:text-indigo-600 transition">Pilihan Tema</a>
            <a href="#harga" className="hover:text-indigo-600 transition">Harga</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-block text-xs font-semibold text-slate-600 hover:text-emerald-600 px-3 py-2"
            >
              Tanya Admin
            </a>
            <Link
              href="/editor"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              Buat Undangan
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Promo Masa Uji Coba: Buat Undangan Gratis!
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Desain Sendiri Undangan Website Anda dalam{' '}
            <span className="text-indigo-600">Hitungan Menit</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tidak perlu tunggu lama atau jago desain. Pilih tema favorit, unggah foto & musik sendiri, lihat hasilnya langsung, dan bagikan ke WhatsApp dengan nama tamu otomatis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/editor"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/20 transition text-sm"
            >
              Mulai Desain Sekarang (Gratis)
            </Link>
            <a
              href="#tema"
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-7 py-3.5 rounded-2xl transition text-sm"
            >
              Lihat Pilihan Tema
            </a>
          </div>

          <div className="pt-6 flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-medium">
            <span>✓ Langsung Aktif Seketika</span>
            <span>✓ Tanpa Install Aplikasi</span>
            <span>✓ Unlimited Nama Tamu</span>
          </div>
        </div>
      </section>

      {/* FITUR UNGGULAN */}
      <section id="fitur" className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Semua Fitur Lengkap dalam Satu Tempat</h2>
            <p className="text-sm text-slate-500 mt-2">
              Atur sendiri bagian mana yang ingin ditampilkan atau disembunyikan sesuai kebutuhan acara Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition space-y-2"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILIHAN TEMA */}
      <section id="tema" className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pilihan Tema Elegan</h2>
            <p className="text-sm text-slate-500 mt-2">
              Semua tema sudah responsif dan tampil rapi saat dibuka melalui WhatsApp di HP tamu Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {THEMES.map((theme, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div className={`${theme.bg} ${theme.text} p-6 h-44 flex flex-col justify-between relative`}>
                  <span className="self-start text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-white/80 text-slate-800">
                    {theme.tag}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">The Wedding Of</p>
                    <p className="font-script text-3xl mt-1">Andi & Sinta</p>
                  </div>
                  <div className={`w-8 h-1.5 rounded-full ${theme.accent}`} />
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">{theme.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{theme.desc}</p>
                  </div>
                  <Link
                    href="/editor"
                    className="block text-center w-full py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition"
                  >
                    Coba Tema Ini
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-lg mx-auto bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl text-center space-y-5">
          <span className="inline-block text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
            Penawaran Terbatas
          </span>
          <h2 className="text-2xl font-bold">Paket Undangan Lengkap</h2>
          <div>
            <p className="text-sm text-slate-400 line-through">Rp 99.000</p>
            <p className="text-4xl font-extrabold text-emerald-400 mt-1">GRATIS</p>
            <p className="text-xs text-slate-300 mt-1">Khusus selama masa uji coba publik</p>
          </div>

          <ul className="text-xs sm:text-sm text-slate-200 space-y-2.5 text-left bg-white/5 rounded-2xl p-5 border border-white/10">
            <li>✓ Kustomisasi semua tema & huruf</li>
            <li>✓ Upload foto sampul, album galeri & lagu MP3</li>
            <li>✓ Kirim ke nama tamu tanpa batas</li>
            <li>✓ Form RSVP, ucapan doa & amplop digital</li>
            <li>✓ Link aktif instan setelah dibuat</li>
          </ul>

          <Link
            href="/editor"
            className="block w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition shadow-lg"
          >
            Buat Undangan Gratis Sekarang
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Pertanyaan yang Sering Diajukan</h2>
          {[
            {
              q: 'Apakah link undangan langsung aktif setelah dibuat?',
              a: 'Ya! Begitu Anda menekan tombol Buat Gratis Sekarang di halaman editor, link undangan Anda langsung aktif detik itu juga dan siap disebar.',
            },
            {
              q: 'Bagaimana cara mengirim undangan dengan nama tamu berbeda-beda?',
              a: 'Setelah undangan selesai dibuat, tersedia kotak ketik nama tamu yang otomatis membuatkan link khusus (contoh: ?to=Pak+Budi) tinggal klik Salin Link.',
            },
            {
              q: 'Apakah bisa memakai foto dan lagu sendiri?',
              a: 'Bisa. Anda dapat mengunggah foto sampul, beberapa foto album pre-wedding, serta file musik MP3 langsung dari HP atau laptop Anda.',
            },
          ].map((faq, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 text-center space-y-3">
        <p className="font-bold text-slate-900">
          Undangan<span className="text-indigo-600">Prabu</span>
        </p>
        <p className="text-xs text-slate-500">
          Butuh bantuan atau ingin konsultasi?{' '}
          <a href={waUrl} target="_blank" rel="noreferrer" className="text-emerald-600 font-semibold hover:underline">
            Hubungi Admin via WhatsApp
          </a>
        </p>
        <p className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} UndanganPrabu. Semua hak cipta dilindungi.
        </p>
      </footer>
    </div>
  );
}