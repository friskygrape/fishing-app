#!/usr/bin/env python3
"""Build a multi-photo gallery for every species.

Three steps, all idempotent / re-runnable:
  1. CONSOLIDATE  — copy loose photos in images/ (BrownTrout1.jpg, Crappie2.jpeg,
     CrappiePrev.html, ...) into images/fish/<key>/, deduped by content hash,
     with correct extensions. Originals are left untouched as a backup.
  2. FETCH        — top each species up to TARGET photos with openly-licensed
     Wikimedia Commons images (searched by scientific name), deduped.
  3. MANIFEST     — write js/data-gallery.js: window.GALLERY[key] = [paths...],
     cover image first, then user photos, then fetched ones.

Usage:  python3 tools/build-galleries.py            (consolidate + fetch + manifest)
        python3 tools/build-galleries.py --no-fetch (skip downloads; local only)
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = "FishRefBot/1.0 (personal fishing reference PWA)"
HERE = os.path.dirname(__file__)
IMAGES = os.path.normpath(os.path.join(HERE, "..", "images"))
FISH = os.path.join(IMAGES, "fish")
MANIFEST = os.path.normpath(os.path.join(HERE, "..", "js", "data-gallery.js"))
TARGET = 5  # desired photos per species (cover + user + fetched)

# key -> Wikimedia Commons search term (scientific binomial gives clean specimen
# photos). Aggregates use a representative species. aurora-trout is omitted on
# purpose: Commons has no distinct photo of it, so it keeps the placeholder.
SCI = {
    "trout-salmon":     "Oncorhynchus mykiss",
    "atlantic-salmon":  "Salmo salar",
    "largemouth-bass":  "Micropterus salmoides",
    "smallmouth-bass":  "Micropterus dolomieu",
    "bass-combined":    "Micropterus salmoides",
    "brook-trout":      "Salvelinus fontinalis",
    "brown-trout":      "Salmo trutta",
    "rainbow-trout":    "Oncorhynchus mykiss",
    "lake-trout":       "Salvelinus namaycush",
    "splake":           "Splake",
    "chinook-salmon":   "Oncorhynchus tshawytscha",
    "coho-salmon":      "Oncorhynchus kisutch",
    "pacific-salmon":   "Oncorhynchus tshawytscha",
    "walleye":          "Sander vitreus",
    "yellow-perch":     "Perca flavescens",
    "northern-pike":    "Esox lucius",
    "muskellunge":      "Esox masquinongy",
    "lake-whitefish":   "Coregonus clupeaformis",
    "cisco":            "Coregonus artedi",
    "sunfish":          "Lepomis macrochirus",
    "crappie":          "Pomoxis nigromaculatus",
    "channel-catfish":  "Ictalurus punctatus",
    "lake-sturgeon":    "Acipenser fulvescens",
}

# Every species key the app knows about (from data-species.js). aurora-trout has
# no fetch term but still appears so its (placeholder) state is explicit.
ALL_KEYS = list(SCI.keys()) + ["aurora-trout"]

EXT_BY_MAGIC = [
    (b"\xff\xd8\xff", ".jpg"),
    (b"\x89PNG\r\n\x1a\n", ".png"),
    (b"GIF8", ".gif"),
]


def sniff_ext(path, default=".jpg"):
    with open(path, "rb") as f:
        head = f.read(16)
    for magic, ext in EXT_BY_MAGIC:
        if head.startswith(magic):
            return ext
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return ".webp"
    return default


def md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def norm_token(stem):
    """'BrownTrout3'->'browntrout', 'AtlanticSalmonPrev'->'atlanticsalmon'."""
    t = re.sub(r"[^a-z]", "", stem.lower())
    if t.endswith("prev"):
        t = t[:-4]
    return t


# species key without hyphens -> key   (e.g. 'atlanticsalmon' -> 'atlantic-salmon')
TOKEN_TO_KEY = {k.replace("-", ""): k for k in ALL_KEYS}


def _http(url, tries=5):
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < tries - 1:
                wait = 5 * (attempt + 1)
                print(f"      ({e.code}, backing off {wait}s)")
                time.sleep(wait)
                continue
            raise
    return None


def commons_photos(term, limit=12):
    """Return [(thumburl, width)] of real photos on Commons for a search term."""
    q = urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrsearch": term,
        "gsrnamespace": "6", "gsrlimit": str(limit), "prop": "imageinfo",
        "iiprop": "url|size|mime", "iiurlwidth": "1100", "format": "json",
    })
    raw = _http("https://commons.wikimedia.org/w/api.php?" + q)
    if not raw:
        return []
    pages = json.loads(raw).get("query", {}).get("pages", {})
    out = []
    for p in sorted(pages.values(), key=lambda p: p.get("index", 0)):
        i = (p.get("imageinfo") or [{}])[0]
        if (i.get("mime") in ("image/jpeg", "image/png")
                and i.get("thumburl") and (i.get("width") or 0) >= 500):
            out.append(i["thumburl"])
    return out


def consolidate():
    """Copy loose photos in images/ into per-species folders, deduped."""
    print("== Consolidating your loose photos ==")
    # Group loose files by species key.
    groups = {}
    for name in sorted(os.listdir(IMAGES)):
        full = os.path.join(IMAGES, name)
        if not os.path.isfile(full) or name == "placeholder-fish.svg":
            continue
        stem = os.path.splitext(name)[0]
        key = TOKEN_TO_KEY.get(norm_token(stem))
        if key:
            groups.setdefault(key, []).append(name)

    for key, names in groups.items():
        dest_dir = os.path.join(FISH, key)
        os.makedirs(dest_dir, exist_ok=True)
        seen = set()
        cover = os.path.join(FISH, key + ".jpg")
        if os.path.exists(cover):
            seen.add(md5(cover))  # don't re-copy the cover into the gallery
        for f in os.listdir(dest_dir):  # already-consolidated files
            seen.add(md5(os.path.join(dest_dir, f)))
        added = 0
        for name in names:
            src = os.path.join(IMAGES, name)
            digest = md5(src)
            if digest in seen:
                continue
            seen.add(digest)
            ext = sniff_ext(src, default=os.path.splitext(name)[1].lower() or ".jpg")
            if ext == ".jpeg":
                ext = ".jpg"
            idx = len(os.listdir(dest_dir)) + 1
            dest = os.path.join(dest_dir, f"u{idx:02d}{ext}")
            with open(src, "rb") as a, open(dest, "wb") as b:
                b.write(a.read())
            added += 1
        if added:
            print(f"  {key}: +{added} of your photos")


def fetch():
    """Top each species up to TARGET photos from Wikimedia Commons."""
    print("== Fetching extra reference photos from Wikimedia Commons ==")
    for key in ALL_KEYS:
        term = SCI.get(key)
        if not term:
            print(f"  {key}: skipped (no distinct Commons photos)")
            continue
        dest_dir = os.path.join(FISH, key)
        os.makedirs(dest_dir, exist_ok=True)
        seen = set()
        cover = os.path.join(FISH, key + ".jpg")
        have = 1 if os.path.exists(cover) else 0
        if have:
            seen.add(md5(cover))
        for f in os.listdir(dest_dir):
            seen.add(md5(os.path.join(dest_dir, f)))
            have += 1
        need = TARGET - have
        if need <= 0:
            print(f"  {key}: already has {have} — ok")
            continue
        urls = commons_photos(term)
        got = 0
        for url in urls:
            if got >= need:
                break
            try:
                data = _http(url)
            except Exception as e:
                print(f"      download failed: {e}")
                continue
            if not data or len(data) < 3000:
                continue
            digest = hashlib.md5(data).hexdigest()
            if digest in seen:
                continue
            seen.add(digest)
            ext = ".png" if data[:8].startswith(b"\x89PNG") else ".jpg"
            idx = len(os.listdir(dest_dir)) + 1
            with open(os.path.join(dest_dir, f"w{idx:02d}{ext}"), "wb") as f:
                f.write(data)
            got += 1
            time.sleep(1.0)  # be polite to the CDN
        print(f"  {key}: +{got} from Commons ({term})")
        time.sleep(0.6)


def build_manifest():
    """Write js/data-gallery.js from what's on disk."""
    print("== Writing js/data-gallery.js ==")
    gallery = {}
    for key in ALL_KEYS:
        imgs = []
        cover = "images/fish/" + key + ".jpg"
        if os.path.exists(os.path.join(FISH, key + ".jpg")):
            imgs.append(cover)
        dest_dir = os.path.join(FISH, key)
        if os.path.isdir(dest_dir):
            for f in sorted(os.listdir(dest_dir)):  # u.. before w.. alphabetically
                imgs.append("images/fish/" + key + "/" + f)
        if imgs:
            gallery[key] = imgs
    body = json.dumps(gallery, indent=2, ensure_ascii=False)
    with open(MANIFEST, "w") as f:
        f.write("/* AUTO-GENERATED by tools/build-galleries.py — do not edit by hand.\n")
        f.write("   Maps species key -> ordered gallery image paths (cover first). */\n")
        f.write("window.GALLERY = " + body + ";\n")
    total = sum(len(v) for v in gallery.values())
    print(f"  {len(gallery)} species, {total} photos total.")
    for k, v in gallery.items():
        print(f"    {k}: {len(v)}")


def main():
    consolidate()
    if "--no-fetch" not in sys.argv:
        fetch()
    build_manifest()
    print("\nDone. Remember to bump CACHE_VERSION in sw.js if serving offline.")


if __name__ == "__main__":
    main()
