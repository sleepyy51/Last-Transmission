import { useCallback, useEffect, useRef, useState } from 'react'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const MUSIC = {
  title: 'audio/at-the-end-of-all-things.mp3',
  story: 'audio/clear-skies.mp3',
  deepSpace: 'audio/with-these-hands.mp3',
}
const CLICK = 'audio/sfx/click.mp3'

// Music: one Audio element, created on the first gesture (browsers block
// autoplay) and reused as the track changes. Click effects are a second,
// lazily created element. Audio is decorative: a failed play is ignored.
export function useAudio(scene) {
  const music = useRef(null)
  const click = useRef(null)
  const [started, setStarted] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [sfxMuted, setSfxMuted] = useState(false)
  const start = useCallback(() => setStarted(true), [])
  const toggleMusic = useCallback(() => setMusicMuted((m) => !m), [])
  const toggleSfx = useCallback(() => setSfxMuted((m) => !m), [])

  useEffect(() => {
    if (!started) return
    const el = (music.current ??= new Audio())
    el.loop = true
    el.volume = 0.4
    el.muted = musicMuted
    const src = asset(MUSIC[scene])
    if (el.getAttribute('src') !== src) el.src = src
    el.play().catch(() => {})
  }, [started, scene, musicMuted])

  const playClick = useCallback(() => {
    if (sfxMuted) return
    const el = (click.current ??= new Audio(asset(CLICK)))
    el.volume = 0.3
    el.currentTime = 0
    el.play().catch(() => {})
  }, [sfxMuted])

  return {
    started,
    musicMuted,
    sfxMuted,
    start,
    toggleMusic,
    toggleSfx,
    playClick,
  }
}
