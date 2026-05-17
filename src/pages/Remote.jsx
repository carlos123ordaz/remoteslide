import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { SlideViewer } from '../components/SlideViewer'
import { useRealtime } from '../hooks/useRealtime'
import { supabase } from '../lib/supabase'
import { parsePPTX } from '../lib/pptxParser'

const PURPLE = 'oklch(0.55 0.21 285)'
const BG = '#FAFAF7'
const FG = '#0A0A0A'
const MUTED = '#6B6B6B'
const BORDER = 'rgba(10,10,10,0.08)'
const BORDER_STRONG = 'rgba(10,10,10,0.14)'

function useElapsed(startedAt) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.floor((now - startedAt) / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function Remote() {
  const { roomCode } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [blackout, setBlackout] = useState(false)
  const [pptxSlides, setPptxSlides] = useState(null)
  const [startedAt] = useState(() => Date.now())
  const elapsed = useElapsed(startedAt)

  // Load session from DB
  useEffect(() => {
    async function load() {
      const { data, error: err } = await supabase
        .from('sessions')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (err || !data) {
        setError('Sesión no encontrada. Verificá el código e intentá de nuevo.')
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('presentations').getPublicUrl(data.file_path)
      const sess = { ...data, fileUrl: urlData.publicUrl }
      setSession(sess)
      setCurrentSlide(data.current_slide)
      setBlackout(data.is_blackout)

      // Parse PPTX if needed
      if (data.file_type === 'pptx') {
        try {
          const resp = await fetch(urlData.publicUrl)
          const blob = await resp.blob()
          const slides = await parsePPTX(blob)
          setPptxSlides(slides)
        } catch (e) {
          console.warn('PPTX parse failed:', e)
        }
      }

      setLoading(false)
    }
    load()
  }, [roomCode])

  // Send control commands to the desktop
  const { sendControl } = useRealtime({
    roomCode,
    onControl: useCallback((payload) => {
      // Remote also syncs if desktop changes slide (e.g. someone clicks on desktop)
      if (payload.type === 'slide') setCurrentSlide(payload.idx)
      if (payload.type === 'blackout') setBlackout(payload.active)
    }, []),
  })

  // Announce presence when connected
  useEffect(() => {
    if (!session) return
    sendControl({ type: 'phone_connected' })
  }, [session, sendControl])

  function goToSlide(idx) {
    const clamped = Math.max(0, Math.min(idx, (session?.slide_count || 1) - 1))
    setCurrentSlide(clamped)
    sendControl({ type: 'slide', idx: clamped })
    // Persist to DB
    supabase.from('sessions').update({ current_slide: clamped }).eq('room_code', roomCode)
  }

  function toggleBlackout() {
    const next = !blackout
    setBlackout(next)
    sendControl({ type: 'blackout', active: next })
    supabase.from('sessions').update({ is_blackout: next }).eq('room_code', roomCode)
  }

  const slideCount = session?.slide_count || 1
  const isFirst = currentSlide === 0
  const isLast = currentSlide >= slideCount - 1
  const nextIdx = Math.min(currentSlide + 1, slideCount - 1)
  const fileUrl = session?.fileUrl
  const fileType = session?.file_type || 'pdf'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <Spinner />
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
          CARGANDO SESIÓN {roomCode}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Sesión no encontrada</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#0A0A0A', color: '#fff', fontFamily: "'Geist', system-ui, sans-serif", overflowY: 'hidden' }}>
      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }} />
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.8px', color: 'rgba(255,255,255,0.65)' }}>
            EN VIVO · {roomCode}
          </span>
        </div>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{elapsed}</div>
      </div>

      {/* Current slide preview */}
      <div style={{ margin: '0 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', aspectRatio: '16/10', background: '#000', flexShrink: 0, containerType: 'inline-size' }}>
        {blackout ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.2px' }}>
            PANTALLA EN NEGRO
          </div>
        ) : (
          <SlideViewer fileType={fileType} fileUrl={fileUrl} pptxSlides={pptxSlides} slideIndex={currentSlide} />
        )}
        <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '3px 7px', borderRadius: 4 }}>
          ACTUAL · {String(currentSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
        </div>
      </div>

      {/* Slide title + next up */}
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Slide actual</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {pptxSlides?.[currentSlide]?.title || `Slide ${currentSlide + 1}`}
          </div>
        </div>
        {!isLast && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: 150, flexShrink: 0 }}>
            <div style={{ width: 56, aspectRatio: '16/10', borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#fff', containerType: 'inline-size' }}>
              <SlideViewer fileType={fileType} fileUrl={fileUrl} pptxSlides={pptxSlides} slideIndex={nextIdx} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Siguiente</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {pptxSlides?.[nextIdx]?.title || `Slide ${nextIdx + 1}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes placeholder */}
      <div style={{ margin: '14px 20px 0', padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
          Notas del presentador
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', minHeight: 36 }}>
          {pptxSlides?.[currentSlide]?.bodyTexts?.[0] || 'Sin notas para este slide.'}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexShrink: 0 }}>
        {[
          { l: 'Slide 1', i: '↑', onClick: () => goToSlide(0) },
          { l: blackout ? 'Volver' : 'En negro', i: '◐', active: blackout, onClick: toggleBlackout },
          { l: `Ir a… ${String(currentSlide + 1).padStart(2, '0')}`, i: '▦', onClick: null },
        ].map((b, i) => (
          <button
            key={i}
            onClick={b.onClick || undefined}
            disabled={!b.onClick}
            style={{
              flex: 1, height: 40,
              background: b.active ? '#fff' : 'rgba(255,255,255,0.06)',
              color: b.active ? '#0A0A0A' : 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, fontFamily: 'inherit', fontSize: 12,
              fontWeight: 500, cursor: b.onClick ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: b.onClick ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: 10, opacity: 0.7 }}>{b.i}</span> {b.l}
          </button>
        ))}
      </div>

      {/* Slide grid picker (mini) */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }} />

      {/* Main nav controls */}
      <div style={{ padding: '10px 20px 28px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => goToSlide(currentSlide - 1)}
          disabled={isFirst}
          style={{
            width: 64, height: 64, borderRadius: 32,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 22, cursor: isFirst ? 'not-allowed' : 'pointer',
            opacity: isFirst ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ←
        </button>

        <button
          onClick={() => goToSlide(currentSlide + 1)}
          disabled={isLast}
          style={{
            flex: 1, height: 64, borderRadius: 32,
            background: isLast ? PURPLE : '#fff',
            color: isLast ? '#fff' : '#0A0A0A',
            border: 'none', fontFamily: 'inherit',
            fontSize: 15, fontWeight: 600, letterSpacing: '0.4px',
            cursor: isLast ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isLast ? 'FIN' : 'SIGUIENTE'}
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: isLast ? 'rgba(255,255,255,0.7)' : '#6B6B6B' }}>
            {isLast ? '✓' : `${String(currentSlide + 1).padStart(2, '0')} → ${String(currentSlide + 2).padStart(2, '0')}`}
          </span>
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ width: 28, height: 28, border: '2.5px solid rgba(255,255,255,0.15)', borderTopColor: PURPLE, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  )
}
