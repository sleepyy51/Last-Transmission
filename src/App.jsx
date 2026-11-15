import { useState } from 'react'
import MapView from './map/MapView.jsx'

export default function App() {
  const [view, setView] = useState('title')

  if (view === 'map') return <MapView />

  return (
    <main className="screen">
      <h1>Last Transmission</h1>
      <p className="subtitle">Forgotten astral artifacts from mankind.</p>
      <p className="pitch">
        An interactive pixel-art map of NASA hardware still sitting on the Moon and
        Mars — and the science it made possible.
      </p>
      <div className="actions">
        {/* The guided tour lands next; disabled until it does what it says. */}
        <button disabled>Begin transmission</button>
        <button onClick={() => setView('map')}>Explore the map</button>
      </div>
    </main>
  )
}
