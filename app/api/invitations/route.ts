import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
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
      .maybeSingle();

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

    if (error) {
      return NextResponse.json(
        { error: `Supabase Error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}