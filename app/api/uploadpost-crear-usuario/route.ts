import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const UPLOAD_POST_KEY = process.env.UPLOAD_POST_API_KEY || ''
    const { username } = await req.json()
    if (!username) return NextResponse.json({ error: 'username requerido' }, { status: 400 })

    const res = await fetch('https://api.upload-post.com/api/uploadposts/users', {
      method: 'POST',
      headers: {
        'Authorization': `Apikey ${UPLOAD_POST_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
