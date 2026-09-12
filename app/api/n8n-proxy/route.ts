import { NextRequest, NextResponse } from 'next/server'

const N8N_KEY = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkNmFhMDNhYi04',
  'ODVmLTRhOTEtOTIzOS0yOTNiMDRjNGMyMzciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZTZmODU1ZWEtMDMwMC00ZmEwLWFiOTItMGM2ZjczOWExZWQ1IiwiaWF0IjoxNzc3NzI1NDU5fQ.6JVSULk4EhRhpLV-wgEhmdSR-1Q0IGpe4NxJlfMV074'
].join('')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { webhook, workflow_id, execute, ...payload } = body

    // Ejecutar workflow via API de n8n
    if (workflow_id && execute) {
      const res = await fetch(`https://n8n.borges.com.ar/api/v1/workflows/${workflow_id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': N8N_KEY
        },
        body: JSON.stringify({})
      })
      const text = await res.text()
      return NextResponse.json({ ok: res.ok, status: res.status, body: text })
    }

    // Llamar webhook conocido
    const allowed: Record<string, string> = {
      'maestro-ejecutar': 'https://n8n.borges.com.ar/webhook/maestro-ejecutar',
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
