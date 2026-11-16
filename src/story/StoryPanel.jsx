import { useEffect, useMemo, useRef, useState } from 'react'
import { beats } from './beats.js'

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

function Narrator({ artifact }) {
  const lines = useMemo(() => beats(artifact.narrator.story), [artifact])
  const [step, setStep] = useState(-1)
  const last = lines.length - 1
  const done = step >= last
  const part = step + 1

  // The last click starts the story over instead of doing nothing.
  const advance = () => setStep((current) => (current >= last ? 0 : current + 1))

  const portraitLabel =
    step === -1
      ? `Ask Nib to tell the story of ${artifact.name}`
      : done
        ? `Hear Nib tell the story of ${artifact.name} again`
        : `Next part of Nib's story, part ${part + 1} of ${lines.length}`

  return (
    <section className="narrator" aria-label={`Nib's story of ${artifact.name}`}>
      <div className="narrator-head">
        <button
          type="button"
          className="narrator-portrait-button"
          onClick={advance}
          aria-label={portraitLabel}
        >
          <img
            className="narrator-portrait"
            src={asset('narrator/cat.webp')}
            alt=""
          />
        </button>
        <div>
          <p className="narrator-name">Nib</p>
          <p className="narrator-role">Martian cat, storyteller</p>
        </div>
      </div>

      <div className="narrator-bubble">
        <p
          className={step === -1 ? 'narrator-story is-intro' : 'narrator-story'}
          aria-live="polite"
        >
          <span className="narrator-line" key={step}>
            {step === -1
              ? `I know ${artifact.name}'s story. Want to hear how it really went?`
              : lines[step]}
          </span>
        </p>
        <div className="narrator-foot">
          {step >= 0 && (
            <p className="narrator-count">
              Part {part} of {lines.length}
            </p>
          )}
          <button type="button" className="narrator-next" onClick={advance}>
            {step === -1 ? 'Tell me' : done ? 'Tell it again' : 'Next'}
          </button>
        </div>
      </div>

      <details className="narrator-reveal">
        <summary>Was that all true?</summary>
        <div className="narrator-facts">
          <p className="narrator-intro">I checked the mission files.</p>
          {artifact.narrator.factCheck.map(({ claim, correction }, index) => (
            <div className="narrator-fact" key={index}>
              <p className="narrator-claim">{claim}</p>
              <p className="narrator-correction">{correction}</p>
            </div>
          ))}
        </div>
      </details>
    </section>
  )
}

// focusOnMount is false during the tour so Next/Previous keep keyboard focus.
export default function StoryPanel({ artifact, onClose, focusOnMount = true }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (focusOnMount) panelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <aside
      ref={panelRef}
      className="story-panel"
      tabIndex={-1}
      aria-labelledby="story-title"
    >
      <button
        type="button"
        className="story-close"
        onClick={onClose}
        aria-label="Close story"
      >
        ×
      </button>

      <p className="story-year">{artifact.year}</p>
      <h2 id="story-title">{artifact.name}</h2>
      {artifact.status && <p className="story-status">{artifact.status}</p>}

      {artifact.image && (
        <img
          className="story-image"
          src={asset(artifact.image)}
          alt={artifact.name}
        />
      )}

      {artifact.transmission && (
        <blockquote className="story-transmission">
          “{artifact.transmission}”
        </blockquote>
      )}

      {artifact.narrator ? (
        <Narrator artifact={artifact} />
      ) : artifact.story ? (
        <p className="story-body">{artifact.story}</p>
      ) : (
        <p className="story-todo">Story coming soon.</p>
      )}

      {artifact.source && (
        <a
          className="story-source"
          href={artifact.source}
          target="_blank"
          rel="noreferrer"
        >
          Read the NASA source ↗
        </a>
      )}
    </aside>
  )
}
