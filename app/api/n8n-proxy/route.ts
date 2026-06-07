import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { webhook, ...payload } = body

    // Solo permitir webhooks conocidos
    const allowed: Record<string, string> = {
      'maestro-ejecutar': 'https://n8n.borges.com.ar/webhook/maestro-ejecutar',
      'postia-on-demand': 'https://n8n.borges.com.ar/webhook/postia-on-demand',
      'maestro-republicar': 'https://n8n.borges.com.ar/webhook/maestro-republicar',
    }

    const url = allowed[webhook]
    if (!url) {
      return NextResponse.json({ error: 'webhook no permitido' }, { status: 400 })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const text = await res.text()
    return NextResponse.json({ ok: res.ok, status: res.status, body: text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
