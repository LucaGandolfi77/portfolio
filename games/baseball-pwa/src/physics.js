/*
 * DIAMOND & OVAL POLY '99 · 3D Ball Aerodynamics, Batting & Running (Baseball + Cricket)
 * --------------------------------------------------------------------------------------
 * Coordinate system (meters):
 *   Baseball: Home Plate = (0, 0, 0), +Y = Center Field (Mound at Y = 18.44)
 *   Cricket:  Striker's Stumps = (0, 0, 0), +Y = Bowler's Stumps (Y = 20.12),
 *             360° Oval centered at (0, 10.06, 0) with radius 72m.
 */
import CONFIG from "./config.js";

const B = 19.40; // 27.43 / sqrt(2)
const FENCE_CORNER_M = (CONFIG.field && CONFIG.field.fenceCorner) || 100;
const FENCE_CENTER_M = (CONFIG.field && CONFIG.field.fenceCenter) || 122;

export const BASE_COORDS = [
  [0, 0, 0],         // 0: Home
  [B, B, 0],         // 1: 1st Base
  [0, B * 2, 0],     // 2: 2nd Base
  [-B, B, 0],        // 3: 3rd Base
  [0, 0, 0]          // 4: Home Plate (scoring)
];

export const FIELDER_HOME_POS = [
  { role: "P",  x: 0,     y: 18.44 },
  { role: "C",  x: 0,     y: -1.4  },
  { role: "1B", x: 18.5,  y: 23.0  },
  { role: "2B", x: 9.5,   y: 38.0  },
  { role: "SS", x: -9.5,  y: 38.0  },
  { role: "3B", x: -18.5, y: 23.0  },
  { role: "LF", x: -38.0, y: 74.0  },
  { role: "CF", x: 0.0,   y: 88.0  },
  { role: "RF", x: 38.0,  y: 74.0  }
];

/* Cricket 360° fielding positions around the 22-yard pitch */
export const CRICKET_FIELDER_POS = [
  { role: "BWL", x: 0.4,   y: 20.6  }, // Bowler
  { role: "WK",  x: 0.0,   y: -2.4  }, // Wicketkeeper
  { role: "SLP", x: 5.5,   y: -4.5  }, // Slip
  { role: "PNT", x: 32.0,  y: 6.0   }, // Point
  { role: "CVR", x: 36.0,  y: 34.0  }, // Extra Cover
  { role: "LOF", x: 18.0,  y: 62.0  }, // Long-Off
  { role: "LON", x: -20.0, y: 60.0  }, // Long-On
  { role: "MWK", x: -38.0, y: 30.0  }, // Deep Mid-Wicket
  { role: "SQL", x: -34.0, y: 4.0   }, // Square Leg
  { role: "FLG", x: -24.0, y: -26.0 }, // Fine Leg
  { role: "3RD", x: 24.0,  y: -24.0 }  // Third Man
];

export const CRICKET_STUMPS_STRIKER = [0, 0, 0];
export const CRICKET_STUMPS_BOWLER = [0, CONFIG.cricketField.pitchLength, 0];

/* ===================== BASEBALL PHYSICS ===================== */

export function wallDistAtAngle(theta) {
  const cos2 = Math.cos(theta * 2);
  return FENCE_CORNER_M + (FENCE_CENTER_M - FENCE_CORNER_M) * Math.max(0, cos2);
}

export function createPitch(teamRating = 1.0) {
  const list = CONFIG.pitches;
  const spec = list[Math.floor(Math.random() * list.length)];
  const mph = Math.round(spec.mphMin + Math.random() * (spec.mphMax - spec.mphMin));
  const inZone = Math.random() < 0.78;
  const targetX = inZone ? (Math.random() - 0.5) * 0.72 : (Math.random() < 0.5 ? -0.62 : 0.62);
  const targetZ = inZone ? 0.68 + Math.random() * 0.58 : (Math.random() < 0.5 ? 0.38 : 1.55);

  const flightTime = 18.44 / (spec.speed * (0.95 + teamRating * 0.05));
  return {
    spec,
    mph,
    startX: -0.18,
    startY: 18.0,
    startZ: 1.85,
    targetX,
    targetZ,
    flightTime,
    elapsed: 0
  };
}

export function samplePitchPos(pitch) {
  const u = Math.max(0, Math.min(1.25, pitch.elapsed / pitch.flightTime));
  const curve = u * u * (1 - u) * 2.2;
  const x = pitch.startX + (pitch.targetX - pitch.startX) * u + pitch.spec.breakX * curve;
  const y = pitch.startY * (1 - u);
  const z = pitch.startZ + (pitch.targetZ - pitch.startZ) * u + pitch.spec.breakZ * curve + Math.sin(u * Math.PI) * 0.28;
  return { x, y, z, u };
}

