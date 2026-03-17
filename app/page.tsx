'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

type Contenido = {
  id: string; archivo: string; file_id_drive: string; estado: string
  fecha_aprobacion: string; score_promedio: number; score_gancho: number
  score_claridad: number; score_cta: number
  ig_titulo: string; ig_descripcion: string; ig_hashtags: string; li_hashtags: string
  tt_titulo: string; tt_descripcion: string; tt_hashtags: string
  yt_titulo: string; yt_descripcion: string; yt_hashtags: string; yt_keywords: string
  li_titulo: string; li_descripcion: string
  fb_descripcion: string; tw_texto: string; th_texto: string
  ig_publicado: boolean; tt_publicado: boolean; yt_publicado: boolean
  li_publicado: boolean; fb_publicado: boolean; tw_publicado: boolean; th_publicado: boolean
  ig_post_id: string; tt_post_id: string; yt_post_id: string
  li_post_id: string; fb_post_id: string; tw_post_id: string; th_post_id: string
  portada_vertical_path: string; portada_youtube_path: string
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
    ghost:  { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' },
    gold:   { background: 'var(--gold)', border: 'none', color: '#000' },
    danger: { background: 'rgba(240,84,84,0.1)', border: '1px solid rgba(240,84,84,0.3)', color: 'var(--red)' },
  }
  return <button onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1, ...vs[variant], ...style }}>{children}</button>
}

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...style }}>{children}</div>
)

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
    <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, color: color || 'var(--text)', letterSpacing: 1, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
  </div>
)

function LoginPage({ onLogin }: { onLogin: () => void }) {
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
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 3, color: 'var(--gold)' }}>BORGES</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 2, textTransform: 'uppercase' }}>Content System</div>
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
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer', border: 'none', background: loading ? 'var(--border)' : 'var(--gold)', color: loading ? 'var(--text2)' : '#000' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </div>
    </div>
  )
}

