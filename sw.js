/* Service worker — cache-first, versioned. Bump CACHE_VERSION whenever any
   asset (data, code, styles, or fish photos) changes so clients update. */
var CACHE_VERSION = "on-angler-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/data-zones.js",
  "./js/data-species.js",
  "./js/data-gallery.js",
  "./js/data-reference.js",
  "./js/season.js",
  "./js/geo.js",
  "./images/placeholder-fish.svg",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (c) {
      // addAll fails the whole install if one asset 404s; add individually to be resilient.
      return Promise.all(ASSETS.map(function (url) {
        return c.add(url).catch(function () { /* ignore missing optional asset */ });
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        // Cache same-origin successful responses (incl. fish photos added later
        // and Google Fonts if reachable) for future offline use.
        if (res && res.status === 200 && (req.url.indexOf(self.location.origin) === 0 ||
            req.url.indexOf("fonts.g") !== -1)) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, clone); });
        }
        return res;
      }).catch(function () {
        // Offline fallback: for navigations, serve the app shell.
        if (req.mode === "navigate") return caches.match("./index.html");
      });
    })
  );
});
