import { useEffect, useRef } from 'react'

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

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

      {artifact.story ? (
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
