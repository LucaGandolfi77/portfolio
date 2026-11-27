/* ===== DIAMOND & OVAL POLY '99 · Configuration & Tunables (Baseball + Cricket) ===== */
const CONFIG = {
  field: {
    baseDist: 27.43,       // 90 ft in world meters
    moundDist: 18.44,      // 60 ft 6 in
    fenceCenter: 122.0,    // 400 ft center-field wall, in world meters
    fenceCorner: 100.0,    // 328 ft foul poles, in world meters
    wallHeight: 4.2,
    gravity: 9.81
  },

  cricketField: {
    pitchLength: 20.12,    // 22 yards in meters
    creaseDist: 1.22,      // popping crease distance in front of stumps
    boundaryRadius: 72.0,  // oval boundary rope radius in meters
    ropeHeight: 0.65,
    stumpWidth: 0.23,      // 9 inches total width of 3 stumps
    stumpHeight: 0.72,     // 28 inches height
    gravity: 9.81
  },

  pitches: [
    { id: "fastball", name: "4-SEAM FASTBALL", mphMin: 94, mphMax: 101, speed: 41.5, breakX: 0.0, breakZ: 0.12, color: "#f97316" },
    { id: "slider",   name: "SHARP SLIDER",    mphMin: 84, mphMax: 89,  speed: 36.5, breakX: -0.68, breakZ: -0.28, color: "#38bdf8" },
    { id: "curve",    name: "12-6 CURVEBALL",  mphMin: 76, mphMax: 82,  speed: 32.8, breakX: 0.18, breakZ: -0.82, color: "#a855f7" },
    { id: "changeup", name: "CIRCLE CHANGE",   mphMin: 80, mphMax: 85,  speed: 34.2, breakX: 0.35, breakZ: -0.38, color: "#22c55e" },
    { id: "splitter", name: "SPLITTER",        mphMin: 86, mphMax: 91,  speed: 37.8, breakX: -0.15, breakZ: -0.64, color: "#eab308" }
  ],

  deliveries: [
    { id: "pace",      name: "EXPRESS PACE",   kphMin: 144, kphMax: 153, speed: 39.5, bounceU: 0.72, swingX: 0.06,  spinX: 0.05,  bounceZ: 0.92, color: "#f97316" },
    { id: "outswing",  name: "OUTSWINGER",     kphMin: 134, kphMax: 142, speed: 36.8, bounceU: 0.76, swingX: 0.34,  spinX: 0.18,  bounceZ: 0.78, color: "#38bdf8" },
    { id: "yorker",    name: "INSWING YORKER", kphMin: 138, kphMax: 147, speed: 38.2, bounceU: 0.92, swingX: -0.26, spinX: -0.10, bounceZ: 0.36, color: "#ef4444" },
    { id: "legspin",   name: "LEG SPIN",       kphMin: 84,  kphMax: 94,  speed: 26.8, bounceU: 0.74, swingX: 0.05,  spinX: 0.56,  bounceZ: 0.96, color: "#a855f7" },
    { id: "googly",    name: "GOOGLY",         kphMin: 86,  kphMax: 95,  speed: 27.4, bounceU: 0.75, swingX: 0.08,  spinX: -0.52, bounceZ: 0.88, color: "#22c55e" },
    { id: "bouncer",   name: "SHORT BOUNCER",  kphMin: 141, kphMax: 150, speed: 38.8, bounceU: 0.56, swingX: -0.05, spinX: 0.04,  bounceZ: 1.38, color: "#eab308" }
  ],

  teams: [
    { id: "tokyo",    abbr: "TKY", name: "Tokyo Cyber-Carp",     primary: "#ef4444", secondary: "#f8fafc", rating: 1.00 },
    { id: "brooklyn", abbr: "BKN", name: "Brooklyn Poly-Knights", primary: "#3b82f6", secondary: "#fde047", rating: 0.95 },
    { id: "havana",   abbr: "HAV", name: "Havana Sugar Kings",    primary: "#10b981", secondary: "#fef08a", rating: 1.05 },
    { id: "seoul",    abbr: "SEL", name: "Seoul Neon Tigers",     primary: "#a855f7", secondary: "#38bdf8", rating: 1.10 },
    { id: "osaka",    abbr: "OSK", name: "Osaka Shogun Nine",     primary: "#f59e0b", secondary: "#1e293b", rating: 1.15 },
    { id: "sanju",    abbr: "SJU", name: "San Juan Cangrejeros",  primary: "#ec4899", secondary: "#fef9c3", rating: 1.08 }
  ],

  cricketTeams: [
    { id: "ind", abbr: "IND", name: "Mumbai Sky Strikers",   primary: "#0284c7", secondary: "#f97316", rating: 1.08 },
    { id: "aus", abbr: "AUS", name: "Melbourne Gold XI",     primary: "#eab308", secondary: "#15803d", rating: 1.12 },
    { id: "eng", abbr: "ENG", name: "London Royal Lions",    primary: "#2563eb", secondary: "#ef4444", rating: 1.02 },
    { id: "wi",  abbr: "WIN", name: "Kingston Maroon Storm", primary: "#9f1239", secondary: "#fbbf24", rating: 1.05 },
    { id: "nz",  abbr: "NZL", name: "Auckland Silver Caps",  primary: "#334155", secondary: "#38bdf8", rating: 1.00 },
    { id: "rsa", abbr: "RSA", name: "Cape Town Emerald XI",  primary: "#16a34a", secondary: "#fde047", rating: 1.10 }
  ],

  bats: [
    { id: "ash",    name: "Classic Maple Wood", power: 1.00, sweetSpot: 1.00, color: "#d97706", grip: "#1e293b", cost: 0 },
    { id: "alloy",  name: "Aero Alloy '99",     power: 1.06, sweetSpot: 1.08, color: "#38bdf8", grip: "#0f172a", cost: 50 },
    { id: "carbon", name: "Stealth Carbon Pro", power: 1.10, sweetSpot: 1.12, color: "#a855f7", grip: "#f8fafc", cost: 120 },
    { id: "gold",   name: "24K Legend Slugger", power: 1.16, sweetSpot: 1.15, color: "#fbbf24", grip: "#7c2d12", cost: 250 }
  ],

  cricketBats: [
    { id: "willow",  name: "English Willow Grade A", power: 1.00, sweetSpot: 1.00, color: "#f3d5a5", grip: "#22c55e", cost: 0 },
    { id: "kashmir", name: "Pro Blaster Blade",      power: 1.07, sweetSpot: 1.08, color: "#fde68a", grip: "#38bdf8", cost: 50 },
    { id: "mongoose",name: "Power Slog Carbon",      power: 1.12, sweetSpot: 1.11, color: "#e2e8f0", grip: "#f97316", cost: 120 },
    { id: "sovereign",name:"24K Sovereign Willow",   power: 1.18, sweetSpot: 1.16, color: "#fbbf24", grip: "#991b1b", cost: 250 }
  ],

  skies: {
    day: {
      top: "#073b66",
      mid: "#0ea5e9",
      horizon: "#bae6fd",
      haze: "rgba(186, 230, 253, 0.24)",
      sun: [0.35, -0.55, 0.76],
      sunPos: [0.76, 0.14],
      sunColor: "#fef08a",
      ambient: 0.56,
      turfA: "#1ea84f",
      turfB: "#168a3e",
      dirt: "#c47135",
      dirtLight: "#d98a4c",
      pitchClay: "#e2c08d",
      pitchWear: "#c9a26d",
      standA: "#334155",
      standB: "#1e293b",
      beamAlpha: 0.0,
      stars: false,
      clouds: true
    },
    sunset: {
      top: "#1e1646",
      mid: "#be185d",
      horizon: "#fb923c",
      haze: "rgba(251, 146, 60, 0.28)",
      sun: [0.55, -0.45, 0.70],
      sunPos: [0.24, 0.21],
      sunColor: "#fdba74",
      ambient: 0.48,
      turfA: "#168d43",
      turfB: "#116e35",
      dirt: "#a84a1c",
      dirtLight: "#c4622d",
      pitchClay: "#d4a672",
      pitchWear: "#b58550",
      standA: "#312e4a",
      standB: "#1e1b33",
      beamAlpha: 0.14,
      stars: false,
      clouds: true
    },
    night: {
      top: "#020617",
      mid: "#0b1530",
      horizon: "#1e293b",
      haze: "rgba(56, 189, 248, 0.14)",
      sun: [0.20, -0.35, 0.91],
      sunPos: [0.80, 0.13],
      sunColor: "#e2e8f0",
      ambient: 0.52,
      turfA: "#157a3c",
      turfB: "#0f5e31",
      dirt: "#8f4518",
      dirtLight: "#a65624",
      pitchClay: "#c9a675",
      pitchWear: "#a88656",
      standA: "#1e293b",
      standB: "#0f172a",
      beamAlpha: 0.24,
      stars: true,
      clouds: false
    }
  }
};

export default CONFIG;
