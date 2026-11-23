/* Italy 3D Flight Sim — procedural 3D aircraft models */

import * as THREE from '../../_vendor/three.module.js';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.25, ...opts });
}
function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}
function wing(points, material) {
  const shape = new THREE.Shape(points.map(p => new THREE.Vector2(p[0], p[1])));
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geo, material);
}

export function createPlaneMesh(plane) {
  const g = new THREE.Group();
  const body = mat(plane.color);
  const dark = mat('#263445');
  const glass = mat('#bfe7ff', { transparent: true, opacity: 0.75, metalness: 0.5 });
  const L = plane.length, S = plane.span;

  if (plane.kind === 'prop') {
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(L * 0.09, L * 0.55, 4, 8), body);
    fus.rotation.x = Math.PI / 2; g.add(fus);
    g.add(box(S, 0.6, L * 0.16, body));
    g.add(box(S * 0.35, 0.5, L * 0.12, body, 0, 0.2, L * 0.36));
    g.add(box(1, L * 0.22, 1, dark, 0, L * 0.06, -L * 0.42));
    const prop = new THREE.Group();
    prop.add(box(S * 0.34, 0.35, 0.8, dark));
    prop.add(box(0.8, S * 0.34, 0.8, dark));
    prop.position.z = -L * 0.52;
    prop.name = 'propeller';
    g.add(prop);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(L * 0.08, 10, 8), glass).translateZ(-L * 0.28));
  } else if (plane.kind === 'heli') {
    const fus = new THREE.Mesh(new THREE.SphereGeometry(L * 0.24, 14, 10), body);
    fus.scale.set(1, 0.7, 1.5); g.add(fus);
    g.add(box(0.9, 0.9, L, dark, 0, 0.4, L * 0.5));
    const rotor = new THREE.Group();
    rotor.add(box(S * 2, 0.25, 0.6, dark));
    rotor.add(box(0.6, 0.25, S * 2, dark));
    rotor.position.y = L * 0.22;
    rotor.name = 'rotor';
    g.add(rotor);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(L * 0.16, 10, 8), glass).translateZ(-L * 0.22));
  } else if (plane.kind === 'airliner') {
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(L * 0.055, L * 0.62, 6, 10), body);
    fus.rotation.x = Math.PI / 2; g.add(fus);
    g.add(box(S, 1.2, L * 0.16, body, 0, -0.5, 0.05 * L));
    g.add(box(S * 0.34, 4, L * 0.09, body, 0, 1.6, L * 0.32));
    for (const s of [-1, 1]) {
      const engine = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 6, 10), dark);
      engine.rotation.x = Math.PI / 2;
      engine.position.set(s * S * 0.26, -1.8, L * 0.06);
      g.add(engine);
    }
  } else if (plane.kind === 'starfighter' || plane.kind === 'cruiser') {
    const wide = plane.kind === 'cruiser';
    g.add(wing([[-L * 0.1, 0], [-L * 0.1, -S], [L * 0.22, -S * 0.5], [L * 0.5, 0], [L * 0.22, S * 0.5], [-L * 0.1, S]], body));
    const fus = new THREE.Mesh(new THREE.ConeGeometry(wide ? L * 0.12 : L * 0.09, L, 6), body);
    fus.rotation.x = -Math.PI / 2; g.add(fus);
    g.add(box(S * (wide ? 0.5 : 0.34), 0.6, L * 0.18, dark, 0, 0, L * 0.28));
    for (const s of [-1, 1]) {
      const glow = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), new THREE.MeshBasicMaterial({ color: '#8ce9ff' }));
      glow.position.set(s * S * (wide ? 0.16 : 0.1), 0, L * 0.42);
      glow.name = 'engineGlow';
      g.add(glow);
    }
  } else {
    const fus = new THREE.Mesh(new THREE.ConeGeometry(L * 0.09, L * 0.85, 6), body);
    fus.rotation.x = -Math.PI / 2; g.add(fus);
    g.add(wing([[-L * 0.1, 0], [-L * 0.28, -S * 0.5], [L * 0.18, -S * 0.5], [L * 0.4, 0], [L * 0.18, S * 0.5], [-L * 0.28, S * 0.5]], body));
    g.add(box(S * 0.28, 2.4, L * 0.12, dark, 0, 0.9, L * 0.3));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffcf6b' }));
    glow.position.z = L * 0.45; glow.name = 'engineGlow'; g.add(glow);
  }
  g.userData.plane = plane;
  return g;
}

export function animatePlane(mesh, time, boosting) {
  mesh.traverse(o => {
    if (o.name === 'propeller') o.rotation.z = time * 22;
    if (o.name === 'rotor') o.rotation.y = time * 12;
    if (o.name === 'engineGlow') o.scale.setScalar(boosting ? 1.7 + Math.sin(time * 20) * 0.3 : 1);
  });
}
