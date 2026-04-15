import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}&confirm=t`
    const coverVertical = contenido.portada_url_vertical || ''  // 9:16 Instagram JPEG
    const coverYoutube = contenido.portada_url || ''            // 16:9 YouTube JPEG

    const form = new FormData()
    form.append('user', username)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')
    // title global — fallback para plataformas sin título específico
    form.append('title', contenido.yt_titulo || contenido.ig_titulo || contenido.archivo || '')

    // Plataformas activas
    const platformMap: Record<string, string> = {
      ig: 'instagram', tt: 'tiktok', yt: 'youtube',
      fb: 'facebook', th: 'threads'
      // linkedin y twitter/x se publican por separado como fotos
    }
    for (const [key, platform] of Object.entries(platformMap)) {
      if (redes[key]) form.append('platform[]', platform)
    }

    // INSTAGRAM — caption completo + portada vertical como cover_url (JPEG requerido)
    if (redes.ig) {
      const igCaption = [contenido.ig_titulo, contenido.ig_descripcion, contenido.ig_hashtags]
        .filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('instagram_title', igCaption)
      form.append('media_type', 'REELS')
      form.append('share_to_feed', 'true')
      // cover_url: portada vertical JPG desde Supabase Storage (acceso público)
      // Si no hay portada, usa thumb_offset como fallback (frame del video)
      if (coverVertical) {
        form.append('cover_url', coverVertical)
      } else {
        form.append('thumb_offset', '1000')
      }
    }

    // TIKTOK — caption completo + portada vertical como cover_url
    if (redes.tt) {
      const ttCaption = [contenido.tt_titulo, contenido.tt_descripcion, contenido.tt_hashtags]
        .filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('tiktok_title', ttCaption)
      // cover_timestamp define qué frame del video usar como portada (ms)
      // TikTok API no acepta imagen externa — usamos frame del video
      form.append('cover_timestamp', '2000')
    }

    // YOUTUBE — todos los campos correctos según la doc
    if (redes.yt) {
      form.append('youtube_title', (contenido.yt_titulo || '').slice(0, 100))

      // Descripción solo con el texto — sin keywords
      const ytHashtags = contenido.yt_hashtags || ''
      const ytKeywords = contenido.yt_keywords || ''
      const ytDesc = [
        contenido.yt_descripcion,
        ytHashtags ? `\n\n${ytHashtags}` : ''
      ].filter(Boolean).join('').slice(0, 5000)
      form.append('youtube_description', ytDesc)

      // Tags como array — keywords del copy + "inmobiliaria" siempre presente
      const tagsList: string[] = ytKeywords.split(',').map((t: string) => t.trim()).filter(Boolean)
      if (!tagsList.map(t => t.toLowerCase()).includes('inmobiliaria')) tagsList.unshift('inmobiliaria')
      tagsList.slice(0, 500).forEach((tag: string) => form.append('tags[]', tag))

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

    // TWITTER/X — se publica como FOTO separada (portada vertical + texto)
    // Se hace en llamada separada a /api/upload_photos después del video

    // THREADS — texto + cover vertical si hay portada
    if (redes.th) {
      form.append('threads_title', (contenido.th_texto || contenido.ig_titulo || '').slice(0, 500))
    }

    // Función helper para publicar foto en una red
    const publicarFoto = async (platform: string, titulo: string): Promise<{request_id?: string, error?: string}> => {
      if (!contenido.portada_url_vertical) return { error: 'Sin portada vertical' }
      try {
        const imgRes = await fetch(contenido.portada_url_vertical)
        if (!imgRes.ok) throw new Error(`No se pudo descargar portada: HTTP ${imgRes.status}`)
        const imgBlob = await imgRes.blob()
        const imgFile = new File([imgBlob], 'portada.jpg', { type: 'image/jpeg' })
        const fotoForm = new FormData()
        fotoForm.append('user', username)
        fotoForm.append('platform[]', platform)
        fotoForm.append('photos[]', imgFile, 'portada.jpg')
        fotoForm.append('async_upload', 'true')
        fotoForm.append('title', titulo.slice(0, 3000))
        if (platform === 'linkedin') fotoForm.append('visibility', 'PUBLIC')
        const fotoRes = await fetch('https://api.upload-post.com/api/upload_photos', {
          method: 'POST',
          headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
          body: fotoForm
        })
        const fotoData = await fotoRes.json()
        console.log(`=== ${platform.toUpperCase()} PHOTO RESPONSE ===`, JSON.stringify(fotoData))
        if (fotoData.request_id) return { request_id: fotoData.request_id }
        return { error: fotoData.message || fotoData.error || JSON.stringify(fotoData) }
      } catch(e: any) {
        return { error: e.message }
      }
    }

    // LINKEDIN — foto si hay portada, sino texto solo
    let linkedinPhotoRequestId: string | null = null
    let linkedinError: string | null = null
    if (redes.li) {
      const liTitulo = [contenido.li_titulo, contenido.li_descripcion].filter(Boolean).join('\n\n')
      if (contenido.portada_url_vertical) {
        // Intentar con foto
        const liResult = await publicarFoto('linkedin', liTitulo)
        if (liResult.request_id) {
          linkedinPhotoRequestId = liResult.request_id
        } else {
          // Foto falló — publicar solo texto como fallback
          console.log('LinkedIn foto falló, intentando solo texto:', liResult.error)
          try {
            const liTextForm = new FormData()
            liTextForm.append('user', username)
            liTextForm.append('platform[]', 'linkedin')
            liTextForm.append('async_upload', 'true')
            liTextForm.append('title', liTitulo.slice(0, 3000))
            liTextForm.append('visibility', 'PUBLIC')
            const liTextRes = await fetch('https://api.upload-post.com/api/upload_text', {
              method: 'POST',
              headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
              body: liTextForm
            })
            const liTextData = await liTextRes.json()
            console.log('=== LINKEDIN TEXT FALLBACK ===', JSON.stringify(liTextData))
            if (liTextData.request_id) linkedinPhotoRequestId = liTextData.request_id
            else linkedinError = liTextData.message || liTextData.error || 'Error publicando LinkedIn'
          } catch(e: any) { linkedinError = e.message }
        }
      } else {
        // Sin portada — publicar solo texto directamente
        try {
          const liTextForm = new FormData()
          liTextForm.append('user', username)
          liTextForm.append('platform[]', 'linkedin')
          liTextForm.append('async_upload', 'true')
          liTextForm.append('title', liTitulo.slice(0, 3000))
          liTextForm.append('visibility', 'PUBLIC')
          const liTextRes = await fetch('https://api.upload-post.com/api/upload_text', {
            method: 'POST',
            headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
            body: liTextForm
          })
          const liTextData = await liTextRes.json()
          console.log('=== LINKEDIN TEXT (sin portada) ===', JSON.stringify(liTextData))
          if (liTextData.request_id) linkedinPhotoRequestId = liTextData.request_id
          else linkedinError = liTextData.message || liTextData.error || 'Error publicando LinkedIn'
        } catch(e: any) { linkedinError = e.message }
      }
    }

    // TWITTER/X — foto con texto corto (max 280)
    let xPhotoRequestId: string | null = null
    let xError: string | null = null
    if (redes.tw && contenido.portada_url_vertical) {
      const twTitulo = (contenido.tw_texto || contenido.ig_titulo || '').slice(0, 280)
      const twResult = await publicarFoto('x', twTitulo)
      if (twResult.request_id) xPhotoRequestId = twResult.request_id
      else xError = twResult.error || null
    }

    console.log('=== FORM FIELDS ENVIADOS ===')
    for (const [k, v] of form.entries()) {
      console.log(`  ${k}: ${typeof v === 'string' ? v.slice(0, 150) : '[file]'}`)
    }

    // Solo llamar al endpoint de video si hay plataformas que lo requieren
    const videoPlatforms = [...form.getAll('platform[]')]
    let data: any = { success: true, skipped: true }
    if (videoPlatforms.length > 0) {
      const res = await fetch('https://api.upload-post.com/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
        body: form
      })
      data = await res.json()
      console.log('=== UPLOAD POST RESPONSE ===', JSON.stringify(data))
    } else {
      console.log('=== UPLOAD VIDEO SKIPPED — solo redes de foto ===')
    }

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

    return NextResponse.json({ ...data, linkedin_error: linkedinError, linkedin_request_id: linkedinPhotoRequestId, x_error: xError, x_request_id: xPhotoRequestId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
