const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function segment(n) {
  return Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
}

export function generateRoomCode() {
  return `${segment(2)}-${segment(3)}-${segment(3)}`
}

export function formatRoomCode(code) {
  return code.toUpperCase()
}
