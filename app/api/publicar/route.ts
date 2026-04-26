import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zphzoaeihoziyhhdatut.supabase.co'

    // Llamar a Supabase Edge Function — sin limite de tiempo, corre en Deno
    const res = await fetch(`${SUPABASE_URL}/functions/v1/publicar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido_id: contenido.id,
        redes,
        username
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json({ error: data.error || 'Error en edge function' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
