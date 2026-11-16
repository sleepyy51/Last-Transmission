import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { project } from '../src/map/projection.js'
import { beats } from '../src/story/beats.js'

const artifacts = JSON.parse(
  readFileSync(new URL('../src/data/artifacts.json', import.meta.url), 'utf8'),
)
const ZOOM = 2.5
const expectedTransform = (a) => {
  const { x, y } = project(a.lat, a.lon)
  return { x: 50 - ZOOM * x, y: 50 - ZOOM * y }
}

test('title screen loads', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Last Transmission' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Begin transmission' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Explore the map' })).toBeVisible()
  await page.getByRole('button', { name: 'Pause stars' }).click()
  await expect(page.getByRole('button', { name: 'Resume stars' })).toBeVisible()
  expect(
    await page.locator('.site-logo').evaluate((el) => el.naturalWidth),
  ).toBeGreaterThan(0)
})

test('tour advances through all stops and finishes', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Begin transmission' }).click()

  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()

  for (const [i, artifact] of artifacts.entries()) {
    await expect(page.locator('#story-title')).toHaveText(artifact.name)
    await expect(page.locator('.narrator-story')).toBeVisible()
    await expect(page.locator('.narrator-fact')).not.toHaveCount(0)
    await expect(page.locator('.narrator-fact').first()).toBeHidden()
    if (i === 0) {
      expect(
        await page
          .locator('.narrator-portrait')
          .evaluate((el) => el.naturalWidth),
      ).toBeGreaterThan(0)
    }
    await expect(page.locator('.tour-controls span')).toHaveText(
      `Stop ${i + 1} of ${artifacts.length}`,
    )
    if (i < artifacts.length - 1) {
      await page.getByRole('button', { name: 'Next' }).click()
    }
  }

  await page.getByRole('button', { name: 'Finish' }).click()
  await expect(
    page.getByRole('heading', { name: 'Last Transmission' }),
  ).toBeVisible()
})

test('responsive controls remain reachable and story panels close', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Begin transmission' }).click()
  await expect(page.getByRole('button', { name: 'Next' })).toBeVisible()

  await page.getByRole('button', { name: 'Home' }).click()
  await page.getByRole('button', { name: 'Explore the map' }).click()
  await page.getByRole('button', { name: 'Deep space' }).click()
  await page.locator('.artifact-list button').first().click()
  await expect(page.locator('.story-panel')).toBeVisible()
  await page.getByRole('button', { name: 'Close story' }).click()
  await expect(page.locator('.story-panel')).toBeHidden()
})

test('Nib tells the story one bubble at a time', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Begin transmission' }).click()

  const [artifact] = artifacts
  const lines = beats(artifact.narrator.story)
  const bubble = page.locator('.narrator-story')
  const nib = page.locator('.narrator-portrait-button')

  await expect(bubble).toContainText(`I know ${artifact.name}'s story`)
  await expect(bubble).not.toContainText(lines[0])

  await nib.click()
  await expect(bubble).toContainText(lines[0])
  await expect(page.locator('.narrator-count')).toHaveText(
    `Part 1 of ${lines.length}`,
  )
  await expect(page.locator('.narrator-line')).toHaveCount(1)

  await page.locator('.narrator-next').click()
  await expect(bubble).toContainText(lines[1])

  await nib.click()
  await expect(bubble).toContainText(lines[2])
})

test('zoom-to-pin centres Moon and Mars artifacts', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Begin transmission' }).click()

  for (const [i, artifact] of artifacts.entries()) {
    if (artifact.body !== 'deep-space') {
      await expect(page.locator('#story-title')).toHaveText(artifact.name)
      const transform = await page
        .locator('.map-world')
        .evaluate((el) => el.style.transform)
      const match = transform.match(
        /translate\(([-\d.]+)%, ([-\d.]+)%\) scale\(([\d.]+)\)/,
      )
      expect(match, `${artifact.id} transform: ${transform}`).toBeTruthy()
      const expected = expectedTransform(artifact)
      expect(Number(match[1])).toBeCloseTo(expected.x, 2)
      expect(Number(match[2])).toBeCloseTo(expected.y, 2)
      expect(Number(match[3])).toBe(ZOOM)
    }
    if (i < artifacts.length - 1) {
      await page.getByRole('button', { name: 'Next' }).click()
    }
  }
})

test('deep-space act renders and its entries open', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'Explore the map' }).click()
  await page.getByRole('button', { name: 'Deep space' }).click()

  const deep = artifacts.filter((a) => a.body === 'deep-space')
  await expect(page.locator('.map-world')).toHaveClass(/starfield/)
  await expect(page.locator('.pin')).toHaveCount(deep.length)
  for (const artifact of deep) {
    await expect(
      page.getByRole('button', { name: `${artifact.name} (${artifact.year})` }),
    ).toBeVisible()
  }

  await page.getByRole('button', { name: `${deep[2].name} (${deep[2].year})` }).click()
  await expect(page.locator('#story-title')).toHaveText(deep[2].name)
  await page.locator('.narrator-reveal summary').click()
  await expect(page.locator('.narrator-fact').first()).toBeVisible()
})

test('mute toggles survive navigation', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: 'About' }).click()
  await expect(page.getByLabel('Music')).toBeChecked()
  await page.getByLabel('Music').uncheck()
  await page.getByRole('button', { name: 'Close About panel' }).click()

  await page.getByRole('button', { name: 'Begin transmission' }).click()
  await page.getByRole('button', { name: 'About' }).click()
  await expect(page.getByLabel('Music')).not.toBeChecked()
})

test('favicon, logo, and artifact icons are served', async ({ page, request }) => {
  for (const [path, type] of [
    ['favicon.png', 'image/png'],
    ['logo.svg', 'image/svg+xml'],
    ['narrator/cat.webp', 'image/webp'],
  ]) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type']).toContain(type)
  }

  for (const artifact of artifacts) {
    const response = await request.get(artifact.image.replace(/^\/+/, ''))
    expect(response.status(), artifact.image).toBe(200)
    expect(response.headers()['content-type']).toContain('image/png')
  }

  await page.goto('./')
  const hrefs = await page
    .locator('link[rel~="icon"]')
    .evaluateAll((links) => links.map((link) => link.href))
  expect(hrefs).toHaveLength(2)
  for (const href of hrefs) {
    const response = await request.get(href)
    expect(response.status(), href).toBe(200)
  }
})
