import { useCallback, useEffect, useRef, useState } from 'react'

const asset = (path) => `${import.meta.env.BASE_URL}${path}`

const MUSIC = {
  title: 'audio/at-the-end-of-all-things.mp3',
  story: 'audio/clear-skies.mp3',
  deepSpace: 'audio/with-these-hands.mp3',
}
const CLICK = 'audio/sfx/click.mp3'

const VOLUME = 0.4
const FADE_MS = 800
const MUTE_MS = 300

// Drives one volume animation at a time; every new transition cancels the old.
function ramp(frame, ms, tick, done) {
  cancelAnimationFrame(frame.current)
  const start = performance.now()
  const step = (now) => {
    // A rAF timestamp can predate the performance.now() that scheduled it.
    const t = Math.min(Math.max((now - start) / ms, 0), 1)
    tick(t)
    if (t < 1) frame.current = requestAnimationFrame(step)
    else done?.()
  }
  frame.current = requestAnimationFrame(step)
}

// Music: one live track with a second element during a transition. Elements are
// created on the first gesture (browsers block autoplay) and lazy-loaded.
// Audio is decorative: a failed play is ignored.
export function useAudio(scene) {
  const music = useRef(null)
  const outgoing = useRef(null)
  const frame = useRef(0)
  const click = useRef(null)
  const [started, setStarted] = useState(false)
  const [musicMuted, setMusicMuted] = useState(false)
  const [sfxMuted, setSfxMuted] = useState(false)
  const start = useCallback(() => setStarted(true), [])
  const toggleMusic = useCallback(() => setMusicMuted((m) => !m), [])
  const toggleSfx = useCallback(() => setSfxMuted((m) => !m), [])

  useEffect(() => {
    if (!started) return

    const stopOutgoing = () => {
      outgoing.current?.pause()
      outgoing.current = null
    }

    const fadeTo = (el, target, ms, done) => {
      const from = el.volume
      ramp(frame, ms, (t) => {
        el.volume = from + (target - from) * t
      }, done)
    }

    const crossFade = (out, next, done) => {
      const outFrom = out.volume
      const nextFrom = next.volume
      ramp(frame, FADE_MS, (t) => {
        out.volume = outFrom * (1 - t)
        next.volume = nextFrom + (VOLUME - nextFrom) * t
      }, done)
    }

    // Muted: fade the live track out, then stop it. Nothing new starts.
    if (musicMuted) {
      stopOutgoing()
      const el = music.current
      if (el) fadeTo(el, 0, MUTE_MS, () => el.pause())
      return
    }

    const target = asset(MUSIC[scene])
    const current = music.current

    if (!current) {
      const el = new Audio(target)
      el.loop = true
      el.volume = 0
      music.current = el
      el.play().catch(() => {})
      fadeTo(el, VOLUME, FADE_MS)
      return
    }

    if (current.getAttribute('src') === target) {
      if (current.paused) {
        current.play().catch(() => {})
        fadeTo(current, VOLUME, FADE_MS)
      } else if (current.volume < VOLUME) {
        fadeTo(current, VOLUME, MUTE_MS)
      }
      return
    }

    stopOutgoing()
    const next = new Audio(target)
    next.loop = true
    next.volume = 0
    next.play().catch(() => {})
    music.current = next
    outgoing.current = current
    crossFade(current, next, () => {
      current.pause()
      outgoing.current = null
    })
  }, [started, scene, musicMuted])

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      music.current?.pause()
      outgoing.current?.pause()
    },
    [],
  )

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
