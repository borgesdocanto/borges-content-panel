'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ADMIN_EMAIL = 'borgesdocanto@gmail.com'

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      if (data.session?.user?.email === ADMIN_EMAIL) setIsAdmin(true)
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
      if (session?.user?.email === ADMIN_EMAIL) setIsAdmin(true)
      else setIsAdmin(false)
    })
  }, [])

  const fetchUsuarios = async () => {
    const { data } = await supabase.from('usuarios').select('id,email,plan,activo,created_at,upload_post_username').order('created_at', { ascending: false })
    if (data) setUsuarios(data)
  }

  useEffect(() => {
    if (isAdmin) fetchUsuarios()
  }, [isAdmin])

  const handleLogin = async () => {
    setLoginError('')
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) setLoginError('Email o contraseña incorrectos')
  }

  const crearUsuario = async () => {
    if (!email || !password) { setError('Completá email y contraseña'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError(''); setMensaje('')
    try {
      // Crear en Supabase Auth via API admin
      const res = await fetch('/api/admin-crear-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Error creando usuario'); setLoading(false); return }
      setMensaje(`✅ Usuario ${email} creado correctamente`)
      setEmail(''); setPassword('')
      fetchUsuarios()
    } catch(e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from('usuarios').update({ activo: !activo }).eq('id', id)
    fetchUsuarios()
  }

  const cambiarPlan = async (id: string, plan: string) => {
    await supabase.from('usuarios').update({ plan }).eq('id', id)
    fetchUsuarios()
  }

  if (authed === null) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Cargando...</div>
  )

  if (!authed || !isAdmin) return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a24', border: '1px solid #2e2e38', borderRadius: 16, padding: 40, width: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/postia-logo.svg" alt="PostIA" style={{ height: 40, width: 'auto', marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>Admin</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email admin"
            style={{ width: '100%', background: '#0f0f13', border: '1px solid #2e2e38', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none', marginBottom: 8 }} />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Contraseña"
            style={{ width: '100%', background: '#0f0f13', border: '1px solid #2e2e38', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        {loginError && <div style={{ color: '#f05454', fontSize: 13, marginBottom: 12 }}>{loginError}</div>}
        <button onClick={handleLogin} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: '#e8472a', color: '#fff' }}>
          Ingresar
        </button>
        {authed && !isAdmin && <div style={{ color: '#f05454', fontSize: 13, marginTop: 12, textAlign: 'center' }}>No tenés permisos de admin</div>}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f13', color: '#e8e8f0', fontFamily: 'Inter, sans-serif', padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/postia-logo.svg" alt="PostIA" style={{ height: 36 }} />
            <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Panel Admin</div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid #2e2e38', background: 'transparent', color: '#888' }}>
            Cerrar sesión
          </button>
        </div>

        {/* Crear usuario */}
        <div style={{ background: '#1a1a24', border: '1px solid #2e2e38', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Crear nuevo usuario</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
              style={{ flex: 1, background: '#0f0f13', border: '1px solid #2e2e38', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña temporal"
              style={{ flex: 1, background: '#0f0f13', border: '1px solid #2e2e38', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
            <button onClick={crearUsuario} disabled={loading} style={{ padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', border: 'none', background: loading ? '#2e2e38' : '#e8472a', color: '#fff', whiteSpace: 'nowrap' }}>
              {loading ? 'Creando...' : '+ Crear'}
            </button>
          </div>
          {error && <div style={{ color: '#f05454', fontSize: 13 }}>{error}</div>}
          {mensaje && <div style={{ color: '#22c55e', fontSize: 13 }}>{mensaje}</div>}
        </div>

        {/* Lista usuarios */}
        <div style={{ background: '#1a1a24', border: '1px solid #2e2e38', borderRadius: 12, padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Usuarios ({usuarios.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {usuarios.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0f0f13', borderRadius: 8, border: '1px solid #2e2e38' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>@{u.upload_post_username} · {u.id.slice(0,8)}...</div>
                </div>
                <select value={u.plan || 'starter'} onChange={e => cambiarPlan(u.id, e.target.value)}
                  style={{ background: '#1a1a24', border: '1px solid #2e2e38', color: '#e8e8f0', padding: '4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
                <div onClick={() => toggleActivo(u.id, u.activo)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: u.activo ? 'rgba(34,197,94,0.15)' : 'rgba(240,84,84,0.15)', color: u.activo ? '#22c55e' : '#f05454', border: `1px solid ${u.activo ? '#22c55e44' : '#f0545444'}` }}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
