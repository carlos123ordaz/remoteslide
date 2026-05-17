// Shared button styles
const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontFamily: "'Geist', system-ui, sans-serif",
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  borderRadius: 6,
  letterSpacing: '-0.005em',
  transition: 'opacity 0.15s',
}

export function BtnPrimary({ children, style, height = 34, ...props }) {
  return (
    <button
      {...props}
      style={{
        ...base,
        height,
        padding: '0 14px',
        background: '#0A0A0A',
        color: '#fff',
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function BtnGhost({ children, style, height = 34, ...props }) {
  return (
    <button
      {...props}
      style={{
        ...base,
        height,
        padding: '0 12px',
        background: 'transparent',
        color: '#0A0A0A',
        border: '1px solid rgba(10,10,10,0.14)',
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function BtnIcon({ children, style, disabled, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        ...base,
        width: 32,
        height: 32,
        padding: 0,
        background: disabled ? 'transparent' : '#fff',
        color: disabled ? '#C9C8C2' : '#0A0A0A',
        border: '1px solid rgba(10,10,10,0.14)',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}
