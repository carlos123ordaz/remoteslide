// Platform — full-bleed, step-routed prototype.
// One App component owns the step state and renders the right page
// + floating phone overlay. The phone really drives the deck.

const PLAT_PURPLE = 'oklch(0.55 0.21 285)';
const PLAT_BG = '#FAFAF7';
const PLAT_FG = '#0A0A0A';
const PLAT_MUTED = '#6B6B6B';
const PLAT_BORDER = 'rgba(10,10,10,0.08)';
const PLAT_BORDER_STRONG = 'rgba(10,10,10,0.14)';

// ─── Top nav ────────────────────────────────────────────────────────
function TopNav({ step }) {
  return (
    <header style={{
      height: 60, display: 'flex', alignItems: 'center',
      padding: '0 32px', borderBottom: '1px solid ' + PLAT_BORDER,
      background: 'rgba(250,250,247,0.85)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 50, flexShrink: 0,
    }}>
      <Wordmark size={17} />
      <nav style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 28, marginLeft: 40, fontSize: 13, color: PLAT_MUTED }}>
        <span>Producto</span>
        <span>Cómo funciona</span>
        <span>Precios</span>
        <span>Soporte</span>
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={navGhost}>Iniciar sesión</button>
        <button style={navPrimary}>Empezar</button>
      </div>
    </header>
  );
}
const navPrimary = { height: 34, padding: '0 14px', borderRadius: 6, background: PLAT_FG, color: '#fff', border: 'none', fontFamily: RS_FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const navGhost = { height: 34, padding: '0 12px', borderRadius: 6, background: 'transparent', color: PLAT_FG, border: '1px solid ' + PLAT_BORDER_STRONG, fontFamily: RS_FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer' };

// ─── Step indicator (appears on upload/session) ─────────────────────
function StepIndicator({ current }) {
  const steps = [
    { k: 'upload', l: '1 · Subir archivo' },
    { k: 'session', l: '2 · Conectar celular' },
    { k: 'live', l: '3 · Presentar' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
      {steps.map((s, i) => {
        const active = s.k === current;
        const done = steps.findIndex(x => x.k === current) > i;
        return (
          <React.Fragment key={s.k}>
            {i > 0 && <div style={{ width: 24, height: 1, background: PLAT_BORDER_STRONG }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: active ? PLAT_FG : (done ? PLAT_MUTED : '#BABAB4') }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: active ? PLAT_FG : (done ? PLAT_FG : 'transparent'),
                border: '1px solid ' + (active || done ? PLAT_FG : PLAT_BORDER_STRONG),
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontFamily: RS_MONO, fontWeight: 600,
              }}>
                {done ? '✓' : s.l[0]}
              </span>
              <span>{s.l.slice(4)}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── 1 · LANDING (platform) ─────────────────────────────────────────
function PageLanding({ onStart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: PLAT_BG, fontFamily: RS_FONT, color: PLAT_FG }}>
      <TopNav step="landing" />
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 64, padding: '88px max(64px, 8vw) 64px', alignItems: 'center', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 999, border: '1px solid ' + PLAT_BORDER_STRONG, fontSize: 12, color: PLAT_MUTED, marginBottom: 32, fontFamily: RS_MONO }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLAT_PURPLE }} />
            v2.4 · ahora con notas del presentador
          </div>
          <h1 style={{ fontSize: 'clamp(48px, 5.4vw, 72px)', fontWeight: 600, lineHeight: 0.98, letterSpacing: -0.035 + 'em', margin: 0, textWrap: 'balance' }}>
            Tu celular es el control remoto de tus slides.
          </h1>
          <p style={{ fontSize: 18, color: PLAT_MUTED, lineHeight: 1.5, marginTop: 24, maxWidth: 480 }}>
            Subí tu PPT o PDF, escaneá un QR y presentá desde cualquier pantalla. Sin instalar nada, sin cables, en tiempo real.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
            <button onClick={onStart} style={{ ...navPrimary, height: 46, padding: '0 22px', fontSize: 15 }}>
              Subir presentación →
            </button>
            <button style={{ ...navGhost, height: 46, padding: '0 18px', fontSize: 15 }}>Ver demo (45s)</button>
          </div>
          <div style={{ marginTop: 44, display: 'flex', gap: 32, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A' }}>
            <span>PPTX · PDF · KEY</span>
            <span>Sin instalar</span>
            <span>Latencia &lt; 80ms</span>
          </div>
        </div>

        {/* Hero: laptop + phone composition */}
        <div style={{ position: 'relative', aspectRatio: '1/0.85', minHeight: 420 }}>
          <div style={{ position: 'absolute', top: '4%', left: '6%', right: '14%', bottom: '22%', background: PLAT_FG, borderRadius: 14, padding: 10, boxShadow: '0 40px 80px -28px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
              <Slide index={2} total={8} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: '0%', right: '8%', top: 'calc(78% + 0px)', height: 12, background: PLAT_FG, borderRadius: '0 0 10px 10px' }} />

          <div style={{ position: 'absolute', bottom: '0%', right: '0%', width: '36%', aspectRatio: '0.48/1', background: PLAT_FG, borderRadius: 28, padding: 8, boxShadow: '0 28px 50px -10px rgba(0,0,0,0.32)' }}>
            <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 22, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 22, background: PLAT_FG, borderRadius: '0 0 14px 14px', margin: '0 32%' }} />
              <div style={{ padding: '10px 10px 0', fontFamily: RS_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: '#9A9A9A' }}>
                03 / 08 · Resumen
              </div>
              <div style={{ margin: '8px 10px 0', aspectRatio: '16/10', background: PLAT_BG, borderRadius: 4, overflow: 'hidden' }}>
                <Slide index={2} total={8} />
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 4, padding: 10 }}>
                <div style={{ flex: 1, height: 38, background: PLAT_BG, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>←</div>
                <div style={{ flex: 2, height: 38, background: PLAT_FG, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>SIGUIENTE</div>
              </div>
              <div style={{ height: 3, width: 40, background: PLAT_FG, borderRadius: 2, margin: '0 auto 8px' }} />
            </div>
          </div>

          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 64 60 Q 72 72, 78 80" stroke={PLAT_PURPLE} strokeWidth="0.25" strokeDasharray="0.7 0.7" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </main>

      {/* Logo strip */}
      <section style={{ borderTop: '1px solid ' + PLAT_BORDER, padding: '24px max(64px, 8vw)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: '#9A9A9A' }}>
          <span>Usado en sesiones de</span>
          <span>Vercel</span><span>Linear</span><span>Pitch</span><span>Notion</span><span>Loom</span><span>Figma</span>
        </div>
      </section>

      {/* Feature row */}
      <section style={{ background: '#fff', borderTop: '1px solid ' + PLAT_BORDER, padding: '80px max(64px, 8vw)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: PLAT_PURPLE, marginBottom: 12 }}>Cómo funciona</div>
          <h2 style={{ fontSize: 'clamp(32px, 3.4vw, 44px)', fontWeight: 600, letterSpacing: -0.025 + 'em', margin: '0 0 48px', maxWidth: 720, lineHeight: 1.05 }}>
            Tres pasos. Sin descargas, sin cables, sin Bluetooth.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { n: '01', t: 'Subí tu archivo', d: 'PPTX, PDF o Keynote. Lo procesamos en segundos manteniendo fuentes y animaciones.' },
              { n: '02', t: 'Escaneá el QR', d: 'Tu celular se vuelve el control remoto. La presentación se proyecta en tu pantalla.' },
              { n: '03', t: 'Presentá tranquilo', d: 'Slide actual, notas, timer y vista previa de la siguiente — todo en tu mano.' },
            ].map((f, i) => (
              <div key={i}>
                <div style={{ fontFamily: RS_MONO, fontSize: 12, color: '#9A9A9A', marginBottom: 16 }}>{f.n}</div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.015 + 'em', marginBottom: 8 }}>{f.t}</div>
                <p style={{ fontSize: 14, color: PLAT_MUTED, lineHeight: 1.5, margin: 0 }}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px max(64px, 8vw)', borderTop: '1px solid ' + PLAT_BORDER, fontSize: 12, color: PLAT_MUTED, display: 'flex', justifyContent: 'space-between' }}>
        <span>© 2025 RemoteSlides</span>
        <span style={{ fontFamily: RS_MONO, letterSpacing: 0.6 }}>v2.4 · estable</span>
      </footer>
    </div>
  );
}

// ─── 2 · UPLOAD ─────────────────────────────────────────────────────
function PageUpload({ onComplete }) {
  const [progress, setProgress] = React.useState(0);
  const [active, setActive] = React.useState(true);
  React.useEffect(() => {
    if (!active) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setTimeout(onComplete, 600); return 100; }
        return Math.min(100, p + (p < 70 ? 4 : 2));
      });
    }, 80);
    return () => clearInterval(t);
  }, [active, onComplete]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: PLAT_BG, fontFamily: RS_FONT, color: PLAT_FG }}>
      <header style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + PLAT_BORDER, flexShrink: 0 }}>
        <Wordmark size={17} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><StepIndicator current="upload" /></div>
        <button style={navGhost}>Cancelar</button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 640 }}>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.025 + 'em', margin: '0 0 8px' }}>
            Subí tu presentación.
          </h1>
          <p style={{ fontSize: 15, color: PLAT_MUTED, margin: '0 0 28px' }}>
            Arrastrá tu archivo o pegá un enlace. Tu presentación es privada y se borra automáticamente al terminar.
          </p>

          <div style={{ background: '#fff', border: '2px dashed ' + PLAT_PURPLE, borderRadius: 8, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 52, height: 64, background: PLAT_BG, border: '1px solid ' + PLAT_BORDER_STRONG, borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 7, fontFamily: RS_MONO, fontSize: 10, fontWeight: 600, color: PLAT_PURPLE, position: 'relative', flexShrink: 0 }}>
                PPTX
                <div style={{ position: 'absolute', top: 8, left: 7, right: 7, height: 2, background: PLAT_BORDER_STRONG }} />
                <div style={{ position: 'absolute', top: 14, left: 7, right: 16, height: 2, background: PLAT_BORDER_STRONG }} />
                <div style={{ position: 'absolute', top: 20, left: 7, right: 12, height: 2, background: PLAT_BORDER_STRONG }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Pulse-Q3-2025.pptx</div>
                <div style={{ fontSize: 12, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 2 }}>
                  14.2 MB · 8 diapositivas · {progress < 100 ? 'Procesando…' : 'Listo'}
                </div>
                <div style={{ marginTop: 14, height: 5, background: PLAT_BORDER, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: progress + '%', height: '100%', background: PLAT_PURPLE, transition: 'width .12s linear' }} />
                </div>
              </div>
              <div style={{ fontFamily: RS_MONO, fontSize: 14, color: PLAT_FG, fontVariantNumeric: 'tabular-nums', minWidth: 48, textAlign: 'right', fontWeight: 500 }}>{progress}%</div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: PLAT_BORDER }} />
            <span style={{ fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 1 }}>O</span>
            <div style={{ flex: 1, height: 1, background: PLAT_BORDER }} />
          </div>

          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { l: 'Google Drive', icon: 'GD' },
              { l: 'Dropbox', icon: 'DB' },
              { l: 'Pegar enlace', icon: '→' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 6, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div style={{ width: 28, height: 28, background: PLAT_BG, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS_MONO, fontSize: 10, fontWeight: 600, color: PLAT_MUTED }}>{s.icon}</div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.l}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 0.6 }}>
            Formatos: PPTX, PDF, KEY · Máx 200 MB · Cifrado de extremo a extremo
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── 3 · SESSION (PowerPoint-style sorter + QR pairing) ─────────────
function PageSession({ phoneConnected, onPresent }) {
  const p = usePresentation();
  const sidebarRef = React.useRef(null);

  // Keep selected thumbnail in view
  React.useEffect(() => {
    if (!sidebarRef.current) return;
    const el = sidebarRef.current.querySelector(`[data-thumb="${p.idx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [p.idx]);

  // Keyboard nav within the sorter
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); p.next(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); p.prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: PLAT_BG, fontFamily: RS_FONT, color: PLAT_FG, overflow: 'hidden' }}>
      <header style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + PLAT_BORDER, flexShrink: 0, background: '#fff' }}>
        <Wordmark size={17} />
        <div style={{ marginLeft: 24, paddingLeft: 24, borderLeft: '1px solid ' + PLAT_BORDER, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{p.deck.title}</div>
          <div style={{ fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 1 }}>{p.deck.filename} · {p.total} slides</div>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><StepIndicator current="session" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, letterSpacing: 0.6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: phoneConnected ? '#22C55E' : PLAT_PURPLE, boxShadow: phoneConnected ? '0 0 0 3px rgba(34,197,94,0.18)' : '0 0 0 3px oklch(0.55 0.21 285 / 0.15)' }} />
          {phoneConnected ? 'CELULAR CONECTADO' : 'ESPERANDO CELULAR'}
        </div>
      </header>

      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '248px 1fr', minHeight: 0 }}>
        {/* Sidebar: PowerPoint-style slide sorter */}
        <aside ref={sidebarRef} style={{
          background: '#fff', borderRight: '1px solid ' + PLAT_BORDER,
          overflowY: 'auto', padding: '14px 10px 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 10px' }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#9A9A9A' }}>Slides</div>
            <div style={{ fontFamily: RS_MONO, fontSize: 11, color: PLAT_MUTED, fontVariantNumeric: 'tabular-nums' }}>{p.idx + 1} / {p.total}</div>
          </div>
          {p.deck.slides.map((_, i) => {
            const selected = i === p.idx;
            return (
              <button
                key={i}
                data-thumb={i}
                onClick={() => p.go(i)}
                style={{
                  display: 'flex', gap: 10, padding: '6px 6px 6px 0',
                  alignItems: 'center', background: 'transparent',
                  border: 'none', cursor: 'pointer', borderRadius: 4,
                  textAlign: 'left', width: '100%',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(10,10,10,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{
                  width: 22, fontFamily: RS_MONO, fontSize: 11,
                  color: selected ? PLAT_PURPLE : '#9A9A9A',
                  fontWeight: selected ? 600 : 400,
                  fontVariantNumeric: 'tabular-nums', textAlign: 'right',
                  flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{
                  flex: 1, aspectRatio: '16/10',
                  borderRadius: 3, overflow: 'hidden',
                  outline: selected ? '2px solid ' + PLAT_PURPLE : '1px solid ' + PLAT_BORDER,
                  outlineOffset: selected ? 0 : 0,
                  boxShadow: selected ? '0 4px 16px oklch(0.55 0.21 285 / 0.18)' : 'none',
                  transition: 'box-shadow .15s',
                }}>
                  <Slide index={i} total={p.total} />
                </div>
              </button>
            );
          })}
        </aside>

        {/* Main: big preview + bottom action bar */}
        <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Title strip */}
          <div style={{ padding: '14px 28px', borderBottom: '1px solid ' + PLAT_BORDER, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 2 }}>
                Slide {String(p.idx + 1).padStart(2, '0')} de {String(p.total).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.015 + 'em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.titles[p.idx]}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={p.prev} disabled={p.idx === 0} style={iconBtn(p.idx === 0)} title="Anterior (←)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={p.next} disabled={p.idx === p.total - 1} style={iconBtn(p.idx === p.total - 1)} title="Siguiente (→)">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div style={{ width: 12 }} />
              <span style={{ fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 0.4 }}>
                ←  →  para navegar
              </span>
            </div>
          </div>

          {/* Big slide */}
          <div style={{ flex: 1, padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, background: PLAT_BG }}>
            <div style={{
              width: '100%', maxWidth: 'min(100%, calc((100vh - 320px) * 1.6))',
              aspectRatio: '16/10', background: '#fff',
              borderRadius: 6, overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.08)',
              border: '1px solid ' + PLAT_BORDER,
            }}>
              <Slide index={p.idx} total={p.total} />
            </div>
          </div>

          {/* Bottom action bar */}
          <div style={{
            padding: '14px 28px', borderTop: '1px solid ' + PLAT_BORDER, background: '#fff',
            display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                background: '#fff', padding: 6, borderRadius: 6,
                border: '1px solid ' + PLAT_BORDER, position: 'relative',
                opacity: phoneConnected ? 0.4 : 1, transition: 'opacity .3s',
              }}>
                <FakeQR size={56} />
                {phoneConnected && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l4 4 7-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {phoneConnected ? 'Celular conectado' : 'Escaneá para usar tu celular como control'}
                </div>
                <div style={{ fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 2 }}>
                  Código <span style={{ color: PLAT_FG, fontWeight: 500 }}>K7-9Q2-FX4</span> · remoteslides.app/r
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ ...navGhost, height: 40, padding: '0 16px', fontSize: 13 }}>Presentar sin control</button>
            <button onClick={onPresent} style={{ ...navPrimary, height: 40, padding: '0 18px', fontSize: 13, background: PLAT_FG }}>
              Comenzar presentación →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const iconBtn = (disabled) => ({
  width: 32, height: 32, borderRadius: 6,
  background: disabled ? 'transparent' : '#fff',
  color: disabled ? '#C9C8C2' : PLAT_FG,
  border: '1px solid ' + PLAT_BORDER_STRONG,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
});

// ─── 4 · LIVE (fullscreen presentation — keyboard + click nav) ──────
function PageLive({ onEnd }) {
  const p = usePresentation();
  const elapsed = useElapsed(p.startedAt);
  const pct = ((p.idx + 1) / p.total) * 100;
  const [showChrome, setShowChrome] = React.useState(true);
  const chromeTimer = React.useRef(null);

  // Chrome auto-hide
  const bumpChrome = React.useCallback(() => {
    setShowChrome(true);
    clearTimeout(chromeTimer.current);
    chromeTimer.current = setTimeout(() => setShowChrome(false), 2500);
  }, []);
  React.useEffect(() => { bumpChrome(); return () => clearTimeout(chromeTimer.current); }, [bumpChrome]);

  // Keyboard navigation
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); p.next(); bumpChrome(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); p.prev(); bumpChrome(); }
      else if (e.key === 'Escape') { e.preventDefault(); onEnd(); }
      else if (e.key === 'b' || e.key === 'B' || e.key === '.') { e.preventDefault(); p.setBlackout(v => !v); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [p, onEnd, bumpChrome]);

  // Click-to-advance: click right half → next, click left half → prev
  const onClickArea = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x > r.width * 0.5) p.next(); else p.prev();
    bumpChrome();
  };

  return (
    <div
      onMouseMove={bumpChrome}
      style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', cursor: showChrome ? 'default' : 'none' }}>
      <div
        onClick={onClickArea}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}>
        {p.blackout ? (
          <div style={{ width: '100%', height: '100%', background: '#000' }} />
        ) : (
          <Slide index={p.idx} total={p.total} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.2, color: 'rgba(255,255,255,0.8)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }} />
          <span>{elapsed}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{String(p.idx + 1).padStart(2, '0')} / {String(p.total).padStart(2, '0')}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onEnd(); }} style={liveBtn}>
          Finalizar presentación
        </button>
      </div>

      {/* Bottom chrome: nav arrows + hint */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px 24px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.35))',
        opacity: showChrome ? 1 : 0, transition: 'opacity .3s',
        pointerEvents: showChrome ? 'auto' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 0.8, color: 'rgba(255,255,255,0.5)' }}>
          <kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> navegar · <kbd style={kbdStyle}>B</kbd> negro · <kbd style={kbdStyle}>Esc</kbd> salir
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={(e) => { e.stopPropagation(); p.prev(); bumpChrome(); }} disabled={p.idx === 0} style={liveArrow(p.idx === 0)}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); p.next(); bumpChrome(); }} disabled={p.idx === p.total - 1} style={liveArrow(p.idx === p.total - 1)}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}>
        <div style={{ width: pct + '%', height: '100%', background: PLAT_PURPLE, transition: 'width .3s ease' }} />
      </div>
    </div>
  );
}

const liveBtn = {
  height: 34, padding: '0 14px', borderRadius: 6,
  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  color: '#fff', border: '1px solid rgba(255,255,255,0.16)',
  fontFamily: RS_FONT, fontSize: 12, fontWeight: 500, cursor: 'pointer',
};
const liveArrow = (disabled) => ({
  width: 36, height: 36, borderRadius: 18,
  background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  color: '#fff', border: '1px solid rgba(255,255,255,0.16)',
  cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
});
const kbdStyle = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 18, height: 18, padding: '0 5px',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 3, fontFamily: RS_MONO, fontSize: 10, color: 'rgba(255,255,255,0.85)',
  margin: '0 2px',
};

// ─── 5 · END SUMMARY (removed per request) ──────────────────────────
function _PageEndRemoved({ onRestart }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: PLAT_BG, fontFamily: RS_FONT, color: PLAT_FG }}>
      <header style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + PLAT_BORDER, flexShrink: 0 }}>
        <Wordmark size={17} />
        <div style={{ flex: 1 }} />
        <button onClick={onRestart} style={navGhost}>Empezar otra</button>
        <button style={{ ...navPrimary, marginLeft: 8 }}>Descargar reporte</button>
      </header>

      <main style={{ flex: 1, padding: '48px max(64px, 8vw)', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: PLAT_PURPLE, marginBottom: 8 }}>
          Presentación finalizada
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 600, letterSpacing: -0.025 + 'em', margin: 0, textWrap: 'balance' }}>
          Gran sesión, María.
        </h1>
        <p style={{ fontSize: 15, color: PLAT_MUTED, margin: '8px 0 36px', maxWidth: 540 }}>
          Resumen de tu presentación de hoy. Los archivos se borrarán automáticamente en 7 días.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 8, overflow: 'hidden' }}>
          {[
            ['Duración', '24:18', '8 slides'],
            ['Tiempo medio / slide', '3:02', '−12% vs target'],
            ['Slide más larga', '06 · Voz del cliente', '5:44'],
            ['Conexión', 'Estable', '0 desconexiones'],
          ].map(([k,v,sub],i)=>(
            <div key={i} style={{ padding: '22px 24px', borderLeft: i ? '1px solid ' + PLAT_BORDER : 'none' }}>
              <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 6 }}>{k}</div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.02 + 'em' }}>{v}</div>
              <div style={{ fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 8, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Tiempo por slide</div>
                <div style={{ fontSize: 12, color: PLAT_MUTED }}>Minutos:segundos</div>
              </div>
              <div style={{ fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 0.6 }}>Target: 3:00</div>
            </div>
            {[
              ['Portada', 28, '0:32'],
              ['Agenda', 38, '1:08'],
              ['Resumen ejecutivo', 70, '3:42'],
              ['Métricas', 82, '4:24'],
              ['Lanzamientos', 65, '3:18'],
              ['Voz del cliente', 92, '5:44'],
              ['Hoja de ruta', 56, '2:52'],
              ['Cierre', 48, '2:38'],
            ].map(([t,w,d],i)=>(
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '12em 1fr 4em', gap: 16, alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: PLAT_FG }}>
                  <span style={{ fontFamily: RS_MONO, color: '#9A9A9A' }}>{String(i+1).padStart(2,'0')}</span> {t}
                </div>
                <div style={{ height: 8, background: PLAT_BORDER, borderRadius: 1 }}>
                  <div style={{ width: w+'%', height: '100%', background: w > 85 ? PLAT_PURPLE : PLAT_FG, borderRadius: 1 }} />
                </div>
                <div style={{ fontFamily: RS_MONO, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: PLAT_MUTED }}>{d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 8, padding: 20 }}>
              <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 12 }}>Acciones</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  'Descargar grabación · 24m',
                  'Enviar resumen al equipo',
                  'Exportar timeline (CSV)',
                  'Borrar archivo ahora',
                ].map((t,i)=>(
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: i ? '1px solid ' + PLAT_BORDER : 'none', fontSize: 13, cursor: 'pointer' }}>
                    <span>{t}</span>
                    <span style={{ color: PLAT_MUTED, fontFamily: RS_MONO, fontSize: 11 }}>→</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: PLAT_FG, color: '#fff', borderRadius: 8, padding: 22 }}>
              <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Tip</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                Tu Slide 6 (Voz del cliente) tomó 5:44. Para próximas veces, considerá moverla al inicio cuando la audiencia está más fresca.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Floating phone overlay (REAL remote) ───────────────────────────
// Two states: 'pair' shows pairing screen, 'remote' shows live control.
function FloatingPhone({ phoneState, onPair, onEnd, dock = 'bottom-right' }) {
  const p = usePresentation();
  const elapsed = useElapsed(p.startedAt);
  const [collapsed, setCollapsed] = React.useState(false);

  // Auto-finish pairing after a beat
  const [digits, setDigits] = React.useState(['', '', '', '', '', '', '', '']);
  React.useEffect(() => {
    if (phoneState !== 'pair') return;
    const seq = ['K','7','9','Q','2','F','X','4'];
    let i = 0;
    const t = setInterval(() => {
      if (i >= seq.length) { clearInterval(t); setTimeout(onPair, 500); return; }
      setDigits(d => { const n = [...d]; n[i] = seq[i]; return n; });
      i++;
    }, 220);
    return () => clearInterval(t);
  }, [phoneState, onPair]);

  const scale = 0.62;
  const W = 390, H = 844;

  return (
    <div style={{
      position: 'fixed', right: 28, bottom: 28, zIndex: 80,
      transition: 'transform .35s cubic-bezier(.2,.7,.3,1), opacity .25s',
      transform: collapsed ? 'translateY(calc(100% - 48px))' : 'translateY(0)',
    }}>
      {/* Drag handle / collapse */}
      <div style={{
        background: 'rgba(10,10,10,0.92)', color: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(14px)',
        borderRadius: '10px 10px 0 0', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        width: W * scale, boxSizing: 'border-box',
        fontFamily: RS_MONO, fontSize: 11, letterSpacing: 0.8, cursor: 'pointer',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }} onClick={() => setCollapsed(c => !c)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: phoneState === 'remote' ? '#22C55E' : PLAT_PURPLE, boxShadow: phoneState === 'remote' ? '0 0 0 3px rgba(34,197,94,0.15)' : '0 0 0 3px oklch(0.55 0.21 285 / 0.2)' }} />
          {phoneState === 'remote' ? 'TU CELULAR · EN VIVO' : 'TU CELULAR · PAREANDO'}
        </span>
        <span style={{ opacity: 0.6, fontSize: 14, lineHeight: 1 }}>{collapsed ? '▴' : '▾'}</span>
      </div>

      {/* Phone */}
      <div style={{
        width: W * scale, height: H * scale, position: 'relative',
        filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.28))',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {phoneState === 'pair' ? <PhonePair digits={digits} /> : <PhoneRemote onEnd={onEnd} elapsed={elapsed} />}
        </div>
      </div>
    </div>
  );
}

function PhonePair({ digits }) {
  return (
    <IOSDevice width={390} height={844}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PLAT_BG, fontFamily: RS_FONT, color: PLAT_FG, padding: '70px 24px 0' }}>
        <Wordmark size={15} />
        <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginTop: 28 }}>
          Paso 1 de 2 · Pareo
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', margin: '8px 0 8px', textWrap: 'balance' }}>
          Conectando con tu computadora.
        </h1>
        <p style={{ fontSize: 13, color: PLAT_MUTED, lineHeight: 1.5, margin: 0 }}>
          Detectamos tu sesión y estamos pareando.
        </p>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
          {digits.map((d, i) => {
            const isCursor = !d && (i === 0 || digits[i-1]);
            return (
              <div key={i} style={{
                aspectRatio: '1', background: d ? '#fff' : 'transparent',
                border: '1.5px solid ' + (isCursor ? PLAT_PURPLE : (d ? PLAT_BORDER_STRONG : PLAT_BORDER)),
                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: RS_MONO, fontSize: 20, fontWeight: 600,
                boxShadow: isCursor ? '0 0 0 3px oklch(0.55 0.21 285 / 0.15)' : 'none',
                transition: 'all .12s',
              }}>{d}</div>
            );
          })}
        </div>

        <div style={{ marginTop: 32, background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: PLAT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect x="0.5" y="0.5" width="17" height="11" rx="1.5" stroke={PLAT_FG} /><path d="M6 13.5h6" stroke={PLAT_FG} strokeLinecap="round" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>MacBook Pro de María</div>
              <div style={{ fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 1 }}>Pulse-Q3-2025 · 8 slides</div>
            </div>
            <div style={{ fontSize: 11, color: PLAT_PURPLE, fontFamily: RS_MONO, letterSpacing: 0.8 }}>DETECTADO</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ marginBottom: 24, padding: 14, background: '#fff', border: '1px solid ' + PLAT_BORDER, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 20, height: 20, border: '2px solid ' + PLAT_BORDER, borderTopColor: PLAT_PURPLE, borderRadius: '50%', animation: 'plat-spin 0.8s linear infinite' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Estableciendo conexión segura…</div>
            <div style={{ fontSize: 11, color: PLAT_MUTED, fontFamily: RS_MONO, marginTop: 2 }}>End-to-end encrypted</div>
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

function PhoneRemote({ onEnd, elapsed }) {
  const p = usePresentation();
  const isLast = p.idx >= p.total - 1;
  const nextIdx = Math.min(p.idx + 1, p.total - 1);
  const notes = [
    'Saludá al equipo. Recordá que esto es un cierre de Q3.',
    'Vamos a cubrir 5 secciones en 25 minutos.',
    'Foco en retención +38%. Pulse Live es el héroe del trimestre.',
    'No leas los números — mostralos. Comparalos vs Q2.',
    'Pulse Live es el más importante. Pasá rápido por los demás.',
    'Cita de Linear. Pausá después de leerla.',
    'No comprometernos con fechas exactas en público.',
    'Abrí preguntas. Quedate disponible 10min después.',
  ];

  return (
    <IOSDevice width={390} height={844} dark>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: RS_FONT, color: '#fff', padding: '54px 0 0', background: '#0A0A0A' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }} />
            <span style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 0.8, color: 'rgba(255,255,255,0.65)' }}>EN VIVO · K7-9Q2-FX4</span>
          </div>
          <div style={{ fontFamily: RS_MONO, fontSize: 13, fontVariantNumeric: 'tabular-nums', color: '#fff' }}>{elapsed}</div>
        </div>

        <div style={{ margin: '0 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', aspectRatio: '16/10', background: '#000' }}>
          {p.blackout ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS_MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 }}>PANTALLA EN NEGRO</div>
          ) : (
            <Slide index={p.idx} total={p.total} />
          )}
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '3px 7px', borderRadius: 4 }}>
            ACTUAL · {String(p.idx+1).padStart(2,'0')} / {String(p.total).padStart(2,'0')}
          </div>
        </div>

        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Slide actual</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.015 + 'em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.titles[p.idx]}
            </div>
          </div>
          {!isLast && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: 150 }}>
              <div style={{ width: 56, aspectRatio: '16/10', borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                <Slide index={nextIdx} total={p.total} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: RS_MONO, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Siguiente</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.titles[nextIdx]}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ margin: '16px 20px 0', padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Notas del presentador</div>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>A+</div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.9)' }}>{notes[p.idx]}</div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '14px 20px 0' }}>
          {[
            { l: 'Puntero', i: '•' },
            { l: p.blackout ? 'Volver' : 'En negro', i: '◐', active: p.blackout, onClick: () => p.setBlackout(b => !b) },
            { l: 'Slides', i: '▦' },
          ].map((b, i) => (
            <button key={i} onClick={b.onClick} style={{
              flex: 1, height: 40, background: b.active ? '#fff' : 'rgba(255,255,255,0.06)',
              color: b.active ? '#0A0A0A' : 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
              fontFamily: RS_FONT, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 10, opacity: 0.7 }}>{b.i}</span> {b.l}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={p.prev} disabled={p.idx === 0} style={{
            width: 64, height: 64, borderRadius: 32,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 22, cursor: p.idx === 0 ? 'not-allowed' : 'pointer',
            opacity: p.idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <button onClick={isLast ? onEnd : p.next} style={{
            flex: 1, height: 64, borderRadius: 32,
            background: isLast ? PLAT_PURPLE : '#fff', color: isLast ? '#fff' : '#0A0A0A', border: 'none',
            fontFamily: RS_FONT, fontSize: 15, fontWeight: 600, letterSpacing: 0.4,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {isLast ? 'FINALIZAR' : 'SIGUIENTE'}
            <span style={{ fontFamily: RS_MONO, fontSize: 11, color: isLast ? 'rgba(255,255,255,0.7)' : '#6B6B6B' }}>
              {isLast ? '✓' : `${String(p.idx+1).padStart(2,'0')} → ${String(p.idx+2).padStart(2,'0')}`}
            </span>
          </button>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── Root App ───────────────────────────────────────────────────────
function PlatformApp() {
  const [step, setStep] = React.useState('landing');
  const [phoneConnected, setPhoneConnected] = React.useState(false);

  // Reset on restart
  const restart = () => {
    setPhoneConnected(false);
    setStep('landing');
  };

  // Floating phone only appears during pairing in 'session' (not during live).
  const showPhone = step === 'session';
  const phoneState = phoneConnected ? 'remote' : 'pair';

  return (
    <PresentationProvider>
      {step === 'landing' && <PageLanding onStart={() => setStep('upload')} />}
      {step === 'upload' && <PageUpload onComplete={() => setStep('session')} />}
      {step === 'session' && <PageSession phoneConnected={phoneConnected} onPresent={() => setStep('live')} />}
      {step === 'live' && <PageLive onEnd={() => setStep('session')} />}

      {showPhone && (
        <FloatingPhone
          phoneState={phoneState}
          onPair={() => setPhoneConnected(true)}
          onEnd={() => setStep('session')}
        />
      )}

      <PrototypeNav step={step} setStep={setStep} setPhoneConnected={setPhoneConnected} restart={restart} />
    </PresentationProvider>
  );
}

function PrototypeNav({ step, setStep, setPhoneConnected, restart }) {
  const [open, setOpen] = React.useState(false);
  const steps = ['landing', 'upload', 'session', 'live'];
  const labels = { landing: 'Landing', upload: 'Upload', session: 'Antes de presentar', live: 'En vivo' };
  return (
    <div style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 90, fontFamily: RS_MONO, fontSize: 11 }}>
      {open && (
        <div style={{ marginBottom: 8, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(14px)', color: '#fff', padding: 6, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180, boxShadow: '0 12px 32px rgba(0,0,0,0.18)' }}>
          {steps.map(s => (
            <button key={s} onClick={() => { setStep(s); if (s === 'live') setPhoneConnected(true); if (s === 'landing' || s === 'upload') setPhoneConnected(false); }} style={{
              background: s === step ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: 'none', color: '#fff', textAlign: 'left',
              padding: '7px 10px', borderRadius: 4, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 11, letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span>{labels[s]}</span>
              {s === step && <span style={{ width: 5, height: 5, borderRadius: '50%', background: PLAT_PURPLE }} />}
            </button>
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 2px' }} />
          <button onClick={restart} style={{
            background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'left',
            padding: '7px 10px', borderRadius: 4, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, letterSpacing: 0.5,
          }}>Reiniciar flujo</button>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(14px)',
        color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.1)',
        padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: PLAT_PURPLE }} />
        {labels[step]} · saltar
      </button>
    </div>
  );
}

Object.assign(window, { PlatformApp });
