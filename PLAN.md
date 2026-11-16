# Last Transmission — build plan

**Event:** NASA Space Apps Challenge 2026 (virtual, team of 3, 48 hours)
**Last decision:** 2026-11-15
**Status:** MVP complete; submission pending

> Revisit this file whenever a decision changes. Each change gets a line in the
> decision log at the bottom. Do not silently diverge from it.

---

## 1. What we're building

**Last Transmission** — *Forgotten astral artifacts from mankind.*

An interactive, pixel-art map of NASA hardware still sitting on the Moon and Mars,
and the science it made possible.

Pitch line: *An interactive pixel-art map of NASA hardware still sitting on the Moon
and Mars — and the science it made possible.*

- Audience: **ages 9–13** and casual space fans.
- Story: one guided sequence in three acts — Moon → Mars → deep space — with free
  exploration always available.
- Every artifact gets an in-character "last transmission" line plus a narrated story,
  a fact-check, and a source link. Accuracy is not optional; the challenge
  scores it.

## 2. Locked decisions

| Area | Decision |
|---|---|
| Stack | React + Vite + JavaScript (no TypeScript) |
| Map projection | Full-surface **equirectangular** (not an orthographic disc), 2:1, one image per body |
| Basemaps | Moon: NASA SVS CGI Moon Kit `lroc_color_poles_1k.jpg` (1024×512) · Mars: USGS MOLA color hillshade (1024×512). Both 2:1, full 360°, public domain |
| Basemap treatment | Downscaled + rendered with `image-rendering: pixelated`; framed in a rounded pixel-art bezel |
| Map interaction | **Zoom-to-pin** via CSS transform + lat/lon → percentage projection. No free drag/pan |
| Mobile | Mobile-first. On phones the map's default state is zoomed to the current artifact; pull back for overview. One breakpoint (~768px): side drawer on desktop, bottom sheet below |
| Art | 16×16 sprite grid, rendered at 3×. Storybook treatment for panels/typography. 16-bit bevels for controls. Team artist + AI + pixel tools, capped 6–8 h |
| Story delivery | Title screen → map home → guided tour + free explore. Story panel: in-voice line, Nib's click-to-open narrated story + fact-check (plain 60–90 word story as fallback), source link |
| Audio | SFX + ambient, CC, credited to Scott Buckley. Compressed, lazy-loaded, starts on "Begin transmission". Mute toggle. Purely decorative — app must work without it |
| Accessibility | Cheap set (see §8), stated honestly in the README |
| Verification | `npm run build` gates every merge; `node --test` for projection, content, and beat splitting; Playwright smoke suite for the five-step list and served assets |
| Hosting | Public repo → GitHub Actions → GitHub Pages, project path, no custom domain |
| Base path | `base: '/Last-Transmission/'` in `vite.config.js` |
| Docker | Compose is **dev only** — one Node service, no image build, no backend |
| Git | Short-lived feature branches, fast merges, green build required, one merger in the final hour, no LFS |
| Deliverables | 30-second subtitled video · README mapping challenge objectives to features · screenshots · credits panel |

## 3. Non-goals

No 3D globe. No rotating disc. No drag/pan. No router. No backend. No voice-over.
No full accessibility audit. No landscape prompt. No broad unit-test suite (projection test and Playwright smoke only). No custom domain.
No roster beyond 12 artifacts.

## 4. Data model

One file, `src/data/artifacts.json`. Array order **is** tour order.

```json
{
  "id": "apollo-11-descent-stage",
  "name": "Eagle's Descent Stage",
  "body": "moon",
  "lat": 0.67,
  "lon": 23.47,
  "year": 1969,
  "status": "Silent since 20 July 1969",
  "transmission": "Tranquility Base here. The Eagle has landed.",
  "story": "60–90 words. What it is, why it was sent, what science it made possible.",
  "image": "/artifacts/apollo-11-descent-stage.png",
  "source": "https://nssdc.gsfc.nasa.gov/...",
  "narrator": {
    "story": ["First paragraph in the artifact's voice.", "Second paragraph."],
    "factCheck": [
      {
        "claim": "What the story says.",
        "correction": "What the records say, in Nib's voice."
      }
    ]
  }
}
```

