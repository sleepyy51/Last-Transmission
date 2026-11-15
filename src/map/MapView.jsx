import { useCallback, useMemo, useRef, useState } from 'react'
import artifacts from '../data/artifacts.json'
import StoryPanel from '../story/StoryPanel.jsx'
import { project } from './projection.js'

const BODIES = [
  { id: 'moon', label: 'Moon', map: 'maps/moon.webp' },
  { id: 'mars', label: 'Mars', map: 'maps/mars.webp' },
]

const ZOOM = 2.5

export default function MapView() {
  const [body, setBody] = useState('moon')
  const [selected, setSelected] = useState(null)
  const triggerRef = useRef(null)

  const pins = useMemo(
    () => artifacts.filter((a) => a.body === body && a.lat !== null && a.lon !== null),
    [body],
  )

  const bodyMeta = BODIES.find((b) => b.id === body)
  const active = artifacts.find((a) => a.id === selected) ?? null
  const focus = active ? project(active.lat, active.lon) : null

  // Zoom-to-pin: scale about the top-left, then shift so the point lands centre.
  const worldStyle = focus
    ? {
        transform: `translate(${50 - ZOOM * focus.x}%, ${50 - ZOOM * focus.y}%) scale(${ZOOM})`,
      }
    : undefined
  const pinScale = focus ? 1 / ZOOM : 1

  function chooseBody(id) {
    setBody(id)
    setSelected(null)
  }

  // Close returns focus to whatever opened the panel.
  const close = useCallback(() => {
    setSelected(null)
    triggerRef.current?.focus()
  }, [])

  function open(id, event) {
    triggerRef.current = event.currentTarget
    setSelected(id)
  }

  return (
    <section className="map-screen">
      <div className="map-toolbar" role="group" aria-label="Celestial body">
        {BODIES.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={b.id === body}
            onClick={() => chooseBody(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <div className="map-bezel">
          <div className="map-viewport">
            <div className="map-world" style={worldStyle}>
              <img
                className="map-image"
                src={`${import.meta.env.BASE_URL}${bodyMeta.map}`}
                alt={`Equirectangular map of ${bodyMeta.label}`}
                draggable={false}
              />
              {pins.map((a) => {
                const p = project(a.lat, a.lon)
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={a.id === selected ? 'pin is-active' : 'pin'}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%) scale(${pinScale})`,
                    }}
                    aria-label={`${a.name}, ${a.year}`}
                    aria-pressed={a.id === selected}
                    onClick={(e) => open(a.id, e)}
                  >
                    <span aria-hidden="true" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {active && (
          <StoryPanel key={active.id} artifact={active} onClose={close} />
        )}
      </div>

      <section className="artifact-list" aria-label={`${bodyMeta.label} artifacts`}>
        <h2>Artifacts</h2>
        <ul>
          {pins.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={a.id === selected}
                onClick={(e) => open(a.id, e)}
              >
                {a.name} ({a.year})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="map-caption" aria-live="polite">
        {active ? (
          <>
            <strong>{active.name}</strong>
            {active.status && <span className="status"> · {active.status}</span>}
            <button type="button" className="link" onClick={close}>
              Back
            </button>
          </>
        ) : (
          <span>
            {pins.length} artifacts on the {bodyMeta.label.toLowerCase()}
          </span>
        )}
      </div>
    </section>
  )
}