export function evaluateContact(pitch, aimX, aimZ, stance, batSpec) {
  const pos = samplePitchPos(pitch);
  const timingDiff = pos.u - 1.0;
  const timingAbs = Math.abs(timingDiff);

  const sweetBonus = (batSpec && batSpec.sweetSpot) || 1.0;
  const timingWindow = (stance === "contact" ? 0.25 : stance === "bunt" ? 0.29 : 0.20) * sweetBonus;

  if (timingAbs > timingWindow) {
    return { hit: false, reason: timingDiff < 0 ? "EARLY SWING & MISS!" : "LATE SWING & MISS!" };
  }

  const dx = pos.x - aimX;
  const dz = pos.z - aimZ;
  const dist = Math.hypot(dx, dz);
  const maxRadius = (stance === "contact" ? 0.64 : stance === "bunt" ? 0.70 : 0.50) * sweetBonus;

  if (dist > maxRadius) {
    return { hit: false, reason: "SWING & A MISS!" };
  }

  const spatialQ = 1 - (dist / maxRadius) * 0.75;
  const timingQ = 1 - (timingAbs / timingWindow) * 0.65;
  const quality = Math.max(0.15, Math.min(1.0, spatialQ * 0.6 + timingQ * 0.4));

  let sprayAngle = timingDiff * 2.35 + dx * 0.85 + (Math.random() - 0.5) * 0.12;

  if (stance === "bunt") {
    const buntSpeed = 10 + Math.random() * 6;
    const buntAng = Math.max(-0.55, Math.min(0.55, sprayAngle * 0.6));
    return {
      hit: true,
      foul: Math.abs(buntAng) > Math.PI / 4,
      quality: 0.5,
      exitMph: 42,
      vx: Math.sin(buntAng) * buntSpeed,
      vy: Math.cos(buntAng) * buntSpeed,
      vz: 2.2,
      isBunt: true
    };
  }

  let launchDeg = 16 + (-dz * 85) + (stance === "power" ? 9 : 2);
  if (quality > 0.78) {
    launchDeg = 23 + (stance === "power" ? 6 : 2) + (Math.random() - 0.5) * 7;
  }
  launchDeg = Math.max(-18, Math.min(62, launchDeg));
  const launchRad = (launchDeg * Math.PI) / 180;

  const batPower = (batSpec && batSpec.power) || 1.0;
  const stanceMult = stance === "power" ? 1.13 : 1.0;
  const exitSpeed = (24 + quality * 27.5) * batPower * stanceMult;
  const exitMph = Math.round(exitSpeed * 2.237);

  const horizSpeed = exitSpeed * Math.cos(launchRad);
  const vx = Math.sin(sprayAngle) * horizSpeed;
  const vy = Math.cos(sprayAngle) * horizSpeed;
  const vz = exitSpeed * Math.sin(launchRad);

  const foul = Math.abs(sprayAngle) > Math.PI / 4 + 0.03;

  return {
    hit: true,
    foul,
    quality,
    exitMph,
    launchDeg: Math.round(launchDeg),
    sprayAngle,
    vx,
    vy,
    vz
  };
}

export function stepBallPhysics(ball, dt) {
  if (!ball.active) return null;

  const drag = 0.996;
  ball.vx *= Math.pow(drag, dt * 60);
  ball.vy *= Math.pow(drag, dt * 60);
  ball.vz -= CONFIG.field.gravity * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  const dist = Math.hypot(ball.x, ball.y);
  const theta = Math.atan2(ball.x, Math.max(0.1, ball.y));
  const wallR = wallDistAtAngle(theta);

  if (!ball.bounced && !ball.overWall && dist >= wallR && Math.abs(theta) <= Math.PI / 4) {
    if (ball.z >= CONFIG.field.wallHeight) {
      ball.overWall = true;
      const extraM = Math.max(0, (ball.z - 1.0) * 2.8);
      const totalFt = Math.round((dist + extraM) * 3.28084);
      return { event: "homerun", distanceFt: Math.max(335, totalFt) };
    } else {
      ball.bounced = true;
      ball.vx *= -0.35;
      ball.vy *= -0.35;
      ball.x = Math.sin(theta) * (wallR - 1.2);
      ball.y = Math.cos(theta) * (wallR - 1.2);
      return { event: "wall_hit" };
    }
  }

  if (ball.z <= 0.12) {
    ball.z = 0.12;
    if (!ball.bounced) ball.bounced = true;
    if (Math.abs(ball.vz) > 1.8) {
      ball.vz = -ball.vz * 0.44;
      ball.vx *= 0.76;
      ball.vy *= 0.76;
    } else {
      ball.vz = 0;
      ball.vx *= Math.pow(0.92, dt * 60);
      ball.vy *= Math.pow(0.92, dt * 60);
    }
  }

  return null;
}

