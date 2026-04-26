import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    // Delegar publicacion a n8n — sin limite de tiempo como Vercel
    // n8n llama a Upload Post directamente y puede esperar todo lo necesario
    const res = await fetch('https://n8n.borges.com.ar/webhook/postia-publicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido_id: contenido.id,
        redes,
        username
      })
    })

    // n8n puede tardar — usamos async, no esperamos respuesta completa
    // Solo verificamos que el webhook fue aceptado
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `n8n error: ${text.slice(0, 200)}` }, { status: 500 })
    }

    const data = await res.json().catch(() => ({ ok: true }))
    return NextResponse.json({ success: true, ...data })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
