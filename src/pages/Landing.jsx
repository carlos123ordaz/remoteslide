import { useNavigate } from 'react-router-dom'
import { Wordmark } from '../components/Wordmark'
import { useIsMobile } from '../hooks/useIsMobile'
import { supabase } from '../lib/supabase'

const PURPLE = 'oklch(0.55 0.21 285)'
const BG = '#FAFAF7'
const FG = '#0A0A0A'
const MUTED = '#6B6B6B'
const BORDER = 'rgba(10,10,10,0.08)'
const BORDER_STRONG = 'rgba(10,10,10,0.14)'

const btnPrimary = {
  height: 34, padding: '0 14px', borderRadius: 6,
  background: FG, color: '#fff', border: 'none',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
const btnGhost = {
  height: 34, padding: '0 12px', borderRadius: 6,
  background: 'transparent', color: FG, border: '1px solid ' + BORDER_STRONG,
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}

export default function Landing({ user }) {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: BG, color: FG }}>
      {/* Nav */}
      <header style={{
        height: 56,
        display: 'flex', alignItems: 'center',
        padding: isMobile ? '0 20px' : '0 32px',
        borderBottom: '1px solid ' + BORDER,
        background: 'rgba(250,250,247,0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Wordmark size={16} />
        {!isMobile && (
          <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 28, marginLeft: 40, fontSize: 13, color: MUTED }}>
            <span style={{ cursor: 'pointer' }}>Cómo funciona</span>
            <span style={{ cursor: 'pointer' }}>Precios</span>
          </nav>
        )}
        <div style={{ flex: isMobile ? 1 : 'unset' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <button onClick={() => navigate('/dashboard')} style={btnGhost}>Mi cuenta</button>
          ) : (
            !isMobile && <button onClick={handleGoogleLogin} style={btnGhost}><GoogleIcon />Iniciar sesión</button>
          )}
          <button onClick={() => navigate('/upload')} style={btnPrimary}>
            {isMobile ? 'Empezar' : 'Subir presentación'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.05fr 1fr',
        gap: isMobile ? 0 : 64,
        padding: isMobile ? '48px 24px 56px' : '88px max(64px, 8vw) 64px',
        alignItems: 'center',
        maxWidth: 1440,
        margin: '0 auto',
        width: '100%',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 11px', borderRadius: 999,
            border: '1px solid ' + BORDER_STRONG,
            fontSize: 11, color: MUTED, marginBottom: isMobile ? 24 : 32,
            fontFamily: "'Geist Mono', monospace",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE }} />
            v1.0 · sube, escanea y presenta
          </div>

          <h1 style={{
            fontSize: isMobile ? 42 : 'clamp(48px, 5.4vw, 72px)',
            fontWeight: 600,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            margin: 0,
          }}>
            Tu celular es el<br />control remoto<br />de tus slides.
          </h1>

          <p style={{ fontSize: isMobile ? 16 : 18, color: MUTED, lineHeight: 1.5, marginTop: isMobile ? 20 : 24, maxWidth: 480 }}>
            Subí tu PDF, escaneá un QR y presentá desde cualquier pantalla. Sin instalar nada, sin cables, en tiempo real.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: isMobile ? 24 : 32, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/upload')}
              style={{ ...btnPrimary, height: isMobile ? 48 : 46, padding: '0 22px', fontSize: 15, flex: isMobile ? 1 : 'unset' }}
            >
              Subir presentación →
            </button>
            {!user && !isMobile && (
              <button onClick={handleGoogleLogin} style={{ ...btnGhost, height: 46, padding: '0 18px', fontSize: 15 }}>
                <GoogleIcon />Entrar con Google
              </button>
            )}
          </div>

          <div style={{
            marginTop: isMobile ? 32 : 44,
            display: 'flex', gap: isMobile ? 20 : 32, flexWrap: 'wrap',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11, letterSpacing: '1.2px',
            textTransform: 'uppercase', color: '#9A9A9A',
          }}>
            <span>Solo PDF</span>
            <span>Sin instalar</span>
            <span>Tiempo real</span>
          </div>
        </div>

        {/* Hero visual — solo en desktop */}
        {!isMobile && <HeroVisual />}
      </main>

      {/* Logo strip */}
      {!isMobile && (
        <section style={{ borderTop: '1px solid ' + BORDER, padding: '24px max(64px, 8vw)' }}>
          <div style={{
            maxWidth: 1440, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#9A9A9A',
          }}>
            <span>Funciona en</span>
            <span>Teams</span><span>Zoom</span><span>Meet</span><span>Webex</span><span>Anywhere</span>
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ background: '#fff', borderTop: '1px solid ' + BORDER, padding: isMobile ? '48px 24px' : '80px max(64px, 8vw)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '1.4px', textTransform: 'uppercase', color: PURPLE, marginBottom: 12 }}>
            Cómo funciona
          </div>
          <h2 style={{ fontSize: isMobile ? 26 : 'clamp(32px, 3.4vw, 44px)', fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 36px', lineHeight: 1.05 }}>
            Tres pasos. Sin cables, sin Bluetooth.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 32 : 32 }}>
            {[
              { n: '01', t: 'Subí tu archivo', d: 'PDF. Lo procesamos y generamos un código QR único para tu sesión.' },
              { n: '02', t: 'Escaneá el QR', d: 'Tu celular se vuelve el control remoto. La presentación se proyecta en tu pantalla.' },
              { n: '03', t: 'Presentá tranquilo', d: 'Slide actual, vista previa de la siguiente y timer — todo en tu mano.' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: isMobile ? 16 : 0, flexDirection: isMobile ? 'row' : 'column' }}>
                <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#9A9A9A', marginBottom: isMobile ? 0 : 16, minWidth: 28, paddingTop: isMobile ? 2 : 0 }}>{f.n}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.015em', marginBottom: 6 }}>{f.t}</div>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: 0 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth CTA */}
      {!user && (
        <section style={{ padding: isMobile ? '40px 24px' : '64px max(64px, 8vw)', borderTop: '1px solid ' + BORDER }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 24 : 0 }}>
            <div>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                Guardá tus presentaciones.
              </h2>
              <p style={{ fontSize: 14, color: MUTED, margin: 0, maxWidth: 480 }}>
                Sin cuenta, la sesión dura 24 horas. Con Google, tus presentaciones se guardan indefinidamente.
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              style={{ ...btnPrimary, height: 46, padding: '0 22px', fontSize: 15, flexShrink: 0, marginLeft: isMobile ? 0 : 40, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
            >
              <GoogleIcon color="#fff" />
              Entrar con Google — gratis
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '24px 20px' : '28px max(64px, 8vw)',
        borderTop: '1px solid ' + BORDER,
        fontSize: 12, color: MUTED,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>© 2025 RemoteSlides</span>
        <span style={{ fontFamily: "'Geist Mono', monospace" }}>v1.0</span>
      </footer>
    </div>
  )
}

function HeroVisual() {
  const FG = '#0A0A0A', BG = '#FAFAF7', PURPLE = 'oklch(0.55 0.21 285)'
  return (
    <div style={{ position: 'relative', aspectRatio: '1/0.85', minHeight: 420 }}>
      <div style={{ position: 'absolute', top: '4%', left: '6%', right: '14%', bottom: '22%', background: FG, borderRadius: 14, padding: 10, boxShadow: '0 40px 80px -28px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MockSlide />
        </div>
      </div>
      <div style={{ position: 'absolute', left: '0%', right: '8%', top: 'calc(78%)', height: 12, background: FG, borderRadius: '0 0 10px 10px' }} />
      <div style={{ position: 'absolute', bottom: '0%', right: '0%', width: '36%', aspectRatio: '0.48/1', background: FG, borderRadius: 28, padding: 8, boxShadow: '0 28px 50px -10px rgba(0,0,0,0.32)' }}>
        <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 22, background: FG, borderRadius: '0 0 14px 14px', margin: '0 32%' }} />
          <div style={{ padding: '10px 10px 0', fontFamily: "'Geist Mono', monospace", fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#9A9A9A' }}>01 / 05 · Portada</div>
          <div style={{ margin: '8px 10px 0', aspectRatio: '16/10', background: BG, borderRadius: 4, overflow: 'hidden' }}><MockSlide small /></div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 4, padding: 10 }}>
            <div style={{ flex: 1, height: 38, background: BG, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>←</div>
            <div style={{ flex: 2, height: 38, background: FG, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>SIGUIENTE</div>
          </div>
          <div style={{ height: 3, width: 40, background: FG, borderRadius: 2, margin: '0 auto 8px' }} />
        </div>
      </div>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 64 60 Q 72 72, 78 80" stroke={PURPLE} strokeWidth="0.25" strokeDasharray="0.7 0.7" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

function MockSlide({ small }) {
  const FG = '#0A0A0A'
  return (
    <div style={{ width: '100%', height: '100%', background: FG, display: 'flex', flexDirection: 'column', padding: small ? '8%' : '7%', justifyContent: 'space-between' }}>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: small ? 5 : 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>RemoteSlides · Demo</div>
      <div>
        <div style={{ fontSize: small ? 10 : 18, fontWeight: 600, color: '#fff', lineHeight: 1, marginBottom: small ? 4 : 8 }}>Tu presentación</div>
        <div style={{ fontSize: small ? 6 : 11, color: 'rgba(255,255,255,0.5)' }}>Enero 2025 · 5 slides</div>
      </div>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: small ? 4 : 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>01 / 05</div>
    </div>
  )
}

function GoogleIcon({ color = '#0A0A0A' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
