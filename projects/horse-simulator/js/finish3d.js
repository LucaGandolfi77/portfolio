/**
 * finish3d.js — scena Three.js del fotofinish con replay rallentato.
 */

import * as THREE from 'three';

const ANGLES = {
  front: { pos: [0, 14, 58], look: [-2, 1, 0] },
  low: { pos: [-10, 3.5, 26], look: [0, 1.2, 0] },
  aerial: { pos: [-6, 48, 26], look: [-3, 0, 0] }
};

function checkeredTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const ctx = c.getContext('2d');
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 2; x += 1) {
      ctx.fillStyle = (x + y) % 2 ? '#12130f' : '#fffaf0';
      ctx.fillRect(x * 32, y * 32, 32, 32);
    }
  }
  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  return texture;
}

function makeHorse(color) {
  const group = new THREE.Group();
  const coat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.75 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x37251c, roughness: 0.9 });
  const silk = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.6, 4, 10), coat);
  body.rotation.z = Math.PI / 2;
  body.position.y = 1.25;
  group.add(body);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 1.1, 8), coat);
  neck.position.set(1.05, 1.7, 0);
  neck.rotation.z = -0.55;
  group.add(neck);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.5, 0.42), coat);
  head.position.set(1.55, 2.05, 0);
  group.add(head);

  const legs = [];
  [[-0.7, -0.3], [-0.7, 0.3], [0.7, -0.3], [0.7, 0.3]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.18), dark);
    leg.position.set(x, 0.6, z);
    group.add(leg);
    legs.push(leg);
  });

  const rider = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), silk);
  rider.position.set(-0.1, 2.15, 0);
  group.add(rider);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.28, 10), silk);
  cap.position.set(-0.1, 2.52, 0);
  group.add(cap);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.03;
  group.add(shadow);

  group.userData.legs = legs;
  return group;
}

