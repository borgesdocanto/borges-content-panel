import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ success: false, error: 'Email y password requeridos' })

    // Usar service role key para crear usuarios sin confirmación
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Crear en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) return NextResponse.json({ success: false, error: authError.message })

    const userId = authData.user.id
    const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + Math.floor(Math.random() * 999)

    // Crear en tabla usuarios
    await supabaseAdmin.from('usuarios').insert({
      id: userId,
      email,
      plan: 'starter',
      activo: true,
      upload_post_username: username
    })

    // Crear perfil en Upload Post
    const uploadPostKey = process.env.UPLOAD_POST_API_KEY || ''
    if (uploadPostKey) {
      await fetch('https://api.upload-post.com/api/uploadposts/users', {
        method: 'POST',
        headers: { 'Authorization': `Apikey ${uploadPostKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
    }

    return NextResponse.json({ success: true, userId, username })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message })
  }
}
