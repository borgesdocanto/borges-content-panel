'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

type Contenido = {
  id: string; archivo: string; file_id_drive: string; estado: string
  created_at: string; fecha_aprobacion: string; score_promedio: number; score_gancho: number
  score_claridad: number; score_cta: number
  transcripcion: string; ig_titulo: string; ig_descripcion: string; ig_hashtags: string; li_hashtags: string
  tt_titulo: string; tt_descripcion: string; tt_hashtags: string
  yt_titulo: string; yt_descripcion: string; yt_hashtags: string; yt_keywords: string
  li_titulo: string; li_descripcion: string
  fb_descripcion: string; tw_texto: string; th_texto: string
  ig_publicado: boolean; tt_publicado: boolean; yt_publicado: boolean
  li_publicado: boolean; fb_publicado: boolean; tw_publicado: boolean; th_publicado: boolean
  ig_post_id: string; tt_post_id: string; yt_post_id: string
  li_post_id: string; fb_post_id: string; tw_post_id: string; th_post_id: string
  portada_vertical_path: string; portada_youtube_path: string
  portada_url: string; portada_url_vertical: string
  upload_post_request_id: string
  fecha_programada_ig: string; fecha_programada_tt: string; fecha_programada_yt: string
  fecha_programada_li: string; fecha_programada_fb: string; fecha_programada_tw: string; fecha_programada_th: string
}

type Config = { parametro: string; valor: string }
const REDES = ['instagram','tiktok','youtube','linkedin','facebook','twitter','threads']

const GRAY_SVG: Record<string, string> = {
  instagram: '<svg viewBox="0 0 24 24" fill="#555"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
  tiktok:    '<svg viewBox="0 0 24 24" fill="#555"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>',
  youtube:   '<svg viewBox="0 0 24 24" fill="#555"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>',
  linkedin:  '<svg viewBox="0 0 24 24" fill="#555"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  facebook:  '<svg viewBox="0 0 24 24" fill="#555"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  twitter:   '<svg viewBox="0 0 24 24" fill="#555"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  threads:   '<svg viewBox="0 0 24 24" fill="#555"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.288-.883-2.301-.887l-.026-.001c-.785 0-1.848.192-2.531 1.344l-1.775-1.05c.87-1.474 2.307-2.285 4.06-2.285h.037c2.966.03 4.735 1.82 5.067 5.093a8.503 8.503 0 011.044.584c1.26.83 2.139 2.022 2.543 3.443.74 2.594.095 5.417-1.707 7.15-1.61 1.548-3.851 2.382-6.573 2.403z"/></svg>',
}

