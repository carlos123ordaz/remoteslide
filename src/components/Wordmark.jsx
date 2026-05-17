export function Wordmark({ size = 18, color = '#0A0A0A' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: "'Geist', system-ui, sans-serif",
        color,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.01em',
        userSelect: 'none',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
        <rect x="0.5" y="0.5" width="17" height="17" rx="4" stroke={color} strokeOpacity="0.9" />
        <rect x="4" y="4" width="6" height="6" rx="1" fill={color} />
        <rect x="11" y="11" width="3" height="3" rx="0.5" fill={color} fillOpacity="0.6" />
      </svg>
      <span>RemoteSlides</span>
    </div>
  )
}