- `body`: `"moon" | "mars" | "deep-space"`.
- Deep-space entries still carry `lat`/`lon`/`year` (filled from NSSDCA) even though the
  map ignores them; the starfield layout uses a manual position instead.
- `image` points at a 16×16-grid sprite in `public/artifacts/`.
- `source` is the NSSDCA or mission catalogue page — required, never empty.
- `narrator` is optional. When present, clicking Nib opens a popup with her
  first-person story, told one beat at a time; the fact-check follows the last
  beat. `story` stays as the plain factual fallback for entries without a narrator.
- The writer owns this file. Reordering the array reorders the tour; no code change.

## 5. Roster (12)

| Act | Artifact | Year |
|---|---|---|
| Moon | Surveyor 3 | 1967 |
| Moon | Apollo 11 descent stage (*Eagle*) | 1969 |
| Moon | Apollo 17 ALSEP | 1972 |
| Moon | Apollo 15 Lunar Roving Vehicle | 1971 |
| Mars | Viking 1 lander | 1976 |
| Mars | Sojourner | 1997 |
| Mars | Opportunity | 2004 |
| Mars | Ingenuity | 2021 |
| Deep space | Pioneer 10 | 1972 |
| Deep space | NEAR Shoemaker | 2001 |
| Deep space | Kepler | 2009 |
| Deep space | Dawn | 2015 |

Coordinates, dates and copy must be filled from NSSDCA/mission pages by the content
owner. **Nothing in this table is a verified coordinate.**

Coordinates already in `src/data/artifacts.json` were verified on 2026-11-14 against
the NSSDCA Apollo landing-site table (DE421, planetocentric), NSSDCA mission pages for
Viking 1 / Pathfinder / Opportunity, and Wagner et al. 2012 for the Apollo 15 LRV
parking position. Apollo 17 ALSEP replaced Apollo 12 ALSEP because Surveyor 3 sits
~150 m from the Apollo 12 site — the two pins landed on the same pixel.

## 6. App shape

```
src/
  main.jsx
  App.jsx              title screen, act/tour state
  styles.css
  data/artifacts.json
  map/
    projection.js      lat/lon → x/y percentage (tested)
    projection.test.js
    MapView.jsx        bezel, basemap, pins, zoom-to-pin
  story/
    StoryPanel.jsx     drawer (desktop) / bottom sheet (mobile)
  tour/
    useTour.js         act/stop state machine
  audio/
    useAudio.js        lazy load, mute, start on interaction
public/
  maps/moon.png, maps/mars.png
  artifacts/*.png
```

Keep it this flat. No index barrels, no context providers unless a prop chain gets ugly.

## 7. Deployment

- Public repo `Last-Transmission`, default branch `main`.
- `.github/workflows/deploy.yml`: install → test → build → `configure-pages` →
  `upload-pages-artifact` → `deploy-pages`.
- URL: `https://<account>.github.io/Last-Transmission/`.
- In the repo settings, Pages source = **GitHub Actions**.
- Pages limits: 1 GB site, 100 MB per file, 10 builds/hour. Audio stays compressed.
- Deploy within the first ~4 hours. A missing `base` produces 404s on every asset,
  and it is much cheaper to find that at T+4 than at T+40.

## 8. Accessibility commitments

- Pins are real `<button>`s with accessible names; visible focus ring.
- Body text ≥ 16 px; contrast ≥ 4.5:1.
- Alt text on every artifact image; decorative sprites get `alt=""`.
- `aria-live` announcement when the tour advances.
- Nib's popup takes focus when opened and returns it to its button when closed.
- `prefers-reduced-motion`: no zoom animation, no drifting stars.
- Mute control visible and persistent; nothing essential is audio-only.
- README states what is covered and what is not. No audit claimed.

## 9. Verification

- `npm run build` in CI — a broken build cannot deploy.
- `node --test` for projection, narrator content integrity, and beat splitting (built into Node, zero dependencies).
- `npm run test:smoke` — Playwright against the dev server: title load, the full
  12-stop tour, Nib's popup and fact-check, zoom-to-pin projection on Moon/Mars,
  the deep-space pins, mute persistence, and served favicon/logo/artifact icons.
