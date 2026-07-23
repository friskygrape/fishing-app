/* GPS zone detection — STUB for a future release.
   Manual zone selection is the supported flow today. To enable GPS later:
     1. Populate ZONE_BOUNDARIES with a polygon (array of [lng,lat] rings) per zone id.
     2. Implement point-in-polygon in detectZone().
   The UI ("Locate me") already calls Geo.detectZone(); returning null makes it
   fall back to manual selection gracefully. */
(function () {
  // Placeholder — no boundary data bundled yet.
  var ZONE_BOUNDARIES = {}; // { 20: [ [ [lng,lat], ... ] ], ... }

  // Returns a zone id (number) or null if unknown / not yet supported.
  function detectZone(lat, lng) {
    if (!Object.keys(ZONE_BOUNDARIES).length) return null;
    // Future: ray-casting point-in-polygon against ZONE_BOUNDARIES.
    return null;
  }

  function isSupported() {
    return Object.keys(ZONE_BOUNDARIES).length > 0 && "geolocation" in navigator;
  }

  window.Geo = { detectZone: detectZone, isSupported: isSupported };
})();
