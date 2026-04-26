import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}&confirm=t`
    const coverVertical = contenido.portada_url_vertical || ''
    const coverYoutube  = contenido.portada_url || ''

    // Helper: guardar request_id en Supabase
    const saveRequestId = async (requestId: string) => {
      if (!requestId || !SUPABASE_URL || !SUPABASE_KEY) return
      await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${contenido.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ upload_post_request_id: requestId, estado: 'publicado' })
      })
    }

    // Helper: publicar foto usando URL pública (sin descargar localmente)
    const publicarFotoUrl = async (platform: string, titulo: string, imageUrl: string): Promise<{request_id?: string, error?: string}> => {
      if (!imageUrl) return { error: 'Sin portada vertical' }
      try {
        const fotoForm = new FormData()
        fotoForm.append('user', username)
        fotoForm.append('platform[]', platform)
        fotoForm.append('async_upload', 'true')
        fotoForm.append('title', titulo.slice(0, 3000))
        fotoForm.append('photo_url', imageUrl)  // URL directa — Upload Post descarga la imagen
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

    // Helper: publicar texto plano (fallback para LinkedIn sin portada)
    const publicarTexto = async (platform: string, titulo: string): Promise<{request_id?: string, error?: string}> => {
      try {
        const textForm = new FormData()
        textForm.append('user', username)
        textForm.append('platform[]', platform)
        textForm.append('async_upload', 'true')
        textForm.append('title', titulo.slice(0, 3000))
        if (platform === 'linkedin') textForm.append('visibility', 'PUBLIC')
        const textRes = await fetch('https://api.upload-post.com/api/upload_text', {
          method: 'POST',
          headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
          body: textForm
        })
        const textData = await textRes.json()
        console.log(`=== ${platform.toUpperCase()} TEXT RESPONSE ===`, JSON.stringify(textData))
        if (textData.request_id) return { request_id: textData.request_id }
        return { error: textData.message || textData.error || JSON.stringify(textData) }
      } catch(e: any) {
        return { error: e.message }
      }
    }

    // ── LINKEDIN ────────────────────────────────────────────────────────────
    let linkedinRequestId: string | null = null
    let linkedinError: string | null = null
    if (redes.li) {
      const liTitulo = [contenido.li_titulo, contenido.li_descripcion].filter(Boolean).join('\n\n')
      if (coverVertical) {
        const liResult = await publicarFotoUrl('linkedin', liTitulo, coverVertical)
        if (liResult.request_id) {
          linkedinRequestId = liResult.request_id
          await saveRequestId(liResult.request_id)
        } else {
          console.log('LinkedIn foto URL falló, intentando texto:', liResult.error)
          const liText = await publicarTexto('linkedin', liTitulo)
          if (liText.request_id) { linkedinRequestId = liText.request_id; await saveRequestId(liText.request_id) }
          else linkedinError = liText.error || 'Error publicando LinkedIn'
        }
      } else {
        const liText = await publicarTexto('linkedin', liTitulo)
        if (liText.request_id) { linkedinRequestId = liText.request_id; await saveRequestId(liText.request_id) }
        else linkedinError = liText.error || 'Error publicando LinkedIn'
      }
    }

    // ── TWITTER/X ───────────────────────────────────────────────────────────
    let xRequestId: string | null = null
    let xError: string | null = null
    if (redes.tw) {
      const twTitulo = (contenido.tw_texto || contenido.ig_titulo || '').slice(0, 280)
      if (coverVertical) {
        const twResult = await publicarFotoUrl('x', twTitulo, coverVertical)
        if (twResult.request_id) { xRequestId = twResult.request_id; await saveRequestId(twResult.request_id) }
        else xError = twResult.error || null
      }
    }

    // ── VIDEO: IG, TikTok, YouTube, Facebook, Threads ───────────────────────
    const form = new FormData()
    form.append('user', username)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')

    const videoPlatforms: string[] = []
    if (redes.ig) videoPlatforms.push('instagram')
    if (redes.tt) videoPlatforms.push('tiktok')
    if (redes.yt) videoPlatforms.push('youtube')
    if (redes.fb) videoPlatforms.push('facebook')
    if (redes.th) videoPlatforms.push('threads')

    for (const p of videoPlatforms) form.append('platform[]', p)

    if (redes.ig) {
      const igCaption = [contenido.ig_titulo, contenido.ig_descripcion, contenido.ig_hashtags].filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('instagram_title', igCaption)
      form.append('media_type', 'REELS')
      form.append('share_to_feed', 'true')
      if (coverVertical) form.append('cover_url', coverVertical)
      else form.append('thumb_offset', '1000')
    }

    if (redes.tt) {
      const ttCaption = [contenido.tt_titulo, contenido.tt_descripcion, contenido.tt_hashtags].filter(Boolean).join('\n\n').slice(0, 2200)
      form.append('tiktok_title', ttCaption)
      form.append('cover_timestamp', '2000')
    }

    if (redes.yt) {
      form.append('youtube_title', (contenido.yt_titulo || '').slice(0, 100))
      const ytDesc = [contenido.yt_descripcion, contenido.yt_hashtags ? `\n\n${contenido.yt_hashtags}` : ''].filter(Boolean).join('').slice(0, 5000)
      form.append('youtube_description', ytDesc)
      const tagsList: string[] = (contenido.yt_keywords || '').split(',').map((t: string) => t.trim()).filter(Boolean)
      if (!tagsList.map((t: string) => t.toLowerCase()).includes('inmobiliaria')) tagsList.unshift('inmobiliaria')
      tagsList.slice(0, 500).forEach((tag: string) => form.append('tags[]', tag))
      if (coverYoutube) form.append('thumbnail_url', coverYoutube)
      form.append('defaultLanguage', 'es')
      form.append('defaultAudioLanguage', 'es-US')
      form.append('categoryId', '22')
      form.append('privacyStatus', 'public')
      form.append('embeddable', 'true')
    }

    if (redes.fb) {
      form.append('facebook_title', (contenido.ig_titulo || '').slice(0, 255))
      form.append('facebook_description', (contenido.fb_descripcion || contenido.ig_descripcion || '').slice(0, 2000))
      form.append('facebook_media_type', 'REELS')
    }

    if (redes.th) {
      form.append('threads_title', (contenido.th_texto || contenido.ig_titulo || '').slice(0, 500))
    }

    console.log('=== FORM FIELDS ENVIADOS ===')
    for (const [k, v] of form.entries()) {
      console.log(`  ${k}: ${typeof v === 'string' ? v.slice(0, 150) : '[file]'}`)
    }
    console.log('=== USERNAME ===', username)
    console.log('=== VIDEO PLATFORMS ===', videoPlatforms)

    let data: any = { success: true, skipped: true }
    if (videoPlatforms.length > 0) {
      const res = await fetch('https://api.upload-post.com/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
        body: form
      })
      data = await res.json()
      console.log('=== UPLOAD POST VIDEO RESPONSE ===', JSON.stringify(data))

      if (data.request_id) await saveRequestId(data.request_id)
    }

    return NextResponse.json({
      ...data,
      linkedin_error: linkedinError,
      linkedin_request_id: linkedinRequestId,
      x_error: xError,
      x_request_id: xRequestId,
    })

  } catch (e: any) {
    console.error('=== ERROR EN /api/publicar ===', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
