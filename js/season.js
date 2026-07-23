/* Season status engine.
   isOpenToday(seasonText, date) -> "open" | "closed" | "unknown"
   Parses the verbatim season text from the summary. Recognizes:
     - "open all year" / "closed all year"
     - fixed ranges: "January 1 to April 14"
     - multi-range joined by " and "
     - relative dates: "<ordinal> <Weekday> in <Month>", "Labour Day", "Family Day"
   Returns "unknown" (never a guess) when a token isn't recognized, so the UI
   shows a neutral badge and the raw text. */
(function () {
  var MONTHS = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
  };
  var WEEKDAYS = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  var ORDINALS = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, last: -1 };

  function nthWeekday(year, monthIdx, weekday, n) {
    if (n === -1) {
      var last = new Date(year, monthIdx + 1, 0);
      for (var d = last.getDate(); d >= 1; d--) {
        var dd = new Date(year, monthIdx, d);
        if (dd.getDay() === weekday) return dd;
      }
      return null;
    }
    var count = 0, day = new Date(year, monthIdx, 1);
    while (day.getMonth() === monthIdx) {
      if (day.getDay() === weekday) { count++; if (count === n) return new Date(day); }
      day.setDate(day.getDate() + 1);
    }
    return null;
  }

  // Parse one endpoint phrase into a Date in the given year, or null if unknown.
  function parseEndpoint(phrase, year) {
    var s = phrase.trim().toLowerCase().replace(/\s+/g, " ");
    if (s === "labour day" || s === "labor day") return nthWeekday(year, 8, 1, 1); // 1st Mon Sept
    if (s === "family day") return nthWeekday(year, 1, 1, 3);                       // 3rd Mon Feb (ON)

    // "<ordinal> <weekday> in <month>"
    var rel = s.match(/^(first|second|third|fourth|fifth|last)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+in\s+([a-z]+)$/);
    if (rel && MONTHS[rel[3]] !== undefined) {
      return nthWeekday(year, MONTHS[rel[3]], WEEKDAYS[rel[2]], ORDINALS[rel[1]]);
    }

    // "<month> <day>"
    var abs = s.match(/^([a-z]+)\s+(\d{1,2})$/);
    if (abs && MONTHS[abs[1]] !== undefined) {
      return new Date(year, MONTHS[abs[1]], parseInt(abs[2], 10));
    }
    return null;
  }

  function dayNum(date) { return date.getMonth() * 31 + date.getDate(); }

  function isOpenToday(seasonText, date) {
    if (!seasonText) return "unknown";
    var today = date || new Date();
    var text = seasonText.toLowerCase();

    if (/closed all year/.test(text)) return "closed";
    if (/open all year/.test(text)) return "open";
    if (text.indexOf(" to ") === -1) return "unknown"; // e.g. "See individual seasons below"

    var year = today.getFullYear();
    var todayN = dayNum(today);
    var segments = text.split(" and ");
    var sawRange = false;

    for (var i = 0; i < segments.length; i++) {
      var parts = segments[i].split(" to ");
      if (parts.length !== 2) continue;
      var start = parseEndpoint(parts[0], year);
      var end = parseEndpoint(parts[1], year);
      if (!start || !end) return "unknown"; // don't guess if any endpoint is unknown
      sawRange = true;
      var s = dayNum(start), e = dayNum(end);
      if (s <= e) { if (todayN >= s && todayN <= e) return "open"; }
      else { if (todayN >= s || todayN <= e) return "open"; } // wraps year-end
    }
    return sawRange ? "closed" : "unknown";
  }

  window.Season = { isOpenToday: isOpenToday };
})();
