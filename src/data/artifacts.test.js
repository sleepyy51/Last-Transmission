import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const artifacts = JSON.parse(
  readFileSync(new URL('./artifacts.json', import.meta.url), 'utf8'),
)

test('every artifact has a narrator story and fact checks', () => {
  for (const artifact of artifacts) {
    const { narrator } = artifact
    assert.ok(narrator, `${artifact.id} has no narrator`)
    assert.ok(
      Array.isArray(narrator.story) && narrator.story.length > 0,
      `${artifact.id} has no narrator story`,
    )
    for (const paragraph of narrator.story) {
      assert.ok(paragraph.trim(), `${artifact.id} has an empty story paragraph`)
    }
    assert.ok(
      Array.isArray(narrator.factCheck) && narrator.factCheck.length > 0,
      `${artifact.id} has no fact checks`,
    )
    for (const { claim, correction } of narrator.factCheck) {
      assert.ok(claim.trim(), `${artifact.id} has an empty claim`)
      assert.ok(correction.trim(), `${artifact.id} has an empty correction`)
    }
  }
})
