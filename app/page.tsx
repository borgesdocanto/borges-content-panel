'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
)

type Contenido = {
  id: string
  archivo: string
  file_id_drive: string
  estado: string
  fecha_aprobacion: string
  score_promedio: number
  score_gancho: number
  score_claridad: number
  score_cta: number
  ig_titulo: string
  ig_descripcion: string
  ig_hashtags: string
  tt_titulo: string
  tt_descripcion: string
  tt_hashtags: string
  yt_titulo: string
  yt_descripcion: string
  yt_hashtags: string
  yt_keywords: string
  li_titulo: string
  li_descripcion: string
  fb_descripcion: string
  tw_texto: string
  th_texto: string
  ig_publicado: boolean
  tt_publicado: boolean
  yt_publicado: boolean
  li_publicado: boolean
  fb_publicado: boolean
  tw_publicado: boolean
  portada_vertical_path: string
}

type Config = { parametro: string; valor: string }

const REDES = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'twitter', 'threads']

const RED_META: Record<string, { color: string; label: string; emoji: string }> = {
  instagram: { color: '#e1306c', label: 'Instagram', emoji: '📸' },
  tiktok:    { color: '#69c9d0', label: 'TikTok',    emoji: '🎵' },
  youtube:   { color: '#ff0000', label: 'YouTube',   emoji: '▶️' },
  linkedin:  { color: '#0077b5', label: 'LinkedIn',  emoji: '💼' },
  facebook:  { color: '#1877f2', label: 'Facebook',  emoji: '👥' },
  twitter:   { color: '#1da1f2', label: 'Twitter/X', emoji: '🐦' },
  threads:   { color: '#aaaaaa', label: 'Threads',   emoji: '🧵' },
}

const Btn = ({ onClick, children, variant = 'ghost', style = {}, disabled = false }: any) => {
  const styles: Record<string, React.CSSProperties> = {
    ghost:  { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)' },
    gold:   { background: 'var(--gold)', border: 'none', color: '#000' },
    danger: { background: 'rgba(240,84,84,0.1)', border: '1px solid rgba(240,84,84,0.3)', color: 'var(--red)' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'default' : 'pointer', transition: 'all 0.2s', opacity: disabled ? 0.5 : 1, ...styles[variant], ...style }}>
      {children}
    </button>
  )
}

