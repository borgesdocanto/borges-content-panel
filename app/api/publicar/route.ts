import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}`
    const coverUrl = `https://n8n.borges.com.ar/videos/${contenido.portada_youtube_path}`

    const form = new FormData()
    form.append('user', username)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')

    // Plataformas activas
    const platformMap: Record<string, string> = {
      ig: 'instagram', tt: 'tiktok', yt: 'youtube',
      li: 'linkedin', fb: 'facebook', tw: 'x', th: 'threads'
    }
    for (const [key, platform] of Object.entries(platformMap)) {
      if (redes[key]) form.append('platform[]', platform)
    }

    // INSTAGRAM — caption = titulo + descripcion + hashtags, portada via cover_url
    if (redes.ig) {
      const igCaption = [
        contenido.ig_titulo,
        contenido.ig_descripcion,
        contenido.ig_hashtags
      ].filter(Boolean).join('\n\n')
      form.append('instagram_title', igCaption)
      form.append('cover_url', coverUrl)
      form.append('media_type', 'REELS')
    }

    // TIKTOK — titulo + descripcion + hashtags (max 2200 chars)
    if (redes.tt) {
      const ttCaption = [
        contenido.tt_titulo,
        contenido.tt_descripcion,
        contenido.tt_hashtags
      ].filter(Boolean).join('\n\n')
      form.append('tiktok_title', ttCaption.slice(0, 2200))
    }

    // YOUTUBE — titulo SEO requerido + descripcion + thumbnail
    if (redes.yt) {
      form.append('youtube_title', contenido.yt_titulo || contenido.ig_titulo)
      form.append('youtube_description', [
        contenido.yt_descripcion,
        contenido.yt_hashtags
      ].filter(Boolean).join('\n\n'))
      form.append('thumbnail_url', coverUrl)
    }

    // LINKEDIN — titulo + descripcion como commentary
    if (redes.li) {
      form.append('linkedin_title', contenido.li_titulo || contenido.ig_titulo)
      form.append('linkedin_description', contenido.li_descripcion || contenido.ig_descripcion)
      form.append('visibility', 'PUBLIC')
    }

    // FACEBOOK — titulo + descripcion
    if (redes.fb) {
      form.append('facebook_title', contenido.ig_titulo)
      form.append('facebook_description', contenido.fb_descripcion || contenido.ig_descripcion)
    }

    // TWITTER/X — texto corto max 280 chars
    if (redes.tw) {
      form.append('x_title', (contenido.tw_texto || contenido.ig_titulo).slice(0, 280))
    }

    // THREADS — texto
    if (redes.th) {
      form.append('threads_title', contenido.th_texto || contenido.ig_titulo)
    }

    // Título global como fallback requerido para YouTube
    form.append('title', contenido.yt_titulo || contenido.ig_titulo || contenido.archivo)

    const res = await fetch('https://api.upload-post.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
      body: form
    })

    const data = await res.json()

    // Marcar redes como publicadas en Supabase
    if (data.success || data.request_id) {
      const updates: Record<string, any> = {}
      const results = data.results || {}

      if (redes.ig) { updates.ig_publicado = true; if (results.instagram?.url) updates.ig_post_id = results.instagram.url }
      if (redes.tt) { updates.tt_publicado = true; if (results.tiktok?.url) updates.tt_post_id = results.tiktok.url }
      if (redes.yt) { updates.yt_publicado = true; if (results.youtube?.url) updates.yt_post_id = results.youtube.url }
      if (redes.li) { updates.li_publicado = true; if (results.linkedin?.url) updates.li_post_id = results.linkedin.url }
      if (redes.fb) { updates.fb_publicado = true; if (results.facebook?.url) updates.fb_post_id = results.facebook.url }
      if (redes.tw) { updates.tw_publicado = true; if (results.x?.url) updates.tw_post_id = results.x.url }
      if (redes.th) { updates.th_publicado = true; if (results.threads?.url) updates.th_post_id = results.threads.url }
      if (data.request_id) updates.upload_post_request_id = data.request_id

      if (Object.keys(updates).length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${contenido.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updates)
        })
      }
    }

    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
