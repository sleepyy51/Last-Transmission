# Narrator cat — design

Date: 2026-11-15
Status: awaiting approval

## Intent

Every tour stop gets a narrator: Nib, a Martian cat with round glasses and a
pointing finger. Nib tells the artifact's first-person story, then reveals a
fact-check that corrects the story's errors. The audience is 9–13. The voice is
silly but factual, and the mood can stay melancholy — these are machines left
behind.

The cat is a storyteller, not a voice-over: all copy is text. The plan's
"no voice-over" non-goal stands.

## Goals

- All 12 tour stops have a narrated story and at least one fact-check note.
- The 8 stories in `Original stories.md` are used as the narration, with the
  corrections in `Narrator corrections.md` turned into Nib's voice.
- The 4 missing stops (Viking 1, Ingenuity, NEAR Shoemaker, Dawn) get new stories
  in the same first-person voice, plus verified fact-check notes.
- The ALSEP story is rewritten for Apollo 17, the artifact actually on the map.
- The existing panel header, sprite, last-transmission quote, and NASA source
  link stay.
- The fact-check is revealed on demand: a kid reads the tale first, then asks
  for the truth.

## Non-goals

- No voice-over, TTS, or audio narration.
- No router, no per-stop route, no new dependency.
- No map, tour-state, or audio changes.
- No animated cat; one portrait, reused.
- No changes to artifacts without narrator content (the plain story remains the
  fallback).

## Constraints

- One content file: `src/data/artifacts.json`.
- Accuracy is not optional. Every correction is traceable to
  `Narrator corrections.md` or a NASA source. New stories are verified before
  they are written in.
- The cat SVG is 2.1 MB. Ship a 420 px WebP (≈43 KB, transparent) and keep the
  source in `assets-src/`.
- The story panel is a 340 px column on desktop and a 62dvh bottom sheet on
  mobile. Long stories must be comfortable to scroll in both.
- The app has no webfonts. Typography must work with system faces.

## Approaches

**A. Extend `artifacts.json`** — chosen. Each entry gains a `narrator` object.
`StoryPanel` renders it with a native `<details>` disclosure. The writer already
owns this file, so narration and map metadata stay in one place.

**B. Separate `narrator.js` module** — rejected. It separates long prose from
metadata, but adds a second content source, an id lookup, and another component
for no user-visible gain.

**C. Tour-only renderer** — rejected. It duplicates the panel around a conditional
and leaves free exploration with a different reading experience.

## Design

### Data model

Add to each artifact in `src/data/artifacts.json`:

```json
"narrator": {
  "story": [
    "First paragraph in the artifact's first-person voice.",
    "Second paragraph."
  ],
  "factCheck": [
    {
      "claim": "What the story said.",
      "correction": "Nib's factual reply, in Nib's voice."
    }
  ]
}
```

- `story` is an array so paragraphs keep their rhythm without HTML in JSON.
- `factCheck` keeps the claim visible. A kid reads the claim, then the fact;
  that contrast is the teaching moment.
- The existing `story` field stays. When `narrator` is absent, `StoryPanel`
  falls back to the current plain 60–90 word story, so the component still works
  for future entries.

### Panel layout

The narrator block replaces the plain story paragraph when `narrator` exists.
The header, artifact sprite, transmission quote, and source link stay where they
are.

```
┌─ story panel (amber border) ─────────┐
│ 1967                            ×    │
│ Surveyor 3                           │
│ Last contact with Earth: May 4, 1967 │
│ [artifact sprite]                    │
│ │ “last transmission quote”          │
│                                      │
│  ╭────╮  Nib                         │
│  │cat │  Martian cat, storyteller    │
│  ╰────╯  ────────────────────────    │
│                                      │
│  Here's the story as Surveyor 3      │
│  tells it.                           │
│                                      │
│  Nobody told me it would hurt. They  │
│  launched me in April 1967 with one  │
│  task: to land without breaking…     │
│  (serif, 17px/1.7)                   │
│                                      │
│  ▸ Was that all true?                │
│    ┊ “NASA says 6,326 pictures.”     │
│    ┊ Its own pages disagree: 6,315   │
│    ┊ in a 1969 report. About 6,300   │
│    ┊ is the safest number.           │
│                                      │
│  Read the NASA source ↗              │
└──────────────────────────────────────┘
```

