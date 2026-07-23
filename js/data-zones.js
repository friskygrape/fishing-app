/* Ontario Fisheries Management Zones — ZONE-WIDE seasons & limits only.
   Source: 2026 Ontario Fishing Regulations Summary (MNR).
   Fully transcribed & cross-checked: Zone 20 (pp.138–139), Zone 16 (pp.117–118),
   Zone 17 (pp.127–128). Other zones are scaffolded (dataComplete:false) and show
   a "coming soon" notice until their tables are entered.

   `season` text is stored VERBATIM from the summary and is the source of truth.
   S = Sport licence limit, C = Conservation licence limit.
   THIS IS A CONVENIENCE REFERENCE, NOT A LEGAL DOCUMENT. */

window.ZONES = [
  { id: 1, region: "Far North", colorHex: "#1b3a5b", dataComplete: false },
  { id: 2, region: "Northwest", colorHex: "#1b3a5b", dataComplete: false },
  { id: 3, region: "Far North / Northeast", colorHex: "#1b3a5b", dataComplete: false },
  { id: 4, region: "Northwest", colorHex: "#178a6e", dataComplete: false },
  { id: 5, region: "Northwest", colorHex: "#b5651d", dataComplete: false },
  { id: 6, region: "Northwest", colorHex: "#6b2c2c", dataComplete: false },
  { id: 7, region: "Northeast", colorHex: "#4c8c2b", dataComplete: false },
  { id: 8, region: "Northeast", colorHex: "#6a3d9a", dataComplete: false },
  { id: 9, region: "Lake Superior", colorHex: "#1f6fb2", dataComplete: false },
  { id: 10, region: "Northeast", colorHex: "#e14b2a", dataComplete: false },
  { id: 11, region: "Northeast", colorHex: "#7a94a8", dataComplete: false },
  { id: 12, region: "Ottawa River", colorHex: "#8a8a2b", dataComplete: false },
  { id: 13, region: "Lake Huron", colorHex: "#5a5a5a", dataComplete: false },
  { id: 14, region: "Georgian Bay", colorHex: "#5a5a5a", dataComplete: false },
  { id: 15, region: "Central", colorHex: "#e8952b", dataComplete: false },

  {
    id: 16,
    region: "Southern — GTA inland & Lake Huron/Georgian Bay",
    colorHex: "#9b2f4d",
    dataComplete: true,
    generalInfo: [
      "Warmouth is listed as endangered in Ontario and may not be caught or possessed under a Recreational Fishing Licence.",
      "Several Great Lakes tributaries have aligned regulations for Atlantic Salmon, Brown Trout, Pacific Salmon and Rainbow Trout (Species Exceptions — not shown in this zone-wide view).",
      "FMZ 16 is part of the Southern Bait Management Zone (BMZ). Live or dead baitfish or leeches may not be transported into or out of a BMZ — except baitfish/leeches that are both dead AND preserved.",
      "Note: Hamilton Harbour is in Zone 20. Detroit River and St. Clair River are in Zone 19."
    ],
    notPresent: [],
    species: [
      { key: "aggregate-trout-salmon", season: "See individual seasons below", sport: "S-5", conservation: "C-2", size: "", notes: "Total daily catch & possession limit for ALL trout and salmon species combined." },
      { key: "atlantic-salmon", season: "fourth Saturday in April to September 30", sport: "S-0", conservation: "C-0", size: "", notes: "Catch-and-release only (limit zero)." },
      { key: "brook-trout", season: "fourth Saturday in April to September 30", sport: "S-5", conservation: "C-2", size: "" },
      { key: "brown-trout", season: "fourth Saturday in April to September 30", sport: "S-5", conservation: "C-2", size: "" },
      { key: "channel-catfish", season: "open all year", sport: "S-12", conservation: "C-6", size: "" },
      { key: "crappie", season: "open all year", sport: "S-30", conservation: "C-10", size: "" },
      { key: "lake-sturgeon", season: "closed all year", sport: "S-0", conservation: "C-0", size: "", notes: "Protected — no fishing." },
      { key: "lake-trout", season: "January 1 to September 30", sport: "S-2", conservation: "C-1", size: "" },
      { key: "lake-whitefish", season: "open all year", sport: "S-12", conservation: "C-6", size: "" },
      { key: "largemouth-smallmouth-bass", season: "fourth Saturday in June to November 30", sport: "S-6", conservation: "C-2", size: "", notes: "Largemouth and Smallmouth combined." },
      { key: "muskellunge", season: "first Saturday in June to December 15", sport: "S-1", conservation: "C-0", size: "must be greater than 91 cm" },
      { key: "northern-pike", season: "January 1 to March 31 and second Saturday in May to December 31", sport: "S-6", conservation: "C-2", size: "" },
      { key: "pacific-salmon", season: "fourth Saturday in April to September 30", sport: "S-5", conservation: "C-2", size: "" },
      { key: "rainbow-trout", season: "fourth Saturday in April to September 30", sport: "S-2", conservation: "C-1", size: "" },
      { key: "splake", season: "open all year", sport: "S-5", conservation: "C-2", size: "" },
      { key: "sunfish", season: "open all year", sport: "S-50", conservation: "C-25", size: "" },
      { key: "walleye-sauger", season: "January 1 to March 15 and second Saturday in May to December 31", sport: "S-4", conservation: "C-2", size: "not more than 1 greater than 46 cm" },
      { key: "yellow-perch", season: "open all year", sport: "S-50", conservation: "C-25", size: "" }
    ]
  },

  {
    id: 17,
    region: "Southern — Kawarthas / Peterborough",
    colorHex: "#1f6b5c",
    dataComplete: true,
    generalInfo: [
      "Several Great Lakes tributaries have aligned regulations for Rainbow Trout, Brown Trout, Pacific Salmon and Atlantic Salmon (Species Exceptions — not shown in this zone-wide view).",
      "Some waterbodies have their own rules — notably Lake Scugog (Walleye closed all year) and the Trent River. Always check waterbody exceptions for the specific lake/river.",
      "FMZ 17 is part of the Southern Bait Management Zone (BMZ). Live or dead baitfish or leeches may not be transported into or out of a BMZ — except baitfish/leeches that are both dead AND preserved."
    ],
    notPresent: ["Splake"],
    species: [
      { key: "aggregate-trout-salmon", season: "See individual seasons below", sport: "S-5", conservation: "C-2", size: "", notes: "Total daily catch & possession limit for ALL trout and salmon species combined." },
      { key: "atlantic-salmon", season: "fourth Saturday in April to September 30", sport: "S-0", conservation: "C-0", size: "", notes: "Catch-and-release only (limit zero)." },
      { key: "brook-trout", season: "fourth Saturday in April to September 30", sport: "S-2", conservation: "C-1", size: "" },
      { key: "brown-trout", season: "fourth Saturday in April to September 30", sport: "S-5", conservation: "C-2", size: "" },
      { key: "channel-catfish", season: "fourth Saturday in April to November 15", sport: "S-12", conservation: "C-6", size: "" },
      { key: "crappie", season: "open all year", sport: "S-30", conservation: "C-10", size: "" },
      { key: "lake-sturgeon", season: "closed all year", sport: "S-0", conservation: "C-0", size: "", notes: "Protected — no fishing." },
      { key: "lake-trout", season: "fourth Saturday in April to September 30", sport: "S-3", conservation: "C-1", size: "" },
      { key: "lake-whitefish", season: "fourth Saturday in April to November 15", sport: "S-12", conservation: "C-6", size: "" },
      { key: "largemouth-smallmouth-bass", season: "third Saturday in June to December 15", sport: "S-6", conservation: "C-2", size: "", notes: "Largemouth and Smallmouth combined." },
      { key: "muskellunge", season: "first Saturday in June to December 15", sport: "S-1", conservation: "C-0", size: "must be greater than 112 cm" },
      { key: "northern-pike", season: "open all year", sport: "S-6", conservation: "C-2", size: "" },
      { key: "pacific-salmon", season: "fourth Saturday in April to September 30", sport: "S-5", conservation: "C-2", size: "" },
      { key: "rainbow-trout", season: "fourth Saturday in April to September 30", sport: "S-2", conservation: "C-1", size: "" },
      { key: "sunfish", season: "open all year", sport: "S-300", conservation: "C-15", size: "only 30 may be greater than 18 cm" },
      { key: "walleye-sauger", season: "second Saturday in May to November 15", sport: "S-4", conservation: "C-1", size: "must be between 35-50 cm" },
      { key: "yellow-perch", season: "open all year", sport: "S-50", conservation: "C-25", size: "" }
    ]
  },

  { id: 18, region: "Southern — Eastern Ontario", colorHex: "#2f2f2a", dataComplete: false },
  { id: 19, region: "Southern — Lake Erie / St. Clair", colorHex: "#178a8a", dataComplete: false },

  {
    id: 20,
    region: "Southern — Lake Ontario waterfront (Downtown Toronto)",
    colorHex: "#1f5c3a",
    dataComplete: true,
    generalInfo: [
      "American Eel is a specially protected species and may not be caught or possessed under a Recreational Fishing Licence — if you catch one, you must release it.",
      "Two lines may be used when angling from a boat in open water — EXCEPT in Hamilton Harbour, Toronto Harbour, Frenchman's Bay, Murray Canal, Presqu'ile Bay, Weller's Bay, East Lake, West Lake, the Bay of Quinte (west of the Glenora Ferry), the St. Lawrence River (east of a line between Bishops Point and the east tips of Howe/Wolfe islands), and all other tributaries to Lake Ontario.",
      "FMZ 20 (except the County of Prince Edward) is part of the Great Lakes. Baitfish and leeches that are both dead AND preserved can be moved into and out of BMZs and the Great Lakes."
    ],
    notPresent: ["Brook Trout", "Splake"],
    species: [
      { key: "aggregate-trout-salmon", season: "See individual seasons below", sport: "S-5", conservation: "C-2", size: "", notes: "Total daily catch & possession limit for ALL trout and salmon species combined." },
      { key: "atlantic-salmon", season: "open all year", sport: "S-1", conservation: "C-0", size: "must be greater than 63 cm" },
      { key: "largemouth-bass", season: "third Saturday in June to December 31", sport: "S-6", conservation: "C-2", size: "", notes: "Also a CATCH-AND-RELEASE season January 1 to May 10 (limit 0). Regular harvest season starts the third Saturday in June. Aggregate bass limit S-6/C-2 applies." },
      { key: "smallmouth-bass", season: "first Saturday in July to December 31", sport: "S-6", conservation: "C-2", size: "", notes: "Also a CATCH-AND-RELEASE season January 1 to May 10 (limit 0). Regular harvest season starts the first Saturday in July. Aggregate bass limit S-6/C-2 applies." },
      { key: "brown-trout", season: "open all year", sport: "S-5", conservation: "C-2", size: "" },
      { key: "channel-catfish", season: "open all year", sport: "S-12", conservation: "C-6", size: "" },
      { key: "crappie", season: "open all year", sport: "S-30", conservation: "C-10", size: "" },
      { key: "lake-sturgeon", season: "closed all year", sport: "S-0", conservation: "C-0", size: "", notes: "Protected — no fishing." },
      { key: "lake-trout", season: "January 1 to September 30 and December 1 to December 31", sport: "S-3", conservation: "C-1", size: "" },
      { key: "lake-whitefish", season: "open all year", sport: "S-12", conservation: "C-6", size: "" },
      { key: "muskellunge", season: "third Saturday in June to December 15", sport: "S-1", conservation: "C-0", size: "must be greater than 137 cm" },
      { key: "northern-pike", season: "January 1 to March 31 and first Saturday in May to December 31", sport: "S-6", conservation: "C-2", size: "" },
      { key: "pacific-salmon", season: "open all year", sport: "S-5", conservation: "C-2", size: "" },
      { key: "rainbow-trout", season: "open all year", sport: "S-2", conservation: "C-1", size: "" },
      { key: "sunfish", season: "open all year", sport: "S-100", conservation: "C-50", size: "" },
      { key: "walleye-sauger", season: "January 1 to March 1 and first Saturday in May to December 31", sport: "S-4", conservation: "C-2", size: "not more than 1 greater than 63 cm" },
      { key: "yellow-perch", season: "open all year", sport: "S-50", conservation: "C-25", size: "" }
    ]
  }
];
