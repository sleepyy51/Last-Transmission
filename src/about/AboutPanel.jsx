import { useEffect, useRef } from 'react'

export default function AboutPanel({
  onClose,
  musicMuted,
  onToggleMusic,
  sfxMuted,
  onToggleSfx,
}) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [])

  return (
    <aside
      id="about-panel"
      className="about-panel"
      role="dialog"
      aria-labelledby="about-heading"
    >
      <button
        ref={closeRef}
        type="button"
        className="about-close"
        aria-label="Close About panel"
        onClick={onClose}
      >
        ×
      </button>

      <h2 id="about-heading">About</h2>

      <h3>Audio</h3>
      <div className="audio-settings">
        <label>
          <input type="checkbox" checked={!musicMuted} onChange={onToggleMusic} />
          Music
        </label>
        <label>
          <input type="checkbox" checked={!sfxMuted} onChange={onToggleSfx} />
          Click effects
        </label>
      </div>

      <h3>Credits</h3>
      <ul>
        <li>Moon basemap: NASA Scientific Visualization Studio, CGI Moon Kit (LROC colour).</li>
        <li>Mars basemap: USGS Astrogeology, MOLA colour hillshade.</li>
        <li>Both basemaps are public domain.</li>
        <li>Art credits will be added alongside those assets.</li>
        <li>
          All background music tracks are composed by{' '}
          <strong>Scott Buckley</strong> (
          <a href="https://www.scottbuckley.com.au">www.scottbuckley.com.au</a>) and
          licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/">
            Creative Commons Attribution 4.0 International (CC BY 4.0)
          </a>
          :
          <ul>
            <li><strong>"At The End Of All Things"</strong> – Intro &amp; Outro theme</li>
            <li><strong>"Clear Skies"</strong> – Story introduction theme</li>
            <li><strong>"With These Hands"</strong> – Act III transition theme</li>
          </ul>
        </li>
        <li>
          All sound effects are from <strong>Hove Audio</strong> (
          <a href="https://hoveaudio.itch.io/">hoveaudio.itch.io</a>).
        </li>
      </ul>
    </aside>
  )
}
