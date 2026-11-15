import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { project } from '../src/map/projection.js'

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
  await expect(page.locator('.story-body')).toBeVisible()
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
