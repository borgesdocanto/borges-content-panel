import { NextRequest, NextResponse } from 'next/server'

const UPLOAD_POST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}`

    const form = new FormData()
    form.append('user', username)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')
    form.append('title', contenido.ig_titulo || contenido.archivo)

    // Plataformas activas
    const platformMap: Record<string, string> = {
      ig: 'instagram', tt: 'tiktok', yt: 'youtube',
      li: 'linkedin', fb: 'facebook', tw: 'x', th: 'threads'
    }
    for (const [key, platform] of Object.entries(platformMap)) {
      if (redes[key]) form.append('platform[]', platform)
    }

    // Títulos por red
    if (redes.ig) form.append('instagram_title', contenido.ig_descripcion || contenido.ig_titulo)
    if (redes.tt) form.append('tiktok_title', contenido.tt_descripcion || contenido.tt_titulo)
    if (redes.yt) {
      form.append('youtube_title', contenido.yt_titulo)
      form.append('youtube_description', contenido.yt_descripcion || '')
      form.append('thumbnail_url', `https://n8n.borges.com.ar/videos/${contenido.portada_youtube_path}`)
    }
    if (redes.li) {
      form.append('linkedin_title', contenido.li_titulo)
      form.append('linkedin_description', contenido.li_descripcion || '')
    }
    if (redes.fb) {
      form.append('facebook_title', contenido.ig_titulo)
      form.append('facebook_description', contenido.fb_descripcion || '')
    }
    if (redes.tw) form.append('x_title', contenido.tw_texto)
    if (redes.th) form.append('threads_title', contenido.th_texto)

    const res = await fetch('https://api.upload-post.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
      body: form
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
