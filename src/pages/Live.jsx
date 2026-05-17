import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { SlideViewer } from '../components/SlideViewer'
import { useRealtime, persistSlide } from '../hooks/useRealtime'
import { supabase } from '../lib/supabase'

const PURPLE = 'oklch(0.55 0.21 285)'

export default function Live() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}

  const [currentSlide, setCurrentSlide] = useState(state.currentSlide || 0)
  const [blackout, setBlackout] = useState(false)
  const [showChrome, setShowChrome] = useState(true)
  const [session, setSession] = useState(null)
  const chromeTimer = useRef(null)

  const fileUrl = state.fileUrl || session?.fileUrl
  const fileType = state.fileType || session?.file_type || 'pdf'
  const slideCount = state.slideCount || session?.slide_count || 1
  const pptxSlides = state.pptxSlides || null

  // Fetch session if needed
  useEffect(() => {
    if (state.fileUrl) return
    supabase
      .from('sessions')
      .select('*')
      .eq('room_code', roomCode)
      .single()
      .then(({ data }) => {
        if (data) {
          const { data: urlData } = supabase.storage.from('presentations').getPublicUrl(data.file_path)
          setSession({ ...data, fileUrl: urlData.publicUrl })
          setCurrentSlide(data.current_slide)
        }
      })
  }, [roomCode, state.fileUrl])

  // Real-time: receive commands from the phone remote
  const { sendControl } = useRealtime({
    roomCode,
    onControl: useCallback((payload) => {
      if (payload.type === 'slide') {
        setCurrentSlide(payload.idx)
        bumpChrome()
      }
      if (payload.type === 'blackout') {
        setBlackout(payload.active)
      }
    }, []),
  })

  // Chrome auto-hide
  const bumpChrome = useCallback(() => {
    setShowChrome(true)
    clearTimeout(chromeTimer.current)
    chromeTimer.current = setTimeout(() => setShowChrome(false), 2500)
  }, [])

  useEffect(() => {
    bumpChrome()
    return () => clearTimeout(chromeTimer.current)
  }, [bumpChrome])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        setCurrentSlide((i) => {
          const next = Math.min(i + 1, slideCount - 1)
          persistSlide(roomCode, next, blackout)
          return next
        })
        bumpChrome()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrentSlide((i) => {
          const prev = Math.max(i - 1, 0)
          persistSlide(roomCode, prev, blackout)
          return prev
        })
        bumpChrome()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        navigate(`/session/${roomCode}`, { state })
      } else if (e.key === 'b' || e.key === 'B' || e.key === '.') {
        e.preventDefault()
        setBlackout((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slideCount, roomCode, blackout, navigate, state, bumpChrome])

  // Click to advance (right half = next, left half = prev)
  function onClickArea(e) {
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    if (x > r.width * 0.5) {
      setCurrentSlide((i) => Math.min(i + 1, slideCount - 1))
    } else {
      setCurrentSlide((i) => Math.max(i - 1, 0))
    }
    bumpChrome()
  }

  const pct = ((currentSlide + 1) / slideCount) * 100

  return (
    <div
      onMouseMove={bumpChrome}
      style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', cursor: showChrome ? 'default' : 'none' }}
    >
      {/* Slide */}
      <div onClick={onClickArea} style={{ width: '100%', height: '100%', cursor: 'pointer', containerType: 'inline-size' }}>
        {blackout ? (
          <div style={{ width: '100%', height: '100%', background: '#000' }} />
        ) : (
          <SlideViewer
            fileType={fileType}
            fileUrl={fileUrl}
            pptxSlides={pptxSlides}
            slideIndex={currentSlide}
          />
        )}
      </div>

      {/* Top chrome */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(rgba(0,0,0,0.35), transparent)',
        opacity: showChrome ? 1 : 0, transition: 'opacity .3s',
        pointerEvents: showChrome ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '1.2px', color: 'rgba(255,255,255,0.8)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }} />
          <span>{String(currentSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}</span>
          {blackout && <span style={{ color: 'rgba(255,255,255,0.5)' }}>· PANTALLA EN NEGRO</span>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/session/${roomCode}`, { state }) }}
          style={{
            height: 34, padding: '0 14px', borderRadius: 6,
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.16)',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Finalizar presentación
        </button>
      </div>

      {/* Bottom chrome */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 24px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.35))',
        opacity: showChrome ? 1 : 0, transition: 'opacity .3s',
        pointerEvents: showChrome ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.8px', color: 'rgba(255,255,255,0.5)' }}>
          <Kbd>←</Kbd> <Kbd>→</Kbd> navegar · <Kbd>B</Kbd> negro · <Kbd>Esc</Kbd> salir
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <LiveArrow
            disabled={currentSlide === 0}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide((i) => Math.max(i - 1, 0)); bumpChrome() }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </LiveArrow>
          <LiveArrow
            disabled={currentSlide === slideCount - 1}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide((i) => Math.min(i + 1, slideCount - 1)); bumpChrome() }}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </LiveArrow>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}>
        <div style={{ width: pct + '%', height: '100%', background: PURPLE, transition: 'width .3s ease' }} />
      </div>
    </div>
  )
}

function Kbd({ children }) {
  return (
    <kbd style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 18, height: 18, padding: '0 5px',
      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 3, fontFamily: "'Geist Mono', monospace", fontSize: 10,
      color: 'rgba(255,255,255,0.85)', margin: '0 2px',
    }}>
      {children}
    </kbd>
  )
}

function LiveArrow({ children, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 36, height: 36, borderRadius: 18,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        color: '#fff', border: '1px solid rgba(255,255,255,0.16)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  )
}
