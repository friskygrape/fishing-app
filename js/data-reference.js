/* Static reference content: licence types, glossary, provincial possession
   limits, and the required legal disclaimer. Source: 2026 Ontario Fishing
   Regulations Summary (General Fishing Regulations, pp.11–16). */
window.REFERENCE = {
  disclaimer:
    "This app is a convenience reference only. It is NOT a legal document and NOT a complete collection of the current laws. It currently covers zone-wide seasons and limits for Zones 20, 16 and 17 only — it does NOT include waterbody exceptions, species exceptions, fish sanctuaries or bait restrictions for specific lakes and rivers. Always confirm the current rules for the exact water you are fishing at ontario.ca/fishing before you fish.",

  licences: [
    { code: "S", name: "Sport Fishing Licence", desc: "Full catch-and-possession privileges. In this app, an 'S-4' means a catch & possession limit of 4." },
    { code: "C", name: "Conservation Fishing Licence", desc: "Reduced limits, ideal if you release most fish. A 'C-2' means a catch & possession limit of 2." }
  ],

  glossary: [
    { term: "Catch limit", def: "The number of fish you may catch and keep in ONE day. It includes fish not immediately released and any fish eaten or given away." },
    { term: "Possession limit", def: "The number of fish you may have on hand, in storage, in transit or anywhere. Same as one day's catch limit unless stated otherwise." },
    { term: "Size limit", def: "Total length — measured from the tip of the closed mouth to the tip of the tail with the tail lobes squeezed together for maximum length." },
    { term: "Aggregate (combined) limit", def: "A single shared limit across several species — you can't take a full limit of each. Applies to Walleye+Sauger, Largemouth+Smallmouth Bass, Black+White Crappie, and all Trout+Salmon (incl. Splake)." },
    { term: "Open / closed season", def: "It is illegal to target a species when its season is closed, even to release it. Fish caught accidentally in a closed season must be released immediately." },
    { term: "Catch-and-release season", def: "An open season with a zero limit — you may fish for it but must release everything you catch." }
  ],

  possessionLimits: [
    { name: "Atlantic Salmon", limit: "1" },
    { name: "Aurora Trout", limit: "1" },
    { name: "Brook Trout", limit: "5" },
    { name: "Brown Trout", limit: "5" },
    { name: "Channel Catfish", limit: "12" },
    { name: "Crappie", limit: "30" },
    { name: "Lake Trout", limit: "3" },
    { name: "Lake Whitefish", limit: "25" },
    { name: "Largemouth or Smallmouth Bass (combined)", limit: "6" },
    { name: "Muskellunge", limit: "1" },
    { name: "Northern Pike", limit: "6" },
    { name: "Pacific Salmon", limit: "5" },
    { name: "Rainbow Trout", limit: "5" },
    { name: "Splake", limit: "5" },
    { name: "Walleye or Sauger (combined)", limit: "6" },
    { name: "Yellow Perch", limit: "100" }
  ],

  reportAbuse: "1-877-847-7667",
  officialSite: "ontario.ca/fishing"
};
