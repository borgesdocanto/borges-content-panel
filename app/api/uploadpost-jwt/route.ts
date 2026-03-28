import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()
    if (!username) return NextResponse.json({ error: 'username requerido' }, { status: 400 })

    const UPLOAD_POST_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvcmdlc2RvY2FudG9AZ21haWwuY29tIiwiZXhwIjo0OTA3MjI1MDYzLCJqdGkiOiJkZDIwMTNiYS0zZTAwLTQ3ODMtYTAzZC0wYjRlYmY0ZjZjOTEifQ.sUiCyuDfE5u6V_bg2bd2Ss7FmVTRCXpJjnekK-Mhncc'

    const res = await fetch('https://api.upload-post.com/api/uploadposts/users/generate-jwt', {
      method: 'POST',
      headers: {
        'Authorization': `Apikey ${UPLOAD_POST_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        redirect_url: 'https://content.borges.com.ar',
        connect_title: 'Conectá tus redes sociales',
        connect_description: 'Vinculá tus cuentas para que PostIA pueda publicar en tu nombre.',
        show_calendar: true,
      })
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: 'Error generando JWT' }, { status: 500 })
  }
}
