# Ontario Angler — Fishing App

A fast, offline-first PWA for Ontario fishing regulations by Fisheries Management Zone:
seasons, catch & size limits, and what's **open today** — plus a browsable photo
gallery for every species so you can identify your catch.

## Features

- **Zone-based regulations** — seasons, sport/conservation limits, and size rules.
- **"Open today" logic** — computes what's legally open on the current date.
- **Species photo galleries** — tap any fish for a full-screen lightbox (swipe, arrows,
  thumbnail strip) with multiple reference photos under varied lighting and environments.
- **Works offline** — service worker caches the app shell, data, and photos.
- **No framework** — plain HTML/CSS/JS, no build step.

## Running locally

It's a static site — serve the folder with any static server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Photo galleries

Reference photos live in `images/fish/<species>/` and are indexed by
`js/data-gallery.js` (auto-generated). To rebuild after adding or removing photos:

```bash
python3 tools/build-galleries.py          # consolidate + fetch + regenerate manifest
python3 tools/build-galleries.py --no-fetch  # local files only, no downloads
```

Fetched photos come from [Wikimedia Commons](https://commons.wikimedia.org) (openly
licensed). After changing photos, bump `CACHE_VERSION` in `sw.js` so offline clients update.

## Disclaimer

Convenience reference only — **not a legal document**. Always confirm current rules at
[ontario.ca/fishing](https://www.ontario.ca/page/fishing) before you fish.
