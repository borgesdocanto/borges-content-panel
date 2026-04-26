import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const UPLOAD_POST_KEY = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  '.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ',
  '.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'
].join('')

const SUPABASE_URL = 'https://zphzoaeihoziyhhdatut.supabase.co'
const SUPABASE_KEY = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwaHpvYWVpaG96aXloaGRhdHV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMwODY3MCwiZXhwIjoyMDg4ODg0NjcwfQ',
  '.qpt9xAI7bzEZB1tRQ54cKnDtmXOIgCOnTIxIFbqG65g'
].join('')

async function updateSupabase(contenidoId: string, updates: Record<string, any>) {
  await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${contenidoId}`, {
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

export async function POST(req: NextRequest) {
  try {
    const { contenido, redes, username } = await req.json()

    const videoUrl = `https://drive.google.com/uc?export=download&id=${contenido.file_id_drive}&confirm=t`
    const coverVertical = contenido.portada_url_vertical || ''
    const coverYoutube = contenido.portada_url || ''

    const updates: Record<string, any> = {}
    let videoRequestId: string | null = null
    let videoError: string | null = null
    let liError: string | null = null
    let xError: string | null = null

    // === VIDEO: IG, TT, YT, FB, Threads ===
    const videoRedes = ['ig','tt','yt','fb','th'].filter(r => redes[r])
    if (videoRedes.length > 0) {
      const form = new FormData()
      form.append('user', username)
      form.append('video', videoUrl)
      form.append('async_upload', 'true')
      form.append('title', contenido.yt_titulo || contenido.ig_titulo || '')

      const platformMap: Record<string,string> = {
        ig:'instagram', tt:'tiktok', yt:'youtube', fb:'facebook', th:'threads'
      }
      for (const r of videoRedes) form.append('platform[]', platformMap[r])

      if (redes.ig) {
        const cap = [contenido.ig_titulo, contenido.ig_descripcion, contenido.ig_hashtags].filter(Boolean).join('\n\n')
        form.append('instagram_title', cap.slice(0, 2200))
        form.append('media_type', 'REELS')
        form.append('share_to_feed', 'true')
        if (coverVertical) form.append('cover_url', coverVertical)
      }
      if (redes.tt) {
        const cap = [contenido.tt_titulo, contenido.tt_descripcion, contenido.tt_hashtags].filter(Boolean).join('\n\n')
        form.append('tiktok_title', cap.slice(0, 2200))
        form.append('cover_timestamp', '2000')
      }
      if (redes.yt) {
        form.append('youtube_title', (contenido.yt_titulo || '').slice(0, 100))
        const desc = [contenido.yt_descripcion, contenido.yt_keywords ? `Keywords: ${contenido.yt_keywords}` : ''].filter(Boolean).join('\n\n')
        form.append('youtube_description', desc.slice(0, 5000))
        if (coverYoutube) form.append('thumbnail_url', coverYoutube)
        form.append('defaultLanguage', 'es')
        form.append('privacyStatus', 'public')
      }
      if (redes.fb) {
        form.append('facebook_title', (contenido.ig_titulo || '').slice(0, 255))
        form.append('facebook_description', (contenido.fb_descripcion || contenido.ig_descripcion || '').slice(0, 2000))
        form.append('facebook_media_type', 'REELS')
      }
      if (redes.th) {
        form.append('threads_title', (contenido.th_texto || contenido.ig_titulo || '').slice(0, 500))
      }

      const res = await fetch('https://api.upload-post.com/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
        body: form
      })
      const data = await res.json()
      console.log('Upload Post video response:', JSON.stringify(data))
      videoRequestId = data.request_id || null
      if (!data.request_id) videoError = data.message || data.error || JSON.stringify(data)
    }

    // === LINKEDIN — foto ===
    if (redes.li && coverVertical) {
      try {
        const imgRes = await fetch(coverVertical)
        if (imgRes.ok) {
          const imgBlob = await imgRes.blob()
          const imgFile = new File([imgBlob], 'portada.jpg', { type: 'image/jpeg' })
          const liForm = new FormData()
          liForm.append('user', username)
          liForm.append('platform[]', 'linkedin')
          liForm.append('photos[]', imgFile, 'portada.jpg')
          liForm.append('async_upload', 'true')
          const liCap = [contenido.li_titulo, contenido.li_descripcion].filter(Boolean).join('\n\n')
          liForm.append('title', liCap.slice(0, 3000))
          liForm.append('visibility', 'PUBLIC')
          const liRes = await fetch('https://api.upload-post.com/api/upload_photos', {
            method: 'POST',
            headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
            body: liForm
          })
          const liData = await liRes.json()
          console.log('LinkedIn response:', JSON.stringify(liData))
          if (!liData.request_id) liError = liData.message || liData.error || JSON.stringify(liData)
          else updates.li_publicado = true
        }
      } catch(e: any) { liError = e.message }
    }

    // === TWITTER/X — foto ===
    if (redes.tw && coverVertical) {
      try {
        const imgRes = await fetch(coverVertical)
        if (imgRes.ok) {
          const imgBlob = await imgRes.blob()
          const imgFile = new File([imgBlob], 'portada.jpg', { type: 'image/jpeg' })
          const xForm = new FormData()
          xForm.append('user', username)
          xForm.append('platform[]', 'x')
          xForm.append('photos[]', imgFile, 'portada.jpg')
          xForm.append('async_upload', 'true')
          xForm.append('title', (contenido.tw_texto || contenido.ig_titulo || '').slice(0, 280))
          const xRes = await fetch('https://api.upload-post.com/api/upload_photos', {
            method: 'POST',
            headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
            body: xForm
          })
          const xData = await xRes.json()
          console.log('X response:', JSON.stringify(xData))
          if (!xData.request_id) xError = xData.message || xData.error || JSON.stringify(xData)
          else updates.tw_publicado = true
        }
      } catch(e: any) { xError = e.message }
    }

    // Actualizar flags de publicacion en Supabase
    if (redes.ig) updates.ig_publicado = !videoError
    if (redes.tt) updates.tt_publicado = !videoError
    if (redes.yt) updates.yt_publicado = !videoError
    if (redes.fb) updates.fb_publicado = !videoError
    if (redes.th) updates.th_publicado = !videoError
    if (videoRequestId) updates.upload_post_request_id = videoRequestId

    if (Object.keys(updates).length > 0) {
      await updateSupabase(contenido.id, updates)
    }

    return NextResponse.json({
      success: !videoError,
      request_id: videoRequestId,
      video_error: videoError,
      li_error: liError,
      x_error: xError
    })

  } catch (e: any) {
    console.error('publicar error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
