import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import InvitationTemplate from '@/components/InvitationTemplate';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data } = await supabase
    .from('invitations')
    .select('config')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Undangan Tidak Ditemukan' };

  const cfg = data.config;
  return {
    title: `Undangan Pernikahan ${cfg.groomName} & ${cfg.brideName}`,
    description: 'Tanpa mengurangi rasa hormat, kami mengundang Anda hadir di hari bahagia kami.',
    openGraph: {
      images: [cfg.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'],
    },
  };
}

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;
  const supabase = getSupabase();

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!invitation) {
    notFound();
  }

  if (invitation.status !== 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h1 className="text-xl font-bold text-slate-800">Undangan Belum Aktif</h1>
        <p className="text-sm text-slate-500 mt-2">
          Undangan ini sedang menunggu penyelesaian pembayaran oleh pembuatnya.
        </p>
      </div>
    );
  }

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitation.id)
    .order('created_at', { ascending: false });

  return (
    <InvitationTemplate
      invitationId={invitation.id}
      config={invitation.config}
      guestName={to || 'Bapak/Ibu/Saudara/i'}
      initialRsvps={rsvps || []}
    />
  );
}