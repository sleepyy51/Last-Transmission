export default function App() {
  return (
    <main className="screen">
      <h1>Last Transmission</h1>
      <p className="subtitle">Forgotten astral artifacts from mankind.</p>
      <p className="pitch">
        An interactive pixel-art map of NASA hardware still sitting on the Moon and
        Mars — and the science it made possible.
      </p>
      <div className="actions">
        {/* Map and tour land next; disabled until they do what they say. */}
        <button disabled>Begin transmission</button>
        <button disabled>Explore the map</button>
      </div>
    </main>
  )
}
