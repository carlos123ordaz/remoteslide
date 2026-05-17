import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Wordmark } from '../components/Wordmark'
import { SlideViewer } from '../components/SlideViewer'
import { useRealtime, persistSlide } from '../hooks/useRealtime'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'

const PURPLE = 'oklch(0.55 0.21 285)'
const BG = '#FAFAF7'
const FG = '#0A0A0A'
const MUTED = '#6B6B6B'
const BORDER = 'rgba(10,10,10,0.08)'
const BORDER_STRONG = 'rgba(10,10,10,0.14)'

export default function Session() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const state = location.state || {}

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(!state.fileUrl)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [phoneConnected, setPhoneConnected] = useState(false)
  const sidebarRef = useRef(null)

  const fileUrl = state.fileUrl || session?.fileUrl
  const fileType = state.fileType || session?.file_type || 'pdf'
  const slideCount = state.slideCount || session?.slide_count || 1
  const fileName = state.fileName || session?.file_name || ''
  const pptxSlides = state.pptxSlides || null

  useEffect(() => {
    if (state.fileUrl) return
    async function fetchSession() {
      const { data } = await supabase.from('sessions').select('*').eq('room_code', roomCode).single()
      if (data) {
        const { data: urlData } = supabase.storage.from('presentations').getPublicUrl(data.file_path)
        setSession({ ...data, fileUrl: urlData.publicUrl })
        setCurrentSlide(data.current_slide)
      }
      setLoading(false)
    }
    fetchSession()
  }, [roomCode, state.fileUrl])

  const { sendControl } = useRealtime({
    roomCode,
    onControl: useCallback((payload) => {
      if (payload.type === 'slide') setCurrentSlide(payload.idx)
      if (payload.type === 'phone_connected') setPhoneConnected(true)
    }, []),
  })

  const persistTimeout = useRef(null)
  useEffect(() => {
    clearTimeout(persistTimeout.current)
    persistTimeout.current = setTimeout(() => persistSlide(roomCode, currentSlide, false), 400)
  }, [roomCode, currentSlide])

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCurrentSlide((i) => Math.min(i + 1, slideCount - 1)) }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCurrentSlide((i) => Math.max(i - 1, 0)) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slideCount])

  useEffect(() => {
    if (!sidebarRef.current) return
    const el = sidebarRef.current.querySelector(`[data-thumb="${currentSlide}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentSlide])

  const remoteUrl = `${window.location.origin}/r/${roomCode}`

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG }}>
        <Spinner color={PURPLE} />
      </div>
    )
  }

  // Mobile: simplified view — just QR + current slide + nav
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: BG, color: FG }}>
        <header style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid ' + BORDER, background: '#fff', flexShrink: 0 }}>
          <Wordmark size={15} />
          <div style={{ flex: 1 }} />
          <button
            onClick={() => navigate(`/present/${roomCode}`, { state: { fileUrl, fileType, slideCount, fileName, pptxSlides, currentSlide } })}
            style={{ height: 36, padding: '0 14px', borderRadius: 6, background: FG, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Presentar →
          </button>
        </header>

        <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Slide preview */}
          <div style={{ aspectRatio: '16/10', background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid ' + BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', containerType: 'inline-size' }}>
            <SlideViewer fileType={fileType} fileUrl={fileUrl} pptxSlides={pptxSlides} slideIndex={currentSlide} />
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setCurrentSlide((i) => Math.max(i - 1, 0))}
              disabled={currentSlide === 0}
              style={{ height: 48, flex: 1, borderRadius: 8, background: '#fff', border: '1px solid ' + BORDER_STRONG, color: FG, fontFamily: 'inherit', fontSize: 20, cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', opacity: currentSlide === 0 ? 0.35 : 1 }}
            >←</button>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: MUTED, textAlign: 'center', minWidth: 60 }}>
              {currentSlide + 1} / {slideCount}
            </div>
            <button
              onClick={() => setCurrentSlide((i) => Math.min(i + 1, slideCount - 1))}
              disabled={currentSlide === slideCount - 1}
              style={{ height: 48, flex: 1, borderRadius: 8, background: FG, border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 20, cursor: currentSlide === slideCount - 1 ? 'not-allowed' : 'pointer', opacity: currentSlide === slideCount - 1 ? 0.35 : 1 }}
            >→</button>
          </div>

          {/* QR */}
          <div style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 12, padding: 20 }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 14 }}>
              Control remoto · escaneá con otro celular
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ background: '#fff', padding: 8, borderRadius: 6, border: '1px solid ' + BORDER, flexShrink: 0 }}>
                <QRCodeSVG value={remoteUrl} size={80} />
              </div>
              <div>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 18, fontWeight: 600, letterSpacing: '2px' }}>{roomCode}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{window.location.host}/r</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: phoneConnected ? '#22C55E' : PURPLE }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: MUTED, letterSpacing: '0.6px' }}>
                    {phoneConnected ? 'CELULAR CONECTADO' : 'ESPERANDO CELULAR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop: full layout with sidebar
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: BG, color: FG, overflow: 'hidden' }}>
      <header style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0, background: '#fff' }}>
        <Wordmark size={17} />
        <div style={{ marginLeft: 24, paddingLeft: 24, borderLeft: '1px solid ' + BORDER }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{fileName || 'Presentación'}</div>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Geist Mono', monospace", marginTop: 1 }}>{slideCount} slides · {roomCode}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: MUTED, fontFamily: "'Geist Mono', monospace", letterSpacing: '0.6px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: phoneConnected ? '#22C55E' : PURPLE, boxShadow: phoneConnected ? '0 0 0 3px rgba(34,197,94,0.18)' : '0 0 0 3px oklch(0.55 0.21 285 / 0.15)' }} />
          {phoneConnected ? 'CELULAR CONECTADO' : 'ESPERANDO CELULAR'}
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '248px 1fr', minHeight: 0 }}>
        {/* Sidebar */}
        <aside ref={sidebarRef} style={{ background: '#fff', borderRight: '1px solid ' + BORDER, overflowY: 'auto', padding: '14px 10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#9A9A9A' }}>Slides</div>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: MUTED, fontVariantNumeric: 'tabular-nums' }}>{currentSlide + 1} / {slideCount}</div>
          </div>
          {Array.from({ length: slideCount }).map((_, i) => {
            const selected = i === currentSlide
            return (
              <button key={i} data-thumb={i} onClick={() => setCurrentSlide(i)} style={{ display: 'flex', gap: 10, padding: '6px 6px 6px 0', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 4, textAlign: 'left', width: '100%' }}>
                <div style={{ width: 22, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: selected ? PURPLE : '#9A9A9A', fontWeight: selected ? 600 : 400, fontVariantNumeric: 'tabular-nums', textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1, aspectRatio: '16/10', borderRadius: 3, overflow: 'hidden', outline: selected ? '2px solid ' + PURPLE : '1px solid ' + BORDER, boxShadow: selected ? '0 4px 16px oklch(0.55 0.21 285 / 0.18)' : 'none', transition: 'box-shadow 0.15s' }}>
                  <SlideViewer fileType={fileType} fileUrl={fileUrl} pptxSlides={pptxSlides} slideIndex={i} />
                </div>
              </button>
            )
          })}
        </aside>

        {/* Main */}
        <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '14px 28px', borderBottom: '1px solid ' + BORDER, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '1.2px', textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 2 }}>
                Slide {String(currentSlide + 1).padStart(2, '0')} de {String(slideCount).padStart(2, '0')}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBtn onClick={() => setCurrentSlide((i) => Math.max(i - 1, 0))} disabled={currentSlide === 0}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </IconBtn>
              <IconBtn onClick={() => setCurrentSlide((i) => Math.min(i + 1, slideCount - 1))} disabled={currentSlide === slideCount - 1}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </IconBtn>
              <div style={{ width: 8 }} />
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#9A9A9A' }}>← → navegar</span>
            </div>
          </div>

          <div style={{ flex: 1, padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
            <div style={{ width: '100%', maxWidth: 'min(100%, calc((100vh - 320px) * 1.6))', aspectRatio: '16/10', background: '#fff', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)', border: '1px solid ' + BORDER, containerType: 'inline-size' }}>
              <SlideViewer fileType={fileType} fileUrl={fileUrl} pptxSlides={pptxSlides} slideIndex={currentSlide} />
            </div>
          </div>

          <div style={{ padding: '14px 28px', borderTop: '1px solid ' + BORDER, background: '#fff', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: '#fff', padding: 6, borderRadius: 6, border: '1px solid ' + BORDER, position: 'relative', opacity: phoneConnected ? 0.4 : 1, transition: 'opacity .3s' }}>
                <QRCodeSVG value={remoteUrl} size={56} />
                {phoneConnected && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l4 4 7-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{phoneConnected ? 'Celular conectado' : 'Escaneá para usar tu celular como control'}</div>
                <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Geist Mono', monospace", marginTop: 2 }}>
                  Código <span style={{ color: FG, fontWeight: 500 }}>{roomCode}</span> · {window.location.host}/r
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => navigate(`/present/${roomCode}`, { state: { fileUrl, fileType, slideCount, fileName, pptxSlides, currentSlide } })}
              style={{ height: 40, padding: '0 18px', borderRadius: 6, background: FG, color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Comenzar presentación →
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function IconBtn({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 32, height: 32, borderRadius: 6, background: disabled ? 'transparent' : '#fff', color: disabled ? '#C9C8C2' : FG, border: '1px solid ' + BORDER_STRONG, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

function Spinner({ color = '#6B6B6B' }) {
  return <span style={{ width: 20, height: 20, border: '2px solid ' + BORDER_STRONG, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'block' }} />
}
