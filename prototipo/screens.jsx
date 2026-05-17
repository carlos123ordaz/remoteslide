// All 7 screens of the RemoteSlides prototype.
// Each screen reads/writes the same PresentationProvider state, so the
// phone "remote" really drives the laptop preview + fullscreen view.

// ─── Shared little parts ────────────────────────────────────────────
const PURPLE = 'oklch(0.55 0.21 285)';
const PAGE_BG = '#FAFAF7';
const FG = '#0A0A0A';
const FG_MUTED = '#6B6B6B';
const BORDER = 'rgba(10,10,10,0.08)';
const BORDER_STRONG = 'rgba(10,10,10,0.14)';

function Wordmark({ size = 18, color = FG }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: RS_FONT, color, fontWeight: 600, fontSize: size, letterSpacing: -0.01 + 'em' }}>
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="0.5" y="0.5" width="17" height="17" rx="4" stroke={color} strokeOpacity="0.9" />
        <rect x="4" y="4" width="6" height="6" rx="1" fill={color} />
        <rect x="11" y="11" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6" />
      </svg>
      <span>RemoteSlides</span>
    </div>
  );
}

// Tiny browser-window chrome (light, Linear/Vercel-y, not Chrome dark).
function LightBrowser({ url = 'remoteslides.app', children, accent = false }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.06)' }}>
      <div style={{ height: 38, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', background: '#F4F3EF', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0DFD9' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0DFD9' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0DFD9' }} />
        </div>
        <div style={{ flex: 1, height: 22, borderRadius: 6, background: '#fff', border: '1px solid ' + BORDER, display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px', fontFamily: RS_MONO, fontSize: 11, color: FG_MUTED, maxWidth: 460, margin: '0 auto' }}>
          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M4 5V3.5a2 2 0 014 0V5M3 5h6v5H3z" stroke="currentColor" strokeWidth="1.2"/></svg>
          {url}
        </div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// QR placeholder — deterministic blocky pattern, not a real QR but reads right.
function FakeQR({ size = 180, fg = FG, bg = '#fff' }) {
  const N = 21;
  const cells = React.useMemo(() => {
    // PRNG seeded so it's stable
    let s = 0xC0FFEE;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return (s >>> 16) / 0xffff; };
    const m = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.5));
    // clear corners for the locator squares
    for (const [r, c] of [[0,0],[0,N-7],[N-7,0]]) {
      for (let i=0;i<7;i++) for (let j=0;j<7;j++) m[r+i][c+j] = false;
    }
    return m;
  }, []);
  const cs = size / N;
  const locator = (r, c) => (
    <g transform={`translate(${c*cs} ${r*cs})`}>
      <rect width={7*cs} height={7*cs} fill={fg} />
      <rect x={cs} y={cs} width={5*cs} height={5*cs} fill={bg} />
      <rect x={2*cs} y={2*cs} width={3*cs} height={3*cs} fill={fg} />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill={bg} />
      {cells.map((row, r) => row.map((v, c) => v ? (
        <rect key={r+'-'+c} x={c*cs} y={r*cs} width={cs} height={cs} fill={fg} />
      ) : null))}
      {locator(0, 0)}
      {locator(0, N-7)}
      {locator(N-7, 0)}
    </svg>
  );
}

// Mini slide rendered into a small box (used for thumbnails / previews)
function MiniSlide({ index, width, height, total }) {
  return (
    <div style={{ width, height, containerType: 'inline-size', overflow: 'hidden', background: '#fff', position: 'relative' }}>
      <Slide index={index} total={total} />
    </div>
  );
}

// ─── 1 · LANDING ────────────────────────────────────────────────────
function ScreenLanding() {
  return (
    <LightBrowser url="remoteslides.app">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PAGE_BG, fontFamily: RS_FONT, color: FG }}>
        {/* Nav */}
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
          <Wordmark />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 13, color: FG_MUTED }}>
            <span>Producto</span>
            <span>Cómo funciona</span>
            <span>Precios</span>
            <span>Soporte</span>
          </div>
          <div style={{ width: 28 }} />
          <button style={btnGhost}>Iniciar sesión</button>
          <button style={{ ...btnPrimary, marginLeft: 8 }}>Empezar</button>
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '56px 64px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 11px', borderRadius: 999, border: '1px solid ' + BORDER_STRONG, fontSize: 12, color: FG_MUTED, marginBottom: 28, fontFamily: RS_MONO }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE }} />
              v2.4 · ahora con notas del presentador
            </div>
            <h1 style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.02, letterSpacing: -0.035 + 'em', margin: 0, textWrap: 'balance' }}>
              Tu celular es el<br />control remoto<br />de tus slides.
            </h1>
            <p style={{ fontSize: 17, color: FG_MUTED, lineHeight: 1.5, marginTop: 22, maxWidth: 440 }}>
              Sube tu PPT o PDF, escanea un QR y presenta desde cualquier pantalla. Sin instalar nada, sin cables, en tiempo real.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              <button style={{ ...btnPrimary, padding: '0 18px', height: 42, fontSize: 14 }}>Subir presentación →</button>
              <button style={{ ...btnGhost, padding: '0 16px', height: 42, fontSize: 14 }}>Ver demo (45s)</button>
            </div>
            <div style={{ marginTop: 36, display: 'flex', gap: 28, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A' }}>
              <span>PPTX · PDF · KEY</span>
              <span>Sin instalar</span>
              <span>Latencia &lt; 80ms</span>
            </div>
          </div>

          {/* Right: laptop + phone composition */}
          <div style={{ position: 'relative', height: 380 }}>
            {/* Laptop */}
            <div style={{ position: 'absolute', top: 16, left: 24, right: 60, height: 280, background: FG, borderRadius: 12, padding: 9, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.25)' }}>
              <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 4, overflow: 'hidden', containerType: 'inline-size' }}>
                <Slide index={2} total={8} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: 296, left: 0, right: 36, height: 8, background: FG, borderRadius: '0 0 8px 8px' }} />

            {/* Phone */}
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 132, height: 270, background: FG, borderRadius: 22, padding: 7, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.3)' }}>
              <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 18, background: FG, borderRadius: '0 0 12px 12px', margin: '0 28px' }} />
                <div style={{ padding: '8px 8px 0', fontFamily: RS_MONO, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: '#9A9A9A' }}>
                  03 / 08 · Resumen
                </div>
                <div style={{ margin: 8, height: 70, background: PAGE_BG, borderRadius: 4, overflow: 'hidden', containerType: 'inline-size' }}>
                  <Slide index={2} total={8} />
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 4, padding: 8 }}>
                  <div style={{ flex: 1, height: 36, background: PAGE_BG, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>←</div>
                  <div style={{ flex: 2, height: 36, background: FG, color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>SIGUIENTE</div>
                </div>
                <div style={{ height: 3, width: 36, background: FG, borderRadius: 2, margin: '0 auto 6px' }} />
              </div>
            </div>

            {/* Connection line */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <path d="M 280 240 Q 320 280, 340 300" stroke={PURPLE} strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
              <circle cx="340" cy="300" r="3" fill={PURPLE} />
              <circle cx="280" cy="240" r="3" fill={PURPLE} />
            </svg>
          </div>
        </div>

        {/* Strip */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 64px', borderTop: '1px solid ' + BORDER, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: '#9A9A9A', flexShrink: 0 }}>
          <span>Usado en sesiones de</span>
          <span>Vercel</span>
          <span>Linear</span>
          <span>Pitch</span>
          <span>Notion</span>
          <span>Loom</span>
          <span>Figma</span>
        </div>
      </div>
    </LightBrowser>
  );
}

// ─── 2 · UPLOAD ─────────────────────────────────────────────────────
function ScreenUpload() {
  const [progress, setProgress] = React.useState(64);
  React.useEffect(() => {
    const t = setInterval(() => setProgress(p => p >= 92 ? 64 : p + 1), 140);
    return () => clearInterval(t);
  }, []);
  return (
    <LightBrowser url="remoteslides.app/upload">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PAGE_BG, fontFamily: RS_FONT, color: FG }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
          <Wordmark />
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: FG_MUTED }}>
            Paso 1 de 3 · Subir archivo
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ width: '100%', maxWidth: 640 }}>
            <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.025 + 'em', margin: '0 0 8px' }}>
              Sube tu presentación.
            </h1>
            <p style={{ fontSize: 15, color: FG_MUTED, margin: '0 0 28px' }}>
              Arrastra tu archivo o pega un enlace. Tu presentación es privada y se borra automáticamente al terminar.
            </p>

            {/* Active dropzone */}
            <div style={{ background: '#fff', border: '2px dashed ' + PURPLE, borderRadius: 8, padding: 36, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 48, height: 60, background: PAGE_BG, border: '1px solid ' + BORDER_STRONG, borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, fontFamily: RS_MONO, fontSize: 10, fontWeight: 600, color: PURPLE, position: 'relative' }}>
                  PPTX
                  <div style={{ position: 'absolute', top: 6, left: 6, right: 6, height: 2, background: BORDER_STRONG }} />
                  <div style={{ position: 'absolute', top: 12, left: 6, right: 14, height: 2, background: BORDER_STRONG }} />
                  <div style={{ position: 'absolute', top: 18, left: 6, right: 10, height: 2, background: BORDER_STRONG }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Pulse-Q3-2025.pptx</div>
                  <div style={{ fontSize: 12, color: FG_MUTED, fontFamily: RS_MONO, marginTop: 2 }}>14.2 MB · 8 diapositivas · Procesando…</div>
                  <div style={{ marginTop: 12, height: 4, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: progress + '%', height: '100%', background: PURPLE, transition: 'width .14s linear' }} />
                  </div>
                </div>
                <div style={{ fontFamily: RS_MONO, fontSize: 13, color: FG, fontVariantNumeric: 'tabular-nums', minWidth: 44, textAlign: 'right' }}>{progress}%</div>
              </div>
            </div>

            {/* Empty dropzone alternative below */}
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
              <span style={{ fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 1 }}>O</span>
              <div style={{ flex: 1, height: 1, background: BORDER }} />
            </div>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { l: 'Google Drive', icon: 'GD' },
                { l: 'Dropbox', icon: 'DB' },
                { l: 'Pegar enlace', icon: '→' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 6, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div style={{ width: 28, height: 28, background: PAGE_BG, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS_MONO, fontSize: 10, fontWeight: 600, color: FG_MUTED }}>{s.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.l}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, fontFamily: RS_MONO, fontSize: 11, color: '#9A9A9A', letterSpacing: 0.6 }}>
              Formatos: PPTX, PDF, KEY · Máx 200 MB · Cifrado de extremo a extremo
            </div>
          </div>
        </div>
      </div>
    </LightBrowser>
  );
}

