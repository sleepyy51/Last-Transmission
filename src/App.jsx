import { useState } from 'react'
import MapView from './map/MapView.jsx'

export default function App() {
  const [view, setView] = useState('title')

  if (view !== 'title') return <MapView guided={view === 'tour'} />

  return (
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
  )
}
