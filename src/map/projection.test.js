import test from 'node:test'
import assert from 'node:assert/strict'
import { project } from './projection.js'

test('equirectangular anchors', () => {
  assert.deepEqual(project(0, 0), { x: 50, y: 50 })
  assert.deepEqual(project(90, 0), { x: 50, y: 0 })
  assert.deepEqual(project(-90, 0), { x: 50, y: 100 })
})

test('longitude wraps around the antimeridian', () => {
  assert.deepEqual(project(0, 541), project(0, -179))
})

test('Apollo 11 sits where the map says it does', () => {
  const eagle = project(0.67, 23.47)
  assert.ok(Math.abs(eagle.x - 56.52) < 0.01)
  assert.ok(Math.abs(eagle.y - 49.63) < 0.01)
})
