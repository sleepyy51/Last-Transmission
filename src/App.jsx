import { useEffect, useState } from 'react'
import { useAudio } from './audio/useAudio.js'
import MapView from './map/MapView.jsx'

export default function App() {
  const [view, setView] = useState('title')
  const [scene, setScene] = useState('story')
  const [aboutOpen, setAboutOpen] = useState(false)
  const { started, muted, start, toggleMute } = useAudio(
    view === 'title' ? 'title' : scene,
  )

  // Autoplay needs a gesture: the title theme starts on the first click or key
  // press on the title screen.
  useEffect(() => {
    if (started || view !== 'title') return
    const onGesture = () => start()
    window.addEventListener('pointerdown', onGesture, { once: true })
    window.addEventListener('keydown', onGesture, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [started, view, start])

  const screen =
    view === 'title' ? (
      <main className="screen">
        <h1>Last Transmission</h1>
        <p className="subtitle">Forgotten astral artifacts from mankind.</p>
        <p className="pitch">
          An interactive pixel-art map of NASA hardware still sitting on the Moon and
          Mars — and the science it made possible.
        </p>
        <div className="actions">
          <button onClick={() => setView('tour')}>Begin transmission</button>
          <button onClick={() => setView('explore')}>Explore the map</button>
        </div>
      </main>
    ) : (
      <MapView
        guided={view === 'tour'}
        onSceneChange={setScene}
        onFinish={() => setView('title')}
      />
    )

  return (
    <>
      {screen}
      {started && (
        <button
          type="button"
          className="audio-toggle"
          aria-pressed={muted}
          onClick={toggleMute}
        >
          Mute
        </button>
      )}
      <button
        type="button"
        className="about-toggle"
        aria-expanded={aboutOpen}
        aria-controls="about-panel"
        onClick={() => setAboutOpen((open) => !open)}
      >
        About
      </button>
      {aboutOpen && (
        <aside id="about-panel" className="about-panel" aria-labelledby="about-heading">
          <button
            type="button"
            className="about-close"
            aria-label="Close About panel"
            onClick={() => setAboutOpen(false)}
          >
            ×
          </button>
          <h2 id="about-heading">About</h2>
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
          </ul>
        </aside>
      )}
    </>
  )
}
