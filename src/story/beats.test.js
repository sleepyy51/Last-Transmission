import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { beats } from './beats.js'

const artifacts = JSON.parse(
  readFileSync(new URL('../data/artifacts.json', import.meta.url), 'utf8'),
)

test('keeps short paragraphs whole and never merges paragraphs', () => {
  assert.deepEqual(beats(['Dear Spirit,', 'I was a test. I became a pilot.']), [
    'Dear Spirit,',
    'I was a test. I became a pilot.',
  ])
})

test('splits a long paragraph at sentence ends', () => {
  const long = `${'A'.repeat(150)}. ${'B'.repeat(150)}.`
  const lines = beats([long])
  assert.equal(lines.length, 2)
  assert.ok(lines.every((line) => line.length <= 240))
})

test('preserves every word of the real stories', () => {
  for (const artifact of artifacts) {
    const story = artifact.narrator.story
    assert.equal(
      beats(story).join(' '),
      story.join(' ').replace(/\s+/g, ' '),
      artifact.id,
    )
  }
})