// ─── 3 · QR + PREVIEW ───────────────────────────────────────────────
function ScreenQR() {
  const p = usePresentation();
  return (
    <LightBrowser url={'remoteslides.app/r/k7-9q2-fx4'}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PAGE_BG, fontFamily: RS_FONT, color: FG }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
          <Wordmark />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: FG_MUTED, fontFamily: RS_MONO, letterSpacing: 0.6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE, boxShadow: '0 0 0 4px oklch(0.55 0.21 285 / 0.15)' }} />
            ESPERANDO CONEXIÓN
          </div>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 0 }}>
          {/* Left: QR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 48px', borderRight: '1px solid ' + BORDER }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: FG_MUTED, marginBottom: 16 }}>
              Paso 2 · Conectá tu celular
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', margin: '0 0 12px', textWrap: 'balance' }}>
              Escaneá este QR<br />con tu cámara.
            </h1>
            <p style={{ fontSize: 14, color: FG_MUTED, margin: '0 0 28px', maxWidth: 360 }}>
              Tu celular se vuelve el control remoto. La presentación se proyecta acá, en pantalla completa.
            </p>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid ' + BORDER, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <FakeQR size={172} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                <div>
                  <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 4 }}>Código de sala</div>
                  <div style={{ fontFamily: RS_MONO, fontSize: 22, fontWeight: 600, letterSpacing: 2 }}>K7-9Q2-FX4</div>
                </div>
                <div style={{ height: 1, background: BORDER }} />
                <div style={{ fontSize: 12, color: FG_MUTED, lineHeight: 1.5 }}>
                  O entrá manualmente a<br />
                  <span style={{ fontFamily: RS_MONO, color: FG }}>remoteslides.app/r</span>
                </div>
              </div>
            </div>

            <button style={{ ...btnPrimary, marginTop: 32, height: 42, padding: '0 22px', fontSize: 14 }}>
              Iniciar sin control remoto →
            </button>
          </div>

          {/* Right: preview of deck */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '32px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A' }}>Tu presentación</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>{p.deck.title}</div>
              </div>
              <div style={{ fontFamily: RS_MONO, fontSize: 11, color: FG_MUTED }}>{p.total} slides · 14.2 MB</div>
            </div>

            {/* Hero preview */}
            <div style={{ aspectRatio: '16/10', background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid ' + BORDER, containerType: 'inline-size' }}>
              <Slide index={0} total={p.total} />
            </div>

            {/* Thumbs */}
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {p.deck.slides.slice(1, 5).map((_, i) => (
                <div key={i} style={{ aspectRatio: '16/10', background: '#fff', borderRadius: 3, overflow: 'hidden', border: '1px solid ' + BORDER, containerType: 'inline-size', position: 'relative' }}>
                  <Slide index={i+1} total={p.total} />
                  <div style={{ position: 'absolute', bottom: 2, right: 4, fontFamily: RS_MONO, fontSize: 8, color: '#9A9A9A' }}>{String(i+2).padStart(2,'0')}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', gap: 18, fontFamily: RS_MONO, fontSize: 11, letterSpacing: 0.6, color: '#9A9A9A' }}>
              <span>↑ Slide 1 — Portada</span>
              <span>· LISTO PARA PRESENTAR</span>
            </div>
          </div>
        </div>
      </div>
    </LightBrowser>
  );
}

// ─── 4 · PAIRING (mobile) ───────────────────────────────────────────
function ScreenPairing() {
  const [digits, setDigits] = React.useState(['K','7','9','Q','2','','','']);
  return (
    <IOSDevice width={390} height={844}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PAGE_BG, fontFamily: RS_FONT, color: FG, padding: '70px 24px 0' }}>
        <Wordmark size={15} />
        <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginTop: 28 }}>
          Paso 1 de 2 · Pareo
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', margin: '8px 0 8px', textWrap: 'balance' }}>
          Ingresá el código de tu sala.
        </h1>
        <p style={{ fontSize: 13, color: FG_MUTED, lineHeight: 1.5, margin: 0 }}>
          Lo encontrás abajo del QR en tu computadora.
        </p>

        {/* Code input */}
        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              aspectRatio: '1', background: d ? '#fff' : 'transparent',
              border: '1.5px solid ' + (i === 5 ? PURPLE : (d ? BORDER_STRONG : BORDER)),
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: RS_MONO, fontSize: 20, fontWeight: 600,
              boxShadow: i === 5 ? '0 0 0 3px oklch(0.55 0.21 285 / 0.15)' : 'none',
            }}>{d}</div>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: FG_MUTED, fontFamily: RS_MONO, letterSpacing: 0.6 }}>
          O escaneá el QR desde tu cámara
        </div>

        {/* Connected device card */}
        <div style={{ marginTop: 32, background: '#fff', border: '1px solid ' + BORDER, borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect x="0.5" y="0.5" width="17" height="11" rx="1.5" stroke={FG} /><path d="M6 13.5h6" stroke={FG} strokeLinecap="round" /></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>MacBook Pro de María</div>
              <div style={{ fontSize: 11, color: FG_MUTED, fontFamily: RS_MONO, marginTop: 1 }}>Pulse-Q3-2025 · 8 slides</div>
            </div>
            <div style={{ fontSize: 11, color: PURPLE, fontFamily: RS_MONO, letterSpacing: 0.8 }}>DETECTADO</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button style={{ ...btnPrimary, height: 50, fontSize: 15, marginBottom: 20 }}>
          Conectar a la presentación
        </button>
      </div>
    </IOSDevice>
  );
}

