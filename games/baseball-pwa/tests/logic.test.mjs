import { describe, it } from "node:test";
import assert from "node:assert/strict";

import CONFIG from "../src/config.js";
import {
  wallDistAtAngle,
  createPitch,
  samplePitchPos,
  evaluateContact,
  stepBallPhysics,
  lerpBasePos,
  createCricketDelivery,
  sampleCricketDeliveryPos,
  evaluateCricketShot,
  stepCricketBallPhysics,
  isCricketBowledOrLbw,
  isCricketWide,
  lerpCricketCreasePos
} from "../src/physics.js";
import { buildPlayerMesh, buildStumpsMesh } from "../src/mesh.js";

describe("Diamond & Oval Poly '99 — Baseball Physics", () => {
  it("wallDistAtAngle returns 122m in center and 100m at foul corners", () => {
    assert.equal(wallDistAtAngle(0), CONFIG.field.fenceCenter);
    assert.ok(Math.abs(wallDistAtAngle(Math.PI / 4) - CONFIG.field.fenceCorner) < 0.01);
    assert.ok(Math.abs(wallDistAtAngle(-Math.PI / 4) - CONFIG.field.fenceCorner) < 0.01);
  });

  it("createPitch and samplePitchPos move ball from mound to home plate", () => {
    const p = createPitch(1.0);
    assert.ok(p.mph >= p.spec.mphMin && p.mph <= p.spec.mphMax);
    const start = samplePitchPos({ ...p, elapsed: 0 });
    const end = samplePitchPos({ ...p, elapsed: p.flightTime });
    assert.ok(start.y > 17);
    assert.ok(Math.abs(end.y) < 0.01);
  });

  it("evaluateContact registers sweet-spot hit and detects early/late misses", () => {
    const p = createPitch(1.0);
    p.elapsed = p.flightTime; // dead center u=1.0
    const pos = samplePitchPos(p);
    const hit = evaluateContact(p, pos.x, pos.z, "power", CONFIG.bats[0]);
    assert.equal(hit.hit, true);
    assert.ok(hit.exitMph > 60);

    const early = evaluateContact({ ...p, elapsed: p.flightTime * 0.4 }, pos.x, pos.z, "power", CONFIG.bats[0]);
    assert.equal(early.hit, false);
  });

  it("stepBallPhysics detects home run over center field fence", () => {
    const ball = { active: true, x: 0, y: 121.5, z: 12, vx: 0, vy: 35, vz: 5, bounced: false, overWall: false };
    const evt = stepBallPhysics(ball, 0.05);
    assert.ok(evt && evt.event === "homerun");
    assert.ok(evt.distanceFt >= 335);
  });

  it("lerpBasePos interpolates Home -> 1B -> 2B -> 3B -> Home", () => {
    const home = lerpBasePos(0);
    const second = lerpBasePos(2);
    assert.deepEqual(home, [0, 0, 0]);
    assert.ok(second[1] > 38);
  });
});

describe("Diamond & Oval Poly '99 — Cricket Physics", () => {
  it("createCricketDelivery bounces on the 22-yard pitch before reaching striker", () => {
    const d = createCricketDelivery(1.0);
    assert.ok(d.kph >= d.spec.kphMin && d.kph <= d.spec.kphMax);
    const before = sampleCricketDeliveryPos({ ...d, elapsed: d.flightTime * (d.bounceU - 0.1) });
    const atBounce = sampleCricketDeliveryPos({ ...d, elapsed: d.flightTime * d.bounceU });
    const atCrease = sampleCricketDeliveryPos({ ...d, elapsed: d.flightTime });
    assert.equal(before.bounced, false);
    assert.equal(atBounce.bounced, true);
    assert.ok(atBounce.z < 0.25);
    assert.ok(atCrease.z >= atBounce.z);
  });

  it("evaluateCricketShot produces valid 3D shot velocity for drive, slog, and sweep", () => {
    const d = createCricketDelivery(1.0);
    d.elapsed = d.flightTime * 0.97;
    const pos = sampleCricketDeliveryPos(d);
    for (const stance of ["drive", "slog", "sweep"]) {
      const res = evaluateCricketShot(d, pos.x, pos.z, stance, CONFIG.cricketBats[0]);
      assert.equal(res.hit, true);
      assert.ok(res.exitKph > 50);
    }
  });

  it("stepCricketBallPhysics detects SIX on the full and FOUR after bounce", () => {
    const sixBall = { active: true, x: 0, y: 81.5, z: 8.0, vx: 0, vy: 28, vz: 4, bounced: false, overWall: false };
    const sixEvt = stepCricketBallPhysics(sixBall, 0.05);
    assert.ok(sixEvt && sixEvt.event === "six");
    assert.ok(sixEvt.distanceM >= 74);

    const fourBall = { active: true, x: 0, y: 81.5, z: 0.11, vx: 0, vy: 22, vz: 0, bounced: true, overWall: false };
    const fourEvt = stepCricketBallPhysics(fourBall, 0.05);
    assert.ok(fourEvt && fourEvt.event === "four");
  });

  it("detects BOWLED, LBW, and WIDE accurately", () => {
    assert.equal(isCricketBowledOrLbw({ targetX: 0.02, targetZ: 0.45 }), "BOWLED");
    assert.equal(isCricketBowledOrLbw({ targetX: 0.05, targetZ: 0.72 }), "LBW");
    assert.equal(isCricketBowledOrLbw({ targetX: 0.45, targetZ: 0.50 }), null);
    assert.equal(isCricketWide({ targetX: 0.72 }), true);
    assert.equal(isCricketWide({ targetX: 0.15 }), false);
  });

  it("lerpCricketCreasePos alternates running direction between creases", () => {
    const p0 = lerpCricketCreasePos(0, false);
    const p1 = lerpCricketCreasePos(1, false);
    const ns0 = lerpCricketCreasePos(0, true);
    assert.ok(p0[1] < 2.0);
    assert.ok(p1[1] > 18.0);
    assert.ok(ns0[1] > 18.0);
  });
});

describe("3D Low-Poly Meshes", () => {
  it("builds valid baseball, cricket, and stumps meshes", () => {
    const bb = buildPlayerMesh({ jersey: "#22c55e", batColor: "#d97706", isCricket: false });
    const cr = buildPlayerMesh({ jersey: "#22c55e", batColor: "#f3d5a5", isCricket: true, hasPads: true });
    const st = buildStumpsMesh(false);
    const stBroken = buildStumpsMesh(true);
    assert.ok(bb.v.length > 20 && bb.f.length > 10);
    assert.ok(cr.v.length > bb.v.length); // cricket player has helmet grille + two-part willow bat
    assert.ok(st.f.length > stBroken.f.length); // intact stumps include bails
  });
});
