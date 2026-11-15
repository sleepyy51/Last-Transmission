# Last Transmission

**Forgotten astral artifacts from mankind.**

An interactive pixel-art map of NASA hardware still sitting on the Moon and Mars — and the science it made possible.

Built for the NASA Space Apps Challenge 2026 challenge
[“Abandoned but not Forgotten: Storytelling about NASA’s Discarded Equipment on the Moon and Mars”](https://hackathlone.com/challenges/nasas-discarded-equipment-storytelling).

**Live site:** <https://sleepyy51.github.io/Last-Transmission/>

## What it is

Twelve artifacts left behind by NASA missions, presented as one guided tour in three acts
(the Moon, Mars, deep space), with free exploration always available.

- **Title screen** — “Begin transmission” starts the guided tour; “Explore the map” goes straight to free exploration.
- **Guided tour** — twelve stops in mission order. Each stop switches the map body, zooms to the artifact, and opens its story. **Finish** on the last stop returns to the title screen.
- **Free explore** — Moon, Mars, and Deep space tabs; zoom-to-pin; an artifact list for each body.
- **Story panel** — each stop has an in-character “last transmission”, a 60–90 word factual story, and a link to the NASA source. Side drawer on desktop, bottom sheet on phones.
- **Deep-space act** — no basemap for spacecraft that left the Moon and Mars, so the four deep-space entries sit on a starfield.
- **Maps** — full-surface equirectangular 2:1 images, downscaled and rendered with `image-rendering: pixelated` inside a pixel-art bezel.
- **Audio** — three looping Scott Buckley themes: the title and finish screens, the Moon and Mars story, and the deep-space act, plus a Hove Audio click effect on every control. Themes crossfade when the act changes, fade in on start, and fade out/in with the music switch. Music starts on the first interaction, is lazy-loaded, and music and effects have separate on/off switches in the About panel. Purely decorative.

Designed for ages 9–13 and casual space fans.

## How it maps to the challenge

| Challenge asks                                                         | Where it shows up                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tell the story of NASA’s discarded equipment                           | 12 artifacts across the Moon, Mars, and deep space, ordered into a three-act tour (`src/data/artifacts.json`), each with an in-character “last transmission”.                                                               |
| Explain what it is, why it was sent, and what science it made possible | Each story panel has a 60–90 word factual story covering what the artifact is, why it was sent, and what it found, plus a NASA source link.                                                                                 |
| Teach school-age and casual space enthusiasts                          | A guided tour with no prior knowledge assumed, a pixel-art map, and stories written for ages 9–13.                                                                                                                         |
| Use an interactive web format                                          | React + Vite single-page app: map, zoom-to-pin, tour controls, story panel, keyboard support.                                                                                                                              |
| Consider accessibility of the format                                   | See [Accessibility](#accessibility) — what is covered and what is not.                                                                                                                                                     |
| Accuracy is important                                                  | Every entry has a required NSSDCA or NASA mission-page source; coordinates were verified against the NSSDCA Apollo landing-site table, NSSDCA lander pages, and Wagner et al. 2012 for the Apollo 15 LRV parking position. |
| Specific missions or a broader story                                   | A specific roster of twelve artifacts spanning 1967–2021, with each stop tied to one mission.                                                                                                                              |

## Run it locally

Requires Node 22+.

```sh
npm ci
npm run dev     # http://localhost:5173/Last-Transmission/
npm test        # projection tests (node --test)
npm run build   # production build into dist/
```

The Vite base path is `/Last-Transmission/` because the site is served from a GitHub Pages project path.

A dev-only Compose file is included (`docker compose up`); there is no backend and no image build. On Fedora, the volume uses the `:Z` label.

## Deploy

`.github/workflows/deploy.yml` runs tests, builds, and publishes `dist/` to GitHub Pages on every push to `main`.
Repository setting: **Pages → Source → GitHub Actions**.

## Project layout

```
src/
  main.jsx
  App.jsx              title screen, tour vs free-explore entry, audio toggles
  styles.css
  about/AboutPanel.jsx About, credits, music and click-effect switches
  data/artifacts.json  the 12 entries; array order is tour order
  map/
    projection.js      lat/lon → x/y percentage (tested)
    projection.test.js
    MapView.jsx        bezel, basemap, pins, zoom-to-pin, tour controls
  story/StoryPanel.jsx drawer (desktop) / bottom sheet (mobile)
  tour/useTour.js      tour index, previous/next, resume
  audio/useAudio.js    lazy music player, track switching, mute
public/
  maps/moon.webp, maps/mars.webp
  audio/*.mp3, artifacts/*.png
```

Adding or reordering an artifact in `artifacts.json` reorders the tour; no code change is needed.
`source` is required and must never be empty.

## Accessibility

Covered:

- Map pins and artifact list items are real `<button>`s with accessible names and `aria-pressed`.
- Visible focus ring on every control; focus is not trapped.
- The story panel takes focus when opened from a map pin, returns focus to its trigger when closed, and closes on Escape.
- Tour stops are announced through an `aria-live` caption.
- Body text is at least 16 px; text colours meet 4.5:1 contrast against the background.
- The map image has alt text; artifact images use the artifact name as alt text.
- `prefers-reduced-motion` disables the zoom animation.
- Audio starts only after a user gesture; music and click effects have separate on/off switches in the About panel, which is reachable from every screen; nothing in the app is audio-only.

Not covered:

- No formal WCAG 2.1 AA audit has been run, and there has been no screen-reader testing.
- High-contrast / forced-colors modes have not been tested.
- The music/effect choices are not remembered across page reloads, and there is no volume control.

## Credits

- Moon basemap: NASA Scientific Visualization Studio, CGI Moon Kit (LROC colour).
- Mars basemap: USGS Astrogeology, MOLA colour hillshade.
- Both basemaps are public domain.
- Art credits will be added alongside those assets.
- All background music tracks are composed by **Scott Buckley** ([www.scottbuckley.com.au](https://www.scottbuckley.com.au)) and licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/):
- All sound effects are from **Hove Audio** ([https://hoveaudio.itch.io/](https://hoveaudio.itch.io/)).

* **"At The End Of All Things"** – Intro & Outro theme
* **"Clear Skies"** – Story introduction theme
* **"With These Hands"** – Act III transition theme

Design decisions, roster, and open questions live in [PLAN.md](PLAN.md).
