import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanSlug = String(body.slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'Nama link wajib diisi.' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('invitations')
      .select('id')
      .eq('slug', cleanSlug)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Link undangan sudah dipakai, silakan pilih nama lain.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        slug: cleanSlug,
        status: 'active',
        config: body.config,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan undangan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}