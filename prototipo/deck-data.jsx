// Demo deck data + slide renderer + shared presentation state.
// One React context drives every screen so the phone "remote" really
// navigates the laptop preview and the fullscreen view in lockstep.

const RS_FONT = "'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const RS_MONO = "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace";

// ─── Demo deck: "Pulse — Q3 Product Review" ─────────────────────────
const DECK = {
  title: 'Pulse — Q3 Product Review',
  author: 'María Restrepo',
  filename: 'Pulse-Q3-2025.pptx',
  filesize: '14.2 MB',
  slides: [
    { kind: 'title' },
    { kind: 'agenda' },
    { kind: 'summary' },
    { kind: 'metrics' },
    { kind: 'launches' },
    { kind: 'voice' },
    { kind: 'roadmap' },
    { kind: 'closing' },
  ],
};

// ─── Slide chrome shared by every kind ──────────────────────────────
function SlideShell({ children, bg = '#ffffff', label, num, total, padded = true }) {
  return (
    <div
      data-screen-label={`Slide ${num}`}
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: bg, color: '#0A0A0A',
        fontFamily: RS_FONT, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: padded ? '7% 7.5%' : 0,
        boxSizing: 'border-box',
      }}
    >
      {children}
      {label && (
        <div style={{
          position: 'absolute', top: '5%', left: '7.5%',
          fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.6,
          textTransform: 'uppercase', color: '#9A9A9A',
        }}>
          {label}
        </div>
      )}
      {num !== undefined && (
        <div style={{
          position: 'absolute', bottom: '5%', right: '7.5%',
          fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.4,
          color: '#9A9A9A', fontVariantNumeric: 'tabular-nums',
        }}>
          {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}

// ─── Slide kinds ────────────────────────────────────────────────────
function SlideTitle({ num, total }) {
  return (
    <SlideShell num={num} total={total} bg="#0A0A0A">
      <div style={{ color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: RS_MONO, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
          Pulse · Internal review
        </div>
        <div>
          <div style={{ fontSize: '6.5cqw', fontWeight: 600, lineHeight: 0.95, letterSpacing: -0.04 + 'em', marginBottom: '0.4em' }}>
            Q3 Product<br />Review
          </div>
          <div style={{ fontSize: '1.8cqw', color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>
            Septiembre 2025 — María Restrepo, Head of Product
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: RS_MONO, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.3)' }} />
          PULSE.CO / Q3-2025
        </div>
      </div>
    </SlideShell>
  );
}

function SlideAgenda({ num, total }) {
  const items = [
    '01 Resumen ejecutivo',
    '02 Métricas del trimestre',
    '03 Lo que lanzamos',
    '04 Voz del cliente',
    '05 Hoja de ruta Q4',
  ];
  return (
    <SlideShell num={num} total={total} label="Agenda">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6%', alignContent: 'center', alignItems: 'start' }}>
        <div style={{ fontSize: '4.4cqw', fontWeight: 600, lineHeight: 1, letterSpacing: -0.03 + 'em' }}>
          Agenda
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4cqw' }}>
          {items.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.8cqw', alignItems: 'baseline', fontSize: '1.9cqw', borderTop: '1px solid rgba(10,10,10,0.08)', paddingTop: '1.4cqw' }}>
              <span style={{ fontFamily: RS_MONO, fontSize: '1cqw', color: '#9A9A9A', minWidth: '2.5em' }}>{t.slice(0,2)}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{t.slice(3)}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function SlideSummary({ num, total }) {
  return (
    <SlideShell num={num} total={total} label="01 · Resumen ejecutivo">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '85%' }}>
        <div style={{ fontSize: '3.4cqw', fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.025 + 'em', textWrap: 'pretty' }}>
          Cerramos Q3 con <span style={{ color: 'oklch(0.55 0.21 285)' }}>+38% en retención semanal</span> y el lanzamiento de Pulse Live, nuestro mayor release del año.
        </div>
        <div style={{ marginTop: '3cqw', display: 'flex', gap: '4cqw' }}>
          {[['Usuarios activos', '124.8K', '+22%'], ['ARR', '$8.4M', '+31%'], ['NPS', '64', '+9 pts']].map(([k,v,d],i)=>(
            <div key={i} style={{ flex: 1 }}>
              <div style={{ fontFamily: RS_MONO, fontSize: '0.95cqw', letterSpacing: 1.2, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: '0.4cqw' }}>{k}</div>
              <div style={{ fontSize: '2.6cqw', fontWeight: 600, letterSpacing: -0.02 + 'em' }}>{v}</div>
              <div style={{ fontFamily: RS_MONO, fontSize: '0.95cqw', color: 'oklch(0.55 0.21 285)' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function SlideMetrics({ num, total }) {
  const bars = [
    { label: 'WAU', v: 86, val: '124.8K' },
    { label: 'MAU', v: 92, val: '312K' },
    { label: 'Paid seats', v: 64, val: '8.4K' },
    { label: 'NRR', v: 78, val: '128%' },
    { label: 'Churn', v: 12, val: '1.8%' },
  ];
  return (
    <SlideShell num={num} total={total} label="02 · Métricas del trimestre">
      <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '6%', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '3cqw', fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', marginBottom: '1cqw' }}>
            Crecimiento sostenido en todas las métricas norte.
          </div>
          <div style={{ fontSize: '1.3cqw', color: '#6B6B6B', lineHeight: 1.4, maxWidth: '85%' }}>
            Trimestre a trimestre versus Q2 2025. Churn se mantiene bajo nuestro objetivo del 2.5%.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1cqw' }}>
          {bars.map((b,i)=>(
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '6em 1fr 5em', gap: '1.4cqw', alignItems: 'center', fontFamily: RS_MONO, fontSize: '1cqw' }}>
              <div style={{ color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 }}>{b.label}</div>
              <div style={{ height: 10, background: 'rgba(10,10,10,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${b.v}%`, height: '100%', background: '#0A0A0A' }} />
              </div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: '#0A0A0A' }}>{b.val}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function SlideLaunches({ num, total }) {
  const items = [
    { tag: 'Release', t: 'Pulse Live', d: 'Dashboards en tiempo real con sub-segundo de latencia.' },
    { tag: 'Beta', t: 'Anomaly detection', d: 'Modelos de ML que detectan desviaciones en métricas clave.' },
    { tag: 'GA', t: 'Slack 2.0', d: 'Integración rediseñada con threading y reacciones bidireccionales.' },
    { tag: 'API', t: 'v3 streaming', d: 'Cursor-based pagination, webhooks firmados, 10× throughput.' },
  ];
  return (
    <SlideShell num={num} total={total} label="03 · Lo que lanzamos">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '3cqw', fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', marginBottom: '2.4cqw', maxWidth: '70%' }}>
          Cuatro lanzamientos clave en 12 semanas.
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.6cqw', alignContent: 'start' }}>
          {items.map((it,i)=>(
            <div key={i} style={{ border: '1px solid rgba(10,10,10,0.1)', borderRadius: 4, padding: '1.8cqw', display: 'flex', flexDirection: 'column', gap: '0.6cqw' }}>
              <div style={{ fontFamily: RS_MONO, fontSize: '0.85cqw', letterSpacing: 1.4, textTransform: 'uppercase', color: 'oklch(0.55 0.21 285)' }}>{it.tag}</div>
              <div style={{ fontSize: '1.8cqw', fontWeight: 600, letterSpacing: -0.02 + 'em' }}>{it.t}</div>
              <div style={{ fontSize: '1.05cqw', color: '#6B6B6B', lineHeight: 1.4 }}>{it.d}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function SlideVoice({ num, total }) {
  return (
    <SlideShell num={num} total={total} label="04 · Voz del cliente" bg="#FAFAF7">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '78%' }}>
        <div style={{ fontFamily: RS_MONO, fontSize: '0.95cqw', letterSpacing: 1.4, textTransform: 'uppercase', color: '#9A9A9A', marginBottom: '1.4cqw' }}>
          Linear · Customer interview · 14 ago
        </div>
        <div style={{ fontSize: '3cqw', fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.022 + 'em', textWrap: 'balance' }}>
          “Pulse Live nos cortó el tiempo de respuesta a incidentes a la mitad. Es el primer dashboard que sentimos vivo.”
        </div>
        <div style={{ marginTop: '2.2cqw', display: 'flex', alignItems: 'center', gap: '1cqw' }}>
          <div style={{ width: '2.4cqw', height: '2.4cqw', borderRadius: '50%', background: 'linear-gradient(135deg, #0A0A0A, #6B6B6B)' }} />
          <div>
            <div style={{ fontSize: '1.1cqw', fontWeight: 600 }}>Karri Saarinen</div>
            <div style={{ fontSize: '0.95cqw', color: '#6B6B6B' }}>CEO, Linear</div>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}

function SlideRoadmap({ num, total }) {
  const cols = [
    { q: 'Oct', items: ['Pulse Mobile · GA', 'Audit log v2', 'Custom dashboards'] },
    { q: 'Nov', items: ['Forecasting beta', 'SSO con SCIM', 'Retención de 24 meses'] },
    { q: 'Dic', items: ['Public roadmap', 'Pulse Copilot · alpha', 'Compliance: SOC2 Type II'] },
  ];
  return (
    <SlideShell num={num} total={total} label="05 · Hoja de ruta Q4">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '3cqw', fontWeight: 600, lineHeight: 1.05, letterSpacing: -0.025 + 'em', marginBottom: '2cqw' }}>
          Q4: profundizar antes de expandir.
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.4cqw' }}>
          {cols.map((c,i)=>(
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1cqw' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6cqw', paddingBottom: '0.8cqw', borderBottom: '1px solid rgba(10,10,10,0.12)' }}>
                <div style={{ width: '0.5cqw', height: '0.5cqw', borderRadius: '50%', background: 'oklch(0.55 0.21 285)' }} />
                <div style={{ fontFamily: RS_MONO, fontSize: '1cqw', letterSpacing: 1.2, textTransform: 'uppercase' }}>{c.q}</div>
              </div>
              {c.items.map((t,j)=>(
                <div key={j} style={{ fontSize: '1.2cqw', lineHeight: 1.4, color: '#0A0A0A' }}>{t}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}

function SlideClosing({ num, total }) {
  return (
    <SlideShell num={num} total={total} bg="#0A0A0A">
      <div style={{ color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ fontFamily: RS_MONO, fontSize: '0.95cqw', letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '1.4cqw' }}>
          Fin · gracias
        </div>
        <div style={{ fontSize: '5.5cqw', fontWeight: 600, lineHeight: 0.95, letterSpacing: -0.04 + 'em' }}>
          Preguntas.
        </div>
        <div style={{ marginTop: '2.2cqw', fontSize: '1.4cqw', color: 'rgba(255,255,255,0.55)' }}>
          maria@pulse.co · #q3-review en Slack
        </div>
      </div>
    </SlideShell>
  );
}

// ─── Renderer ───────────────────────────────────────────────────────
function Slide({ index, total }) {
  const kind = DECK.slides[index]?.kind;
  const props = { num: index + 1, total: total ?? DECK.slides.length };
  switch (kind) {
    case 'title':    return <SlideTitle {...props} />;
    case 'agenda':   return <SlideAgenda {...props} />;
    case 'summary':  return <SlideSummary {...props} />;
    case 'metrics':  return <SlideMetrics {...props} />;
    case 'launches': return <SlideLaunches {...props} />;
    case 'voice':    return <SlideVoice {...props} />;
    case 'roadmap':  return <SlideRoadmap {...props} />;
    case 'closing':  return <SlideClosing {...props} />;
    default:         return <SlideShell {...props}>—</SlideShell>;
  }
}

const SLIDE_TITLES = ['Portada', 'Agenda', 'Resumen ejecutivo', 'Métricas', 'Lanzamientos', 'Voz del cliente', 'Hoja de ruta', 'Cierre'];

// ─── Shared presentation state (drives every artboard) ──────────────
const PresentationCtx = React.createContext(null);

function PresentationProvider({ children }) {
  const [idx, setIdx] = React.useState(0);
  const [blackout, setBlackout] = React.useState(false);
  const [startedAt] = React.useState(() => Date.now() - 12 * 60 * 1000 - 34 * 1000); // pretend we're 12:34 in
  const total = DECK.slides.length;

  const next = React.useCallback(() => setIdx(i => Math.min(i + 1, total - 1)), [total]);
  const prev = React.useCallback(() => setIdx(i => Math.max(i - 1, 0)), []);
  const go = React.useCallback((i) => setIdx(Math.max(0, Math.min(total - 1, i))), [total]);

  const value = React.useMemo(() => ({
    idx, total, next, prev, go,
    blackout, setBlackout,
    startedAt,
    deck: DECK,
    titles: SLIDE_TITLES,
  }), [idx, total, next, prev, go, blackout, startedAt]);

  return <PresentationCtx.Provider value={value}>{children}</PresentationCtx.Provider>;
}

const usePresentation = () => React.useContext(PresentationCtx);

// Live clock for the timer pieces
function useElapsed(startedAt) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

Object.assign(window, {
  RS_FONT, RS_MONO,
  Slide, DECK, SLIDE_TITLES,
  PresentationProvider, usePresentation, useElapsed,
});
