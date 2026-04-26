import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zphzoaeihoziyhhdatut.supabase.co'
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const res = await fetch(`${SUPABASE_URL}/functions/v1/publicar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        contenido_id: contenido.id,
        redes,
        username
      })
    })

    const text = await res.text()
    console.log('Edge function response:', res.status, text.slice(0, 500))

    let data: any = {}
    try { data = JSON.parse(text) } catch(e) { data = { raw: text } }

    if (!res.ok) {
      return NextResponse.json({ error: data.error || text }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...data })

  } catch (e: any) {
    console.error('publicar error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
