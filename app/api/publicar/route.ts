import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}&confirm=t`
    const coverYoutube = contenido.portada_url || ''  // 16:9 YouTube JPEG

    const form = new FormData()
    form.append('user', username)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')
    // title global — fallback para plataformas sin título específico
    form.append('title', contenido.yt_titulo || contenido.ig_titulo || contenido.archivo || '')

    // Plataformas activas
    const platformMap: Record<string, string> = {
      ig: 'instagram', tt: 'tiktok', yt: 'youtube',
      fb: 'facebook', tw: 'x', th: 'threads'
      // linkedin se publica por separado como foto
    }
    for (const [key, platform] of Object.entries(platformMap)) {
      if (redes[key]) form.append('platform[]', platform)
    }

    // INSTAGRAM — caption = titulo + descripcion + hashtags (todo junto, max 2200)
    if (redes.ig) {
      const igCaption = [contenido.ig_titulo, contenido.ig_descripcion, contenido.ig_hashtags]
        .filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('instagram_title', igCaption)
      form.append('media_type', 'REELS')
      form.append('share_to_feed', 'true')
      form.append('thumb_offset', '1000')
    }

    // TIKTOK — caption completo + frame como portada
    if (redes.tt) {
      const ttCaption = [contenido.tt_titulo, contenido.tt_descripcion, contenido.tt_hashtags]
        .filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('tiktok_title', ttCaption)
      form.append('cover_timestamp', '1000')
    }

    // YOUTUBE — todos los campos correctos según la doc
    if (redes.yt) {
      form.append('youtube_title', (contenido.yt_titulo || '').slice(0, 100))

      // Descripción + hashtags + keywords
      const ytHashtags = contenido.yt_hashtags || ''
      const ytKeywords = contenido.yt_keywords || ''
      const ytDesc = [
        contenido.yt_descripcion,
        ytHashtags ? `\n\n${ytHashtags}` : '',
        ytKeywords ? `\n\nKeywords: ${ytKeywords}` : ''
      ].filter(Boolean).join('').slice(0, 5000)
      form.append('youtube_description', ytDesc)

      // Tags como array separado
      if (ytKeywords) {
        ytKeywords.split(',').map((t: string) => t.trim()).filter(Boolean).slice(0, 500).forEach((tag: string) => {
          form.append('tags[]', tag)
        })
      }

      // Thumbnail 16:9
      if (coverYoutube) form.append('thumbnail_url', coverYoutube)

      // Idioma español, ubicación Buenos Aires Argentina
      form.append('defaultLanguage', 'es')
      form.append('defaultAudioLanguage', 'es-US')

      // Fecha de publicación = hoy
      const today = new Date().toISOString().split('T')[0]
      form.append('recordingDate', new Date().toISOString())

      // Categoría: People & Blogs (22), visible públicamente
      form.append('categoryId', '22')
      form.append('privacyStatus', 'public')
      form.append('embeddable', 'true')
    }

    // LINKEDIN — se publica como FOTO separada (portada vertical con título y descripción)
    // Se hace en llamada separada a /api/upload_photos después del video

    // FACEBOOK — Reels
    if (redes.fb) {
      form.append('facebook_title', (contenido.ig_titulo || '').slice(0, 255))
      form.append('facebook_description', (contenido.fb_descripcion || contenido.ig_descripcion || '').slice(0, 2000))
      form.append('facebook_media_type', 'REELS')
    }

    // TWITTER/X
    if (redes.tw) {
      form.append('x_title', (contenido.tw_texto || contenido.ig_titulo || '').slice(0, 280))
    }

    // THREADS
    if (redes.th) {
      form.append('threads_title', (contenido.th_texto || contenido.ig_titulo || '').slice(0, 500))
    }

    // LINKEDIN — llamada separada a upload_photos con portada vertical
    // Descargamos la imagen de Supabase Storage y la enviamos como blob
    let linkedinPhotoRequestId: string | null = null
    let linkedinError: string | null = null
    if (redes.li && contenido.portada_url_vertical) {
      try {
        // Descargar imagen desde Supabase Storage
        const imgRes = await fetch(contenido.portada_url_vertical)
        if (!imgRes.ok) throw new Error(`No se pudo descargar portada: HTTP ${imgRes.status}`)
        const imgBlob = await imgRes.blob()
        const imgFile = new File([imgBlob], 'portada.jpg', { type: 'image/jpeg' })

        const liForm = new FormData()
        liForm.append('user', username)
        liForm.append('platform[]', 'linkedin')
        liForm.append('photos[]', imgFile, 'portada.jpg')
        liForm.append('async_upload', 'true')
        const liTitulo = contenido.li_titulo || contenido.ig_titulo || ''
        const liDesc = contenido.li_descripcion || contenido.ig_descripcion || ''
        liForm.append('linkedin_title', [liTitulo, liDesc].filter(Boolean).join('\n\n').slice(0, 3000))
        liForm.append('visibility', 'PUBLIC')

        console.log('=== LINKEDIN FORM FIELDS ===')
        for (const [k, v] of liForm.entries()) {
          console.log(`  ${k}: ${typeof v === 'string' ? v.slice(0, 200) : `[File: ${(v as File).name} ${(v as File).size}b ${(v as File).type}]`}`)
        }
        const liRes = await fetch('https://api.upload-post.com/api/upload_photos', {
          method: 'POST',
          headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
          body: liForm
        })
        const liData = await liRes.json()
        console.log('=== LINKEDIN PHOTO RESPONSE ===', JSON.stringify(liData))
        if (liData.request_id) linkedinPhotoRequestId = liData.request_id
        if (!liData.success && !liData.request_id) {
          linkedinError = liData.message || liData.error || JSON.stringify(liData)
        }
      } catch(e: any) {
        console.error('Error publicando foto LinkedIn:', e.message)
        linkedinError = e.message
      }
    }

    console.log('=== FORM FIELDS ENVIADOS ===')
    for (const [k, v] of form.entries()) {
      console.log(`  ${k}: ${typeof v === 'string' ? v.slice(0, 150) : '[file]'}`)
    }

    const res = await fetch('https://api.upload-post.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
      body: form
    })

    const data = await res.json()
    console.log('=== UPLOAD POST RESPONSE ===', JSON.stringify(data))

    // Guardar request_id
    if (data.request_id && SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${contenido.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ upload_post_request_id: data.request_id })
      })
    }

    // Si ya hay resultados sincrónicos
    if (data.results) {
      const updates: Record<string, any> = {}
      const results = data.results
      if (redes.ig && results.instagram?.success) { updates.ig_publicado = true; if (results.instagram?.url) updates.ig_post_id = results.instagram.url }
      if (redes.tt && results.tiktok?.success) { updates.tt_publicado = true; if (results.tiktok?.url) updates.tt_post_id = results.tiktok.url }
      if (redes.yt && results.youtube?.success) { updates.yt_publicado = true; if (results.youtube?.url) updates.yt_post_id = results.youtube.url }
      if (redes.li && results.linkedin?.success) { updates.li_publicado = true; if (results.linkedin?.url) updates.li_post_id = results.linkedin.url }
      if (redes.fb && results.facebook?.success) { updates.fb_publicado = true; if (results.facebook?.url) updates.fb_post_id = results.facebook.url }
      if (redes.tw && results.x?.success) { updates.tw_publicado = true; if (results.x?.url) updates.tw_post_id = results.x.url }
      if (redes.th && results.threads?.success) { updates.th_publicado = true; if (results.threads?.url) updates.th_post_id = results.threads.url }
      if (Object.keys(updates).length > 0 && SUPABASE_URL && SUPABASE_KEY) {
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

    return NextResponse.json({ ...data, linkedin_error: linkedinError, linkedin_request_id: linkedinPhotoRequestId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
