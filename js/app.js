/* Ontario Angler — view routing + rendering. Plain JS, no framework. */
(function () {
  "use strict";

  var PRIORITY = [20, 16, 17];          // zones fully built (Toronto trio)
  var DISC_KEY = "onAngler.discAck.v1";
  var main = document.getElementById("main");

  /* ---------- tiny helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function h(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function zoneById(id) { for (var i = 0; i < ZONES.length; i++) if (ZONES[i].id === +id) return ZONES[i]; return null; }
  function speciesMeta(key) { return SPECIES[key] || { displayName: key, family: "", imageFile: "", idNotes: "" }; }
  function galleryOf(key) {
    if (!window.GALLERY) return [];
    if (GALLERY[key]) return GALLERY[key];
    // Some species keys differ from their image basename (e.g. combined-limit
    // cards). Fall back to the basename the species' imageFile points at.
    var meta = SPECIES[key];
    var m = meta && meta.imageFile && meta.imageFile.match(/\/([^\/]+)\.[a-z]+$/i);
    return (m && GALLERY[m[1]]) || [];
  }

  var CHEV = '<svg class="chev" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>';

  /* ---------- status ---------- */
  function statusOf(sp, zone) {
    var meta = speciesMeta(sp.key);
    if (zone.notPresent && zone.notPresent.indexOf(meta.displayName) !== -1) return "notpresent";
    if (/closed all year/i.test(sp.season || "")) return "closedyear";
    return Season.isOpenToday(sp.season, new Date()); // open | closed | unknown
  }
  function pill(status) {
    if (status === "open") return '<span class="pill pill--open"><span class="dot"></span>Open today</span>';
    if (status === "closed") return '<span class="pill pill--closed"><span class="dot"></span>Closed today</span>';
    if (status === "closedyear") return '<span class="pill pill--closed"><span class="dot"></span>Closed all year</span>';
    if (status === "notpresent") return '<span class="pill pill--closed"><span class="dot"></span>Not present</span>';
    return '<span class="pill pill--neutral"><span class="dot"></span>Check dates</span>';
  }

  /* ---------- species card ---------- */
  function limitTags(sp) {
    var out = "";
    var releaseOnly = /^S-0$/i.test(sp.sport || "") && /^C-0$/i.test(sp.conservation || "");
    if (releaseOnly) {
      out += '<span class="tag tag--release">Release only (limit 0)</span>';
    } else {
      if (sp.sport) out += '<span class="tag tag--s">Sport <b>' + esc(sp.sport.replace(/^S-?/, "")) + '</b></span>';
      if (sp.conservation) out += '<span class="tag tag--c">Cons. <b>' + esc(sp.conservation.replace(/^C-?/, "")) + '</b></span>';
    }
    if (sp.size) out += '<span class="tag tag--size">' + esc(sp.size) + '</span>';
    return out;
  }

  function speciesCard(sp, zone) {
    var meta = speciesMeta(sp.key);
    var status = statusOf(sp, zone);
    var gallery = galleryOf(sp.key);
    var img = gallery[0] || meta.imageFile || "images/placeholder-fish.svg";
    var hasGallery = gallery.length > 0;
    var badge = gallery.length > 1
      ? '<span class="card__count"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="4" width="9" height="8" rx="1.4"/><path d="M5 4V3.2A1.2 1.2 0 016.2 2h6.6A1.2 1.2 0 0114 3.2v6.6a1.2 1.2 0 01-1.2 1.2H12"/></svg>' + gallery.length + '</span>'
      : "";
    var card = h(
      '<details class="card' + (status === "open" ? "" : " card--closed") + '">' +
        '<summary>' +
          '<div class="card__row">' +
            '<div class="card__thumb' + (hasGallery ? " card__thumb--gallery" : "") + '"' +
              (hasGallery ? ' role="button" tabindex="0" aria-label="Browse ' + gallery.length + ' photos of ' + esc(meta.displayName) + '"' : "") + '>' +
              '<img loading="lazy" alt="' + esc(meta.displayName) + '" src="' + esc(img) + '">' + badge + '</div>' +
            '<div class="card__body">' +
              '<div class="card__top">' +
                '<div><h3 class="card__name">' + esc(meta.displayName) + '</h3>' +
                (meta.family ? '<div class="card__family">' + esc(meta.family) + '</div>' : "") + '</div>' +
                pill(status) +
                '<svg class="chev-open" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>' +
              '</div>' +
              '<div class="card__limits">' + limitTags(sp) + '</div>' +
            '</div>' +
          '</div>' +
        '</summary>' +
        '<div class="card__detail">' +
          '<dl>' +
            '<dt>Season</dt><dd>' + esc(sp.season || "—") + '</dd>' +
            '<dt>Sport</dt><dd>' + esc(sp.sport || "—") + '</dd>' +
            '<dt>Cons.</dt><dd>' + esc(sp.conservation || "—") + '</dd>' +
            (sp.size ? '<dt>Size</dt><dd>' + esc(sp.size) + '</dd>' : "") +
            (sp.notes ? '<dt>Note</dt><dd>' + esc(sp.notes) + '</dd>' : "") +
          '</dl>' +
          (meta.idNotes ? '<p class="card__idnote"><strong>Identify:</strong> ' + esc(meta.idNotes) + '</p>' : "") +
        '</div>' +
      '</details>'
    );
    // Broken/missing photo -> placeholder
    var im = card.querySelector("img");
    im.addEventListener("error", function () { if (im.src.indexOf("placeholder-fish.svg") === -1) im.src = "images/placeholder-fish.svg"; });

    // Tapping the photo opens the gallery instead of toggling the card.
    if (hasGallery) {
      var thumb = card.querySelector(".card__thumb");
      var open = function (e) { e.preventDefault(); e.stopPropagation(); Lightbox.open(gallery, 0, meta.displayName); };
      thumb.addEventListener("click", open);
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") open(e);
      });
    }
    return card;
  }

  /* ---------- HOME ---------- */
  function renderHome() {
    setNav("home");
    main.innerHTML = "";
    main.appendChild(h(
      '<div>' +
        '<p class="eyebrow">Ontario Fishing Regulations 2026</p>' +
        '<h1 class="page-title">Pick your zone</h1>' +
        '<p class="lede">Seasons, catch &amp; size limits, and what’s open <em>today</em> — by Fisheries Management Zone. Works offline.</p>' +
      '</div>'
    ));

    var actions = h('<div class="home-actions"></div>');
    var locate = h(
      '<button class="locate" id="locate" type="button">' +
        '<span class="locate__ico" aria-hidden="true">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0114 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>' +
        '</span>' +
        '<span><span class="locate__t">Locate me</span><br><span class="locate__s">GPS auto-detect — coming soon. Pick manually below.</span></span>' +
      '</button>'
    );
    locate.addEventListener("click", function () {
      var s = locate.querySelector(".locate__s");
      if (Geo.isSupported()) { /* future */ }
      s.textContent = "GPS isn’t available yet — choose your zone from the list below ↓";
    });
    actions.appendChild(locate);

    var search = h(
      '<label class="search">' +
        '<span class="search__ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></span>' +
        '<input type="search" id="zoneSearch" placeholder="Search zone number or area…" autocomplete="off" aria-label="Search zones">' +
      '</label>'
    );
    actions.appendChild(search);
    main.appendChild(actions);

    var ready = ZONES.filter(function (z) { return PRIORITY.indexOf(z.id) !== -1; })
      .sort(function (a, b) { return PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id); });
    var others = ZONES.filter(function (z) { return PRIORITY.indexOf(z.id) === -1; })
      .sort(function (a, b) { return a.id - b.id; });

    var readyWrap = h('<div><p class="group-label">★ Your area — Greater Toronto</p><div class="zone-grid" id="grid-ready"></div></div>');
    ready.forEach(function (z) { readyWrap.querySelector("#grid-ready").appendChild(zoneChip(z)); });
    main.appendChild(readyWrap);

    var otherWrap = h('<div><p class="group-label">All other zones</p><div class="zone-grid" id="grid-other"></div></div>');
    others.forEach(function (z) { otherWrap.querySelector("#grid-other").appendChild(zoneChip(z)); });
    main.appendChild(otherWrap);

    // search filter
    var input = search.querySelector("input");
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var any = false;
      document.querySelectorAll(".zone-chip").forEach(function (chip) {
        var hay = chip.getAttribute("data-hay");
        var show = !q || hay.indexOf(q) !== -1;
        chip.style.display = show ? "" : "none";
        if (show) any = true;
      });
      [readyWrap, otherWrap].forEach(function (w) {
        var visible = w.querySelectorAll('.zone-chip:not([style*="display: none"])').length;
        w.style.display = visible ? "" : "none";
      });
    });
  }

  function zoneChip(z) {
    var ready = !!z.dataComplete;
    var region = z.region || "";
    var chip = h(
      '<a class="zone-chip ' + (ready ? "is-ready" : "is-soon") + '" href="#/zone/' + z.id + '"' +
        ' style="--zc:' + esc(z.colorHex || "#45b3ab") + '"' +
        ' data-hay="' + esc((z.id + " " + region + (PRIORITY.indexOf(z.id) !== -1 ? " toronto gta" : "")).toLowerCase()) + '">' +
        (PRIORITY.indexOf(z.id) !== -1 ? '<span class="pin">★ You</span>' : "") +
        '<span class="zone-chip__num">' + z.id + '</span>' +
        '<span class="zone-chip__meta">' +
          '<span class="zone-chip__label">Zone ' + z.id + '</span>' +
          '<span class="zone-chip__region">' + esc(region) + '</span>' +
          (ready ? "" : '<span class="zone-chip__soon">Data coming soon</span>') +
        '</span>' +
      '</a>'
    );
    return chip;
  }

  /* ---------- ZONE DETAIL ---------- */
  function renderZone(id) {
    setNav("home");
    var z = zoneById(id);
    main.innerHTML = "";
    main.appendChild(h('<a class="back-link" href="#/">' + backArrow() + ' All zones</a>'));

    if (!z) { main.appendChild(h('<p class="empty">Zone not found.</p>')); return; }

    main.appendChild(h(
      '<div class="zone-head" style="--zc:' + esc(z.colorHex || "#45b3ab") + '">' +
        '<span class="zone-head__num" aria-hidden="true">' + z.id + '</span>' +
        '<p class="zone-head__eyebrow">Fisheries Management Zone</p>' +
        '<h1 class="zone-head__title">Zone ' + z.id + '</h1>' +
        '<p class="zone-head__region">' + esc(z.region || "") + '</p>' +
      '</div>'
    ));

    if (!z.dataComplete) {
      main.appendChild(h(
        '<div class="ref-block"><h2>Data coming soon</h2>' +
        '<p style="color:var(--ink-dim)">This first release covers Zones 20, 16 and 17 (the Greater Toronto area) in full. Zone ' + z.id +
        '’s seasons and limits haven’t been added yet. Check <span class="nowrap">ontario.ca/fishing</span> for now.</p></div>'
      ));
      return;
    }

    // General info accordion
    if (z.generalInfo && z.generalInfo.length) {
      var acc = h(
        '<details class="accordion"><summary>Zone rules &amp; bait notes ' + CHEV + '</summary>' +
        '<div class="accordion__body"><ul>' +
        z.generalInfo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") +
        '</ul></div></details>'
      );
      main.appendChild(acc);
    }

    // in-zone search
    var sBox = h(
      '<label class="search" style="margin-top:1rem;display:block">' +
        '<span class="search__ico" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></span>' +
        '<input type="search" id="spSearch" placeholder="Find a species…" autocomplete="off" aria-label="Search species in this zone">' +
      '</label>'
    );
    main.appendChild(sBox);

    var body = h('<div id="zoneBody"></div>');
    main.appendChild(body);
    drawZoneSpecies(z, body, "");

    sBox.querySelector("input").addEventListener("input", function (e) {
      drawZoneSpecies(z, body, e.target.value.trim().toLowerCase());
    });
  }

  function drawZoneSpecies(z, body, q) {
    body.innerHTML = "";
    var species = (z.species || []).filter(function (sp) {
      if (!q) return true;
      return speciesMeta(sp.key).displayName.toLowerCase().indexOf(q) !== -1;
    });

    var info = [], open = [], notOpen = [], closed = [];
    species.forEach(function (sp) {
      if (sp.key === "aggregate-trout-salmon") { info.push(sp); return; }
      var st = statusOf(sp, z);
      if (st === "open") open.push(sp);
      else if (st === "closedyear") closed.push(sp);
      else notOpen.push(sp); // closed today or unknown
    });

    if (info.length) {
      body.appendChild(sectionHead("Combined limit"));
      var wrap = h('<div class="cards"></div>');
      info.forEach(function (sp) { wrap.appendChild(speciesCard(sp, z)); });
      body.appendChild(wrap);
    }
    if (open.length) appendGroup(body, "Open today", open.length, open, z);
    if (notOpen.length) appendGroup(body, "Not open today", notOpen.length, notOpen, z);

    // closed all year + not present
    var np = (z.notPresent || []).filter(function (n) { return !q || n.toLowerCase().indexOf(q) !== -1; });
    if (closed.length || np.length) {
      body.appendChild(sectionHead("Closed all year / not present", closed.length + np.length));
      var list = h('<div class="closed-list"></div>');
      closed.forEach(function (sp) {
        list.appendChild(h('<div class="closed-item"><span class="closed-item__name">' + esc(speciesMeta(sp.key).displayName) + '</span><span class="closed-item__why">Closed all year</span></div>'));
      });
      np.forEach(function (n) {
        list.appendChild(h('<div class="closed-item"><span class="closed-item__name">' + esc(n) + '</span><span class="closed-item__why">Not present in zone</span></div>'));
      });
      body.appendChild(list);
    }

    if (!species.length && !np.length) body.appendChild(h('<p class="empty">No species match “' + esc(q) + '”.</p>'));
  }

  function appendGroup(body, title, count, arr, z) {
    body.appendChild(sectionHead(title, count));
    var wrap = h('<div class="cards"></div>');
    arr.sort(function (a, b) { return speciesMeta(a.key).displayName.localeCompare(speciesMeta(b.key).displayName); });
    arr.forEach(function (sp) { wrap.appendChild(speciesCard(sp, z)); });
    body.appendChild(wrap);
  }
  function sectionHead(title, count) {
    return h('<h2 class="sect-h">' + esc(title) + (count != null ? ' <span class="count">' + count + '</span>' : "") + '</h2>');
  }

  /* ---------- REFERENCE ---------- */
  function renderReference() {
    setNav("reference");
    var R = REFERENCE;
    main.innerHTML = "";
    main.appendChild(h('<div><p class="eyebrow">General rules</p><h1 class="page-title">Reference</h1></div>'));

    var lic = h('<div class="ref-block"><h2>Licence limits: S vs C</h2></div>');
    R.licences.forEach(function (l) {
      lic.appendChild(h('<div class="lic"><div class="lic__code">' + esc(l.code) + '</div><div><div class="lic__name">' + esc(l.name) + '</div><div class="lic__desc">' + esc(l.desc) + '</div></div></div>'));
    });
    main.appendChild(lic);

    var gl = h('<div class="ref-block"><h2>Key terms</h2><dl class="gloss"></dl></div>');
    var dl = gl.querySelector("dl");
    R.glossary.forEach(function (g) { dl.appendChild(h('<dt>' + esc(g.term) + '</dt>')); dl.appendChild(h('<dd>' + esc(g.def) + '</dd>')); });
    main.appendChild(gl);

    var pl = h('<div class="ref-block"><h2>Provincial possession limits</h2><ul class="plimits"></ul><p style="color:var(--ink-dim);font-size:.82rem;margin:.7rem 0 0">Caps across ALL zones combined. Zone limits may be lower — the lower one applies.</p></div>');
    var ul = pl.querySelector("ul");
    R.possessionLimits.forEach(function (p) { ul.appendChild(h('<li><span class="n">' + esc(p.name) + '</span><span class="v">' + esc(p.limit) + '</span></li>')); });
    main.appendChild(pl);

    main.appendChild(h('<div class="ref-block"><h2>Disclaimer</h2><div class="callout">' + esc(R.disclaimer) + '</div>' +
      '<p style="color:var(--ink-dim);margin:.8rem 0 0">Report a resource violation: <strong>' + esc(R.reportAbuse) + '</strong> • Official rules: <span class="nowrap">' + esc(R.officialSite) + '</span></p></div>'));
  }

  function backArrow() { return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 12L6 8l4-4"/></svg>'; }

  /* ---------- nav / routing ---------- */
  function setNav(which) {
    document.querySelectorAll(".app-bar__nav a").forEach(function (a) {
      if (a.getAttribute("data-nav") === which) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }
  function route() {
    var hash = location.hash || "#/";
    var m = hash.match(/^#\/zone\/(\d+)/);
    if (m) renderZone(m[1]);
    else if (hash.indexOf("#/reference") === 0) renderReference();
    else renderHome();
    main.focus({ preventScroll: false });
    window.scrollTo(0, 0);
  }

  /* ---------- disclaimer gate ---------- */
  function gate() {
    var modal = document.getElementById("disclaimer");
    document.getElementById("disc-body").textContent = REFERENCE.disclaimer;
    if (localStorage.getItem(DISC_KEY)) return;
    modal.hidden = false;
    document.getElementById("disc-ok").addEventListener("click", function () {
      try { localStorage.setItem(DISC_KEY, "1"); } catch (e) {}
      modal.hidden = true;
    });
  }

  /* ---------- lightbox / photo gallery ---------- */
  var Lightbox = (function () {
    var el, imgEl, capEl, countEl, stripEl, imgs = [], idx = 0, lastFocus = null;

    function build() {
      el = h(
        '<div class="lbox" hidden aria-hidden="true">' +
          '<div class="lbox__backdrop" data-close></div>' +
          '<div class="lbox__dialog" role="dialog" aria-modal="true" aria-label="Fish photo gallery">' +
            '<button class="lbox__x" type="button" data-close aria-label="Close gallery">' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            '<div class="lbox__stage">' +
              '<button class="lbox__nav lbox__nav--prev" type="button" data-prev aria-label="Previous photo"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5l-7 7 7 7"/></svg></button>' +
              '<img class="lbox__img" alt="">' +
              '<button class="lbox__nav lbox__nav--next" type="button" data-next aria-label="Next photo"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>' +
            '</div>' +
            '<div class="lbox__bar"><span class="lbox__cap"></span><span class="lbox__count"></span></div>' +
            '<div class="lbox__strip"></div>' +
          '</div>' +
        '</div>'
      );
      imgEl = el.querySelector(".lbox__img");
      capEl = el.querySelector(".lbox__cap");
      countEl = el.querySelector(".lbox__count");
      stripEl = el.querySelector(".lbox__strip");
      document.body.appendChild(el);

      el.addEventListener("click", function (e) {
        if (e.target.closest("[data-close]")) close();
        else if (e.target.closest("[data-prev]")) go(idx - 1);
        else if (e.target.closest("[data-next]")) go(idx + 1);
      });
      // swipe
      var x0 = null;
      el.querySelector(".lbox__stage").addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      el.querySelector(".lbox__stage").addEventListener("touchend", function (e) {
        if (x0 == null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
        x0 = null;
      });
    }

    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (e.key === "ArrowRight") go(idx + 1);
    }

    function go(n) {
      if (!imgs.length) return;
      idx = (n + imgs.length) % imgs.length;
      imgEl.src = imgs[idx];
      countEl.textContent = (idx + 1) + " / " + imgs.length;
      var multi = imgs.length > 1;
      el.querySelectorAll(".lbox__nav").forEach(function (b) { b.style.display = multi ? "" : "none"; });
      stripEl.querySelectorAll("img").forEach(function (t, i) {
        t.classList.toggle("is-active", i === idx);
        if (i === idx) t.scrollIntoView({ block: "nearest", inline: "center" });
      });
    }

    function open(list, start, title) {
      if (!list || !list.length) return;
      if (!el) build();
      imgs = list; idx = start || 0;
      lastFocus = document.activeElement;
      capEl.textContent = title || "";
      stripEl.innerHTML = "";
      stripEl.style.display = imgs.length > 1 ? "" : "none";
      imgs.forEach(function (src, i) {
        var t = h('<img loading="lazy" alt="' + esc(title || "") + ' photo ' + (i + 1) + '" src="' + esc(src) + '">');
        t.addEventListener("click", function () { go(i); });
        t.addEventListener("error", function () { t.style.display = "none"; });
        stripEl.appendChild(t);
      });
      el.hidden = false; el.setAttribute("aria-hidden", "false");
      document.body.classList.add("lbox-open");
      document.addEventListener("keydown", onKey);
      go(idx);
      el.querySelector(".lbox__x").focus();
    }

    function close() {
      if (!el || el.hidden) return;
      el.hidden = true; el.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lbox-open");
      document.removeEventListener("keydown", onKey);
      imgEl.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    return { open: open };
  })();

  /* ---------- boot ---------- */
  window.addEventListener("hashchange", route);
  gate();
  route();

  if ("serviceWorker" in navigator && navigator.serviceWorker) {
    window.addEventListener("load", function () {
      try { navigator.serviceWorker.register("sw.js").catch(function () {}); } catch (e) {}
    });
  }
})();
