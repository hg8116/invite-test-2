# Diana & Richard — digital wedding invitation

A mobile-first wedding invitation website with an Amalfi/Mallorca painted
aesthetic: guests tap a ribbon-tied envelope, the flap lifts and the
invitation slides out, then they scroll through a live countdown, the couple's
story, the venue, the day's programme and the dress code. EN/DE language toggle
and background music included.

Built with Next.js 16 (App Router) — the page is fully static.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Personalise

Everything guests read lives in **`content/invitation.ts`**:

- `event` — names, ceremony date/time (with UTC offset, drives the countdown),
  venue + Google Maps link, the programme (times + icons), music settings.
- `copy.en` / `copy.de` — all English and German text. Add a language by adding
  another entry and listing it in `LANGS`.

### Music

By default a gentle music-box waltz is synthesised in the browser (Web Audio),
so no audio file is needed. To use your own song, drop it in
`public/music/` and set `event.music.src = "/music/your-song.mp3"`. Music starts
when the guest taps the envelope (browsers only allow audio after a tap) and can
be muted with the speaker button.

## Artwork

All paintings in `assets/art/` are original and generated procedurally
(seeded brush strokes + SVG impasto/paper filters), then rasterised to WebP:

```bash
npm run art                      # re-render everything (~1 min)
npm run art -- hero hero-fg      # re-render specific pieces
PREVIEW_DIR=/tmp/art npm run art -- envelope   # also dump PNG/SVG previews
```

Sources live in `scripts/art/` (`hero.mjs`, `envelope.mjs`, `frame.mjs`,
`fountain.mjs`, `estate.mjs`, `icons.mjs`, …).

To use commissioned or hand-painted art instead, replace the files in
`assets/art/` keeping the same names and aspect ratios:

| File | Size | Notes |
| --- | --- | --- |
| `envelope.webp` | 1000×2000 | one painting, cut into flap + pocket by CSS |
| `hero.webp` / `hero-fg.webp` | 1000×2000 | background, and foreground layer (transparent) drawn over the card |
| `card.webp` | 800×1300 | torn paper card (transparent edges) |
| `frame.webp` | 900×1200 | countdown frame, transparent centre |
| `fountain.webp` | 1000×1100 | bottom must fade into `--green` (#26332b) |
| `estate.webp` | 1000×640 | cut-out straddling the dark/light boundary |
| `icon-*.webp` | 260×260 | programme vignettes |

## Structure

```
app/                      layout (fonts, metadata), page, global styles
components/invitation/    Envelope, Hero, Countdown, Story, Celebration,
                          Day (programme), Closing (dress code + footer),
                          Controls (EN/DE + sound), music.ts, useLang.ts
content/invitation.ts     all copy + event details
assets/art/               generated paintings (WebP)
scripts/art/              procedural art generator
```

The opening choreography timings are in `Envelope.module.css` and mirrored by
`HERO_REVEAL_AT` / `ENVELOPE_DONE_AT` in `Invitation.tsx`. Users with
"reduce motion" enabled get a simple fade instead.

## Deploy

Any static-capable host works. On Vercel: `vercel deploy` (or import the repo).
