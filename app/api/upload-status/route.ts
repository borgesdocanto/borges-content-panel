import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const request_id = req.nextUrl.searchParams.get('request_id')
    if (!request_id) return NextResponse.json({ error: 'request_id requerido' }, { status: 400 })

    const res = await fetch(`https://api.upload-post.com/api/uploadposts/status?request_id=${request_id}`, {
      headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` }
    })
    const data = await res.json()
    console.log('=== UPLOAD STATUS RAW ===', JSON.stringify(data))
    
    // Normalizar results: la API devuelve array [{platform, success, ...}]
    // Lo convertimos a objeto {instagram: {success}, tiktok: {success}, ...} para compatibilidad
    if (data.results && Array.isArray(data.results)) {
      const normalized: Record<string, any> = {}
      for (const r of data.results) {
        if (r.platform) {
          normalized[r.platform] = { success: r.success, url: r.url, message: r.message, error: r.error, status: r.status }
          console.log(`  [${r.platform}] success=${r.success} status=${r.status} message=${r.message} error=${r.error}`)
        }
      }
      data.results = normalized
    }
    
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