- The cat portrait is 72 px on desktop, 56 px on mobile, top-left, above the
  label. The story starts below it at full panel width.
- The narrator block is separated by a 2 px green rule, not another boxed card.
  The panel already has a border; one quiet surface is enough.
- The open fact-check is inset with a 3 px green left rule and a slightly
  lighter background. Claims are dim italic, corrections are normal body text.
- Story type is a system serif stack (`Georgia`, `Iowan Old Style`,
  `Palatino Linotype`) to feel like a storybook and to mark it as a different
  register from the UI. Corrections use the existing system sans, marking them
  as annotation. No downloaded fonts.
- Green is Nib's color, taken from the asset (`#90d552`); a lighter tint
  (`#b9e87e`) is used for text and rules so contrast clears 4.5:1 on the dark
  panel.
- Reveal motion: a 160 ms fade/4 px lift when the disclosure opens, disabled by
  `prefers-reduced-motion`. It answers the click and shows what changed.

### Copy

Visible label: **Nib** / Martian cat, storyteller.
Story frame (one line, reused): *Here's the story as {name} tells it.*
Reveal summary: **Was that all true?**
Inside the reveal, a single intro line: *I checked the mission files.*

Nib's corrections, drafted from the corrections doc:

| Stop | Nib's fact-check |
|---|---|
| Eagle | "Only the crew went home — in Columbia. The ascent stage stayed in lunar orbit and was jettisoned; NASA lists its impact site as unknown. I'd like to say she came down near me, but that's a wish, not a record." |
| LRV | "18 hours 35 minutes is how long the three moonwalks lasted, not how long I was driving. The driving was about 3 hours. The rest was rock collecting, flag planting, and one famous hammer-and-feather drop. The 27.9 km is right." |
| ALSEP | "The 180-metre figure belongs to the Apollo 12 package, which sat near Surveyor 3. This pin is the Apollo 17 package, in Taurus–Littrow. Same family, different neighbourhood." · "Earth didn't switch me off because I broke. It switched me off on 30 September 1977 because the data cost money. I was still working, and my plutonium core is still warm." |
| Surveyor 3 | "NASA's own pages disagree: 6,326 pictures on the mission page, 6,315 in a 1969 report. 'About 6,300' is the safest number." |
| Sojourner | "Her full name is the Carl Sagan Memorial Station. 'Memorial' because he died before we arrived. I thought you should know what the name is carrying." |
| Opportunity | "That last line — 'it is getting dark, and my battery is low' — is a journalist's paraphrase, not a transmission. The 90 days were 90 sols, a little longer than Earth days. The Perseverance record is real: October 11, 2026. Opportunity is just not really writing letters." |
| Pioneer 10 | "Pluto was known in 1983. Its orbit had carried it inside Neptune's, so Neptune was the outermost planet at the time — not the last one anyone knew about." · "NASA's page says Jupiter's radiation knocked out my photopolarimeter before I reached Io. It also sent me false commands." |
| Kepler | "The ten campaigns were an estimate, not a promise. I did nineteen. My second reaction wheel failed in May 2013 — the exact day is in my engineers' logs." |
| Viking 1 | "Mars 3 landed first, in 1971, but it fell silent almost at once. 'First pictures' is fair only if you mean the first ones that kept coming. And finding no organics doesn't mean no life — just none where I looked." |
| Ingenuity | "I was meant to fly five times in thirty days. I flew 72 times over almost three years. The first flight lasted 39.1 seconds, and I have never been more nervous. My last relay home was 16 April 2024." |
| NEAR Shoemaker | "I wasn't designed to land. The team slowed me to about 1.8 metres per second — a brisk walk — and touched down. 'Landing' is fair; 'a crash in slow motion' is also fair." |
| Dawn | "I never landed. I'm still orbiting Ceres; NASA expects me to stay for decades — at least 20 years, and probably more than 50. 'Mission concluded' means I ran out of hydrazine, not that I went anywhere." |

