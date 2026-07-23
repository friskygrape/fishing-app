#!/usr/bin/env python3
"""Fetch openly-licensed reference photos for each species from Wikimedia.

For every species the app expects at images/fish/<file>, this queries the
Wikipedia pageimages API for the lead photo (a Wikimedia Commons image, mostly
CC/public-domain), downloads the original, and saves it under the exact name
data-species.js / README.md expect. Re-runnable: pass --force to overwrite.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

UA = "FishRefBot/1.0 (personal fishing reference PWA; contact: local)"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "images", "fish")

# filename (without .jpg)  ->  Wikipedia article title to pull the lead image from.
# Aggregates/combined categories use a representative species. Tricky commons:
# "sunfish" -> Bluegill (plain "Sunfish" = ocean sunfish), "cisco" -> Cisco (fish).
SPECIES = {
    "trout-salmon":     "Rainbow trout",      # aggregate cap — representative
    "atlantic-salmon":  "Atlantic salmon",
    "largemouth-bass":  "Largemouth bass",
    "smallmouth-bass":  "Smallmouth bass",
    "bass-combined":    "Largemouth bass",     # combined limit — representative
    "brook-trout":      "Brook trout",
    "brown-trout":      "Brown trout",
    "rainbow-trout":    "Rainbow trout",
    "lake-trout":       "Lake trout",
    "splake":           "Splake",
    "aurora-trout":     "Aurora trout",
    "chinook-salmon":   "Chinook salmon",
    "coho-salmon":      "Coho salmon",
    "pacific-salmon":   "Chinook salmon",      # aggregate — representative
    "walleye":          "Walleye",
    "yellow-perch":     "Yellow perch",
    "northern-pike":    "Northern pike",
    "muskellunge":      "Muskellunge",
    "lake-whitefish":   "Lake whitefish",
    "cisco":            "Cisco (fish)",
    "sunfish":          "Bluegill",
    "crappie":          "Black crappie",
    "channel-catfish":  "Channel catfish",
    "lake-sturgeon":    "Lake sturgeon",
}


# For species whose Wikipedia page has no lead photo, search Wikimedia Commons
# directly by scientific name (binomial searches return clean specimen photos).
COMMONS_FALLBACK = {
    "lake-sturgeon": "Acipenser fulvescens",
    # aurora-trout intentionally omitted: Commons has no distinct photo of it
    # (it's a rare Brook Trout variant), so the app keeps its placeholder.
}


def _api(params, tries=5, host="en.wikipedia.org"):
    q = urllib.parse.urlencode(params)
    url = f"https://{host}/w/api.php?" + q
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < tries - 1:
                wait = 5 * (attempt + 1)
                print(f"    (429, backing off {wait}s)")
                time.sleep(wait)
                continue
            raise
    return {}


def get_image_urls(titles):
    """One batched API call -> {title (as returned): image url}. Handles
    redirects/normalization by mapping requested titles back to canonical."""
    uniq = list(dict.fromkeys(titles))
    # Thumbnails (not full-res originals): Wikimedia recommends these, they don't
    # rate-limit, and ~1200px is the right size for a reference card.
    data = _api({
        "action": "query", "titles": "|".join(uniq), "prop": "pageimages",
        "piprop": "thumbnail", "pithumbsize": "1200",
        "format": "json", "redirects": "1",
    })
    query = data.get("query", {})
    # Build alias map: requested/normalized/redirected title -> final title
    alias = {}
    for kind in ("normalized", "redirects"):
        for m in query.get(kind, []):
            alias[m["from"]] = m["to"]

    def resolve(t):
        seen = set()
        while t in alias and t not in seen:
            seen.add(t)
            t = alias[t]
        return t

    by_title = {}
    for page in query.get("pages", {}).values():
        thumb = page.get("thumbnail")
        if thumb and thumb.get("source"):
            by_title[page["title"]] = thumb["source"]
    return {t: by_title.get(resolve(t)) for t in uniq}


def commons_search_url(search):
    """Find the first real photo (jpg/png, not pdf/svg) on Commons for a term."""
    data = _api({
        "action": "query", "generator": "search", "gsrsearch": search,
        "gsrnamespace": "6", "gsrlimit": "10", "prop": "imageinfo",
        "iiprop": "url|mime", "iiurlwidth": "1200", "format": "json",
    }, host="commons.wikimedia.org")
    pages = data.get("query", {}).get("pages", {})
    # generator=search returns an 'index' for ordering; respect it.
    for page in sorted(pages.values(), key=lambda p: p.get("index", 0)):
        info = (page.get("imageinfo") or [{}])[0]
        if info.get("mime") in ("image/jpeg", "image/png") and info.get("thumburl"):
            return info["thumburl"]
    return None


def download(url, dest, tries=5):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            with open(dest, "wb") as f:
                f.write(data)
            return len(data)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < tries - 1:
                wait = 5 * (attempt + 1)
                print(f"    (download 429, backing off {wait}s)")
                time.sleep(wait)
                continue
            raise


def main():
    force = "--force" in sys.argv
    os.makedirs(OUT_DIR, exist_ok=True)

    todo = {n: t for n, t in SPECIES.items()
            if force or not os.path.exists(os.path.join(OUT_DIR, n + ".jpg"))}
    skipped = len(SPECIES) - len(todo)
    if skipped:
        print(f"  ({skipped} already present, skipping)")
    if not todo:
        print("\nAll images already present. Use --force to re-download.")
        return

    print(f"  Looking up {len(todo)} titles in one batched API call...")
    urls = get_image_urls(list(todo.values()))

    ok, failed = 0, []
    for name, title in todo.items():
        dest = os.path.join(OUT_DIR, name + ".jpg")
        src = urls.get(title)
        src_label = title
        if not src and name in COMMONS_FALLBACK:
            print(f"    (no page photo for '{title}', searching Commons...)")
            src = commons_search_url(COMMONS_FALLBACK[name])
            src_label = "Commons: " + COMMONS_FALLBACK[name]
            time.sleep(1.0)
        if not src:
            print(f"  FAIL   {name}.jpg  no image for '{title}'")
            failed.append(name)
            continue
        try:
            size = download(src, dest)
            print(f"  ok     {name}.jpg  <- {src_label}  ({size//1024} KB)")
            ok += 1
        except Exception as e:
            print(f"  FAIL   {name}.jpg  {e}")
            failed.append(name)
        time.sleep(1.0)  # be polite to the CDN
    print(f"\nDone: {ok} downloaded, {skipped} skipped, {len(failed)} failed.")
    if failed:
        print("Failed:", ", ".join(failed))


if __name__ == "__main__":
    main()
