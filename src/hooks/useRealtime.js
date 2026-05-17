import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Manages a Supabase Realtime broadcast channel for session sync.
// Returns sendControl(payload) to emit events from either side.
export function useRealtime({ roomCode, onControl, enabled = true }) {
  const channelRef = useRef(null)
  const onControlRef = useRef(onControl)
  onControlRef.current = onControl

  useEffect(() => {
    if (!roomCode || !enabled) return

    const channel = supabase.channel(`rs-${roomCode}`, {
      config: { broadcast: { self: false } },
    })

    channel
      .on('broadcast', { event: 'control' }, ({ payload }) => {
        onControlRef.current?.(payload)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [roomCode, enabled])

  const sendControl = useCallback((payload) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'control',
      payload,
    })
  }, [])

  return { sendControl }
}

// Updates the session's current_slide in the DB (for state recovery on reconnect)
export async function persistSlide(roomCode, currentSlide, isBlackout) {
  await supabase
    .from('sessions')
    .update({ current_slide: currentSlide, is_blackout: isBlackout })
    .eq('room_code', roomCode)
}