New-story premises (to be written and verified):

- **Viking 1** — launched 1975, landed 20 July 1976 in Chryse Planitia; first
  long-lived Mars surface mission; pictures, weather, robotic arm, biology
  experiments; silence on 11 November 1982.
- **Ingenuity** — carried under Perseverance; first powered flight on another
  planet on 19 April 2021; planned as five flights, flew 72; rotor damage ended
  flight in January 2024; last link in 2024.
- **NEAR Shoemaker** — first spacecraft to orbit an asteroid (Eros, 2000) and
  first to touch down on one (12 February 2001); named for Eugene Shoemaker;
  kept sending data for about two weeks.
- **Dawn** — ion-propelled; orbited Vesta (2011–12) and Ceres (2015–18), the
  first spacecraft to orbit two bodies beyond Earth; found bright salt deposits
  at Ceres; ran out of hydrazine in 2018 and remains in orbit.

Nib's voice rules:

- Short sentences. One to three per note.
- Exact numbers, translated to kid scale where it helps.
- Silly asides, never at the artifact's expense. Nib likes these machines.
- Melancholy is allowed; bleak is not. Each stop ends on a fact or a quiet line.
- No catchphrase repeated across stops. Nib is a character, not a template.
- The story is the artifact's "I"; the correction is Nib's. Corrections name the
  artifact or use "the records" when "I" would be ambiguous.

### Behavior

- The panel is keyed by artifact id, so each new stop starts with the fact-check
  closed and the scroll at the top. No extra state.
- The narrator also appears in free exploration, because tour and explore share
  `StoryPanel`. This is free consistency, not a new mode.
- `story` remains the fallback when `narrator` is missing.
- Native `<details>` gives the reveal keyboard support and an expanded state for
  free. No stateful button, no ARIA bookkeeping.

### Files

| File | Change |
|---|---|
| `src/data/artifacts.json` | `narrator` for all 12 entries |
| `src/story/StoryPanel.jsx` | narrator block + fallback |
| `src/styles.css` | narrator portrait, rule, serif story, reveal block |
| `public/narrator/cat.webp` | 420 px transparent WebP from the SVG |
| `tests/smoke.spec.js` | narrator checks; update the deep-space selector |
| `src/data/artifacts.test.js` | every entry has a story and a fact-check |
| `PLAN.md` | data model note + decision log line |
| `docs/superpowers/specs/…` | this document |

### Verification

- `npm test` — projection plus the new content-integrity test.
- `npm run test:smoke` — tour still advances through 12 stops; every stop shows
  a narrator story; the first reveal opens and shows a correction; deep-space
  entries still open.
- `npm run build`.
- Manual: check the panel at 340 px and at phone width, keyboard-open the
  disclosure, and confirm the portrait is transparent and not blurry.
- Re-check the three unconfirmed items from the corrections doc (Sojourner's
  30 cm, Pioneer 10's 2006 contact and Io blindness, Kepler's ten campaigns)
  against NASA before publishing; drop or flag anything still unverifiable.

## Calls I made (check these)

- The cat is named **Nib**; the name is hardcoded in the panel copy and data.
- Nib replaces the plain 60–90 word story in the panel when narration exists;
  the plain copy stays in the JSON as a fallback.
- Nib appears in free exploration too, not only guided tours.
- The reveal is a native `<details>`, styled as a button.
- The 2.1 MB SVG ships as a 43 KB WebP; the original stays in `assets-src/`.
- The ALSEP correction about Surveyor 3 becomes a note explaining the map's
  Apollo 17 roster choice.