// ─── 5 · ACTIVE REMOTE (mobile) — the interactive heart ──────────────
function ScreenRemote() {
  const p = usePresentation();
  const elapsed = useElapsed(p.startedAt);
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

        {/* Top bar — status, room, timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 0 3px rgba(34,197,94,0.15)' }} />
            <span style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 0.8, color: 'rgba(255,255,255,0.65)' }}>EN VIVO · K7-9Q2-FX4</span>
          </div>
          <div style={{ fontFamily: RS_MONO, fontSize: 13, fontVariantNumeric: 'tabular-nums', color: '#fff' }}>{elapsed}</div>
        </div>

        {/* Current slide preview */}
        <div style={{ margin: '0 20px', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', aspectRatio: '16/10', background: '#000', containerType: 'inline-size' }}>
          {p.blackout ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: RS_MONO, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 }}>PANTALLA EN NEGRO</div>
          ) : (
            <Slide index={p.idx} total={p.total} />
          )}
          <div style={{ position: 'absolute', top: 8, left: 10, fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '3px 7px', borderRadius: 4 }}>
            ACTUAL · {String(p.idx+1).padStart(2,'0')} / {String(p.total).padStart(2,'0')}
          </div>
        </div>

        {/* Slide title + next-up */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Slide actual</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.015 + 'em', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.titles[p.idx]}
            </div>
          </div>
          {!isLast && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: 150 }}>
              <div style={{ width: 56, aspectRatio: '16/10', borderRadius: 4, overflow: 'hidden', flexShrink: 0, containerType: 'inline-size', background: '#fff' }}>
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

        {/* Notes */}
        <div style={{ margin: '16px 20px 0', padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Notas del presentador</div>
            <div style={{ fontFamily: RS_MONO, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>A+</div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.45, color: 'rgba(255,255,255,0.9)' }}>{notes[p.idx]}</div>
        </div>

        {/* Quick actions row */}
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

        {/* Main remote */}
        <div style={{ marginTop: 'auto', padding: '12px 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={p.prev} disabled={p.idx === 0} style={{
            width: 64, height: 64, borderRadius: 32,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: 22, cursor: p.idx === 0 ? 'not-allowed' : 'pointer',
            opacity: p.idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <button onClick={p.next} disabled={isLast} style={{
            flex: 1, height: 64, borderRadius: 32,
            background: '#fff', color: '#0A0A0A', border: 'none',
            fontFamily: RS_FONT, fontSize: 15, fontWeight: 600, letterSpacing: 0.4,
            cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            SIGUIENTE
            <span style={{ fontFamily: RS_MONO, fontSize: 11, color: '#6B6B6B' }}>{String(p.idx+1).padStart(2,'0')} → {String(Math.min(p.idx+2,p.total)).padStart(2,'0')}</span>
          </button>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─── 6 · FULLSCREEN PRESENTATION ────────────────────────────────────
function ScreenFullscreen() {
  const p = usePresentation();
  const elapsed = useElapsed(p.startedAt);
  const pct = ((p.idx + 1) / p.total) * 100;

  return (
    <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* the slide, full bleed */}
      <div style={{ width: '100%', height: '100%', containerType: 'inline-size', position: 'relative' }}>
        {p.blackout ? (
          <div style={{ width: '100%', height: '100%', background: '#000' }} />
        ) : (
          <Slide index={p.idx} total={p.total} />
        )}
      </div>

      {/* Top-right: connection status */}
      <div style={{ position: 'absolute', top: 18, right: 22, display: 'flex', alignItems: 'center', gap: 8, fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, color: 'rgba(0,0,0,0.4)', mixBlendMode: 'difference' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>iPhone · {elapsed}</span>
      </div>

      {/* Bottom progress bar (very thin) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ width: pct + '%', height: '100%', background: PURPLE, transition: 'width .3s ease' }} />
      </div>
    </div>
  );
}

// ─── 7 · END SUMMARY ────────────────────────────────────────────────
function ScreenEnd() {
  const p = usePresentation();
  return (
    <LightBrowser url="remoteslides.app/r/k7-9q2-fx4/summary">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: PAGE_BG, fontFamily: RS_FONT, color: FG }}>
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', borderBottom: '1px solid ' + BORDER, flexShrink: 0 }}>
          <Wordmark />
          <div style={{ flex: 1 }} />
          <button style={btnGhost}>Empezar otra</button>
          <button style={{ ...btnPrimary, marginLeft: 8 }}>Descargar reporte</button>
        </div>

        <div style={{ flex: 1, padding: '40px 64px', overflow: 'auto' }}>
          <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: PURPLE, marginBottom: 8 }}>
            Presentación finalizada
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.025 + 'em', margin: 0, textWrap: 'balance' }}>
            Gran sesión, María.
          </h1>
          <p style={{ fontSize: 15, color: FG_MUTED, margin: '8px 0 32px', maxWidth: 540 }}>
            Resumen de tu presentación de hoy. Los archivos se borrarán automáticamente en 7 días.
          </p>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, overflow: 'hidden' }}>
            {[
              ['Duración', '24:18', '8 slides'],
              ['Tiempo medio / slide', '3:02', '−12% vs target'],
              ['Slide más larga', '06 · Voz del cliente', '5:44'],
              ['Conexión', 'Estable', '0 desconexiones'],
            ].map(([k,v,sub],i)=>(
              <div key={i} style={{ padding: '20px 22px', borderLeft: i ? '1px solid ' + BORDER : 'none' }}>
                <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 6 }}>{k}</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.02 + 'em' }}>{v}</div>
                <div style={{ fontSize: 11, color: FG_MUTED, fontFamily: RS_MONO, marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Tiempo por slide</div>
                  <div style={{ fontSize: 12, color: FG_MUTED }}>Minutos:segundos</div>
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
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '11em 1fr 4em', gap: 16, alignItems: 'center', marginBottom: 10, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: FG }}>
                    <span style={{ fontFamily: RS_MONO, color: '#9A9A9A' }}>{String(i+1).padStart(2,'0')}</span> {t}
                  </div>
                  <div style={{ height: 8, background: BORDER, borderRadius: 1 }}>
                    <div style={{ width: w+'%', height: '100%', background: w > 85 ? PURPLE : FG, borderRadius: 1 }} />
                  </div>
                  <div style={{ fontFamily: RS_MONO, fontVariantNumeric: 'tabular-nums', textAlign: 'right', color: FG_MUTED }}>{d}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', border: '1px solid ' + BORDER, borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: 12 }}>Acciones</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Descargar grabación · 24m',
                    'Enviar resumen al equipo',
                    'Exportar timeline (CSV)',
                    'Borrar archivo ahora',
                  ].map((t,i)=>(
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid ' + BORDER : 'none', fontSize: 13 }}>
                      <span>{t}</span>
                      <span style={{ color: FG_MUTED, fontFamily: RS_MONO, fontSize: 11 }}>→</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: FG, color: '#fff', borderRadius: 8, padding: 20 }}>
                <div style={{ fontFamily: RS_MONO, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Tip</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                  Tu Slide 6 (Voz del cliente) tomó 5:44. Para próximas veces, considerá moverla al inicio.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LightBrowser>
  );
}

// ─── Button styles ──────────────────────────────────────────────────
const btnPrimary = {
  height: 32, padding: '0 14px', borderRadius: 6,
  background: FG, color: '#fff', border: 'none',
  fontFamily: RS_FONT, fontSize: 13, fontWeight: 500,
  cursor: 'pointer', letterSpacing: -0.005 + 'em',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};
const btnGhost = {
  height: 32, padding: '0 12px', borderRadius: 6,
  background: 'transparent', color: FG, border: '1px solid ' + BORDER_STRONG,
  fontFamily: RS_FONT, fontSize: 13, fontWeight: 500, cursor: 'pointer',
};

Object.assign(window, {
  ScreenLanding, ScreenUpload, ScreenQR, ScreenPairing, ScreenRemote, ScreenFullscreen, ScreenEnd,
  LightBrowser, FakeQR, Wordmark,
});
