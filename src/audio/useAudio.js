import { useCallback, useEffect, useRef, useState } from 'react'

const TRACKS = {
  title: 'audio/at-the-end-of-all-things.mp3',
  story: 'audio/clear-skies.mp3',
  deepSpace: 'audio/with-these-hands.mp3',
}

// One Audio element, created on the first gesture (browsers block autoplay) and
// reused as the track changes. Audio is decorative: a failed play is ignored.
export function useAudio(track) {
  const audio = useRef(null)
  const [started, setStarted] = useState(false)
  const [muted, setMuted] = useState(false)
  const start = useCallback(() => setStarted(true), [])
  const toggleMute = useCallback(() => setMuted((m) => !m), [])

  useEffect(() => {
    if (!started) return
    const el = (audio.current ??= new Audio())
    el.loop = true
    el.volume = 0.4
    el.muted = muted
    const src = `${import.meta.env.BASE_URL}${TRACKS[track]}`
    if (el.getAttribute('src') !== src) el.src = src
    el.play().catch(() => {})
  }, [started, track, muted])

  return { started, muted, start, toggleMute }
}