- Manual check before the video is recorded (headless does not assert audio):
  1. Title screen loads; "Begin transmission" starts audio and the tour.
  2. Tour advances through all 12 stops; next/prev works at act boundaries.
  3. Zoom-to-pin centres each artifact correctly on both bodies.
  4. Deep-space act renders and its entries open.
  5. Mute toggles and survives navigation.

## 10. 48-hour timeline

| Time | Milestone |
|---|---|
| T+4 | Scaffold builds and is live on Pages |
| T+12 | Map + zoom-to-pin + two working artifacts |
| T+24 | All 12 content entries + full tour |
| T+36 | Art and audio integrated |
| T+42 | 30-second video + README finished |
| T+48 | Buffer |

**Team split**
- **A — app engineer:** scaffold, map, projection, zoom, tour state, panel, deploy.
- **B — content & accuracy:** 12 entries, coordinates, NSSDCA links, image sourcing,
  README, video script. **Critical path — starts at hour one with placeholders.**
- **C — art, audio, presentation:** sprites, bezel, starfield, audio + mute, video
  capture and editing.

## 11. Cut order (if slipping)

1. Deep-space act (drop the act, keep the entries as an epilogue list).
2. Audio (app must already work without it).
3. Bespoke sprites (reuse silhouettes).
4. Mobile polish.

Never cut: content accuracy, the deployed URL, the 30-second video.

## 12. Risks and open questions

- **AI-generated assets** — confirm the event's rules on generative content before
  relying on any AI-made sprite.
- **Scott Buckley audio licence** — confirm the exact licence and required credit
  string; a missing CC-BY credit is a judging risk.
- **Content is the bottleneck.** Twelve researched entries in 48 hours cannot be
  compressed at the end.
- **Late audio** — never build the demo video around audio that has not landed.
- **Basemap pole gaps** — the Moon colour map fills polar gaps from albedo. Avoid
  pole-adjacent artifacts (e.g. Phoenix at 68°N) unless the coordinate is verified.

## 13. Decision log

| Date | Change |
|---|---|
| 2026-11-14 | Initial plan agreed: equirectangular pixel-art map, 12 artifacts, three-act tour, ages 9–13, Pages + Actions, compose dev-only. |
| 2026-11-14 | Apollo 12 ALSEP → Apollo 17 ALSEP. Surveyor 3 and the Apollo 12 ALSEP share a site and projected to the same pixel, making one story unreachable. |
| 2026-11-15 | Audio wired from the supplied Scott Buckley tracks: title/finish = At The End Of All Things, Moon/Mars = Clear Skies, deep space = With These Hands, lazy-loaded and looping with a persistent mute. The last tour stop's Next became Finish (returns to the title screen) so the outro cue has somewhere to play. No SFX files were supplied, so none are wired. |
| 2026-11-15 | Click SFX wired from the Hove Audio pack (one shared click, sources kept in `assets-src/music/sfx/`). The standalone mute button became an About panel reachable from every screen, holding the credits plus separate music and click-effect switches. |
| 2026-11-15 | Music transitions added on the existing elements: 800 ms crossfade between themes, 800 ms fade-in on start, 300 ms fade-out/in on the music switch. Reduced motion does not apply — audio fades are not visual motion. |
| 2026-11-15 | Added a Playwright smoke suite to CI (system Chrome, no browser download). It automates the §9 five-step list and checks that favicon, logo, and artifact icons are served. Narrows the “no test suite” non-goal. |
| 2026-11-15 | Added Nib, a Martian cat narrator, to every tour stop: a first-person story plus a “Was that all true?” fact-check drawn from `Narrator corrections.md`, with new stories for Viking 1, Ingenuity, NEAR Shoemaker and Dawn, and an Apollo 17 rewrite of the ALSEP entry. The cat portrait ships as a 420 px WebP; the original SVG stays in `assets-src/`. |
| 2026-11-15 | Nib's story became a click-to-open popup: hidden until Nib or “Tell me a story” is clicked, told one beat at a time, with the fact-check inside the popup after the last beat. On desktop it floats above the portrait (the panel leaves only ~75 px below her); on phones it flows inside the bottom sheet. The old “Was that all true?” `<details>` was removed. |