export function lerpBasePos(progress) {
  const clamped = Math.max(0, Math.min(4, progress));
  const idx = Math.min(3, Math.floor(clamped));
  const frac = clamped - idx;
  const a = BASE_COORDS[idx];
  const b = BASE_COORDS[idx + 1];
  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    0
  ];
}

/* ===================== CRICKET PHYSICS ===================== */

export function createCricketDelivery(teamRating = 1.0) {
  const list = CONFIG.deliveries;
  const spec = list[Math.floor(Math.random() * list.length)];
  const kph = Math.round(spec.kphMin + Math.random() * (spec.kphMax - spec.kphMin));

  // 84% legal corridor, 16% wide outside off/leg
  const isWideTarget = Math.random() < 0.14;
  const pitchX = isWideTarget
    ? (Math.random() < 0.5 ? -0.68 : 0.68)
    : (Math.random() - 0.5) * 0.56;

  const bounceU = Math.max(0.50, Math.min(0.94, spec.bounceU + (Math.random() - 0.5) * 0.06));
  const startY = CONFIG.cricketField.pitchLength - 0.4; // ~19.72m
  const bounceY = startY * (1 - bounceU);
  const targetX = pitchX + spec.spinX * (1 - bounceU) * 1.4;
  const targetZ = Math.max(0.24, Math.min(1.48, spec.bounceZ + (Math.random() - 0.5) * 0.18));

  const flightTime = startY / (spec.speed * (0.94 + teamRating * 0.06));

  return {
    spec,
    kph,
    startX: 0.34,
    startY,
    startZ: 2.05,
    bounceU,
    bounceX: pitchX,
    bounceY,
    targetX,
    targetZ,
    flightTime,
    elapsed: 0,
    bouncedSoundPlayed: false
  };
}

export function sampleCricketDeliveryPos(delivery) {
  const u = Math.max(0, Math.min(1.25, delivery.elapsed / delivery.flightTime));
  const bu = delivery.bounceU;
  const y = delivery.startY * (1 - u);
  let x, z;

  if (u <= bu) {
    // Pre-bounce flight from bowler's hand down to the pitch strip
    const t = u / bu;
    const swing = Math.sin(t * Math.PI) * delivery.spec.swingX * 0.55;
    x = delivery.startX + (delivery.bounceX - delivery.startX) * t + swing;
    // Parabolic drop to z = 0.08 at pitch bounce
    const arc = (delivery.spec.id === "legspin" || delivery.spec.id === "googly") ? 0.65 : 0.16;
    z = delivery.startZ * (1 - t * t) + 0.08 * (t * t) + Math.sin(t * Math.PI) * arc;
  } else {
    // Post-bounce rise & spin/seam movement toward striker's crease (u = 1.0)
    const t = (u - bu) / Math.max(0.06, 1 - bu);
    x = delivery.bounceX + (delivery.targetX - delivery.bounceX) * t;
    // Smooth rise to targetZ at popping crease, gently leveling off
    const rise = 1 - Math.pow(1 - Math.min(1.3, t), 1.45);
    z = 0.08 + (delivery.targetZ - 0.08) * Math.max(0, Math.min(1.18, rise));
  }

  return { x, y, z, u, bounced: u >= bu };
}

export function isCricketBowledOrLbw(delivery) {
  const stumpHalfW = CONFIG.cricketField.stumpWidth * 0.72; // generous arcade wicket box
  const inLine = Math.abs(delivery.targetX) <= stumpHalfW;
  const stumpH = CONFIG.cricketField.stumpHeight + 0.10;
  if (inLine && delivery.targetZ <= stumpH) {
    return delivery.targetZ <= 0.62 ? "BOWLED" : "LBW";
  }
  return null;
}

export function isCricketWide(delivery) {
  return Math.abs(delivery.targetX) > 0.60;
}

