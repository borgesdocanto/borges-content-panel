import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    // Delegar a n8n que no tiene límite de tiempo
    // n8n llama a Upload Post y actualiza Supabase cuando termina
    const res = await fetch('https://n8n.borges.com.ar/webhook/postia-publicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contenido_id: contenido.id,
        redes,
        username
      })
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `n8n error ${res.status}: ${text.slice(0,200)}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Publicacion iniciada' })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
