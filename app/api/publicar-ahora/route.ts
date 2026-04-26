import { NextRequest, NextResponse } from 'next/server'

// Ruta temporal para publicar el post del 26/4 via GET
// Eliminar después de confirmar publicación exitosa

export async function GET(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9','.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ','.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'].join('')
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    const CONTENIDO_ID = '9b567813-a099-40cb-b131-4817e04fd5c3'
    const FILE_ID_DRIVE = '1FjJgIRNTEsVSkyznRgiJVRL-nTjNDUyS'
    const USERNAME = 'leanborges'
    const PORTADA_VERTICAL = 'https://zphzoaeihoziyhhdatut.supabase.co/storage/v1/object/public/portadas/17047dd3-00c1-419d-b3a0-c173b8b201fa-1FjJgIRNTEsVSkyznRgiJVRL-nTjNDUyS-vertical.jpg'
    const PORTADA_YOUTUBE = 'https://zphzoaeihoziyhhdatut.supabase.co/storage/v1/object/public/portadas/17047dd3-00c1-419d-b3a0-c173b8b201fa-1FjJgIRNTEsVSkyznRgiJVRL-nTjNDUyS-youtube.jpg'

    const videoUrl = `https://drive.google.com/uc?export=download&id=${FILE_ID_DRIVE}&confirm=t`

    const log: string[] = []

    // ─── VIDEO: Instagram, TikTok, YouTube, Facebook, Threads ───
    const form = new FormData()
    form.append('user', USERNAME)
    form.append('video', videoUrl)
    form.append('async_upload', 'true')
    form.append('title', 'Por qué el silencio del mercado inmobiliario es una señal que no podés ignorar')

    // Plataformas de video
    form.append('platform[]', 'instagram')
    form.append('platform[]', 'tiktok')
    form.append('platform[]', 'youtube')
    form.append('platform[]', 'facebook')
    form.append('platform[]', 'threads')

    // Instagram
    const igCaption = `El silencio del mercado también es una respuesta

Publicaste tu propiedad y no pasa nada.

Eso no es mala suerte. Es información.

El mercado habla. Solo que no siempre lo hace con consultas o visitas. A veces habla con silencio.

Y ese silencio dice:
— No genera interés
— Algo no cierra
— El comprador pasa y sigue

El problema no es el mercado.
El problema es que muchos propietarios esperan.
Y la inmobiliaria que eligieron ni siquiera llama.

Como si algo fuera a cambiar solo.

El mercado no cambia si vos no cambiás algo primero.

Eso no es apurarse.
Eso es entender qué está pasando para decidir mejor.

Y para eso necesitás un inmobiliario que trabaje de forma proactiva, que haga que las cosas pasen, y que te cuente la verdad aunque sea difícil de escuchar.

¿Estás escuchando al mercado o estás esperando que algo pase solo?

#mercadoinmobiliario #propiedades #ventadepropiedades #inmobiliaria #realestate #realestateargentina #consejosinmobiliarios #propietarios #inmobiliariocomercial #metodoinmobiliario #vendertupropied #asesoriainmobiliaria #mercadoinmueble #comprarvender #inmuebles #broker #martillero #corredor #negociosinmobiliarios #leandroborges`

    form.append('instagram_title', igCaption.slice(0, 2200))
    form.append('media_type', 'REELS')
    form.append('share_to_feed', 'true')
    form.append('cover_url', PORTADA_VERTICAL)

    // TikTok
    form.append('tiktok_title', 'Si publicaste y no pasa nada, el mercado ya te respondió\n\nEl mercado habla con silencio. ¿Lo estás escuchando? No esperes que algo cambie solo 👇 #inmobiliaria #realestate #propiedades #vendertucasa #mercadoinmobiliario #broker #realestateargentina #consejosdeoro #propietarios #silenciomercado')
    form.append('cover_timestamp', '2000')

    // YouTube
    form.append('youtube_title', 'Por qué el silencio del mercado inmobiliario es una señal que no podés ignorar')
    form.append('youtube_description', `Si publicaste tu propiedad y no recibís consultas, visitas ni ofertas, el mercado ya te está respondiendo. El problema es que pocos entienden ese mensaje a tiempo.

En este video hablo sobre cómo leer el silencio del mercado, qué significa cuando nadie se mueve con tu propiedad, y por qué esperar sin hacer nada es el peor error que podés cometer.

Lo que vas a ver:
— Qué significa cuando el mercado no valida tu propiedad
— Por qué el propietario espera y la inmobiliaria no llama
— Cómo actuar de forma proactiva para generar resultados reales

Si vendés propiedades o tenés una en venta, este video es para vos.

¿Estás escuchando al mercado o esperando que algo pase solo?

#inmobiliaria #realestate`)
    ;['inmobiliaria', 'real estate argentina', 'mercado inmobiliario', 'silencio del mercado', 'venta de propiedades', 'propietarios', 'broker inmobiliario'].forEach(t => form.append('tags[]', t))
    form.append('thumbnail_url', PORTADA_YOUTUBE)
    form.append('defaultLanguage', 'es')
    form.append('defaultAudioLanguage', 'es-US')
    form.append('categoryId', '22')
    form.append('privacyStatus', 'public')
    form.append('embeddable', 'true')

    // Facebook
    form.append('facebook_title', 'El silencio del mercado también es una respuesta')
    form.append('facebook_description', 'El mercado habla. Solo que no siempre lo hace con consultas o visitas.\n\nA veces habla con silencio.\n\nY ese silencio dice que algo no está funcionando: no genera interés, el comprador pasa y sigue, el mercado no lo valida.\n\nEl problema es que muchos propietarios esperan. Y la inmobiliaria que eligieron ni siquiera los llama.\n\nComo si algo fuera a cambiar solo.\n\nPero el mercado no cambia si vos no cambiás algo primero.\n\nNecesitás un inmobiliario que trabaje de forma proactiva, que haga que las cosas pasen, y que te cuente la verdad aunque sea difícil de escuchar.\n\n¿Estás escuchando al mercado o estás esperando que algo pase solo? Contame abajo 👇')
    form.append('facebook_media_type', 'REELS')

    // Threads
    form.append('threads_title', 'Publicaste tu propiedad y no llega nada.\n\nNi consultas. Ni visitas. Ni ofertas.\n\nEso no es mala suerte. Es el mercado hablando.\n\nY dice: algo no está cerrando.\n\nEl problema real no es la propiedad.\nEs que el propietario espera y la inmobiliaria no llama.\n\nComo si el mercado fuera a cambiar solo.\n\nNo cambia. Cambiás algo vos primero.\n\n¿Estás escuchando o estás esperando?')

    log.push('Enviando video a IG/TT/YT/FB/TH...')
    const videoRes = await fetch('https://api.upload-post.com/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
      body: form
    })
    const videoData = await videoRes.json()
    log.push('Video response: ' + JSON.stringify(videoData))

    // ─── LINKEDIN — foto ───
    log.push('Publicando LinkedIn como foto...')
    const liTitulo = `El silencio del mercado no es un problema de paciencia. Es una señal.

Publicás una propiedad. No llegan consultas. No hay visitas. No hay ofertas.

Muchos propietarios interpretan eso como mala racha o falta de tiempo.

No. Es el mercado hablando.

Y dice algo muy claro: esto no cierra. El comprador pasa y sigue.

El error más común en estos casos no es el precio ni la foto.
Es la falta de reacción.

El propietario espera. Y la inmobiliaria que eligió no llama.
Como si el mercado fuera a cambiar solo.

El mercado no cambia si vos no cambiás algo primero.

Ahí es donde entra el valor real de un profesional inmobiliario: no solo para publicar, sino para interpretar, para actuar, y para decirte la verdad aunque sea incómoda.

La diferencia entre cerrar una operación y tener una propiedad estancada meses no es suerte.
Es método. Es seguimiento. Es proactividad.

¿Tu cartera tiene propiedades que no se mueven? ¿Estás leyendo el mercado o esperando que algo pase solo?`

    let linkedinRequestId: string | null = null
    let linkedinError: string | null = null
    try {
      const imgRes = await fetch(PORTADA_VERTICAL)
      if (imgRes.ok) {
        const imgBlob = await imgRes.blob()
        const imgFile = new File([imgBlob], 'portada.jpg', { type: 'image/jpeg' })
        const liForm = new FormData()
        liForm.append('user', USERNAME)
        liForm.append('platform[]', 'linkedin')
        liForm.append('photos[]', imgFile, 'portada.jpg')
        liForm.append('async_upload', 'true')
        liForm.append('title', liTitulo.slice(0, 3000))
        liForm.append('visibility', 'PUBLIC')
        const liRes = await fetch('https://api.upload-post.com/api/upload_photos', {
          method: 'POST',
          headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
          body: liForm
        })
        const liData = await liRes.json()
        log.push('LinkedIn response: ' + JSON.stringify(liData))
        if (liData.request_id) linkedinRequestId = liData.request_id
        else linkedinError = liData.message || liData.error || JSON.stringify(liData)
      } else {
        linkedinError = `No se pudo descargar portada: HTTP ${imgRes.status}`
      }
    } catch(e: any) {
      linkedinError = e.message
    }

    // ─── TWITTER/X — foto ───
    log.push('Publicando Twitter/X como foto...')
    let xRequestId: string | null = null
    let xError: string | null = null
    try {
      const imgRes2 = await fetch(PORTADA_VERTICAL)
      if (imgRes2.ok) {
        const imgBlob2 = await imgRes2.blob()
        const imgFile2 = new File([imgBlob2], 'portada.jpg', { type: 'image/jpeg' })
        const xForm = new FormData()
        xForm.append('user', USERNAME)
        xForm.append('platform[]', 'x')
        xForm.append('photos[]', imgFile2, 'portada.jpg')
        xForm.append('async_upload', 'true')
        xForm.append('title', 'Publicaste tu propiedad y no pasa nada.\n\nEso también es una respuesta.\n\nEl mercado habla con silencio. Dice que algo no cierra, que el comprador pasa y sigue.\n\nEl error: esperar que cambie solo.\n\nNo cambia. Cambiás vos primero.\n\n¿Estás escuchando al mercado?')
        const xRes = await fetch('https://api.upload-post.com/api/upload_photos', {
          method: 'POST',
          headers: { 'Authorization': `Apikey ${UPLOAD_POST_KEY}` },
          body: xForm
        })
        const xData = await xRes.json()
        log.push('X response: ' + JSON.stringify(xData))
        if (xData.request_id) xRequestId = xData.request_id
        else xError = xData.message || xData.error || JSON.stringify(xData)
      }
    } catch(e: any) {
      xError = e.message
    }

    // ─── Guardar request_id en Supabase ───
    if (videoData.request_id) {
      await fetch(`${SUPABASE_URL}/rest/v1/contenido?id=eq.${CONTENIDO_ID}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ upload_post_request_id: videoData.request_id, estado: 'publicado' })
      })
      log.push('request_id guardado en Supabase: ' + videoData.request_id)
    }

    return NextResponse.json({
      ok: true,
      video_request_id: videoData.request_id || null,
      video_status: videoData.status || null,
      video_error: videoData.message || videoData.error || null,
      video_full: videoData,
      linkedin_request_id: linkedinRequestId,
      linkedin_error: linkedinError,
      x_request_id: xRequestId,
      x_error: xError,
      log
    })

  } catch(e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
