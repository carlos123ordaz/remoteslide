import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Wordmark'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useIsMobile'

const PURPLE = 'oklch(0.55 0.21 285)'
const BG = '#FAFAF7'
const FG = '#0A0A0A'
const MUTED = '#6B6B6B'
const BORDER = 'rgba(10,10,10,0.08)'
const BORDER_STRONG = 'rgba(10,10,10,0.14)'

export default function Dashboard({ user }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [presentations, setPresentations] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    async function load() {
      const [presResult, sessResult] = await Promise.all([
        supabase.from('presentations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ])
      setPresentations(presResult.data || [])
      setSessions(sessResult.data || [])
      setLoading(false)
    }
    load()
  }, [user, navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  async function resumeSession(session) {
    const { data: urlData } = supabase.storage.from('presentations').getPublicUrl(session.file_path)
    navigate(`/session/${session.room_code}`, {
      state: {
        fileUrl: urlData.publicUrl,
        fileType: session.file_type,
        slideCount: session.slide_count,
        fileName: session.file_name,
      },
    })
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: BG, color: FG }}>
      {/* Header */}
      <header style={{ height: isMobile ? 52 : 60, display: 'flex', alignItems: 'center', padding: isMobile ? '0 20px' : '0 32px', borderBottom: '1px solid ' + BORDER, background: 'rgba(250,250,247,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Wordmark size={isMobile ? 15 : 17} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid ' + BORDER }} />
              )}
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user.user_metadata?.full_name || user.email}</span>
            </div>
          )}
          {isMobile && user.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid ' + BORDER }} />
          )}
          <button
            onClick={handleSignOut}
            style={{ height: 32, padding: '0 12px', borderRadius: 6, background: 'transparent', color: FG, border: '1px solid ' + BORDER_STRONG, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
          >
            Salir
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '28px 20px' : '48px 32px' }}>
        {/* Welcome */}
        <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 0, marginBottom: isMobile ? 32 : 48 }}>
          <div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: PURPLE, marginBottom: 8 }}>
              Tu cuenta
            </div>
            <h1 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 600, letterSpacing: '-0.025em', margin: 0 }}>
              Hola, {user.user_metadata?.given_name || 'presenter'}.
            </h1>
          </div>
          <button
            onClick={() => navigate('/upload')}
            style={{ height: isMobile ? 44 : 42, padding: '0 20px', borderRadius: 6, background: FG, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}
          >
            Nueva presentación →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: MUTED, fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>
            Cargando…
          </div>
        ) : (
          <>
            {/* Presentations history */}
            <section style={{ marginBottom: isMobile ? 32 : 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>Mis presentaciones</h2>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: MUTED }}>{presentations.length} archivos</div>
              </div>

              {presentations.length === 0 ? (
                <div style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, padding: isMobile ? '32px 20px' : '48px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, color: MUTED, marginBottom: 16 }}>Aún no subiste ninguna presentación.</div>
                  <button onClick={() => navigate('/upload')} style={{ height: 38, padding: '0 18px', borderRadius: 6, background: FG, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    Subir ahora →
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {presentations.map((p) => (
                    <div
                      key={p.id}
                      style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, padding: isMobile ? 16 : 20, cursor: 'pointer', transition: 'border-color 0.15s', position: 'relative' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = BORDER_STRONG}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <FileTypeBadge type={p.file_type} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title || p.file_name}
                          </div>
                          <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Geist Mono', monospace", marginTop: 4 }}>
                            {p.slide_count} slides · {formatDate(p.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button
                          onClick={() => navigate('/upload')}
                          style={{ flex: 1, height: isMobile ? 38 : 32, borderRadius: 6, background: BG, color: FG, border: '1px solid ' + BORDER, fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                        >
                          Presentar de nuevo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Active sessions */}
            {sessions.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>Sesiones recientes</h2>
                </div>
                <div style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, overflow: 'hidden' }}>
                  {sessions.map((s, i) => (
                    <div
                      key={s.id}
                      style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 16, padding: isMobile ? '12px 16px' : '14px 20px', borderTop: i ? '1px solid ' + BORDER : 'none' }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.is_active ? '#22C55E' : BORDER_STRONG, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.file_name}</div>
                        <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>
                          {s.room_code} · {formatDate(s.created_at)}
                        </div>
                      </div>
                      {!isMobile && (
                        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: MUTED }}>
                          {s.slide_count} slides
                        </div>
                      )}
                      {s.is_active && (
                        <button
                          onClick={() => resumeSession(s)}
                          style={{ height: isMobile ? 34 : 30, padding: '0 12px', borderRadius: 6, background: FG, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}
                        >
                          Retomar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function FileTypeBadge({ type }) {
  const PURPLE = 'oklch(0.55 0.21 285)'
  const BORDER_STRONG = 'rgba(10,10,10,0.14)'
  const BG = '#FAFAF7'
  return (
    <div style={{ width: 36, height: 44, background: BG, border: '1px solid ' + BORDER_STRONG, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 9, fontWeight: 700, color: PURPLE, flexShrink: 0 }}>
      {(type || 'PDF').toUpperCase()}
    </div>
  )
}