const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, ...style }}>
    {children}
  </div>
)

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) => (
  <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
    <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
    <div style={{ fontFamily: 'Bebas Neue', fontSize: 36, color: color || 'var(--text)', letterSpacing: 1, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{sub}</div>}
  </div>
)

export default function Panel() {
  const [page, setPage] = useState('cola')
  const [contenidos, setContenidos] = useState<Contenido[]>([])
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Contenido | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ id: string; nombre: string } | null>(null)
  const [deleteRedes, setDeleteRedes] = useState<string[]>(['instagram'])
  const [filtroRed, setFiltroRed] = useState('todas')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

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

  useEffect(() => { fetchData() }, [fetchData])

  const togglePause = async () => {
    const newVal = paused ? 'NO' : 'SI'
    await supabase.from('config').update({ valor: newVal }).eq('parametro', 'pausa_global')
    setPaused(!paused)
    showToast(newVal === 'SI' ? '⏸ Sistema pausado' : '▶ Sistema reanudado')
  }

  const saveConfig = async () => {
    setSaving(true)
    await Promise.all(Object.entries(config).map(([parametro, valor]) =>
      supabase.from('config').upsert({ parametro, valor })
    ))
    setSaving(false)
    showToast('✅ Configuración guardada')
  }

  const confirmarEliminar = async () => {
    if (!deleteModal) return
    const updates: Record<string, boolean> = {}
    deleteRedes.forEach(r => { updates[`${r.slice(0, 2)}_publicado`] = false })
    await supabase.from('contenido').update(updates).eq('id', deleteModal.id)
    setDeleteModal(null)
    showToast('🗑 Eliminado de redes seleccionadas')
    fetchData()
  }

  const scorePromedio = contenidos.length
    ? (contenidos.reduce((a, b) => a + (b.score_promedio || 0), 0) / contenidos.length).toFixed(1)
    : '0'

  const contenidosFiltrados = filtroRed === 'todas' ? contenidos
    : contenidos.filter(c =>
        filtroRed === 'instagram' ? c.ig_titulo :
        filtroRed === 'tiktok' ? c.tt_titulo :
        filtroRed === 'youtube' ? c.yt_titulo :
        filtroRed === 'linkedin' ? c.li_titulo : true
      )

  const navItems = [
    { id: 'cola', icon: '📋', label: 'Cola' },
    { id: 'contenido', icon: '🎬', label: 'Contenido' },
    { id: 'metricas', icon: '📊', label: 'Métricas' },
    { id: 'tendencias', icon: '🔥', label: 'Tendencias' },
    { id: 'config', icon: '⚙️', label: 'Config' },
  ]

  // Componente tarjeta de video
  const VideoCard = ({ c }: { c: Contenido }) => (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 0, overflow: 'hidden' }}>
      {/* Portada vertical */}
      <div style={{ width: 80, flexShrink: 0, position: 'relative', background: 'var(--bg3)' }}>
        {c.portada_vertical_path ? (
          <img src={c.portada_vertical_path} alt="portada" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 142 }} />
        ) : (
          <div style={{ width: 80, minHeight: 142, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--text2)' }}>🎬</div>
        )}
        {/* Score badge */}
        <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center' }}>
          <span style={{ background: 'rgba(0,0,0,0.85)', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: (c.score_promedio || 0) >= 8 ? 'var(--green)' : 'var(--gold)' }}>
            {c.score_promedio || '—'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {/* Título */}
        {c.file_id_drive ? (
          <a href={`https://drive.google.com/file/d/${c.file_id_drive}/view`} target="_blank" rel="noreferrer"
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textDecoration: 'none', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.ig_titulo || c.archivo} ↗
          </a>
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {c.ig_titulo || c.archivo}
          </div>
        )}

        {/* Fecha */}
        <div style={{ fontSize: 11, color: 'var(--text2)' }}>
          {c.fecha_aprobacion ? new Date(c.fecha_aprobacion).toLocaleDateString('es-AR') : '—'}
        </div>

        {/* Redes con logo y estado */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {[
            { key: 'ig', pub: c.ig_publicado, meta: RED_META.instagram },
            { key: 'tt', pub: c.tt_publicado, meta: RED_META.tiktok },
            { key: 'yt', pub: c.yt_publicado, meta: RED_META.youtube },
            { key: 'li', pub: c.li_publicado, meta: RED_META.linkedin },
            { key: 'fb', pub: c.fb_publicado, meta: RED_META.facebook },
            { key: 'tw', pub: c.tw_publicado, meta: RED_META.twitter },
          ].map(({ key, pub, meta }) => (
            <div key={key} title={`${meta.label}: ${pub ? 'Publicado' : 'Pendiente'}`} style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: pub ? `${meta.color}22` : 'var(--bg3)',
              border: `1px solid ${pub ? meta.color + '55' : 'var(--border)'}`,
              color: pub ? meta.color : 'var(--text2)',
            }}>
              <span style={{ fontSize: 11 }}>{meta.emoji}</span>
              {key.toUpperCase()}
              <span style={{ fontSize: 8 }}>{pub ? '✓' : '○'}</span>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
          <Btn onClick={() => setSelectedContent(c)} style={{ flex: 1, textAlign: 'center', padding: '6px 10px' }}>Ver copy</Btn>
          <Btn variant="danger" onClick={() => setDeleteModal({ id: c.id, nombre: c.ig_titulo || c.archivo })} style={{ padding: '6px 10px' }}>🗑</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* SIDEBAR */}
      <aside style={{ position: 'fixed', left: 0, top: 0, width: 220, height: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 22, letterSpacing: 2, color: 'var(--gold)', lineHeight: 1 }}>BORGES</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 1, textTransform: 'uppercase' }}>Content System</div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => (
            <div key={item.id} onClick={() => setPage(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
              color: page === item.id ? 'var(--gold)' : 'var(--text2)',
              background: page === item.id ? 'rgba(201,168,76,0.12)' : 'transparent',
              fontSize: 13, fontWeight: 500, marginBottom: 2, transition: 'all 0.2s'
            }}>
              <span style={{ width: 20, textAlign: 'center' }}>{item.icon}</span> {item.label}
            </div>
          ))}
        </nav>
        <div onClick={togglePause} style={{
          margin: 16, padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
          fontSize: 13, fontWeight: 600, letterSpacing: 0.5, transition: 'all 0.2s',
          background: paused ? 'rgba(45,212,160,0.1)' : 'rgba(240,84,84,0.1)',
          border: `1px solid ${paused ? 'rgba(45,212,160,0.3)' : 'rgba(240,84,84,0.3)'}`,
          color: paused ? 'var(--green)' : 'var(--red)'
        }}>
          {paused ? '▶ REANUDAR' : '⏸ PAUSAR TODO'}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: 220, padding: 32, flex: 1, minWidth: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text2)', fontSize: 14 }}>
            Cargando...
          </div>
        ) : (
          <>
            {/* ── COLA ── */}
            {page === 'cola' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>
                  COLA DE <span style={{ color: 'var(--gold)' }}>PUBLICACIÓN</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Total" value={contenidos.length} sub="contenidos" />
                  <StatCard label="Aprobados" value={contenidos.filter(c => c.estado === 'aprobado').length} color="var(--green)" />
                  <StatCard label="Score promedio" value={scorePromedio} color="var(--gold)" />
                  <StatCard label="Sistema" value={paused ? 'OFF' : 'ON'} color={paused ? 'var(--red)' : 'var(--green)'} sub={paused ? 'Pausado' : 'Activo'} />
                </div>
                {contenidos.length === 0 ? (
                  <Card>
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 14 }}>
                      No hay contenidos. Subí videos a Google Drive para empezar.
                    </div>
                  </Card>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {contenidos.slice(0, 20).map(c => <VideoCard key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── CONTENIDO ── */}
            {page === 'contenido' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 20 }}>
                  HISTORIAL DE <span style={{ color: 'var(--gold)' }}>CONTENIDO</span>
                </h2>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  {['todas', ...REDES].map(r => (
                    <div key={r} onClick={() => setFiltroRed(r)} style={{
                      padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                      border: `1px solid ${filtroRed === r ? (RED_META[r]?.color || 'var(--gold)') : 'var(--border)'}`,
                      color: filtroRed === r ? (RED_META[r]?.color || 'var(--gold)') : 'var(--text2)',
                      background: filtroRed === r ? `${RED_META[r]?.color || '#c9a84c'}22` : 'transparent'
                    }}>
                      {r === 'todas' ? 'Todas' : `${RED_META[r]?.emoji} ${RED_META[r]?.label}`}
                    </div>
                  ))}
                </div>
                {contenidosFiltrados.length === 0 ? (
                  <Card><div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 14 }}>No hay contenidos.</div></Card>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {contenidosFiltrados.map(c => <VideoCard key={c.id} c={c} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── METRICAS ── */}
            {page === 'metricas' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>
                  MÉTRICAS DE <span style={{ color: 'var(--gold)' }}>RENDIMIENTO</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  <StatCard label="Videos totales" value={contenidos.length} />
                  <StatCard label="Score promedio" value={scorePromedio} color="var(--gold)" />
                  <StatCard label="Score máximo" value={contenidos.length ? Math.max(...contenidos.map(c => c.score_promedio || 0)).toFixed(1) : '0'} color="var(--green)" />
                  <StatCard label="Score alto (≥8)" value={contenidos.filter(c => (c.score_promedio || 0) >= 8).length} color="var(--green)" />
                </div>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Top videos por score</div>
                  {[...contenidos].sort((a, b) => (b.score_promedio || 0) - (a.score_promedio || 0)).slice(0, 10).map((c, i) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(42,42,50,0.5)' }}>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 24, color: i === 0 ? 'var(--gold)' : 'var(--text2)', width: 30, textAlign: 'center' }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ig_titulo || c.archivo}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 180, flexShrink: 0 }}>
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
                  {contenidos.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 14 }}>No hay datos todavía.</div>}
                </Card>
              </div>
            )}

            {/* ── TENDENCIAS ── */}
            {page === 'tendencias' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>
                  TENDENCIAS E <span style={{ color: 'var(--gold)' }}>INTELIGENCIA</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Ganchos con mayor score</div>
                    {contenidos.filter(c => (c.score_gancho || 0) >= 8).slice(0, 5).map(c => (
                      <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 13, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {c.ig_descripcion?.substring(0, 120)}...
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--gold)' }}>Gancho: {c.score_gancho}/10</div>
                      </div>
                    ))}
                    {contenidos.filter(c => (c.score_gancho || 0) >= 8).length === 0 && (
                      <div style={{ color: 'var(--text2)', fontSize: 13 }}>Los ganchos con score ≥ 8 aparecerán acá.</div>
                    )}
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
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                          Score {c.score_promedio}/10 · {Math.floor((Date.now() - new Date(c.fecha_aprobacion).getTime()) / 86400000)} días
                        </div>
                      </div>
                    ))}
                    {contenidos.filter(c => {
                      const dias = (Date.now() - new Date(c.fecha_aprobacion).getTime()) / 86400000
                      return dias >= parseInt(config.dias_reposteo || '90') && (c.score_promedio || 0) >= parseFloat(config.score_reposteo || '7.5')
                    }).length === 0 && (
                      <div style={{ color: 'var(--text2)', fontSize: 13 }}>Los videos aptos aparecerán según tu configuración.</div>
                    )}
                  </Card>
                </div>
                <Card>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Distribución de scores</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                    {[
                      { label: 'Score 9-10', count: contenidos.filter(c => (c.score_promedio || 0) >= 9).length, color: 'var(--green)' },
                      { label: 'Score 8-9', count: contenidos.filter(c => (c.score_promedio || 0) >= 8 && (c.score_promedio || 0) < 9).length, color: 'var(--blue)' },
                      { label: 'Score 7-8', count: contenidos.filter(c => (c.score_promedio || 0) >= 7 && (c.score_promedio || 0) < 8).length, color: 'var(--gold)' },
                      { label: 'Score 6-7', count: contenidos.filter(c => (c.score_promedio || 0) >= 6 && (c.score_promedio || 0) < 7).length, color: 'var(--text2)' },
                      { label: 'Score <6',  count: contenidos.filter(c => (c.score_promedio || 0) < 6 && (c.score_promedio || 0) > 0).length, color: 'var(--red)' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--bg3)', borderRadius: 8, padding: 16, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Bebas Neue', fontSize: 32, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* ── CONFIG ── */}
            {page === 'config' && (
              <div>
                <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2, marginBottom: 28 }}>
                  CONFIGURACIÓN DEL <span style={{ color: 'var(--gold)' }}>SISTEMA</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <Card>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Horarios de publicación</div>
                    {[
                      { label: '📸 Instagram', sub: 'Día 1', key: 'hora_instagram', default: '19:00' },
                      { label: '🎵 TikTok + Facebook + Threads', sub: 'Día 2', key: 'hora_tiktok', default: '20:00' },
                      { label: '▶️ YouTube Shorts', sub: 'Día 3', key: 'hora_youtube', default: '10:00' },
                      { label: '💼 LinkedIn', sub: 'Día 4', key: 'hora_linkedin', default: '12:00' },
                      { label: '🐦 Twitter/X', sub: 'Día 5', key: 'hora_twitter', default: '09:00' },
                    ].map(item => (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.sub}</div>
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
                    <button onClick={saveConfig} disabled={saving} style={{
                      width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: saving ? 'var(--border)' : 'var(--gold)', color: saving ? 'var(--text2)' : '#000'
                    }}>
                      {saving ? 'Guardando...' : 'Guardar configuración'}
                    </button>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── MODAL VER COPY ── */}
      {selectedContent && (
        <div onClick={() => setSelectedContent(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, width: 600, maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* Header modal */}
            <div style={{ display: 'flex', gap: 16, padding: 20, borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
              {selectedContent.portada_vertical_path && (
                <img src={selectedContent.portada_vertical_path} alt="portada" style={{ width: 72, height: 128, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 20, letterSpacing: 1, color: 'var(--gold)', marginBottom: 8 }}>VER COPY</div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, marginBottom: 10 }}>{selectedContent.ig_titulo || selectedContent.archivo}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { label: `🎯 Gancho ${selectedContent.score_gancho}/10` },
                    { label: `💡 Claridad ${selectedContent.score_claridad}/10` },
                    { label: `📢 CTA ${selectedContent.score_cta}/10` },
                    { label: `⭐ Promedio ${selectedContent.score_promedio}/10`, green: true },
                  ].map(s => (
                    <span key={s.label} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.green ? 'rgba(45,212,160,0.15)' : 'rgba(201,168,76,0.15)', color: s.green ? 'var(--green)' : 'var(--gold)' }}>
                      {s.label}
                    </span>
                  ))}
                </div>
                {selectedContent.file_id_drive && (
                  <a href={`https://drive.google.com/file/d/${selectedContent.file_id_drive}/view`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--blue)', textDecoration: 'none' }}>
                    ▶ Ver video en Google Drive ↗
                  </a>
                )}
              </div>
              <span onClick={() => setSelectedContent(null)} style={{ cursor: 'pointer', color: 'var(--text2)', fontSize: 20, flexShrink: 0 }}>✕</span>
            </div>

            {/* Bloques por red */}
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { meta: RED_META.instagram, titulo: selectedContent.ig_titulo, desc: selectedContent.ig_descripcion, extra: selectedContent.ig_hashtags ? `#️⃣ ${selectedContent.ig_hashtags}` : '' },
                { meta: RED_META.tiktok,    titulo: selectedContent.tt_titulo,  desc: selectedContent.tt_descripcion },
                { meta: RED_META.youtube,   titulo: selectedContent.yt_titulo,  desc: selectedContent.yt_descripcion, extra: selectedContent.yt_keywords ? `🔑 ${selectedContent.yt_keywords}` : '' },
                { meta: RED_META.linkedin,  titulo: selectedContent.li_titulo,  desc: selectedContent.li_descripcion },
                { meta: RED_META.facebook,  titulo: 'Facebook',                 desc: selectedContent.fb_descripcion },
                { meta: RED_META.twitter,   titulo: selectedContent.tw_texto },
                { meta: RED_META.threads,   titulo: selectedContent.th_texto },
              ].filter(r => r.titulo || r.desc).map(r => (
                <div key={r.meta.label} style={{ background: 'var(--bg3)', borderRadius: 10, overflow: 'hidden' }}>
                  {/* Header de red */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: `${r.meta.color}18`, borderBottom: `1px solid ${r.meta.color}33` }}>
                    <span style={{ fontSize: 16 }}>{r.meta.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.meta.color, letterSpacing: 0.5, textTransform: 'uppercase' }}>{r.meta.label}</span>
                  </div>
                  {/* Contenido */}
                  <div style={{ padding: '10px 14px' }}>
                    {r.titulo && r.titulo !== r.meta.label && (
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: r.desc ? 6 : 0, lineHeight: 1.4 }}>{r.titulo}</div>
                    )}
                    {r.desc && (
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{r.desc}</div>
                    )}
                    {r.extra && (
                      <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 8, lineHeight: 1.6, wordBreak: 'break-word' }}>{r.extra}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
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
              {['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'twitter'].map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={deleteRedes.includes(r)}
                    onChange={e => setDeleteRedes(prev => e.target.checked ? [...prev, r] : prev.filter(x => x !== r))} />
                  <span>{RED_META[r]?.emoji}</span> {RED_META[r]?.label}
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

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 500, zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
