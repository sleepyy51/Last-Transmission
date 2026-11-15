import { useCallback, useMemo, useRef, useState } from 'react'
import artifacts from '../data/artifacts.json'
import StoryPanel from '../story/StoryPanel.jsx'
import { useTour } from '../tour/useTour.js'
import { project } from './projection.js'

const BODIES = [
  { id: 'moon', label: 'Moon', map: 'maps/moon.webp' },
  { id: 'mars', label: 'Mars', map: 'maps/mars.webp' },
  { id: 'deep-space', label: 'Deep space' },
]

const ZOOM = 2.5

export default function MapView({ guided = false }) {
  const [body, setBody] = useState('moon')
  const [selected, setSelected] = useState(null)
  const triggerRef = useRef(null)
  const tour = useTour(artifacts, guided)

  // A tour stop wins over a free-explore selection; both decide the body.
  const active = tour.current ?? artifacts.find((a) => a.id === selected) ?? null
  const currentBody = active?.body ?? body
  const bodyMeta = BODIES.find((b) => b.id === currentBody)
  const entries = artifacts.filter((a) => a.body === currentBody)

  // Deep-space entries have no map; lay them out evenly across the starfield.
  const deepPositions = useMemo(() => {
    const deep = artifacts.filter((a) => a.body === 'deep-space')
    return new Map(
      deep.map((a, i) => [
        a.id,
        { x: ((i + 0.5) / deep.length) * 100, y: i % 2 ? 62 : 38 },
      ]),
    )
  }, [])

  const place = (a) => deepPositions.get(a.id) ?? project(a.lat, a.lon)
  const focus = active ? place(active) : null

  // Zoom-to-pin: scale about the top-left, then shift so the point lands centre.
  const worldStyle = focus
    ? {
        transform: `translate(${50 - ZOOM * focus.x}%, ${50 - ZOOM * focus.y}%) scale(${ZOOM})`,
      }
    : undefined
  const pinScale = focus ? 1 / ZOOM : 1

  function chooseBody(id) {
    tour.end()
    setBody(id)
    setSelected(null)
  }

  // Close returns focus to whatever opened the panel, and drops out of the tour.
  const close = useCallback(() => {
    if (tour.current) setBody(tour.current.body)
    tour.end()
    setSelected(null)
    triggerRef.current?.focus()
  }, [tour])

  function open(id, event) {
    triggerRef.current = event.currentTarget
    setSelected(id)
  }

  function startTour() {
    setSelected(null)
    tour.start()
  }

  return (
    <section className="map-screen">
      <div className="map-toolbar" role="group" aria-label="Celestial body">
        {BODIES.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-pressed={b.id === currentBody}
            onClick={() => chooseBody(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="map-layout">
        <div className="map-bezel">
          <div className="map-viewport">
            <div
              className={bodyMeta.map ? 'map-world' : 'map-world starfield'}
              style={worldStyle}
            >
              {bodyMeta.map && (
                <img
                  className="map-image"
                  src={`${import.meta.env.BASE_URL}${bodyMeta.map}`}
                  alt={`Equirectangular map of ${bodyMeta.label}`}
                  draggable={false}
                />
              )}
              {entries.map((a) => {
                const p = place(a)
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={a.id === active?.id ? 'pin is-active' : 'pin'}
                    style={{
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      transform: `translate(-50%, -50%) scale(${pinScale})`,
                    }}
                    aria-label={`${a.name}, ${a.year}`}
                    aria-pressed={a.id === active?.id}
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
          <StoryPanel
            key={active.id}
            artifact={active}
            onClose={close}
            focusOnMount={!tour.current}
          />
        )}
      </div>

      <section className="artifact-list" aria-label={`${bodyMeta.label} artifacts`}>
        <h2>Artifacts</h2>
        <ul>
          {entries.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                aria-pressed={a.id === active?.id}
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
          <>
            <span>
              {entries.length} artifacts · {bodyMeta.label}
            </span>
            <button type="button" className="link" onClick={startTour}>
              Start tour
            </button>
          </>
        )}

        {tour.index !== null && (
          <div className="tour-controls">
            <button
              type="button"
              onClick={tour.prev}
              disabled={tour.index === 0}
            >
              Previous
            </button>
            <span>
              Stop {tour.index + 1} of {artifacts.length}
            </span>
            <button
              type="button"
              onClick={tour.next}
              disabled={tour.index === artifacts.length - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