export function evaluateCricketShot(delivery, aimX, aimZ, stance, batSpec) {
  const pos = sampleCricketDeliveryPos(delivery);
  // Striker hits around popping crease (u ~ 0.94..1.0)
  const timingDiff = pos.u - 0.97;
  const timingAbs = Math.abs(timingDiff);

  const sweetBonus = (batSpec && batSpec.sweetSpot) || 1.0;
  // Stances: "drive" (balanced), "slog" (lofted sixes), "sweep" (leg/off placement)
  const timingWindow = (stance === "drive" ? 0.25 : stance === "sweep" ? 0.26 : 0.20) * sweetBonus;

  if (timingAbs > timingWindow) {
    return { hit: false, reason: timingDiff < 0 ? "PLAYED TOO EARLY!" : "BEATEN FOR PACE!" };
  }

  const dx = pos.x - aimX;
  const dz = pos.z - aimZ;
  const dist = Math.hypot(dx, dz);
  const maxRadius = (stance === "drive" ? 0.66 : stance === "sweep" ? 0.64 : 0.52) * sweetBonus;

  if (dist > maxRadius) {
    return { hit: false, reason: "SWING & MISS!" };
  }

  const spatialQ = 1 - (dist / maxRadius) * 0.72;
  const timingQ = 1 - (timingAbs / timingWindow) * 0.65;
  const quality = Math.max(0.18, Math.min(1.0, spatialQ * 0.58 + timingQ * 0.42));

  // 360° shot direction: early pulls to Leg Side (-X), late cuts/glides to Off Side (+X)
  let shotAngle = timingDiff * 3.1 + dx * 1.15 + (Math.random() - 0.5) * 0.16;
  if (stance === "sweep") {
    // Sweep / Cut intentionally angles squarer (around +-65..115 degrees!)
    const side = aimX < 0 ? -1 : 1;
    shotAngle = side * (1.05 + Math.random() * 0.65) + timingDiff * 0.8;
  } else {
    shotAngle = Math.max(-2.1, Math.min(2.1, shotAngle));
  }

  // Launch angle based on shot type
  let launchDeg;
  if (stance === "slog") {
    launchDeg = quality > 0.68 ? 26 + (Math.random() - 0.5) * 9 : 18 + (-dz * 55);
  } else if (stance === "sweep") {
    launchDeg = 8 + quality * 14 + (Math.random() - 0.5) * 6;
  } else {
    // Classic cricket ground drive: crisp & along the carpet (4-18 deg)
    launchDeg = 5 + quality * 13 + (-dz * 30);
  }
  launchDeg = Math.max(-4, Math.min(54, launchDeg));
  const launchRad = (launchDeg * Math.PI) / 180;

  const batPower = (batSpec && batSpec.power) || 1.0;
  const stanceMult = stance === "slog" ? 1.16 : stance === "sweep" ? 1.04 : 1.00;
  // Exit speed in m/s (tuned for 72m boundary rope: ~32-44 m/s clears 72m on lofted slog!)
  const exitSpeed = (18.5 + quality * 21.5) * batPower * stanceMult;
  const exitKph = Math.round(exitSpeed * 3.6);

  const horizSpeed = exitSpeed * Math.cos(launchRad);
  const vx = Math.sin(shotAngle) * horizSpeed;
  const vy = Math.cos(shotAngle) * horizSpeed;
  const vz = Math.max(1.2, exitSpeed * Math.sin(launchRad));

  return {
    hit: true,
    quality,
    exitKph,
    launchDeg: Math.round(launchDeg),
    shotAngle,
    vx,
    vy,
    vz
  };
}

export function stepCricketBallPhysics(ball, dt) {
  if (!ball.active) return null;

  const drag = 0.995;
  ball.vx *= Math.pow(drag, dt * 60);
  ball.vy *= Math.pow(drag, dt * 60);
  ball.vz -= CONFIG.cricketField.gravity * dt;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.z += ball.vz * dt;

  // Distance from oval center (0, 10.06)
  const centerY = CONFIG.cricketField.pitchLength * 0.5;
  const distFromCenter = Math.hypot(ball.x, ball.y - centerY);
  const boundaryR = CONFIG.cricketField.boundaryRadius;

  if (!ball.overWall && distFromCenter >= boundaryR) {
    ball.overWall = true;
    const hitDistM = Math.round(Math.hypot(ball.x, ball.y) + Math.max(0, ball.z * 2.1));
    if (!ball.bounced && ball.z >= CONFIG.cricketField.ropeHeight) {
      return { event: "six", distanceM: Math.max(74, hitDistM) };
    }
    return { event: "four", distanceM: Math.max(68, hitDistM) };
  }

  // Ground bounce & fast outfield roll
  if (ball.z <= 0.11) {
    ball.z = 0.11;
    if (!ball.bounced) ball.bounced = true;
    if (Math.abs(ball.vz) > 1.5) {
      ball.vz = -ball.vz * 0.48;
      ball.vx *= 0.84;
      ball.vy *= 0.84;
    } else {
      ball.vz = 0;
      ball.vx *= Math.pow(0.955, dt * 60);
      ball.vy *= Math.pow(0.955, dt * 60);
    }
  }

  return null;
}

/* Interpolate cricket batter running between the two creases (progress: 0..1..2..3) */
export function lerpCricketCreasePos(progress, isNonStriker = false) {
  const len = CONFIG.cricketField.pitchLength - 2.2; // ~17.9m between popping creases
  const startY = 1.1;
  // Parity alternates direction every completed run!
  const seg = Math.floor(progress);
  const frac = progress - seg;
  const goingUp = isNonStriker ? (seg % 2 === 1) : (seg % 2 === 0);
  const y = goingUp ? startY + frac * len : startY + (1 - frac) * len;
  const x = isNonStriker ? -1.15 : 1.15;
  return [x, y, 0];
}