const RED_META: Record<string, { color: string; label: string; svg: string }> = {
  instagram: { color: '#e1306c', label: 'Instagram', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
  tiktok:    { color: '#69c9d0', label: 'TikTok',    svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>' },
  youtube:   { color: '#ff0000', label: 'YouTube',   svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' },
  linkedin:  { color: '#0077b5', label: 'LinkedIn',  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
  facebook:  { color: '#1877f2', label: 'Facebook',  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
  twitter:   { color: '#1da1f2', label: 'Twitter/X', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
  threads:   { color: '#aaaaaa', label: 'Threads',   svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.288-.883-2.301-.887l-.026-.001c-.785 0-1.848.192-2.531 1.344l-1.775-1.05c.87-1.474 2.307-2.285 4.06-2.285h.037c2.966.03 4.735 1.82 5.067 5.093a8.503 8.503 0 011.044.584c1.26.83 2.139 2.022 2.543 3.443.74 2.594.095 5.417-1.707 7.15-1.61 1.548-3.851 2.382-6.573 2.403z"/></svg>' },
}

const Btn = ({ onClick, children, variant = 'ghost', style = {}, disabled = false }: any) => {
  const vs: Record<string, React.CSSProperties> = {
    ghost:  { background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)' },
    gold:   { background: 'var(--accent)', border: 'none', color: '#fff' },
    danger: { background: 'rgba(232,71,42,0.08)', border: '1px solid rgba(232,71,42,0.2)', color: 'var(--red)' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, ...vs[variant], ...style }}>{children}</button>
}

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...style }}>{children}</div>
)

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color || 'var(--accent)', borderRadius: '10px 10px 0 0' }} />
    <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>{label}</div>
    <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, color: color || 'var(--accent)', letterSpacing: 1, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
  </div>
)

function LoginPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 360, maxWidth: '90vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/postia-logo.svg" alt="PostIA" style={{ height: 48, width: 'auto', marginBottom: 4 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="tu@email.com"
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Contraseña</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••"
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        {error && <div style={{ background: 'rgba(240,84,84,0.1)', border: '1px solid rgba(240,84,84,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', border: 'none', background: loading ? 'var(--border)' : 'var(--accent)', color: '#fff', marginBottom: 12 }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <div onClick={onRegister} style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>¿No tenés cuenta? <span style={{ color: 'var(--accent)' }}>Registrate</span></div>
      </div>
    </div>
  )
}

function OnboardingPage({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [drivePublicar, setDrivePublicar] = useState('')
  const [drivePublicados, setDrivePublicados] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const guardar = async () => {
    if (!drivePublicar || !drivePublicados) { setError('Completá ambas URLs de Drive'); return }
    if (!drivePublicar.includes('drive.google.com') || !drivePublicados.includes('drive.google.com')) { setError('Las URLs deben ser de Google Drive'); return }
    setLoading(true); setError('')
    // Obtener userId desde sesión activa si el prop llega vacío
    let uid = userId
    if (!uid) {
      const { data: { session } } = await supabase.auth.getSession()
      uid = session?.user?.id || ''
    }
    if (!uid) { setError('Error: sesión no encontrada. Recargá la página.'); setLoading(false); return }
    // Asegurar que el usuario existe en tabla usuarios
    const { data: usuarioExiste } = await supabase.from('usuarios').select('id').eq('id', uid).limit(1)
    if (!usuarioExiste || usuarioExiste.length === 0) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('usuarios').insert({ 
        id: uid, 
        email: user?.email || '', 
        plan: 'starter', 
        activo: true, 
        upload_post_username: (user?.email || '').split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + Math.floor(Math.random() * 999)
      })
    }
    try {
      const results = await Promise.all([
        supabase.from('usuario_config').upsert({ user_id: uid, parametro: 'drive_carpeta_publicar', valor: drivePublicar }, { onConflict: 'user_id,parametro' }),
        supabase.from('usuario_config').upsert({ user_id: uid, parametro: 'drive_carpeta_publicados', valor: drivePublicados }, { onConflict: 'user_id,parametro' }),
        supabase.from('usuario_config').upsert({ user_id: uid, parametro: 'max_videos_diarios', valor: '2' }, { onConflict: 'user_id,parametro' }),
        supabase.from('usuario_config').upsert({ user_id: uid, parametro: 'autopublicacion', valor: 'false' }, { onConflict: 'user_id,parametro' }),
      ])
      const errores = results.filter(r => r.error)
      if (errores.length > 0) {
        setError('Error guardando: ' + errores[0].error?.message)
        setLoading(false)
        return
      }
    } catch(e: any) {
      setError('Error: ' + e.message)
      setLoading(false)
      return
    }
    // Activar usuario ahora que tiene Drive configurado
    await supabase.from('usuarios').update({ activo: true }).eq('id', uid)
    setLoading(false)
    setStep(3)
  }

  const conectarRedes = async () => {
    const { data: usr } = await supabase.from('usuarios').select('upload_post_username').eq('id', userId).single()
    if (!usr?.upload_post_username) return
    const res = await fetch('/api/uploadpost-jwt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usr.upload_post_username }) })
    const data = await res.json()
    if (data.access_url) window.open(data.access_url, '_blank')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 480, maxWidth: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/postia-logo.svg" alt="PostIA" style={{ height: 40, width: 'auto', marginBottom: 8 }} />
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Configuración inicial</div>
        </div>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, background: step >= s ? 'var(--accent)' : 'var(--bg3)', color: step >= s ? '#fff' : 'var(--text2)', border: `2px solid ${step >= s ? 'var(--accent)' : 'var(--border)'}` }}>{s}</div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Conectá tu Google Drive</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>Necesitás dos carpetas en Google Drive: una donde subís los videos a publicar y otra donde se mueven después de publicados. Compartí ambas carpetas con acceso público (cualquiera con el link puede ver).</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Carpeta "A Publicar"</div>
              <input value={drivePublicar} onChange={e => setDrivePublicar(e.target.value)} placeholder="https://drive.google.com/drive/folders/..."
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Carpeta "Publicados"</div>
              <input value={drivePublicados} onChange={e => setDrivePublicados(e.target.value)} placeholder="https://drive.google.com/drive/folders/..."
                style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
            </div>
            {error && <div style={{ background: 'rgba(240,84,84,0.1)', border: '1px solid rgba(240,84,84,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}
            <button onClick={guardar} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', border: 'none', background: loading ? 'var(--border)' : 'var(--accent)', color: '#fff' }}>
              {loading ? 'Guardando...' : 'Continuar →'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', marginBottom: 8 }}>Conectá tus redes sociales</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24, lineHeight: 1.6 }}>Conectá Instagram, TikTok, YouTube y las demás redes donde querés publicar. PostIA publicará automáticamente en las redes que conectes.</div>
            <button onClick={conectarRedes} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', marginBottom: 12 }}>
              🔗 Conectar redes →
            </button>
            <button onClick={onComplete} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>
              Hacer esto después
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RegisterPage({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    if (!nombre || !email || !password) { setError('Completá todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signUp({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    if (data.user) {
      // Crear usuario en tabla usuarios
      const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase() + Math.floor(Math.random() * 999)
      await supabase.from('usuarios').insert({ id: data.user.id, email, plan: 'starter', activo: true, upload_post_username: username })
      // Crear perfil en Upload Post
      try {
        await fetch('/api/uploadpost-crear-usuario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
      } catch(e) { console.error('Error creando perfil Upload Post:', e) }
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 360, maxWidth: '90vw', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>¡Cuenta creada!</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Revisá tu email para confirmar tu cuenta y luego ingresá.</div>
        <button onClick={onBack} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff' }}>Ir al login</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, width: 360, maxWidth: '90vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/postia-logo.svg" alt="PostIA" style={{ height: 48, width: 'auto', marginBottom: 4 }} />
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>Crear cuenta</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Nombre</div>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre"
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Email</div>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>Contraseña</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        </div>
        {error && <div style={{ background: 'rgba(240,84,84,0.1)', border: '1px solid rgba(240,84,84,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}
        <button onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', border: 'none', background: loading ? 'var(--border)' : 'var(--accent)', color: '#fff', marginBottom: 12 }}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <div onClick={onBack} style={{ textAlign: 'center', fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>¿Ya tenés cuenta? <span style={{ color: 'var(--accent)' }}>Ingresar</span></div>
      </div>
    </div>
  )
}

export default function Panel() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showRegister, setShowRegister] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      return next
    })
  }
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('postia_page') || 'pendientes'
    return 'pendientes'
  })
  const [menuOpen, setMenuOpen] = useState(false)

  const navegarA = (id: string) => {
    setPage(id)
    localStorage.setItem('postia_page', id)
    setMenuOpen(false)
  }
  const [contenidos, setContenidos] = useState<Contenido[]>([])
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string; ig_publicado?: boolean; tt_publicado?: boolean; yt_publicado?: boolean; li_publicado?: boolean; fb_publicado?: boolean; tw_publicado?: boolean; th_publicado?: boolean } | null>(null)
  const [deleteRedes, setDeleteRedes] = useState<string[]>([])
  const [logModal, setLogModal] = useState<{ contenido: Contenido; uploadStatus: any | null; loading: boolean } | null>(null)
  const [filtroRed, setFiltroRed] = useState('todas')
  const [saving, setSaving] = useState(false)
  const [pendientes, setPendientes] = useState<Contenido[]>([])
  const [editandoCopy, setEditandoCopy] = useState<Record<string, Record<string, string>>>({})
  const [aprobando, setAprobando] = useState<string>('')
  const [redesActivas, setRedesActivas] = useState<Record<string, Record<string, boolean>>>({})
  const [uploadPostUsername, setUploadPostUsername] = useState<string>('')
  const [promptPersonalizado, setPromptPersonalizado] = useState<string>('')
  const [nombreDisplay, setNombreDisplay] = useState<string>('')

  // ── Schedules de publicación ──
  type ScheduleHora = { id: string; hora: string; schedule_id: string | null }
  type ScheduleBloque = { id: string; dias_semana: number[]; horas: ScheduleHora[] }
  const DIAS_LABELS = [
    { id: 1, label: 'L' }, { id: 2, label: 'M' }, { id: 3, label: 'X' },
    { id: 4, label: 'J' }, { id: 5, label: 'V' }, { id: 6, label: 'S' }, { id: 7, label: 'D' }
  ]
  const [schedules, setSchedules] = useState<ScheduleBloque[]>([])
  const [savingSchedules, setSavingSchedules] = useState(false)
  const [generandoAhora, setGenerandoAhora] = useState<string | null>(null)

  const schedUid = () => 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2)

  const cargarSchedules = async () => {
    const uid = USER_ID || ''
    if (!uid) return
    const { data } = await supabase.from('schedule_publicacion').select('*').eq('user_id', uid).eq('activo', true).order('hora', { ascending: true })
    const rows = data || []
    if (rows.length === 0) {
      setSchedules([{ id: schedUid(), dias_semana: [1,2,3,4,5,6,7], horas: [{ id: schedUid(), hora: '08:00:00', schedule_id: null }] }])
      return
    }
    // Agrupar por días_semana
    const mapa: Record<string, ScheduleBloque> = {}
    for (const r of rows) {
      const key = JSON.stringify((r.dias_semana || []).sort((a: number, b: number) => a - b))
      if (!mapa[key]) mapa[key] = { id: schedUid(), dias_semana: [...(r.dias_semana || [])].sort((a, b) => a - b), horas: [] }
      mapa[key].horas.push({ id: schedUid(), hora: r.hora, schedule_id: r.id })
    }
    setSchedules(Object.values(mapa))
  }

  const guardarSchedules = async () => {
    const uid = USER_ID || ''
    if (!uid) return
    for (const b of schedules) {
      if (!b.dias_semana.length || !b.horas.length) { showToast('Cada grupo necesita días y al menos una hora'); return }
    }
    setSavingSchedules(true)
    await supabase.from('schedule_publicacion').delete().eq('user_id', uid)
    const filas = schedules.flatMap(b => b.horas.map(h => ({
      user_id: uid, hora: h.hora.length === 5 ? h.hora + ':00' : h.hora,
      dias_semana: b.dias_semana, activo: true
    })))
    if (filas.length > 0) await supabase.from('schedule_publicacion').insert(filas)
    setSavingSchedules(false)
    showToast('✅ Horarios guardados')
    cargarSchedules()
  }

  const generarAhoraSchedule = async (horaId: string) => {
    const uid = USER_ID || ''
    setGenerandoAhora(horaId)
    try {
      const res = await fetch('https://n8n.borges.com.ar/webhook/maestro-ejecutar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, manual: true })
      })
      showToast(res.ok ? '✅ Generación iniciada — aparece en ~2 minutos' : '❌ Error al iniciar')
    } catch { showToast('❌ Error de conexión') }
    setGenerandoAhora(null)
  }

  const toggleRed = (contenidoId: string, red: string) => {
    setRedesActivas(prev => ({
      ...prev,
      [contenidoId]: {
        ...( prev[contenidoId] || { ig: true, tt: true, yt: true, li: true, fb: true, tw: true, th: true } ),
        [red]: !(prev[contenidoId]?.[red] ?? true)
      }
    }))
  }

  const getRedesActivas = (contenidoId: string) => ({
    ig: redesActivas[contenidoId]?.ig ?? true,
    tt: redesActivas[contenidoId]?.tt ?? true,
    yt: redesActivas[contenidoId]?.yt ?? true,
    li: redesActivas[contenidoId]?.li ?? true,
    fb: redesActivas[contenidoId]?.fb ?? true,
    tw: redesActivas[contenidoId]?.tw ?? true,
    th: redesActivas[contenidoId]?.th ?? true,
  })
  const [toast, setToast] = useState('')
  const [trends, setTrends] = useState<{keyword: string; value: number}[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [loadingTrends, setLoadingTrends] = useState(false)
  const [loadingHashtags, setLoadingHashtags] = useState(false)
  const [temasSugeridos, setTemasSugeridos] = useState<{tema: string; gancho: string; justificacion: string}[]>([])
  const [loadingTemas, setLoadingTemas] = useState(false)
  const [guion, setGuion] = useState('')
  const [loadingGuion, setLoadingGuion] = useState(false)
  const [temaSeleccionado, setTemaSeleccionado] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    // Errores no se auto-cierran — requieren click en X
    if (!msg.startsWith('⚠️')) setTimeout(() => setToast(''), 4000)
  }

  const ANTHROPIC_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_KEY || ''
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>('')

  const callClaude = async (prompt: string, maxTokens: number) => {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
    })
    const data = await res.json()
    return data.content[0].text
  }

  const loadTendencias = async () => {
    const { data } = await supabase.from('tendencias').select('*').order('actualizado_en', { ascending: false }).limit(3)
    if (!data) return
    for (const row of data) {
      if (row.tipo === 'trends') setTrends(row.datos)
      if (row.tipo === 'hashtags') setHashtags(row.datos)
      if (row.tipo === 'temas') setTemasSugeridos(row.datos)
    }
    if (data.length > 0) setUltimaActualizacion(data[0].actualizado_en)
  }

  const actualizarTodo = async () => {
    setLoadingTrends(true)
    try {
      const ultimosTitulos = contenidos.slice(0,10).map((c: Contenido) => c.ig_titulo).filter(Boolean).join(', ')

      // Trends
      const rawTrends = await callClaude('Sos experto en marketing inmobiliario argentino. Genera 8 temas tendencia en el mercado inmobiliario argentino (alquiler, venta, tasacion, creditos, inversiones, barrios). Para cada uno asignale indice 1-100. SOLO JSON sin backticks: [{"keyword": "tema", "value": 85}]', 600)
      const trendsData = JSON.parse(rawTrends.replace(/```json/g,'').replace(/```/g,'').trim())
      setTrends(trendsData)
      await supabase.from('tendencias').upsert({ tipo: 'trends', datos: trendsData, actualizado_en: new Date().toISOString() }, { onConflict: 'tipo' })

      // Hashtags
      const rawHashtags = await callClaude('Genera 20 hashtags que funcionan bien en Instagram y TikTok para contenido inmobiliario en Argentina. Mezcla alto volumen con nicho. SOLO JSON sin backticks: ["hashtag1", "hashtag2"]', 400)
      const hashtagsData = JSON.parse(rawHashtags.replace(/```json/g,'').replace(/```/g,'').trim())
      setHashtags(hashtagsData)
      await supabase.from('tendencias').upsert({ tipo: 'hashtags', datos: hashtagsData, actualizado_en: new Date().toISOString() }, { onConflict: 'tipo' })

      // Temas
      const rawTemas = await callClaude(`Sos asistente de Leandro Borges, martillero y corredor publico 30 anos Argentina. Sus ultimos videos: ${ultimosTitulos || 'inmobiliaria'}. Sugeri 5 temas para Reels cortos que no repitan los anteriores, con gancho max 8 palabras. SOLO JSON sin backticks: [{"tema": "titulo", "gancho": "gancho portada", "justificacion": "por que ahora en una linea"}]`, 800)
      const raw = rawTemas.replace(/```json/g,'').replace(/```/g,'').trim()
      const s = raw.indexOf('['); const e = raw.lastIndexOf(']')
      const temasData = JSON.parse(raw.substring(s, e+1))
      setTemasSugeridos(temasData)
      await supabase.from('tendencias').upsert({ tipo: 'temas', datos: temasData, actualizado_en: new Date().toISOString() }, { onConflict: 'tipo' })

      setUltimaActualizacion(new Date().toISOString())
      showToast('Tendencias actualizadas')
    } catch(err) { showToast('Error actualizando tendencias') }
    setLoadingTrends(false)
  }

  const fetchGuion = async (tema: string) => {
    setTemaSeleccionado(tema); setLoadingGuion(true); setGuion('')
    try {
      const texto = await callClaude(`Sos Leandro Borges, martillero y corredor publico 30 anos Argentina. Tono directo, cercano, con autoridad. Genera guion para video corto 60-90 segundos sobre: "${tema}". Incluye: GANCHO (3 segundos, max 10 palabras), DESARROLLO (3 puntos clave en primera persona), CIERRE con CTA. En lenguaje rioplatense natural.`, 1200)
      setGuion(texto)
    } catch(e) { showToast('Error generando guion') }
    setLoadingGuion(false)
  }


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      if (data.session?.user) setCurrentUser(data.session.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session)
      if (session?.user) setCurrentUser(session.user)
      else { setCurrentUser(null); setOnboarding(false) }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  // Verificar onboarding cuando currentUser esté disponible
  useEffect(() => {
    if (!currentUser?.id) return
    supabase.from('usuario_config')
      .select('valor')
      .eq('user_id', currentUser.id)
      .eq('parametro', 'drive_carpeta_publicar')
      .limit(1)
      .then(({ data }) => {
        if (!data || data.length === 0 || !data[0]?.valor) setOnboarding(true)
        else setOnboarding(false)
      })
  }, [currentUser?.id])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const USER_ID_FETCH = session?.user?.id || ''
    if (!USER_ID_FETCH) { setLoading(false); return }
    const [{ data: cont }, { data: cfg }, { data: userCfg }, { data: usr }] = await Promise.all([
      supabase.from('contenido').select('*').eq('user_id', USER_ID_FETCH).order('created_at', { ascending: false }),
      supabase.from('config').select('*'),
      supabase.from('usuario_config').select('parametro,valor').eq('user_id', USER_ID_FETCH),
      supabase.from('usuarios').select('upload_post_username, prompt_personalizado').eq('id', USER_ID_FETCH).single()
    ])
    if (usr?.upload_post_username) setUploadPostUsername(usr.upload_post_username)
    if (usr?.prompt_personalizado) setPromptPersonalizado(usr.prompt_personalizado)
    // Cargar nombre_display desde usuario_branding
    const { data: branding } = await supabase.from('usuario_branding').select('nombre_display').eq('user_id', USER_ID_FETCH).single()
    if (branding?.nombre_display) setNombreDisplay(branding.nombre_display)
    if (cont) {
      setContenidos(cont)
      setPendientes(cont.filter((c: Contenido) => c.estado === 'pendiente_aprobacion'))
    }
    const cfgMap: Record<string, string> = {}
    if (cfg) {
      cfg.forEach((c: Config) => { cfgMap[c.parametro] = c.valor })
      setPaused(cfgMap.pausa_global === 'SI')
    }
    if (userCfg) {
      userCfg.forEach((c: Config) => { cfgMap[c.parametro] = c.valor })
    }
    setConfig(cfgMap)
    setLoading(false)
    loadTendencias()
    // Cargar schedules de publicación
    const { data: schedData } = await supabase.from('schedule_publicacion').select('*').eq('user_id', USER_ID_FETCH).eq('activo', true).order('hora', { ascending: true })
    const schedRows = schedData || []
    if (schedRows.length === 0) {
      setSchedules([{ id: 'default', dias_semana: [1,2,3,4,5,6,7], horas: [{ id: 'default_h', hora: '08:00:00', schedule_id: null }] }])
    } else {
      const mapa: Record<string, ScheduleBloque> = {}
      for (const r of schedRows) {
        const key = JSON.stringify((r.dias_semana || []).sort((a: number, b: number) => a - b))
        if (!mapa[key]) mapa[key] = { id: 'g_' + key, dias_semana: [...(r.dias_semana || [])].sort((a: number, b: number) => a - b), horas: [] }
        mapa[key].horas.push({ id: 'h_' + r.id, hora: r.hora, schedule_id: r.id })
      }
      setSchedules(Object.values(mapa))
    }
  }, [])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  const aprobarContenido = async (id: string, fileIdDrive: string) => {
    setAprobando(id)
    const edits = editandoCopy[id] || {}
    const redes = getRedesActivas(id)

    // 1. Guardar estado en Supabase
    const updates: Record<string, any> = {
      estado: 'aprobado',
      fecha_aprobacion: new Date().toISOString(),
      ig_activo: redes.ig, tt_activo: redes.tt, yt_activo: redes.yt,
      li_activo: redes.li, fb_activo: redes.fb, tw_activo: redes.tw, th_activo: redes.th,
      ...edits
    }
    await supabase.from('contenido').update(updates).eq('id', id)

    // 2. Obtener contenido completo para publicar
    const { data: cont } = await supabase.from('contenido').select('*').eq('id', id).single()

    // 3. Publicar en Upload Post
    if (cont) {
      try {
        showToast('📤 Publicando en redes...')
        const res = await fetch('/api/publicar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contenido: cont, redes, username: uploadPostUsername })
        })
        const result = await res.json()
        console.log('Upload Post result:', JSON.stringify(result))
        // Mostrar error de LinkedIn inmediatamente si falló
        const liError = result.linkedin_error || null
        const twError = result.x_error || null
        if (twError) showToast('⚠️ X/Twitter: ' + twError)
        // Helper para hacer polling de un request_id y actualizar campos específicos
        const pollRequestId = async (reqId: string, campoMap: Record<string, string>, intentosMax = 15) => {
          let intentos = 0
          const poll = async () => {
            intentos++
            try {
              const sr = await fetch(`/api/upload-status?request_id=${reqId}`)
              const sd = await sr.json()
              console.log(`Poll [${reqId.slice(0,8)}] status:`, sd.status, JSON.stringify(sd.results))
              const stillProcessing = ['pending','queued','processing','in_progress'].includes(sd.status)
              if (sd.results) {
                const updates: Record<string, any> = {}
                for (const [plat, campo] of Object.entries(campoMap)) {
                  if (sd.results[plat]?.success) {
                    updates[campo] = true
                    const url = sd.results[plat]?.url
                    if (url) {
                      const urlCampo = campo.replace('_publicado', '_post_id')
                      updates[urlCampo] = url
                    }
                  }
                }
                if (Object.keys(updates).length > 0) {
                  await supabase.from('contenido').update(updates).eq('id', id)
                  await fetchData()
                }
                if (!stillProcessing) return
              }
              if (stillProcessing || intentos < intentosMax) setTimeout(poll, 8000)
              else { await fetchData() }
            } catch(e) { if (intentos < intentosMax) setTimeout(poll, 8000) }
          }
          setTimeout(poll, 8000)
        }

        if (result.request_id) {
          showToast('📡 request_id: ' + result.request_id.slice(0, 12) + '...')
          // Polling del request_id principal (video: ig, tt, yt, fb, th)
          const camposPrincipales: Record<string, string> = {}
          if (redes.ig) camposPrincipales['instagram'] = 'ig_publicado'
          if (redes.tt) camposPrincipales['tiktok'] = 'tt_publicado'
          if (redes.yt) camposPrincipales['youtube'] = 'yt_publicado'
          if (redes.fb) camposPrincipales['facebook'] = 'fb_publicado'
          if (redes.th) camposPrincipales['threads'] = 'th_publicado'
          pollRequestId(result.request_id, camposPrincipales)
        }
        // Polling separado para LinkedIn (publica como foto/texto)
        if (result.linkedin_request_id && redes.li) {
          console.log('Polling LinkedIn request_id:', result.linkedin_request_id)
          pollRequestId(result.linkedin_request_id, { 'linkedin': 'li_publicado' })
        }
        // Polling separado para X (publica como foto)
        if (result.x_request_id && redes.tw) {
          console.log('Polling X request_id:', result.x_request_id)
          pollRequestId(result.x_request_id, { 'x': 'tw_publicado' })
        }
        if (result.request_id || result.linkedin_request_id || result.x_request_id) {
          // ya lanzamos polling arriba
        } else if (result.success) {
          showToast('✅ Publicado en redes correctamente')
          await fetchData()
        } else {
          showToast('⚠️ Error publicando: ' + (result.message || result.error || 'Error desconocido'))
          console.error('Upload Post error:', result)
        }
      } catch(e) {
        console.error('Error publicando:', e)
        showToast('⚠️ Error de conexión con Upload Post')
      }
    }

    // 4. Mover video en Drive
    try {
      await fetch('https://n8n.borges.com.ar/webhook/postia-mover-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: fileIdDrive, user_id: USER_ID })
      })
    } catch(e) { console.error('Error moviendo video en Drive:', e) }

    await fetchData()
    setAprobando('')
  }

  const regenerarContenido = async (id: string) => {
    await supabase.from('contenido').update({ estado: 'rechazado' }).eq('id', id)
    // Reinsertar en cola para reprocesar
    const { data: cont } = await supabase.from('contenido').select('file_id_drive, file_name, user_id').eq('id', id).single()
    if (cont) {
      await supabase.from('cola').insert({ user_id: cont.user_id, file_id_drive: cont.file_id_drive, file_name: cont.file_name, estado: 'pendiente' })
    }
    await fetchData()
    showToast('🔄 Contenido enviado a regenerar')
  }

  const rechazarContenido = async (id: string) => {
    // Eliminar completamente de contenido y limpiar cola asociada
    const { data: cont } = await supabase.from('contenido').select('file_id_drive, user_id').eq('id', id).single()
    await supabase.from('contenido').delete().eq('id', id)
    // Marcar en cola como rechazado para que el detector no lo reprocese
    if (cont) {
      await supabase.from('cola').update({ estado: 'rechazado' }).eq('file_id_drive', cont.file_id_drive).eq('user_id', cont.user_id)
    }
    await fetchData()
    showToast('🗑 Contenido eliminado')
  }

  const updateCopy = (id: string, field: string, value: string) => {
    setEditandoCopy(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }))
  }

  const togglePause = async () => {
    const newVal = paused ? 'NO' : 'SI'
    await supabase.from('config').update({ valor: newVal }).eq('parametro', 'pausa_global')
    setPaused(!paused); showToast(newVal === 'SI' ? '⏸ Sistema pausado' : '▶ Sistema reanudado')
  }

  const USER_ID = currentUser?.id || ''
  const USER_CONFIG_KEYS = ['drive_carpeta_publicar', 'drive_carpeta_publicados', 'max_videos_diarios', 'autopublicacion', 'hora_instagram', 'hora_tiktok', 'hora_threads', 'hora_youtube', 'hora_linkedin', 'hora_twitter', 'dias_reposteo', 'score_reposteo', 'intervalo_horas', 'min_views']

  const savePerfilUsuario = async () => {
    setSaving(true)
    await Promise.all([
      supabase.from('usuarios').update({ prompt_personalizado: promptPersonalizado }).eq('id', USER_ID),
      supabase.from('usuario_branding').upsert({ user_id: USER_ID, nombre_display: nombreDisplay }, { onConflict: 'user_id' })
    ])
    setSaving(false)
    showToast('✅ Perfil guardado')
  }

  const saveConfig = async () => {
    setSaving(true)
    const userConfigEntries = Object.entries(config).filter(([k]) => USER_CONFIG_KEYS.includes(k))
    const globalConfigEntries = Object.entries(config).filter(([k]) => !USER_CONFIG_KEYS.includes(k))
    await Promise.all([
      ...userConfigEntries.map(([parametro, valor]) => supabase.from('usuario_config').upsert({ user_id: USER_ID, parametro, valor }, { onConflict: 'user_id,parametro' })),
      ...globalConfigEntries.map(([parametro, valor]) => supabase.from('config').upsert({ parametro, valor }))
    ])
    setSaving(false); showToast('✅ Configuración guardada')
  }

  // Verificar y actualizar estado de publicación para un contenido con request_id pendiente
  const verificarEstadoPublicacion = async (c: Contenido) => {
    if (!c.upload_post_request_id) return
    try {
      const res = await fetch(`/api/upload-status?request_id=${c.upload_post_request_id}`)
      const data = await res.json()
      if (!data.results) return
      const r = data.results
      const updates: Record<string, any> = {}
      if (r.instagram?.success && !c.ig_publicado) { updates.ig_publicado = true; if (r.instagram.url) updates.ig_post_id = r.instagram.url }
      if (r.tiktok?.success && !c.tt_publicado) { updates.tt_publicado = true; if (r.tiktok.url) updates.tt_post_id = r.tiktok.url }
      if (r.youtube?.success && !c.yt_publicado) { updates.yt_publicado = true; if (r.youtube.url) updates.yt_post_id = r.youtube.url }
      if (r.linkedin?.success && !c.li_publicado) { updates.li_publicado = true; if (r.linkedin.url) updates.li_post_id = r.linkedin.url }
      if (r.facebook?.success && !c.fb_publicado) { updates.fb_publicado = true; if (r.facebook.url) updates.fb_post_id = r.facebook.url }
      if (r.x?.success && !c.tw_publicado) { updates.tw_publicado = true; if (r.x.url) updates.tw_post_id = r.x.url }
      if (r.threads?.success && !c.th_publicado) { updates.th_publicado = true; if (r.threads.url) updates.th_post_id = r.threads.url }
      if (Object.keys(updates).length > 0) {
        await supabase.from('contenido').update(updates).eq('id', c.id)
        return true // hubo actualizaciones
      }
    } catch(e) { /* silencioso */ }
    return false
  }

  // Al cargar el panel, verificar posts recientes (últimas 4 horas) con request_id y logos pendientes
  useEffect(() => {
    if (contenidos.length === 0) return
    const haceCuatroHoras = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const pendientes = contenidos.filter(c =>
      c.upload_post_request_id &&
      c.estado === 'aprobado' &&
      (!c.ig_publicado || !c.tt_publicado || !c.yt_publicado) &&
      (c.fecha_aprobacion > haceCuatroHoras)
    )
    if (pendientes.length === 0) return
    // Verificar con delay escalonado para no saturar la API
    pendientes.forEach((c, i) => {
      setTimeout(async () => {
        const actualizado = await verificarEstadoPublicacion(c)
        if (actualizado) fetchData()
      }, i * 3000)
    })
  }, [contenidos.length])

  const confirmarEliminar = async () => {
    if (!deleteModal) return
    // Buscar file_id_drive antes de eliminar
    const { data: cont } = await supabase.from('contenido').select('file_id_drive, user_id').eq('id', deleteModal.id).single()
    await supabase.from('contenido').delete().eq('id', deleteModal.id)
    // Marcar cola como rechazado para que el detector no lo reprocese
    if (cont) {
      await supabase.from('cola').update({ estado: 'rechazado' }).eq('file_id_drive', cont.file_id_drive).eq('user_id', cont.user_id)
    }
    setDeleteModal(null)
    showToast('🗑 Eliminado correctamente')
    fetchData()
  }

  const scorePromedio = contenidos.length
    ? (contenidos.reduce((a, b) => a + (b.score_promedio || 0), 0) / contenidos.length).toFixed(1) : '0'

  const contenidosPublicados = contenidos.filter(c => c.estado !== 'pendiente_aprobacion')
  const contenidosFiltrados = filtroRed === 'todas' ? contenidosPublicados
    : contenidosPublicados.filter(c => filtroRed === 'instagram' ? c.ig_titulo : filtroRed === 'tiktok' ? c.tt_titulo : filtroRed === 'youtube' ? c.yt_titulo : filtroRed === 'linkedin' ? c.li_titulo : true)

  // SVG icon helper
  const SvgIcon = ({ red, size = 18, redOverride }: { red: string; size?: number; redOverride?: string }) => {
    const svg = (RED_META[red]?.svg || '').replace(/width="[^"]*"/g, `width="${size}"`).replace(/height="[^"]*"/g, `height="${size}"`)
    const color = redOverride || RED_META[red]?.color || 'currentColor'
    return <span style={{ width: size, height: size, display: 'inline-flex', flexShrink: 0, color }} dangerouslySetInnerHTML={{ __html: svg }} />
  }

  const VideoCard = ({ c }: { c: Contenido }) => {
    const portada = c.portada_youtube_path || c.portada_vertical_path
    const redes = [
      { key: 'ig', pub: c.ig_publicado, red: 'instagram', fecha: c.fecha_programada_ig, label: 'Instagram' },
      { key: 'tt', pub: c.tt_publicado, red: 'tiktok',    fecha: c.fecha_programada_tt, label: 'TikTok' },
      { key: 'yt', pub: c.yt_publicado, red: 'youtube',   fecha: c.fecha_programada_yt, label: 'YouTube' },
      { key: 'li', pub: c.li_publicado, red: 'linkedin',  fecha: c.fecha_programada_li, label: 'LinkedIn' },
      { key: 'fb', pub: c.fb_publicado, red: 'facebook',  fecha: c.fecha_programada_fb, label: 'Facebook' },
      { key: 'tw', pub: c.tw_publicado, red: 'twitter',   fecha: c.fecha_programada_tw, label: 'Twitter/X' },
      { key: 'th', pub: c.th_publicado, red: 'threads',   fecha: c.fecha_programada_th, label: 'Threads' },
    ]
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Portada 16:9 — imagen completa sin recorte */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
          {(c.portada_youtube_path || c.portada_vertical_path) ? (
            <img src={c.portada_url || c.portada_url_vertical || `https://n8n.borges.com.ar/videos/${c.portada_youtube_path || c.portada_vertical_path}`} alt="portada" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} onError={e => { e.currentTarget.style.display='none' }} />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--text2)' }}>🎬</div>
          )}
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.82)', borderRadius: 10, padding: '3px 9px', fontSize: 12, fontWeight: 700, color: (c.score_promedio || 0) >= 8 ? 'var(--green)' : 'var(--gold)' }}>
            ⭐ {c.score_promedio || '—'}
          </div>
        </div>
        {/* Info */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {c.file_id_drive ? (
            <a href={`https://drive.google.com/file/d/${c.file_id_drive}/view`} target="_blank" rel="noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {c.ig_titulo || c.archivo} ↗
            </a>
          ) : (
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.ig_titulo || c.archivo}</div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text2)' }}>
            {c.fecha_aprobacion ? new Date(c.fecha_aprobacion).toLocaleDateString('es-AR') : '—'}
          </div>
          {/* Redes con SVG */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {redes.map(({ key, pub, red, fecha, label }) => (
              <div key={key} title={pub ? `${label}: publicado${fecha ? ' el ' + new Date(fecha).toLocaleDateString('es-AR') : ''}` : `${label}: pendiente`} style={{
                display: 'flex', alignItems: 'center', gap: 3, padding: '4px 7px', borderRadius: 6,
                background: pub ? `${RED_META[red]?.color}18` : '#1e1e26',
                border: `1px solid ${pub ? RED_META[red]?.color + '70' : '#2e2e38'}`,
              }}>
                {pub
                  ? <span style={{ display: 'flex', color: RED_META[red]?.color }}><SvgIcon red={red} size={14} /></span>
                  : <span dangerouslySetInnerHTML={{ __html: (GRAY_SVG[red]||'') }} style={{ width: 14, height: 14, display: 'flex' }} />
                }
                {pub && <span style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 'auto', flexWrap: 'wrap' }}>
            <Btn onClick={() => setSelectedContent(c)} style={{ flex: 1, textAlign: 'center', padding: '6px 10px', minWidth: 80 }}>Ver copy</Btn>
            {c.upload_post_request_id && (
              <Btn variant="ghost" onClick={async () => {
                const res = await fetch(`/api/upload-status?request_id=${c.upload_post_request_id}`)
                const data = await res.json()
                if (data.results) {
                  const updates: Record<string, any> = {}
                  const r = data.results
                  if (r.instagram?.success) { updates.ig_publicado = true; if (r.instagram.url) updates.ig_post_id = r.instagram.url }
                  if (r.tiktok?.success) { updates.tt_publicado = true; if (r.tiktok.url) updates.tt_post_id = r.tiktok.url }
                  if (r.youtube?.success) { updates.yt_publicado = true; if (r.youtube.url) updates.yt_post_id = r.youtube.url }
                  if (r.linkedin?.success) { updates.li_publicado = true; if (r.linkedin.url) updates.li_post_id = r.linkedin.url }
                  if (r.facebook?.success) { updates.fb_publicado = true; if (r.facebook.url) updates.fb_post_id = r.facebook.url }
                  if (r.x?.success) { updates.tw_publicado = true; if (r.x.url) updates.tw_post_id = r.x.url }
                  if (r.threads?.success) { updates.th_publicado = true; if (r.threads.url) updates.th_post_id = r.threads.url }
                  if (Object.keys(updates).length > 0) {
                    await supabase.from('contenido').update(updates).eq('id', c.id)
                    await fetchData()
                    showToast('✅ Estado actualizado')
                  } else {
                    showToast(`Estado: ${data.status || 'procesando...'}`)
                  }
                } else {
                  showToast(`Estado Upload Post: ${data.status || 'sin datos'}`)
                }
              }} style={{ padding: '6px 10px' }} title="Verificar estado">🔄</Btn>
            )}
            <Btn variant="ghost" onClick={() => {
              setDeleteRedes([])
              setDeleteModal({ id: c.id, nombre: c.ig_titulo || c.archivo, ig_publicado: c.ig_publicado, tt_publicado: c.tt_publicado, yt_publicado: c.yt_publicado, li_publicado: c.li_publicado, fb_publicado: c.fb_publicado, tw_publicado: c.tw_publicado, th_publicado: c.th_publicado })
            }} style={{ padding: '6px 10px' }} title="Republicar">📡</Btn>
            <Btn variant="ghost" onClick={async () => {
              const modal = { contenido: c, uploadStatus: null, loading: true }
              setLogModal(modal)
              if (c.upload_post_request_id) {
                try {
                  const res = await fetch(`/api/upload-status?request_id=${c.upload_post_request_id}`)
                  const data = await res.json()
                  setLogModal({ contenido: c, uploadStatus: data, loading: false })
                } catch (e) {
                  setLogModal({ contenido: c, uploadStatus: { error: 'No se pudo consultar Upload Post API' }, loading: false })
                }
              } else {
                setLogModal({ contenido: c, uploadStatus: null, loading: false })
              }
            }} style={{ padding: '6px 10px' }} title="Ver log de publicación">📋</Btn>
            <Btn variant="ghost" onClick={async () => {
              if (!confirm('¿Eliminás este contenido? Esta acción no se puede deshacer.')) return
              const { data: cont } = await supabase.from('contenido').select('file_id_drive, user_id').eq('id', c.id).single()
              await supabase.from('contenido').delete().eq('id', c.id)
              if (cont) await supabase.from('cola').update({ estado: 'rechazado' }).eq('file_id_drive', cont.file_id_drive).eq('user_id', cont.user_id)
              showToast('🗑 Eliminado')
              fetchData()
            }} style={{ padding: '6px 10px', color: '#ef4444' }} title="Eliminar">🗑</Btn>
          </div>
        </div>
      </div>
    )
  }

  if (authed === null) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Cargando...</div>
  if (!authed && showRegister) return <RegisterPage onBack={() => setShowRegister(false)} />
  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} onRegister={() => setShowRegister(true)} />
  if (authed && onboarding) return <OnboardingPage userId={currentUser?.id || ''} onComplete={() => { setOnboarding(false); fetchData() }} />

  const NAV_ITEMS = [
    { id: 'pendientes', icon: '⏳', label: 'Pendientes', badge: pendientes.length },
    { id: 'publicaciones', icon: '📱', label: 'Publicaciones' },
    { id: 'metricas', icon: '📊', label: 'Métricas' },
    { id: 'tendencias', icon: '🔥', label: 'Tendencias' },
    { id: 'redes', icon: '🌐', label: 'Redes Sociales' },
    { id: 'config', icon: '⚙️', label: 'Config' },
  ]

  const SidebarContent = () => (
    <>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/postia-logo.svg" alt="PostIA" style={{ height: 36, width: 'auto' }} />
          <span onClick={() => setMenuOpen(false)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20, display: 'none' }} className="menu-close">✕</span>
        </div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <div key={item.id} onClick={() => navegarA(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
            color: page === item.id ? 'var(--accent)' : 'var(--text2)',
            background: page === item.id ? 'rgba(232,71,42,0.08)' : 'transparent',
            fontSize: 13, fontWeight: page === item.id ? 600 : 400, marginBottom: 1,
            borderLeft: page === item.id ? '3px solid var(--accent)' : '3px solid transparent',
            transition: 'all 0.15s'
          }}>
            <span style={{ width: 18, textAlign: 'center', fontSize: 14 }}>{item.icon}</span> {item.label}
            {(item as any).badge > 0 && <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '2px 6px' }}>{(item as any).badge}</span>}
          </div>
        ))}
      </nav>
      <div style={{ padding: '0 12px 16px' }}>
        <div onClick={togglePause} style={{
          padding: '9px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 600, marginBottom: 8,
          background: paused ? 'rgba(16,185,129,0.1)' : 'rgba(232,71,42,0.08)',
          border: `1px solid ${paused ? 'rgba(16,185,129,0.3)' : 'rgba(232,71,42,0.2)'}`,
          color: paused ? 'var(--green)' : 'var(--accent)'
        }}>{paused ? '▶ Reanudar sistema' : '⏸ Pausar todo'}</div>
        <div onClick={toggleDark} style={{
          padding: '9px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 500,
          background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', marginBottom: 8
        }}>{darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}</div>
        {currentUser?.email === 'borgesdocanto@gmail.com' && (<>
          <a href="https://app.upload-post.com/calendar" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--gold)', background: 'var(--bg3)', textDecoration: 'none', marginBottom: 6 }}>
            📅 Upload Post
          </a>
          <a href="http://n8n.borges.com.ar" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--gold)', background: 'var(--bg3)', textDecoration: 'none', marginBottom: 6 }}>
            ⚙️ n8n
          </a>
        </>)}
        <div onClick={() => supabase.auth.signOut()} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)' }}>
          Cerrar sesión
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Overlay mobile */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />
      )}

      {/* Sidebar desktop */}
      <aside style={{ position: 'fixed', left: 0, top: 0, width: 220, height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 100, boxShadow: 'var(--shadow-md)' }}
        className="sidebar-desktop">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile */}
      <aside style={{ position: 'fixed', left: menuOpen ? 0 : -260, top: 0, width: 260, height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 200, boxShadow: 'var(--shadow-md)', transition: 'left 0.25s ease' }}
        className="sidebar-mobile">
        <SidebarContent />
      </aside>

      {/* Header mobile con hamburguesa */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)', zIndex: 98, alignItems: 'center', padding: '0 16px', gap: 12 }}
        className="mobile-header">
        <button onClick={() => setMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 22, padding: 4, display: 'flex', alignItems: 'center' }}>
          ☰
        </button>
        <img src="/postia-logo.svg" alt="PostIA" style={{ height: 30, width: 'auto' }} />
        {pendientes.length > 0 && (
          <span style={{ marginLeft: 'auto', background: 'var(--red)', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>{pendientes.length}</span>
        )}
      </div>

      <main style={{ marginLeft: 220, padding: 32, flex: 1, minWidth: 0 }} className="main-content">
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text2)', fontSize: 14 }}>Cargando...</div>
        ) : (
          <>
            {page === 'pendientes' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>Pendientes de aprobación</h2>
                  <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--bg3)', padding: '6px 14px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    {pendientes.length} video{pendientes.length !== 1 ? 's' : ''} esperando
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>Revisá el copy generado, editalo si es necesario, y aprobá para mover el video a Publicados.</div>
                {pendientes.length === 0 && (
                  <Card>
                    <div style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Todo al día</div>
                      <div style={{ fontSize: 13 }}>No hay contenido pendiente de aprobación.</div>
                    </div>
                  </Card>
                )}
                {pendientes.map(c => (
                  <div key={c.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
                    {/* PORTADA 16:9 */}
                    {(c.portada_youtube_path || c.portada_vertical_path) && (
                      <img
                        src={c.portada_url || c.portada_url_vertical || `https://n8n.borges.com.ar/videos/${c.portada_youtube_path || c.portada_vertical_path}`}
                        alt="portada"
                        style={{ width: 'auto', height: 220, objectFit: 'contain', display: 'block', margin: '16px auto 0', maxWidth: '100%', borderRadius: 8 }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    )}
                    {/* HEADER */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6, lineHeight: 1.3 }}>{c.ig_titulo || c.archivo}</div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
                          <span>🕐 {(() => { const ts = (c as any).created_at || (c as any).fecha_ingreso; return ts ? new Date(ts).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha'; })()}</span>
                          <span>📄 {c.archivo || '—'}</span>
                          {c.file_id_drive && (
                            <a href={`https://drive.google.com/file/d/${c.file_id_drive}/view`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                              🎬 Ver video en Drive →
                            </a>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {[{label:'Gancho', val:c.score_gancho},{label:'Claridad', val:c.score_claridad},{label:'CTA', val:c.score_cta},{label:'Promedio', val:c.score_promedio}].map(s => (
                            <div key={s.label} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: (s.val||0)>=8?'rgba(16,185,129,0.12)':(s.val||0)>=6?'rgba(232,71,42,0.1)':'rgba(239,68,68,0.12)', color: (s.val||0)>=8?'var(--green)':(s.val||0)>=6?'var(--accent)':'var(--red)', border: '1px solid currentColor' }}>{s.label}: {s.val}/10</div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* TRANSCRIPCION */}
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Transcripción</div>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>{c.transcripcion || '—'}</div>
                    </div>
                    {/* COPY POR RED */}
                    <div style={{ padding: 24 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Copy por red — editá si es necesario</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                        {[
                          { key: 'ig', label: 'Instagram', color: '#e1306c', field: 'ig_descripcion', val: c.ig_descripcion, titulo: c.ig_titulo, hashtags: c.ig_hashtags, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>' },
                          { key: 'tt', label: 'TikTok', color: '#010101', field: 'tt_descripcion', val: c.tt_descripcion, titulo: c.tt_titulo, hashtags: c.tt_hashtags, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>' },
                          { key: 'yt', label: 'YouTube', color: '#ff0000', field: 'yt_descripcion', val: c.yt_descripcion, titulo: c.yt_titulo, hashtags: c.yt_hashtags, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' },
                          { key: 'li', label: 'LinkedIn', color: '#0077b5', field: 'li_descripcion', val: c.li_descripcion, titulo: c.li_titulo, hashtags: '', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
                          { key: 'fb', label: 'Facebook', color: '#1877f2', field: 'fb_descripcion', val: c.fb_descripcion, titulo: '', hashtags: '', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
                          { key: 'tw', label: 'Twitter / X', color: '#000000', field: 'tw_texto', val: c.tw_texto, titulo: '', hashtags: '', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
                          { key: 'th', label: 'Threads', color: '#000000', field: 'th_texto', val: c.th_texto, titulo: '', hashtags: '', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 013.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.288-.883-2.301-.887l-.026-.001c-.785 0-1.848.192-2.531 1.344l-1.775-1.05c.87-1.474 2.307-2.285 4.06-2.285h.037c2.966.03 4.735 1.82 5.067 5.093a8.503 8.503 0 011.044.584c1.26.83 2.139 2.022 2.543 3.443.74 2.594.095 5.417-1.707 7.15-1.61 1.548-3.851 2.382-6.573 2.403z"/></svg>' },
                        ].map(r => {
                          const activa = getRedesActivas(c.id)[r.key as keyof ReturnType<typeof getRedesActivas>]
                          const textoCompleto = [r.titulo, r.val, r.hashtags].filter(Boolean).join('\n\n')
                          return (
                          <div key={r.field} style={{ background: activa ? 'var(--bg3)' : 'var(--bg)', borderRadius: 8, border: `1px solid ${activa ? r.color + '44' : 'var(--border)'}`, overflow: 'hidden', opacity: activa ? 1 : 0.5, transition: 'all 0.2s' }}>
                            {/* Header red */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${activa ? r.color + '33' : 'var(--border)'}`, background: activa ? r.color + '10' : 'transparent' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 16, height: 16, display: 'inline-flex', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: r.svg.replace(/fill="currentColor"/g, `fill="${activa ? r.color : '#999'}"`) }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: activa ? r.color : 'var(--text2)' }}>{r.label}</span>
                              </div>
                              <div onClick={() => toggleRed(c.id, r.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                                <span style={{ fontSize: 11, color: activa ? r.color : 'var(--text2)', fontWeight: 600 }}>{activa ? 'Publicar' : 'Omitir'}</span>
                                <div style={{ width: 38, height: 20, borderRadius: 10, background: activa ? r.color : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
                                  <div style={{ position: 'absolute', top: 2, left: activa ? 20 : 2, width: 16, height: 16, borderRadius: 8, background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </div>
                              </div>
                            </div>
                            {/* Texto editable */}
                            <div style={{ padding: 12 }}>
                              <textarea
                                defaultValue={textoCompleto}
                                onChange={e => { updateCopy(c.id, r.field, e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                ref={el => { if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; } }}
                                disabled={!activa}
                                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 12, padding: 0, resize: 'none', outline: 'none', lineHeight: 1.7, overflow: 'hidden', display: 'block', fontFamily: 'inherit' }}
                              />
                            </div>
                          </div>
                          )
                        })}
                      </div>
                      {/* BOTONES */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => aprobarContenido(c.id, c.file_id_drive)} disabled={aprobando === c.id} style={{ flex: 1, padding: '13px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: aprobando === c.id ? 'default' : 'pointer', border: 'none', background: aprobando === c.id ? 'var(--border)' : 'var(--accent)', color: '#fff', opacity: aprobando === c.id ? 0.6 : 1 }}>
                          {aprobando === c.id ? 'Aprobando...' : '✅ Aprobar y publicar'}
                        </button>
                        <button onClick={() => regenerarContenido(c.id)} style={{ padding: '13px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--text2)' }}>
                          🔄 Regenerar
                        </button>
                        <button onClick={() => rechazarContenido(c.id)} style={{ padding: '13px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(232,71,42,0.3)', background: 'rgba(232,71,42,0.06)', color: 'var(--red)' }}>
                          ✕ Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {page === 'cola_disabled' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0, marginBottom: 24, color: 'var(--text)' }}>Cola de publicación</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Total" value={contenidos.length} sub="contenidos" />
                  <StatCard label="Aprobados" value={contenidos.filter(c => c.estado === 'aprobado').length} color="var(--green)" />
                  <StatCard label="Score promedio" value={scorePromedio} color="var(--gold)" />
                  <StatCard label="Sistema" value={paused ? 'OFF' : 'ON'} color={paused ? 'var(--red)' : 'var(--green)'} sub={paused ? 'Pausado' : 'Activo'} />
                </div>
                {/* ALERTA YOUTUBE 1000 SUBS */}
                <div style={{ background: "linear-gradient(135deg, rgba(255,0,0,0.08), rgba(212,160,23,0.08))", border: "1px solid rgba(255,0,0,0.25)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 24 }}>🎉</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>Cuando llegues a 1000 suscriptores en YouTube podés activar miniaturas personalizadas</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>Las portadas que genera el sistema se van a subir como thumbnail de cada video. Avisanos cuando llegues y lo activamos.</div>
                  </div>
                  <a href="https://studio.youtube.com" target="_blank" rel="noreferrer" style={{ background: "rgba(255,0,0,0.15)", border: "1px solid rgba(255,0,0,0.3)", color: "#ff4444", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>YouTube Studio →</a>
                </div>
                {contenidos.length === 0 ? (
                  <Card><div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 14 }}>No hay contenidos. Subí videos a Google Drive.</div></Card>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="cards-grid">
                    {contenidos.slice(0, 21).map(c => <VideoCard key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            )}

            {page === 'contenido' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)', marginBottom: 20 }}>Contenido publicado</h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {['todas', ...REDES].map(r => (
                    <div key={r} onClick={() => setFiltroRed(r)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${filtroRed === r ? (RED_META[r]?.color || 'var(--gold)') : 'var(--border)'}`,
                      color: filtroRed === r ? (RED_META[r]?.color || 'var(--gold)') : 'var(--text2)',
                      background: filtroRed === r ? `${RED_META[r]?.color || '#c9a84c'}22` : 'transparent'
                    }}>
                      {r !== 'todas' && <SvgIcon red={r} size={14} />}
                      {r === 'todas' ? 'Todas' : RED_META[r]?.label}
                    </div>
                  ))}
                </div>
                <div className="cards-grid">
                  {contenidosFiltrados.map(c => <VideoCard key={c.id} c={c} />)}
                </div>
              </div>
            )}

            {page === 'publicaciones' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>Publicaciones</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['todas', ...REDES].map(r => (
                      <div key={r} onClick={() => setFiltroRed(r)} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${filtroRed === r ? (RED_META[r]?.color || 'var(--accent)') : 'var(--border)'}`,
                        color: filtroRed === r ? (RED_META[r]?.color || 'var(--accent)') : 'var(--text2)',
                        background: filtroRed === r ? `${RED_META[r]?.color || 'var(--accent)'}18` : 'transparent'
                      }}>
                        {r !== 'todas' && <SvgIcon red={r} size={12} />}
                        {r === 'todas' ? 'Todas' : RED_META[r]?.label}
                      </div>
                    ))}
                  </div>
                </div>
                {pendientes.length > 0 && (
                  <div style={{ background: 'rgba(232,71,42,0.06)', border: '1px solid rgba(232,71,42,0.2)', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                    ⏳ {pendientes.length} video{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''} de aprobación
                    <span onClick={() => navegarA('pendientes')} style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 8 }}>Ver →</span>
                  </div>
                )}
                <div className="cards-grid">
                  {contenidosFiltrados.map(c => <VideoCard key={c.id} c={c} />)}
                </div>
                {contenidosFiltrados.length === 0 && (
                  <Card><div style={{ textAlign: 'center', padding: 48, color: 'var(--text2)' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
                    <div style={{ fontWeight: 600 }}>No hay publicaciones aún</div>
                  </div></Card>
                )}
              </div>
            )}

            {page === 'metricas' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0, marginBottom: 24, color: 'var(--text)' }}>Métricas de rendimiento</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Videos totales" value={contenidos.length} />
                  <StatCard label="Score promedio" value={scorePromedio} color="var(--gold)" />
                  <StatCard label="Score máximo" value={contenidos.length ? Math.max(...contenidos.map(c => c.score_promedio || 0)).toFixed(1) : '0'} color="var(--green)" />
                  <StatCard label="Score alto ≥8" value={contenidos.filter(c => (c.score_promedio || 0) >= 8).length} color="var(--green)" />
                </div>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Top videos por score</div>
                  {[...contenidos].sort((a, b) => (b.score_promedio || 0) - (a.score_promedio || 0)).slice(0, 10).map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(42,42,50,0.5)' }}>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: i === 0 ? 'var(--gold)' : 'var(--text2)', width: 30, textAlign: 'center' }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ig_titulo || c.archivo}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 160, flexShrink: 0 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(c.score_promedio || 0) * 10}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold2))', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', width: 28 }}>{c.score_promedio}</span>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: (c.score_promedio || 0) >= 8 ? 'rgba(45,212,160,0.15)' : 'rgba(201,168,76,0.15)', color: (c.score_promedio || 0) >= 8 ? 'var(--green)' : 'var(--gold)' }}>
                        {(c.score_promedio || 0) >= 8 ? 'Excelente' : 'Bueno'}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {page === 'tendencias' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0, marginBottom: 24, color: 'var(--text)' }}>Tendencias e inteligencia</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Ganchos con mayor score</div>
                    {contenidos.filter(c => (c.score_gancho || 0) >= 8).slice(0, 5).map(c => (
                      <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.ig_descripcion?.substring(0, 120)}...</div>
                        <div style={{ fontSize: 11, color: 'var(--gold)' }}>Gancho: {c.score_gancho}/10</div>
                      </div>
                    ))}
                    {contenidos.filter(c => (c.score_gancho || 0) >= 8).length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Los ganchos con score ≥ 8 aparecerán acá.</div>}
                  </Card>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Aptos para reposteo</div>
                    {contenidos.filter(c => {
                      const dias = (Date.now() - new Date(c.fecha_aprobacion).getTime()) / 86400000
                      return dias >= parseInt(config.dias_reposteo || '90') && (c.score_promedio || 0) >= parseFloat(config.score_reposteo || '7.5')
                    }).slice(0, 5).map(c => (
                      <div key={c.id} style={{ background: 'var(--bg3)', borderRadius: 8, padding: 14, marginBottom: 10, borderLeft: '3px solid var(--purple)' }}>
                        <div style={{ fontSize: 12, color: 'var(--purple)', marginBottom: 4 }}>♻️ Apto para reposteo</div>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ig_titulo || c.archivo}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Score {c.score_promedio}/10 · {Math.floor((Date.now() - new Date(c.fecha_aprobacion).getTime()) / 86400000)} días</div>
                      </div>
                    ))}
                    {contenidos.filter(c => { const dias = (Date.now() - new Date(c.fecha_aprobacion).getTime()) / 86400000; return dias >= parseInt(config.dias_reposteo || '90') && (c.score_promedio || 0) >= parseFloat(config.score_reposteo || '7.5') }).length === 0 && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Los videos aptos aparecerán según tu configuración.</div>}
                  </Card>
                </div>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Distribución de scores</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                    {[
                      { label: '9-10', count: contenidos.filter(c => (c.score_promedio||0) >= 9).length, color: 'var(--green)' },
                      { label: '8-9',  count: contenidos.filter(c => (c.score_promedio||0) >= 8 && (c.score_promedio||0) < 9).length, color: 'var(--blue)' },
                      { label: '7-8',  count: contenidos.filter(c => (c.score_promedio||0) >= 7 && (c.score_promedio||0) < 8).length, color: 'var(--gold)' },
                      { label: '6-7',  count: contenidos.filter(c => (c.score_promedio||0) >= 6 && (c.score_promedio||0) < 7).length, color: 'var(--text2)' },
                      { label: '<6',   count: contenidos.filter(c => (c.score_promedio||0) > 0 && (c.score_promedio||0) < 6).length, color: 'var(--red)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Score {s.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* TENDENCIAS IA */}
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Tendencias inmobiliarias</div>
                      <button onClick={actualizarTodo} disabled={loadingTrends} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--gold)', color: '#000' }}>{loadingTrends ? 'Actualizando...' : '↻ Actualizar'}</button>
                    </div>
                    {ultimaActualizacion && <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 8 }}>Actualizado: {new Date(ultimaActualizacion).toLocaleDateString('es-AR')}</div>}
                    {trends.length === 0 && !loadingTrends && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Clickea Actualizar para generar tendencias con IA y guardarlas.</div>}
                    {trends.map((t: any, i: number) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13 }}>{t.keyword}</span><span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>{t.value}</span></div>
                        <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2 }}><div style={{ height: 4, width: t.value + '%', background: t.value > 70 ? 'var(--green)' : t.value > 40 ? 'var(--gold)' : 'var(--text2)', borderRadius: 2 }} /></div>
                      </div>
                    ))}
                  </Card>
                  <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Hashtags recomendados</div>
                      <span style={{ fontSize: 10, color: 'var(--text2)' }}>Se actualiza junto a tendencias</span>
                    </div>
                    {hashtags.length === 0 && !loadingTrends && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Clickea Actualizar en Tendencias para generar hashtags.</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {hashtags.map((h: string, i: number) => (
                        <span key={i} onClick={() => { navigator.clipboard.writeText('#' + h.replace('#','')); showToast('Copiado!') }} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'var(--bg3)', color: 'var(--gold)', cursor: 'pointer', border: '1px solid var(--border)' }}>#{h.replace('#','')}</span>
                      ))}
                    </div>
                  </Card>
                </div>
                <Card style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Temas sugeridos para tu proximo video</div>
                    <span style={{ fontSize: 10, color: 'var(--text2)' }}>Se genera junto a tendencias</span>
                  </div>
                  {temasSugeridos.length === 0 && !loadingTrends && <div style={{ color: 'var(--text2)', fontSize: 13 }}>Clickea Actualizar en Tendencias para generar sugerencias de temas.</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {temasSugeridos.map((t: any, i: number) => (
                      <div key={i} style={{ background: 'var(--bg3)', borderRadius: 10, padding: 16, border: temaSeleccionado === t.tema ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 16, letterSpacing: 1, marginBottom: 6 }}>{t.tema}</div>
                        <div style={{ fontSize: 12, color: 'var(--gold)', marginBottom: 6, fontStyle: 'italic' }}>"{t.gancho}"</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 12 }}>{t.justificacion}</div>
                        <button onClick={() => fetchGuion(t.tema)} disabled={loadingGuion} style={{ width: '100%', padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'var(--gold)', color: '#000' }}>{loadingGuion && temaSeleccionado === t.tema ? 'Generando guion...' : 'Generar guion'}</button>
                      </div>
                    ))}
                  </div>
                </Card>
                {guion && (
                  <Card style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1 }}>Guion: {temaSeleccionado}</div>
                      <button onClick={() => { navigator.clipboard.writeText(guion); showToast('Guion copiado') }} style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)' }}>Copiar</button>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>{guion}</div>
                  </Card>
                )}
              </div>
            )}

            {page === 'redes' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text)' }}>Redes sociales</h2>
                  <button
                    onClick={async () => {
                      const res = await fetch('/api/uploadpost-jwt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: 'leanborges' })
                      })
                      const data = await res.json()
                      if (data.access_url) {
                        window.open(data.access_url, '_blank')
                      } else {
                        showToast('Error generando link de conexión')
                      }
                    }}
                    style={{ padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    🔗 Conectar / gestionar redes
                  </button>
                </div>
                <Card style={{ marginBottom: 20, background: 'rgba(232,71,42,0.06)', border: '1px solid rgba(232,71,42,0.2)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                    <strong>¿Cómo conectar tus redes?</strong> Hacé click en el botón de arriba para abrir la página de conexión de Upload Post. Desde ahí podés vincular Instagram, TikTok, YouTube, LinkedIn, Facebook, Twitter/X y Threads. Una vez conectadas, PostIA puede publicar en tu nombre automáticamente.
                  </div>
                </Card>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {[
                    { red: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/leanborges', color: '#e1306c', svg: RED_META.instagram.svg },
                    { red: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@leanborges', color: '#69c9d0', svg: RED_META.tiktok.svg },
                    { red: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@leanborges', color: '#ff0000', svg: RED_META.youtube.svg },
                    { red: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/leanborges', color: '#0077b5', svg: RED_META.linkedin.svg },
                    { red: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/leanborges', color: '#1877f2', svg: RED_META.facebook.svg },
                    { red: 'twitter', label: 'Twitter / X', url: 'https://x.com/leanborges', color: '#1da1f2', svg: RED_META.twitter.svg },
                    { red: 'threads', label: 'Threads', url: 'https://www.threads.net/@leanborges', color: '#aaaaaa', svg: RED_META.threads.svg },
                  ].map(r => (
                    <a key={r.red} href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'var(--bg2)', border: `1px solid ${r.color}33`, borderRadius: 16,
                        padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = r.color)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = r.color + '33')}
                      >
                        <div style={{ color: r.color, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SvgIcon red={r.red} size={48} />
                        </div>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1.5, color: 'var(--text)' }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: r.color, opacity: 0.8 }}>@leanborges</div>
                        <div style={{
                          marginTop: 4, padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: r.color + '18', color: r.color, border: `1px solid ${r.color}44`
                        }}>Ver perfil ↗</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {page === 'config' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, letterSpacing: 0, marginBottom: 24, color: 'var(--text)' }}>Configuración del sistema</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Card style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Horarios de publicación</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Elegí qué días y a qué horas publicar. Aplica a todas las redes.</div>

                    {schedules.map((bloque, bIdx) => (
                      <div key={bloque.id} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
                        {/* Días */}
                        <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Días</div>
                        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                          {DIAS_LABELS.map(d => {
                            const on = bloque.dias_semana.includes(d.id)
                            return (
                              <button key={d.id} onClick={() => {
                                const next = on ? bloque.dias_semana.filter(x => x !== d.id) : [...bloque.dias_semana, d.id].sort((a,b) => a-b)
                                setSchedules(prev => prev.map(b => b.id === bloque.id ? { ...b, dias_semana: next } : b))
                              }} style={{
                                width: 32, height: 32, borderRadius: 7, border: on ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                                background: on ? 'rgba(201,168,76,0.15)' : 'var(--bg2)', color: on ? 'var(--gold)' : 'var(--text2)',
                                fontWeight: on ? 700 : 400, fontSize: 12, cursor: 'pointer', padding: 0, transition: 'all 0.15s'
                              }}>{d.label}</button>
                            )
                          })}
                        </div>

                        {/* Horas */}
                        <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 6 }}>Horas</div>
                        {bloque.horas.map(h => (
                          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ color: 'var(--text2)', fontSize: 13 }}>⏱</span>
                            <input type="time" value={h.hora.substring(0,5)}
                              onChange={e => setSchedules(prev => prev.map(b => b.id === bloque.id ? { ...b, horas: b.horas.map(x => x.id === h.id ? { ...x, hora: e.target.value + ':00' } : x) } : b))}
                              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 10px', borderRadius: 6, fontSize: 14, fontFamily: 'monospace', fontWeight: 600, outline: 'none' }} />
                            <button onClick={() => setGenerandoAhora(prev => { generarAhoraSchedule(h.id); return prev })}
                              disabled={generandoAhora === h.id}
                              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--gold)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em' }}>
                              {generandoAhora === h.id ? '...' : '▶ Ahora'}
                            </button>
                            <div style={{ flex: 1 }} />
                            {bloque.horas.length > 1 && (
                              <button onClick={() => setSchedules(prev => prev.map(b => b.id === bloque.id ? { ...b, horas: b.horas.filter(x => x.id !== h.id) } : b))}
                                style={{ background: 'transparent', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => setSchedules(prev => prev.map(b => b.id === bloque.id ? { ...b, horas: [...b.horas, { id: schedUid(), hora: '18:00:00', schedule_id: null }] } : b))}
                          style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
                          + Agregar hora
                        </button>
                        {schedules.length > 1 && (
                          <button onClick={() => setSchedules(prev => prev.filter(b => b.id !== bloque.id))}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,80,80,0.4)', fontSize: 11, cursor: 'pointer', marginTop: 8, padding: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', float: 'right' }}>
                            Eliminar grupo
                          </button>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button onClick={() => setSchedules(prev => [...prev, { id: schedUid(), dias_semana: [1,2,3,4,5], horas: [{ id: schedUid(), hora: '10:00:00', schedule_id: null }] }])}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        + Agregar grupo de días
                      </button>
                      <button onClick={guardarSchedules} disabled={savingSchedules}
                        style={{ flex: 2, padding: '8px', borderRadius: 8, border: 'none', background: savingSchedules ? 'var(--border)' : 'var(--gold)', color: savingSchedules ? 'var(--text2)' : '#000', fontSize: 13, fontWeight: 700, cursor: savingSchedules ? 'not-allowed' : 'pointer' }}>
                        {savingSchedules ? 'Guardando...' : 'Guardar horarios'}
                      </button>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Limpieza y reposteo</div>
                    {[
                      { label: 'Mínimo de views para conservar', key: 'min_views', default: '500' },
                      { label: 'Días hasta reposteo', key: 'dias_reposteo', default: '90' },
                      { label: 'Score mínimo para reposteo', key: 'score_reposteo', default: '7.5', step: '0.1' },
                      { label: 'Intervalo de detección (horas)', key: 'intervalo_horas', default: '1' },
                    ].map(item => (
                      <div key={item.key} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{item.label}</div>
                        <input type="number" step={(item as any).step} value={config[item.key] || item.default}
                          onChange={e => setConfig(prev => ({ ...prev, [item.key]: e.target.value }))}
                          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 14, width: '100%' }} />
                      </div>
                    ))}
                    <button onClick={saveConfig} disabled={saving} style={{ width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: saving ? 'var(--border)' : 'var(--gold)', color: saving ? 'var(--text2)' : '#000' }}>
                      {saving ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                  </Card>
                </div>

                {/* PERFIL Y CONTENIDO */}
                <Card style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Perfil y contenido</div>

                  {/* Nombre display */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>👤 Tu nombre o marca</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>
                      Cómo querés aparecer en el copy generado. Ej: <em>Leandro Borges Inmobiliaria</em>
                    </div>
                    <input type="text" placeholder="Tu nombre o marca..." value={nombreDisplay}
                      onChange={e => setNombreDisplay(e.target.value)}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13, width: '100%' }} />
                  </div>

                  {/* Prompt personalizado */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>🤖 Prompt personalizado para Claude</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>
                      Describí tu perfil profesional, zona de trabajo, tipo de propiedades, tono de comunicación y cualquier instrucción especial para la generación de copy. Mientras más detalle, mejor el resultado.
                    </div>
                    <textarea
                      value={promptPersonalizado}
                      onChange={e => setPromptPersonalizado(e.target.value)}
                      placeholder={"Ejemplo: Soy martillero y corredor público en Buenos Aires, especializado en propiedades residenciales en zona norte (Pilar, Nordelta, Tigre). Mi estilo es profesional pero cercano. Me dirijo a familias de clase media-alta que buscan su primera casa o invierten en propiedades. Siempre mencionar ubicación y servicios del barrio. Usar emojis con moderación."}
                      rows={6}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: 6, fontSize: 13, width: '100%', resize: 'vertical', lineHeight: 1.6, fontFamily: 'inherit' }}
                    />
                  </div>

                  {/* Upload Post username (readonly) */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>🔗 Username de Upload Post</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 }}>
                      Tu identificador en Upload Post. Usalo para conectar tus redes sociales en la sección Redes.
                    </div>
                    <input type="text" value={uploadPostUsername} readOnly
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px 12px', borderRadius: 6, fontSize: 13, width: '100%', cursor: 'default' }} />
                  </div>

                  <button onClick={savePerfilUsuario} disabled={saving} style={{ width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: saving ? 'var(--border)' : 'var(--gold)', color: saving ? 'var(--text2)' : '#000' }}>
                    {saving ? 'Guardando...' : 'Guardar perfil'}
                  </button>
                </Card>

                {/* GOOGLE DRIVE */}
                <Card style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Google Drive</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                    Creá dos carpetas en tu Google Drive, compartilas como <strong style={{color:'var(--text)'}}>públicas</strong> y pegá las URLs acá.<br/>
                    Recomendamos llamarlas <strong style={{color:'var(--gold)'}}>A PUBLICAR</strong> y <strong style={{color:'var(--gold)'}}>PUBLICADOS</strong>.
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>📁 Carpeta A PUBLICAR — URL de Google Drive</div>
                    <input type="text" placeholder="https://drive.google.com/drive/folders/..." value={config['drive_carpeta_publicar'] || ''}
                      onChange={e => setConfig(prev => ({ ...prev, drive_carpeta_publicar: e.target.value }))}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13, width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>📁 Carpeta PUBLICADOS — URL de Google Drive</div>
                    <input type="text" placeholder="https://drive.google.com/drive/folders/..." value={config['drive_carpeta_publicados'] || ''}
                      onChange={e => setConfig(prev => ({ ...prev, drive_carpeta_publicados: e.target.value }))}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13, width: '100%' }} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>🎬 Máximo de videos a procesar por día</div>
                    <input type="number" min="1" max="5" value={config['max_videos_diarios'] || '2'}
                      onChange={e => setConfig(prev => ({ ...prev, max_videos_diarios: e.target.value }))}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 14, width: '100%' }} />
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Plan Starter: máx 2 por día · Plan Pro: máx 5 por día</div>
                  </div>
                  <button onClick={saveConfig} disabled={saving} style={{ width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: saving ? 'var(--border)' : 'var(--gold)', color: saving ? 'var(--text2)' : '#000' }}>
                    {saving ? 'Guardando...' : 'Guardar configuración de Drive'}
                  </button>
                </Card>

                {/* AUTOPUBLICACION */}
                <Card style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Publicación automática</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>Autopublicación</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>Si está activa, el contenido se publica sin requerir tu aprobación</div>
                    </div>
                    <div onClick={() => setConfig(prev => ({ ...prev, autopublicacion: prev.autopublicacion === 'true' ? 'false' : 'true' }))}
                      style={{ width: 48, height: 26, borderRadius: 13, background: config['autopublicacion'] === 'true' ? 'var(--green)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: config['autopublicacion'] === 'true' ? 25 : 3, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                  <button onClick={saveConfig} disabled={saving} style={{ width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: saving ? 'var(--border)' : 'var(--gold)', color: saving ? 'var(--text2)' : '#000', marginTop: 16 }}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </Card>

              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL VER COPY */}
      {selectedContent && (
        <div onClick={() => setSelectedContent(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 640, maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', gap: 16, padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              {selectedContent.portada_vertical_path && (
                <img src={selectedContent.portada_vertical_path} alt="portada" style={{ width: 72, height: 128, borderRadius: 8, objectFit: 'cover', objectPosition: 'center', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: 'var(--gold)', marginBottom: 6 }}>VER COPY</div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>{selectedContent.ig_titulo || selectedContent.archivo}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[
                    { label: `🎯 Gancho ${selectedContent.score_gancho}/10` },
                    { label: `💡 Claridad ${selectedContent.score_claridad}/10` },
                    { label: `📢 CTA ${selectedContent.score_cta}/10` },
                    { label: `⭐ Promedio ${selectedContent.score_promedio}/10`, green: true },
                  ].map(s => (
                    <span key={s.label} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.green ? 'rgba(45,212,160,0.15)' : 'rgba(201,168,76,0.15)', color: s.green ? 'var(--green)' : 'var(--gold)' }}>{s.label}</span>
                  ))}
                </div>
                {selectedContent.file_id_drive && (
                  <a href={`https://drive.google.com/file/d/${selectedContent.file_id_drive}/view`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>▶ Ver video en Drive ↗</a>
                )}
              </div>
              <span onClick={() => setSelectedContent(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20, flexShrink: 0 }}>✕</span>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* INSTAGRAM */}
              {(selectedContent.ig_titulo || selectedContent.ig_descripcion) && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.instagram.color}18`, borderBottom: `1px solid ${RED_META.instagram.color}33` }}>
                    <SvgIcon red="instagram" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.instagram.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instagram</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {selectedContent.ig_titulo && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{selectedContent.ig_titulo}</div>}
                    {selectedContent.ig_descripcion && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>{selectedContent.ig_descripcion}</div>}
                    {selectedContent.ig_hashtags && <div style={{ fontSize: 12, color: '#a78bfa', lineHeight: 1.8, wordBreak: 'break-word' }}>{selectedContent.ig_hashtags}</div>}
                  </div>
                </div>
              )}
              {/* TIKTOK */}
              {(selectedContent.tt_titulo || selectedContent.tt_descripcion) && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.tiktok.color}18`, borderBottom: `1px solid ${RED_META.tiktok.color}33` }}>
                    <SvgIcon red="tiktok" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.tiktok.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>TikTok</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {selectedContent.tt_titulo && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{selectedContent.tt_titulo}</div>}
                    {selectedContent.tt_descripcion && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>{selectedContent.tt_descripcion}</div>}
                    {selectedContent.tt_hashtags && <div style={{ fontSize: 12, color: '#a78bfa', lineHeight: 1.8, wordBreak: 'break-word' }}>{selectedContent.tt_hashtags}</div>}
                  </div>
                </div>
              )}
              {/* YOUTUBE */}
              {(selectedContent.yt_titulo || selectedContent.yt_descripcion) && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.youtube.color}18`, borderBottom: `1px solid ${RED_META.youtube.color}33` }}>
                    <SvgIcon red="youtube" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.youtube.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>YouTube</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {selectedContent.yt_titulo && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{selectedContent.yt_titulo}</div>}
                    {selectedContent.yt_descripcion && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>{selectedContent.yt_descripcion}</div>}
                    {selectedContent.yt_hashtags && <div style={{ fontSize: 12, color: '#a78bfa', lineHeight: 1.8, wordBreak: 'break-word', marginBottom: 6 }}>{selectedContent.yt_hashtags}</div>}
                    {selectedContent.yt_keywords && <div style={{ fontSize: 12, color: 'var(--blue)', lineHeight: 1.6, wordBreak: 'break-word' }}>🔑 {selectedContent.yt_keywords}</div>}
                  </div>
                </div>
              )}
              {/* LINKEDIN */}
              {(selectedContent.li_titulo || selectedContent.li_descripcion) && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.linkedin.color}18`, borderBottom: `1px solid ${RED_META.linkedin.color}33` }}>
                    <SvgIcon red="linkedin" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.linkedin.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>LinkedIn</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    {selectedContent.li_titulo && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{selectedContent.li_titulo}</div>}
                    {selectedContent.li_descripcion && <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 8 }}>{selectedContent.li_descripcion}</div>}
                    {selectedContent.li_hashtags && <div style={{ fontSize: 12, color: '#a78bfa', lineHeight: 1.8, wordBreak: 'break-word' }}>{selectedContent.li_hashtags}</div>}
                  </div>
                </div>
              )}
              {/* FACEBOOK */}
              {selectedContent.fb_descripcion && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.facebook.color}18`, borderBottom: `1px solid ${RED_META.facebook.color}33` }}>
                    <SvgIcon red="facebook" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.facebook.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>Facebook</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{selectedContent.fb_descripcion}</div>
                  </div>
                </div>
              )}
              {/* TWITTER */}
              {selectedContent.tw_texto && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.twitter.color}18`, borderBottom: `1px solid ${RED_META.twitter.color}33` }}>
                    <SvgIcon red="twitter" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.twitter.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>Twitter/X</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{selectedContent.tw_texto}</div>
                  </div>
                </div>
              )}
              {/* THREADS */}
              {selectedContent.th_texto && (
                <div style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: `${RED_META.threads.color}18`, borderBottom: `1px solid ${RED_META.threads.color}33` }}>
                    <SvgIcon red="threads" size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: RED_META.threads.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>Threads</span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{selectedContent.th_texto}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOG DE PUBLICACIÓN */}
      {logModal && (
        <div onClick={() => setLogModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 500, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>📋 Log de publicación</div>
              <span onClick={() => setLogModal(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20 }}>✕</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>{logModal.contenido.ig_titulo || logModal.contenido.archivo}</div>

            {/* Estado general */}
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>Estado del contenido</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text2)' }}>Estado</span>
                  <span style={{ fontWeight: 600, color: logModal.contenido.estado === 'publicado' ? '#22c55e' : logModal.contenido.estado === 'aprobado' ? '#f59e0b' : '#94a3b8' }}>
                    {logModal.contenido.estado}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text2)' }}>Creado</span>
                  <span style={{ color: 'var(--text)' }}>{new Date(logModal.contenido.created_at).toLocaleString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text2)' }}>Upload Post request_id</span>
                  <span style={{ color: logModal.contenido.upload_post_request_id ? '#22c55e' : '#ef4444', fontFamily: 'monospace', fontSize: 11, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {logModal.contenido.upload_post_request_id || '❌ Sin request_id — nunca se envió a Upload Post'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado por red */}
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>Estado por red social</div>
              {[
                { key: 'ig', label: 'Instagram', pub: logModal.contenido.ig_publicado, postId: logModal.contenido.ig_post_id },
                { key: 'tt', label: 'TikTok',    pub: logModal.contenido.tt_publicado, postId: logModal.contenido.tt_post_id },
                { key: 'yt', label: 'YouTube',   pub: logModal.contenido.yt_publicado, postId: logModal.contenido.yt_post_id },
                { key: 'li', label: 'LinkedIn',  pub: logModal.contenido.li_publicado, postId: logModal.contenido.li_post_id },
                { key: 'fb', label: 'Facebook',  pub: logModal.contenido.fb_publicado, postId: logModal.contenido.fb_post_id },
                { key: 'tw', label: 'Twitter/X', pub: logModal.contenido.tw_publicado, postId: logModal.contenido.tw_post_id },
                { key: 'th', label: 'Threads',   pub: logModal.contenido.th_publicado, postId: logModal.contenido.th_post_id },
              ].map(r => (
                <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text2)' }}>{r.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r.postId && <a href={r.postId} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)' }}>ver post</a>}
                    <span style={{ fontWeight: 700, color: r.pub ? '#22c55e' : '#ef4444' }}>{r.pub ? '✓ Publicado' : '✗ No publicado'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Respuesta de Upload Post API */}
            {logModal.contenido.upload_post_request_id && (
              <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>Respuesta Upload Post API</div>
                {logModal.loading ? (
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>Consultando API...</div>
                ) : logModal.uploadStatus ? (
                  <div>
                    {logModal.uploadStatus.error ? (
                      <div style={{ color: '#ef4444', fontSize: 13 }}>{logModal.uploadStatus.error}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span style={{ color: 'var(--text2)' }}>Estado global</span>
                          <span style={{ color: logModal.uploadStatus.status === 'completed' ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{logModal.uploadStatus.status || '—'}</span>
                        </div>
                        {logModal.uploadStatus.results && Object.entries(logModal.uploadStatus.results).map(([plat, res]: [string, any]) => (
                          <div key={plat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px solid var(--border)', fontSize: 12 }}>
                            <span style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{plat}</span>
                            <span style={{ color: res?.success ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                              {res?.success ? '✓ OK' : `✗ ${res?.error || 'Error'}`}
                            </span>
                          </div>
                        ))}
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}>Ver respuesta completa</summary>
                          <pre style={{ fontSize: 10, color: 'var(--text2)', background: 'var(--bg2)', padding: 8, borderRadius: 6, marginTop: 6, overflow: 'auto', maxHeight: 200 }}>{JSON.stringify(logModal.uploadStatus, null, 2)}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {!logModal.contenido.upload_post_request_id && (
              <div style={{ background: '#1a0000', border: '1px solid #ef4444', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444', marginBottom: 6 }}>⚠️ Problema detectado</div>
                <div style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.6 }}>
                  Este contenido tiene estado <strong>{logModal.contenido.estado}</strong> pero no tiene <code>upload_post_request_id</code>.<br/>
                  Esto significa que el envío a Upload Post nunca se completó o falló silenciosamente.<br/>
                  Usá el botón 📡 para republicar manualmente.
                </div>
              </div>
            )}

            <Btn onClick={() => setLogModal(null)} style={{ width: '100%', marginTop: 4 }}>Cerrar</Btn>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR REDES */}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 440, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>Gestionar publicación</div>
              <span onClick={() => setDeleteModal(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20 }}>✕</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>{deleteModal.nombre}</div>

            {/* Sección republicar */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Republicar en redes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { r: 'instagram', pub: deleteModal.ig_publicado, key: 'ig' },
                { r: 'tiktok',    pub: deleteModal.tt_publicado, key: 'tt' },
                { r: 'youtube',   pub: deleteModal.yt_publicado, key: 'yt' },
                { r: 'linkedin',  pub: deleteModal.li_publicado, key: 'li' },
                { r: 'facebook',  pub: deleteModal.fb_publicado, key: 'fb' },
                { r: 'twitter',   pub: deleteModal.tw_publicado, key: 'tw' },
                { r: 'threads',   pub: deleteModal.th_publicado, key: 'th' },
              ].map(({ r, pub }) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: pub ? `${RED_META[r]?.color}10` : 'var(--bg3)', border: `1px solid ${pub ? RED_META[r]?.color + '33' : 'var(--border)'}` }}>
                  <SvgIcon red={r} size={16} redOverride={pub ? RED_META[r]?.color : 'var(--text2)'} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: pub ? RED_META[r]?.color : 'var(--text)' }}>{RED_META[r]?.label}</span>
                  {pub && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginRight: 8 }}>✓ Publicado</span>}
                  <input type="checkbox" checked={deleteRedes.includes(r)}
                    onChange={e => setDeleteRedes(prev => e.target.checked ? [...prev, r] : prev.filter(x => x !== r))}
                    style={{ width: 15, height: 15, cursor: 'pointer', accentColor: RED_META[r]?.color }} />
                </div>
              ))}
            </div>
            <button
              disabled={deleteRedes.length === 0}
              onClick={async () => {
                if (!deleteModal) return
                const { data: cont } = await supabase.from('contenido').select('*').eq('id', deleteModal.id).single()
                if (!cont) return
                setDeleteModal(null)
                showToast('📤 Publicando en redes seleccionadas...')
                const redesObj: Record<string, boolean> = {}
                deleteRedes.forEach(r => {
                  const keyMap: Record<string, string> = { instagram: 'ig', tiktok: 'tt', youtube: 'yt', linkedin: 'li', facebook: 'fb', twitter: 'tw', threads: 'th' }
                  if (keyMap[r]) redesObj[keyMap[r]] = true
                })
                const res = await fetch('/api/publicar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contenido: cont, redes: redesObj, username: uploadPostUsername })
                })
                const result = await res.json()
                const liError2 = result.linkedin_error || null
                if (!result.request_id && liError2) {
                  showToast('⚠️ LinkedIn: ' + liError2)
                } else if (result.request_id) {
                  showToast('📡 Procesando... actualizando estado en segundos')
                  let intentos2 = 0
                  const poll2 = async () => {
                    intentos2++
                    try {
                      const sr = await fetch(`/api/upload-status?request_id=${result.request_id}`)
                      const sd = await sr.json()
                      console.log('Poll2 status:', sd.status, JSON.stringify(sd.results))
                      const stillProcessing2 = ['pending','queued','processing','in_progress'].includes(sd.status)
                      if (sd.results) {
                        const updates: Record<string, boolean> = {}
                        const r2 = sd.results
                        if (redesObj.ig && r2.instagram?.success) updates.ig_publicado = true
                        if (redesObj.tt && r2.tiktok?.success) updates.tt_publicado = true
                        if (redesObj.yt && r2.youtube?.success) updates.yt_publicado = true
                        if (redesObj.li && r2.linkedin?.success) updates.li_publicado = true
                        if (redesObj.fb && r2.facebook?.success) updates.fb_publicado = true
                        if (redesObj.tw && r2.x?.success) updates.tw_publicado = true
                        if (redesObj.th && r2.threads?.success) updates.th_publicado = true
                        if (Object.keys(updates).length > 0) {
                          await supabase.from('contenido').update(updates).eq('id', cont.id)
                          await fetchData()
                        }
                        if (!stillProcessing2) {
                          const errores2 = Object.entries(r2)
                            .filter(([,v]: any) => !v.success)
                            .map(([k,v]: any) => `${k}: ${(v as any).message||(v as any).error||'error'}`)
                            .join(' | ')
                          const exito2 = Object.keys(updates).length > 0
                          showToast(exito2
                            ? (errores2 ? `✅ Parcial ⚠️ ${errores2}` : '✅ Publicado — logos actualizados')
                            : `⚠️ ${errores2 || 'Sin éxito — revisá Upload Post'}`)
                          return
                        }
                      }
                      if (stillProcessing2 || intentos2 < 15) setTimeout(poll2, 8000)
                      else { await fetchData(); showToast('⏳ Publicado — actualizá la página para ver logos') }
                    } catch(e) { if (intentos2 < 15) setTimeout(poll2, 8000) }
                  }
                  setTimeout(poll2, 8000)
                } else if (result.success) {
                  showToast('✅ Publicado correctamente')
                  await fetchData()
                } else {
                  showToast('⚠️ Error: ' + (result.message || result.error || 'Error desconocido'))
                  await fetchData()
                }
              }}
              style={{ width: '100%', padding: '10px 0', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: deleteRedes.length === 0 ? 'default' : 'pointer', border: 'none', background: deleteRedes.length === 0 ? 'var(--border)' : 'var(--accent)', color: '#fff', opacity: deleteRedes.length === 0 ? 0.5 : 1, marginBottom: 20 }}
            >
              📤 Republicar seleccionadas →
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => setDeleteModal(null)} style={{ flex: 1 }}>Cancelar</Btn>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg2)', border: `1px solid ${toast.startsWith('⚠️') ? '#ef4444' : 'var(--border)'}`, borderRadius: 10, padding: '12px 16px 12px 20px', fontSize: 13, fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxWidth: 420, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ flex: 1, lineHeight: 1.5, wordBreak: 'break-word' }}>{toast}</span>
          <span onClick={() => setToast('')} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>✕</span>
        </div>
      )}
    </div>
  )
}
// build Fri Apr 10 22:54:58 UTC 2026
