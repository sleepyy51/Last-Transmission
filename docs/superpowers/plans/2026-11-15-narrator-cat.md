# Narrator Cat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every tour stop gets Nib, a Martian cat who narrates the artifact's story and then reveals a factual correction.

**Architecture:** Add a `narrator` object to each entry of `src/data/artifacts.json`, render it in the shared `StoryPanel` with a native `<details>` disclosure, and style it with the existing dark/amber panel. A 420 px WebP portrait replaces the 2.1 MB SVG at runtime. No new dependency, route, state machine, or audio.

**Tech Stack:** React 19, Vite 8, plain CSS, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-15-narrator-cat-design.md`

## Global Constraints

- Audience 9–13. Nib is silly but factual; melancholy is allowed, bleak is not.
- Accuracy is not optional. Every correction traces to `Narrator corrections.md` or a NASA source.
- One content file: `src/data/artifacts.json`.
- No voice-over, no router, no new dependency, no new state.
- Panel is a 340 px column on desktop and a 62dvh bottom sheet on mobile.
- Cat image: 420 px wide, transparent WebP, under 100 KB.
- All 12 artifacts must have at least one story paragraph and one fact-check item.
- Keep the existing header, sprite, transmission quote, and NASA source link.
- Do not commit unless the human asks; leave the work in the working tree.

## Review Focus

- **A stop without narrator content** must still render the old plain `story`, not an empty panel. Pinned by the fallback branch in Task 3 and the data test in Task 1.
- **A closed disclosure** must keep its content in the DOM but hide it visually; the tour smoke test counts items without opening every one.
- **Keyboard-only reveal** must open with Enter/Space and show a visible focus ring. Pinned manually in Task 3 verification.
- **Long narration on a phone** must scroll inside the bottom sheet without trapping the page. Checked in Task 3 manual verification.
- **A missing or misbased cat asset** must not break the panel; the image is decorative and the copy still reads. The asset-serving smoke check in Task 3 pins the path.

---

### Task 1: Narrator content in `artifacts.json`

**Files:**
- Create: `src/data/artifacts.test.js`
- Modify: `src/data/artifacts.json`

**Interfaces:**
- Produces: each artifact may carry `narrator: { story: string[], factCheck: { claim: string, correction: string }[] }`.
- The existing `story: string` field stays as the fallback.

- [ ] **Step 1: Write the failing data test**

Create `src/data/artifacts.test.js`:

```js
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
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm test`
Expected: FAIL on the first artifact with "has no narrator".

- [ ] **Step 3: Verify the open claims before writing copy**

Use NASA mission pages and NSSDCA. Resolve these before publishing:

- Sojourner height: confirm or soften the 30 cm claim.
- Surveyor 3: confirm whether Apollo 12 returned the scoop or only the camera and samples.
- Pioneer 10: the 2006 contact attempt and the "could no longer see Io" claim.
- Kepler: the "ten campaigns" estimate and the exact reaction-wheel date.
- New stories: Viking 1, Ingenuity, NEAR Shoemaker, Dawn dates, masses, distances, and end-of-mission causes.

Record the answer in the copy. If a claim cannot be confirmed, keep it out of the narration or let Nib flag it as unconfirmed.

- [ ] **Step 4: Add narrator content**

For the 8 covered artifacts, use `Original stories.md` as the `story` paragraphs and turn `Narrator corrections.md` into Nib's `factCheck` lines, following the copy in the spec's table. Minor line edits for clarity are fine; do not invent facts.

Rewrite the ALSEP story for Apollo 17: December 1972, Taurus–Littrow, Cernan and Schmitt, the plutonium generator, almost five years of listening, the 30 September 1977 shutdown, and the still-warm core. Keep the first-person voice and the melancholy.

Write first-person stories for Viking 1, Ingenuity, NEAR Shoemaker, and Dawn, 250–350 words each, in the same voice. Give each one or two `factCheck` items from the verified research.

- [ ] **Step 5: Run the data test and confirm it passes**

Run: `npm test`
Expected: PASS for `every artifact has a narrator story and fact checks`, plus the existing projection tests.

---

### Task 2: Cat portrait asset

**Files:**
- Create: `public/narrator/cat.webp`

- [ ] **Step 1: Render and encode the portrait**

Run:

```bash
mkdir -p public/narrator
rsvg-convert -w 420 -h 364 "assets-src/alien cat/alien_cat.svg" -o /tmp/alien-cat.png
magick /tmp/alien-cat.png -quality 82 public/narrator/cat.webp
```

- [ ] **Step 2: Check size and transparency**

Run:

```bash
ls -lh public/narrator/cat.webp
magick identify -format "%wx%h opaque=%[opaque]\n" public/narrator/cat.webp
```

Expected: width 420, height 364, `opaque=False`, file size under 100 KB.

---

### Task 3: StoryPanel block and styles

**Files:**
- Modify: `src/story/StoryPanel.jsx:46-56`
- Modify: `src/styles.css:410-430`
- Modify: `tests/smoke.spec.js:26-46, 87-104, 118-133`

**Interfaces:**
- Consumes: `artifact.narrator` from Task 1 and `public/narrator/cat.webp` from Task 2.
- Produces: `.narrator`, `.narrator-portrait`, `.narrator-name`, `.narrator-story`, `.narrator-reveal`, `.narrator-fact`, `.narrator-claim`, `.narrator-correction`.

- [ ] **Step 1: Add the failing smoke assertions**

In `tests/smoke.spec.js`:

- In the tour loop, after the title check, add:

```js
await expect(page.locator('.narrator-story')).toBeVisible()
await expect(page.locator('.narrator-fact')).not.toHaveCount(0)
```

- In the deep-space test, replace the `.story-body` expectation with:

```js
await page.locator('.narrator-reveal summary').click()
await expect(page.locator('.narrator-fact').first()).toBeVisible()
```

- In the asset loop, add `['narrator/cat.webp', 'image/webp']`.

- [ ] **Step 2: Run the smoke suite and confirm it fails**

Run: `npm run test:smoke`
Expected: FAIL because `.narrator-story` does not exist.

- [ ] **Step 3: Render the narrator block in `StoryPanel`**

Replace the current `artifact.story` block with:

```jsx
{artifact.narrator ? (
  <section className="narrator" aria-label={`Nib's story of ${artifact.name}`}>
    <div className="narrator-head">
      <img
        className="narrator-portrait"
        src={asset('narrator/cat.webp')}
        alt="Nib, a green Martian cat wearing round glasses"
      />
      <div>
        <p className="narrator-name">Nib</p>
        <p className="narrator-role">Martian cat, storyteller</p>
      </div>
    </div>

    <p className="narrator-intro">
      Here's the story as {artifact.name} tells it.
    </p>

    <div className="narrator-story">
      {artifact.narrator.story.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>

    <details className="narrator-reveal">
      <summary>Was that all true?</summary>
      <div className="narrator-facts">
        <p className="narrator-intro">I checked the mission files.</p>
        {artifact.narrator.factCheck.map(({ claim, correction }, index) => (
          <div className="narrator-fact" key={index}>
            <p className="narrator-claim">“{claim}”</p>
            <p className="narrator-correction">{correction}</p>
          </div>
        ))}
      </div>
    </details>
  </section>
) : artifact.story ? (
  <p className="story-body">{artifact.story}</p>
) : (
  <p className="story-todo">Story coming soon.</p>
)}
```

- [ ] **Step 4: Add the styles**

Add after `.story-image` in `src/styles.css`:

```css
.narrator {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 2px solid rgb(144 213 82 / 0.5);
}

.narrator-head {
    display: flex;
    align-items: center;
    gap: 12px;
}

.narrator-portrait {
    flex: none;
    width: 56px;
    height: 56px;
    object-fit: contain;
}

.narrator-name {
    margin: 0;
    color: #b9e87e;
    font-weight: 700;
}

.narrator-role {
    margin: 0;
    color: var(--dim);
    font-size: 0.875rem;
}

.narrator-intro {
    margin: 12px 0;
    color: var(--dim);
    font-style: italic;
}

.narrator-story {
    font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
    font-size: 1.0625rem;
    line-height: 1.7;
}

.narrator-story p {
    margin: 0 0 12px;
}

.narrator-reveal {
    margin-top: 16px;
    border-top: 1px solid rgb(144 213 82 / 0.4);
}

.narrator-reveal summary {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    color: #b9e87e;
    font-weight: 600;
    cursor: pointer;
}

.narrator-reveal summary:focus-visible {
    outline: 3px solid var(--fg);
    outline-offset: 2px;
}

.narrator-reveal[open] summary {
    margin-bottom: 8px;
}

.narrator-facts {
    padding: 12px 12px 12px 16px;
    border-left: 3px solid #90d552;
    border-radius: 0 6px 6px 0;
    background: #171c26;
    animation: narrator-reveal 160ms ease-out;
}

.narrator-claim {
    margin: 0;
    color: var(--dim);
    font-style: italic;
}

.narrator-correction {
    margin: 2px 0 12px;
}

.narrator-fact:last-child .narrator-correction {
    margin-bottom: 0;
}

@media (min-width: 768px) {
    .narrator-portrait {
        width: 72px;
        height: 72px;
    }
}

@keyframes narrator-reveal {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
}

@media (prefers-reduced-motion: reduce) {
    .narrator-facts {
        animation: none;
    }
}
```

- [ ] **Step 5: Run the smoke suite and confirm it passes**

Run: `npm run test:smoke`
Expected: PASS for all 7 tests.

- [ ] **Step 6: Check keyboard and mobile manually**

Run: `npm run dev`, open the first tour stop, Tab to “Was that all true?”, press Enter. Expected: the corrections open, the focus ring is visible, and the panel scrolls without scrolling the page. Repeat at phone width (about 390 px).

---

### Task 4: Project docs and final verification

**Files:**
- Modify: `PLAN.md` §4 and §13
- Modify: `README.md` if it enumerates features

- [ ] **Step 1: Update the plan's data model and decision log**

Add `narrator` to the §4 example and a §13 row dated 2026-11-15 describing Nib, the fact-check reveal, and the 420 px WebP.

- [ ] **Step 2: Update the README feature list if it has one**

Add a line only if the README lists story-panel features. Do not invent a section.

- [ ] **Step 3: Run every gate**

Run:

```bash
npm test
npm run build
npm run test:smoke
```

Expected: all pass; build writes `dist/` with `narrator/cat.webp` included.

- [ ] **Step 4: Take a screenshot for review**

Run the dev server and capture the first tour stop with the disclosure open. Save it outside the repo (for example `/tmp/narrator-panel.png`) and inspect that the cat is transparent, the serif story reads well, and the correction block is distinguishable.

---

## Handoff

Do not commit. Leave the changes in the working tree and report which files changed, the test results, and the screenshot path.
