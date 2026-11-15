const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

// Equirectangular image: lon −180..180 → x 0..100%, lat 90..−90 → y 0..100%.
// ±180 longitude both land on an edge; which edge is irrelevant for our roster.
export function project(lat, lon) {
  const wrapped = ((((lon + 180) % 360) + 360) % 360) - 180
  return {
    x: ((wrapped + 180) / 360) * 100,
    y: ((90 - clamp(lat, -90, 90)) / 180) * 100,
  }
}