export default function Panel() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [page, setPage] = useState('cola')
  const [contenidos, setContenidos] = useState<Contenido[]>([])
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string } | null>(null)
  const [deleteRedes, setDeleteRedes] = useState<string[]>([])
  const [filtroRed, setFiltroRed] = useState('todas')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setAuthed(!!session))
    return () => listener.subscription.unsubscribe()
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: cont }, { data: cfg }] = await Promise.all([
      supabase.from('contenido').select('*').order('fecha_aprobacion', { ascending: false }),
      supabase.from('config').select('*')
    ])
    if (cont) setContenidos(cont)
    if (cfg) {
      const cfgMap: Record<string, string> = {}
      cfg.forEach((c: Config) => { cfgMap[c.parametro] = c.valor })
      setConfig(cfgMap)
      setPaused(cfgMap.pausa_global === 'SI')
    }
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  const togglePause = async () => {
    const newVal = paused ? 'NO' : 'SI'
    await supabase.from('config').update({ valor: newVal }).eq('parametro', 'pausa_global')
    setPaused(!paused); showToast(newVal === 'SI' ? '⏸ Sistema pausado' : '▶ Sistema reanudado')
  }

  const saveConfig = async () => {
    setSaving(true)
    await Promise.all(Object.entries(config).map(([parametro, valor]) => supabase.from('config').upsert({ parametro, valor })))
    setSaving(false); showToast('✅ Configuración guardada')
  }

  const confirmarEliminar = async () => {
    if (!deleteModal) return
    try {
      await fetch('https://n8n.borges.com.ar/webhook/borges-eliminar-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido_id: deleteModal.id, redes: deleteRedes })
      })
    } catch(e) { console.error('Error llamando webhook:', e) }
    setDeleteModal(null); showToast('🗑 Eliminado de redes seleccionadas'); fetchData()
  }

  const scorePromedio = contenidos.length
    ? (contenidos.reduce((a, b) => a + (b.score_promedio || 0), 0) / contenidos.length).toFixed(1) : '0'

  const contenidosFiltrados = filtroRed === 'todas' ? contenidos
    : contenidos.filter(c => filtroRed === 'instagram' ? c.ig_titulo : filtroRed === 'tiktok' ? c.tt_titulo : filtroRed === 'youtube' ? c.yt_titulo : filtroRed === 'linkedin' ? c.li_titulo : true)

  // SVG icon helper
  const SvgIcon = ({ red, size = 18, redOverride }: { red: string; size?: number; redOverride?: string }) => (
    <span style={{ width: size, height: size, display: 'inline-flex', flexShrink: 0, color: redOverride || RED_META[red]?.color }}
      dangerouslySetInnerHTML={{ __html: RED_META[red]?.svg || '' }} />
  )

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
            <img src={c.portada_youtube_path || c.portada_vertical_path} alt="portada" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
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
          <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
            <Btn onClick={() => setSelectedContent(c)} style={{ flex: 1, textAlign: 'center', padding: '6px 10px' }}>Ver copy</Btn>
            <Btn variant="danger" onClick={() => {
              const publicadas = [
                c.ig_publicado && 'instagram',
                c.tt_publicado && 'tiktok',
                c.yt_publicado && 'youtube',
                c.li_publicado && 'linkedin',
                c.fb_publicado && 'facebook',
                c.tw_publicado && 'twitter',
              ].filter(Boolean) as string[]
              setDeleteRedes(publicadas)
              setDeleteModal({ id: c.id, nombre: c.ig_titulo || c.archivo })
            }} style={{ padding: '6px 10px' }}>🗑</Btn>
          </div>
        </div>
      </div>
    )
  }

  if (authed === null) return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Cargando...</div>
  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ position: 'fixed', left: 0, top: 0, width: 220, height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2, color: 'var(--gold)', lineHeight: 1 }}>BORGES</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>Content System</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { id: 'cola', icon: '📋', label: 'Cola' },
            { id: 'contenido', icon: '🎬', label: 'Contenido' },
            { id: 'metricas', icon: '📊', label: 'Métricas' },
            { id: 'tendencias', icon: '🔥', label: 'Tendencias' },
            { id: 'config', icon: '⚙️', label: 'Config' },
          ].map(item => (
            <div key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
              color: page === item.id ? 'var(--gold)' : 'var(--text2)',
              background: page === item.id ? 'rgba(201,168,76,0.12)' : 'transparent',
              fontSize: 13, fontWeight: 500, marginBottom: 2
            }}>
              <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
        <div style={{ padding: '0 12px 16px' }}>
          <div onClick={togglePause} style={{
            padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8,
            background: paused ? 'rgba(45,212,160,0.1)' : 'rgba(240,84,84,0.1)',
            border: `1px solid ${paused ? 'rgba(45,212,160,0.3)' : 'rgba(240,84,84,0.3)'}`,
            color: paused ? 'var(--green)' : 'var(--red)'
          }}>{paused ? '▶ REANUDAR' : '⏸ PAUSAR TODO'}</div>
          <a href="http://n8n.borges.com.ar" target="_blank" rel="noreferrer" style={{ display: 'block', padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontSize: 12, color: 'var(--gold)', background: 'var(--bg3)', textDecoration: 'none', marginBottom: 6 }}>
            ⚙️ n8n
          </a>
          <div onClick={() => supabase.auth.signOut()} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 12, color: 'var(--text2)', background: 'var(--bg3)' }}>
            Cerrar sesión
          </div>
        </div>
      </aside>

      <main style={{ marginLeft: 220, padding: 32, flex: 1, minWidth: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text2)', fontSize: 14 }}>Cargando...</div>
        ) : (
          <>
            {page === 'cola' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>COLA DE <span style={{ color: 'var(--gold)' }}>PUBLICACIÓN</span></h2>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {contenidos.slice(0, 21).map(c => <VideoCard key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            )}

            {page === 'contenido' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 20 }}>HISTORIAL DE <span style={{ color: 'var(--gold)' }}>CONTENIDO</span></h2>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {contenidosFiltrados.map(c => <VideoCard key={c.id} c={c} />)}
                </div>
              </div>
            )}

            {page === 'metricas' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>MÉTRICAS DE <span style={{ color: 'var(--gold)' }}>RENDIMIENTO</span></h2>
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
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>TENDENCIAS E <span style={{ color: 'var(--gold)' }}>INTELIGENCIA</span></h2>
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
              </div>
            )}

            {page === 'config' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>CONFIGURACIÓN DEL <span style={{ color: 'var(--gold)' }}>SISTEMA</span></h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Horarios de publicación</div>
                    {[
                      { label: 'Instagram', red: 'instagram', sub: 'Día 1', key: 'hora_instagram', default: '20:00' },
                      { label: 'TikTok + Facebook', red: 'tiktok', sub: 'Día 2', key: 'hora_tiktok', default: '18:00' },
                      { label: 'Threads', red: 'threads', sub: 'Día 2', key: 'hora_threads', default: '18:00' },
                      { label: 'YouTube Shorts', red: 'youtube', sub: 'Día 2', key: 'hora_youtube', default: '21:00' },
                      { label: 'LinkedIn', red: 'linkedin', sub: 'Día 2', key: 'hora_linkedin', default: '10:00' },
                      { label: 'Twitter/X', red: 'twitter', sub: 'Día 2', key: 'hora_twitter', default: '21:00' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <SvgIcon red={item.red} size={16} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.sub}</div>
                          </div>
                        </div>
                        <input type="time" value={config[item.key] || item.default}
                          onChange={e => setConfig(prev => ({ ...prev, [item.key]: e.target.value }))}
                          style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 10px', borderRadius: 6, fontSize: 13 }} />
                      </div>
                    ))}
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

      {/* MODAL ELIMINAR */}
      {deleteModal && (
        <div onClick={() => setDeleteModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 420, maxWidth: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, letterSpacing: 2, color: 'var(--red)' }}>ELIMINAR POST</div>
              <span onClick={() => setDeleteModal(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20 }}>✕</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
              Seleccioná las redes donde eliminar: <strong style={{ color: 'var(--text)' }}>{deleteModal.nombre}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {['instagram','tiktok','youtube','linkedin','facebook','twitter','threads'].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={deleteRedes.includes(r)} onChange={e => setDeleteRedes(prev => e.target.checked ? [...prev, r] : prev.filter(x => x !== r))} />
                  <SvgIcon red={r} size={16} />
                  {RED_META[r]?.label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn onClick={() => setDeleteModal(null)} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn variant="danger" onClick={confirmarEliminar} style={{ flex: 1 }}>Confirmar eliminación</Btn>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>{toast}</div>
      )}
    </div>
  )
}
