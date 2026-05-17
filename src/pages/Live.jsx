import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { SlideViewer } from '../components/SlideViewer'
import { useRealtime, persistSlide } from '../hooks/useRealtime'
import { supabase } from '../lib/supabase'

const PURPLE = 'oklch(0.55 0.21 285)'

function exitPresentation(roomCode, state, navigate) {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  }
  navigate(`/session/${roomCode}`, { state })
}

export default function Live() {
  const { roomCode } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state || {}
  const containerRef = useRef(null)

  const [currentSlide, setCurrentSlide] = useState(state.currentSlide || 0)
  const [blackout, setBlackout] = useState(false)
  const [showChrome, setShowChrome] = useState(false)
  const [session, setSession] = useState(null)
  const chromeTimer = useRef(null)

  const fileUrl = state.fileUrl || session?.fileUrl
  const fileType = state.fileType || session?.file_type || 'pdf'
  const slideCount = state.slideCount || session?.slide_count || 1
  const pptxSlides = state.pptxSlides || null

  // Enter fullscreen on mount
  useEffect(() => {
    const el = containerRef.current || document.documentElement
    el.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {})

    // When fullscreen is exited (Esc or programmatic), go back to session
    const onFsChange = () => {
      if (!document.fullscreenElement) {
        navigate(`/session/${roomCode}`, { state })
      }
    }
    document.addEventListener('fullscreenchange', onFsChange)

    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch session if not passed via state
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

  // Chrome auto-hide (shows briefly on mouse move, hides after 2s)
  const bumpChrome = useCallback(() => {
    setShowChrome(true)
    clearTimeout(chromeTimer.current)
    chromeTimer.current = setTimeout(() => setShowChrome(false), 2000)
  }, [])

  useEffect(() => {
    return () => clearTimeout(chromeTimer.current)
  }, [])

  // Keyboard navigation — Escape is handled natively by the browser to exit fullscreen
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
      } else if (e.key === 'b' || e.key === 'B' || e.key === '.') {
        e.preventDefault()
        setBlackout((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slideCount, roomCode, blackout, bumpChrome])

  // Click to advance: right half → next, left half → prev
  function onClickArea(e) {
    const r = e.currentTarget.getBoundingClientRect()
    if (e.clientX - r.left > r.width * 0.5) {
      setCurrentSlide((i) => Math.min(i + 1, slideCount - 1))
    } else {
      setCurrentSlide((i) => Math.max(i - 1, 0))
    }
    bumpChrome()
  }

  const pct = ((currentSlide + 1) / slideCount) * 100

  return (
    <div
      ref={containerRef}
      onMouseMove={bumpChrome}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
        cursor: showChrome ? 'default' : 'none',
      }}
    >
      {/* Slide — full bleed, click to navigate */}
      <div
        onClick={onClickArea}
        style={{ width: '100%', height: '100%', cursor: 'inherit', containerType: 'inline-size' }}
      >
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

      {/* Overlay chrome — fades in on mouse move, fades out after 2s */}
      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: showChrome ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: showChrome ? 'auto' : 'none',
        }}
      >
        {/* Top: slide counter + hint */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '20px 28px',
          background: 'linear-gradient(rgba(0,0,0,0.5) 0%, transparent 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: "'Geist Mono', monospace", fontSize: 12,
            letterSpacing: '1px', color: 'rgba(255,255,255,0.75)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)' }} />
            <span>{String(currentSlide + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}</span>
            {blackout && <span style={{ color: 'rgba(255,255,255,0.4)' }}>· EN NEGRO</span>}
          </div>
          <div style={{
            fontFamily: "'Geist Mono', monospace", fontSize: 11,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.6px',
          }}>
            <Kbd>Esc</Kbd> salir · <Kbd>B</Kbd> negro
          </div>
        </div>

        {/* Bottom: nav arrows only */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '20px 28px 24px',
          background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.5) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
        }}>
          <LiveArrow
            disabled={currentSlide === 0}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide((i) => Math.max(i - 1, 0)); bumpChrome() }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LiveArrow>
          <LiveArrow
            disabled={currentSlide === slideCount - 1}
            onClick={(e) => { e.stopPropagation(); setCurrentSlide((i) => Math.min(i + 1, slideCount - 1)); bumpChrome() }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LiveArrow>
        </div>
      </div>

      {/* Progress bar — always visible, very subtle */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }}>
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
      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 3, fontFamily: "'Geist Mono', monospace", fontSize: 10,
      color: 'rgba(255,255,255,0.6)', margin: '0 2px',
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
        width: 38, height: 38, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        color: '#fff', border: '1px solid rgba(255,255,255,0.14)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.25 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.15s',
      }}
    >
      {children}
    </button>
  )
}
