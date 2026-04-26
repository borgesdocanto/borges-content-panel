import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { contenido_id, plataformas_video } = await req.json()
    if (!contenido_id || !plataformas_video?.length) {
      return NextResponse.json({ error: 'Faltan contenido_id o plataformas_video' }, { status: 400 })
    }
    const res = await fetch('https://n8n.borges.com.ar/webhook/maestro-ejecutar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido_id, plataformas: plataformas_video, modo: 'republicar', manual: true })
    })
    const text = await res.text()
    console.log('=== N8N REPUBLICAR RESPONSE ===', res.status, text.slice(0, 300))
    if (!res.ok) return NextResponse.json({ error: `n8n ${res.status}: ${text.slice(0, 200)}` }, { status: 500 })
    return NextResponse.json({ ok: true, message: 'Publicación iniciada en n8n' })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