export function createFinishScene(canvas, { onEnd } = {}) {
  let renderer, scene, camera;
  let samples = [];
  let horses = new Map();
  let visible = false;
  let playing = false;
  let speed = 0.5;
  let cursor = 0;
  let angle = 'front';
  let confetti = [];
  let lastFinished = false;

  function init() {
    if (renderer) return;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setClearColor(0x0e1c33, 1);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0e1c33, 70, 190);
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);

    scene.add(new THREE.HemisphereLight(0xf6efdd, 0x2a3b28, 1.1));
    const sun = new THREE.DirectionalLight(0xfff1c9, 1.6);
    sun.position.set(-30, 60, 25);
    scene.add(sun);

    const grass = new THREE.Mesh(
      new THREE.PlaneGeometry(400, 260),
      new THREE.MeshStandardMaterial({ color: 0x2c5634, roughness: 1 })
    );
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = -0.05;
    scene.add(grass);

    const track = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 34),
      new THREE.MeshStandardMaterial({ color: 0x9a7355, roughness: 1 })
    );
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    const finish = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 34),
      new THREE.MeshBasicMaterial({ map: checkeredTexture() })
    );
    finish.rotation.x = -Math.PI / 2;
    finish.position.y = 0.02;
    scene.add(finish);

    const railMaterial = new THREE.MeshStandardMaterial({ color: 0xf6efdd });
    [-18, 18].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(360, 0.35, 0.25), railMaterial);
      rail.position.set(0, 0.5, z);
      scene.add(rail);
    });

    // tribune e bandiere
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(260, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x16243b })
    );
    stand.position.set(-30, 5, -46);
    scene.add(stand);
    for (let i = 0; i < 36; i += 1) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.2, 1),
        new THREE.MeshBasicMaterial({ color: [0xd4af37, 0xf6efdd, 0x6b1f2e][i % 3] })
      );
      seat.position.set(-150 + i * 7, 8 + (i % 3), -41.5);
      scene.add(seat);
    }
    [-120, -40, 40, 120].forEach((x, i) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12, 6), railMaterial);
      pole.position.set(x, 6, -34);
      scene.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 2.4),
        new THREE.MeshBasicMaterial({ color: [0xd4af37, 0x6b1f2e, 0xf6efdd, 0x14382b][i], side: THREE.DoubleSide })
      );
      flag.position.set(x + 2, 10, -34);
      scene.add(flag);
    });

    resize();
  }

  function resize() {
    if (!renderer) return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(100, rect.width), h = Math.max(100, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function placeCamera() {
    const preset = ANGLES[angle] || ANGLES.front;
    camera.position.set(...preset.pos);
    camera.lookAt(...preset.look);
  }

  function setSamples(list, race) {
    init();
    samples = Array.isArray(list) ? list.slice() : [];
    const count = samples.length;
    cursor = samples.length ? samples[0].t : 0;
    playing = count > 1;
    lastFinished = false;
    horses.forEach((group) => scene.remove(group));
    horses = new Map();
    const first = samples[0] || { horses: [] };
    first.horses.forEach((h) => {
      const group = makeHorse(h.color);
      group.position.set((h.progress - 1) * 260, 0, (h.lane - 3.5) * 2.4);
      scene.add(group);
      horses.set(h.id, group);
    });
    confetti.forEach((piece) => scene.remove(piece.mesh));
    confetti = [];
    placeCamera();
    void race;
  }

  function spawnConfetti() {
    const colors = [0xd4af37, 0xf6efdd, 0x6b1f2e, 0x14382b, 0x3ee6ff];
    for (let i = 0; i < 90; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.35, 0.6),
        new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide })
      );
      mesh.position.set(-2 + (Math.random() - 0.5) * 20, 12 + Math.random() * 8, (Math.random() - 0.5) * 30);
      scene.add(mesh);
      confetti.push({ mesh, vy: -0.1 - Math.random() * 0.2, vx: (Math.random() - 0.5) * 0.15, spin: (Math.random() - 0.5) * 0.2, life: 180 });
    }
  }

  function interpolate(t) {
    if (!samples.length) return null;
    let index = 0;
    while (index < samples.length - 1 && samples[index + 1].t < t) index += 1;
    const a = samples[index], b = samples[index + 1] || a;
    const span = Math.max(1e-6, b.t - a.t);
    const k = Math.max(0, Math.min(1, (t - a.t) / span));
    const map = new Map(a.horses.map((h) => [h.id, h]));
    return {
      horses: b.horses.map((bh) => {
        const ah = map.get(bh.id) || bh;
        return {
          id: bh.id, name: bh.name, color: bh.color, lane: bh.lane,
          progress: ah.progress + (bh.progress - ah.progress) * k,
          speed: ah.speed + (bh.speed - ah.speed) * k
        };
      })
    };
  }

  function render(now, dt = 0.016) {
    if (!renderer || !visible) return;
    const start = samples.length ? samples[0].t : 0;
    const end = samples.length ? samples[samples.length - 1].t : 0;
    if (playing && cursor < end) cursor = Math.min(end, cursor + dt * speed);
    if (playing && cursor >= end && !lastFinished) {
      lastFinished = true;
      playing = false;
      spawnConfetti();
      if (onEnd) onEnd();
    }
    const frame = interpolate(cursor) || { horses: [] };
    frame.horses.forEach((h) => {
      const group = horses.get(h.id);
      if (!group) return;
      group.position.x = (h.progress - 1) * 260;
      group.userData.legs.forEach((leg, i) => {
        leg.rotation.z = Math.sin(now / 90 + i * 1.8) * 0.55;
      });
    });
    for (let i = confetti.length - 1; i >= 0; i -= 1) {
      const piece = confetti[i];
      piece.mesh.position.x += piece.vx;
      piece.mesh.position.y += piece.vy;
      piece.mesh.rotation.z += piece.spin;
      piece.life -= 1;
      if (piece.life <= 0 || piece.mesh.position.y < 0) {
        scene.remove(piece.mesh);
        confetti.splice(i, 1);
      }
    }
    renderer.render(scene, camera);
    void start;
  }

  return {
    init, resize, setSamples, render,
    show() { visible = true; init(); resize(); placeCamera(); },
    hide() { visible = false; },
    play() { if (cursor >= (samples[samples.length - 1]?.t || 0)) cursor = samples[0]?.t || 0; playing = true; lastFinished = false; },
    pause() { playing = false; },
    seek(fraction) {
      if (!samples.length) return;
      cursor = samples[0].t + Math.max(0, Math.min(1, fraction)) * (samples[samples.length - 1].t - samples[0].t);
      lastFinished = false;
    },
    progress() {
      if (samples.length < 2) return 0;
      return Math.max(0, Math.min(1, (cursor - samples[0].t) / Math.max(1e-6, samples[samples.length - 1].t - samples[0].t)));
    },
    setSpeed(value) { speed = Math.max(0.1, Math.min(2, Number(value) || 1)); },
    setAngle(value) { angle = ANGLES[value] ? value : 'front'; placeCamera(); },
    dispose() { if (renderer) renderer.dispose(); },
    get isVisible() { return visible; }
  };
}
