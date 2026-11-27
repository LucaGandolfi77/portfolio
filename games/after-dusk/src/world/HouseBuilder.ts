import * as THREE from 'three';
import { createMaterials, photoTexture, type Materials } from '../renderer/ProceduralAssets';
import { kitGeometry, kitMaterial } from './AssetKit';
import { PropFactory } from './PropFactory';
import type { DoorData, Interactable, RoomInfo, WindowData, World } from './Interactable';

interface Opening { at: number; width: number; height?: number; bottom?: number; type?: 'door' | 'window' }

export class HouseBuilder {
  readonly materials: Materials;
  readonly group = new THREE.Group();
  private props: PropFactory;
  private colliders: THREE.Box3[] = [];
  private interactables: Interactable[] = [];
  private navNodes: THREE.Vector3[] = [];
  private navEdges: number[][] = [];
  private rooms: RoomInfo[] = [];
  private shadowSpawns: THREE.Vector3[] = [];
  private wallSegments: Array<[number, number, number, number]> = [];
  private doorCounter = 0;

  constructor(materials: Materials = createMaterials()) {
    this.materials = materials;
    this.props = new PropFactory(materials);
  }

  build(): World {
    this.floors();
    this.walls();
    this.furniture();
    this.outdoors();
    this.nav();
    this.addExit();
    return {
      group: this.group,
      colliders: this.colliders,
      interactables: this.interactables,
      navNodes: this.navNodes,
      navEdges: this.navEdges,
      rooms: this.rooms,
      bounds: new THREE.Box3(new THREE.Vector3(-8, 0, -8.4), new THREE.Vector3(8, 3.2, 6.5)),
      shadowsSpawn: this.shadowSpawns,
      wallSegments: this.wallSegments,
    };
  }

  private tryKit(id: string, x: number, y: number, z: number, ry = 0): THREE.Mesh | null {
    const geo = kitGeometry(id, 'home');
    if (!geo) return null;
    const m = new THREE.Mesh(geo, kitMaterial());
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  private place(obj: THREE.Object3D, x: number, y: number, z: number, ry = 0, collide = false) {
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    this.group.add(obj);
    if (collide) this.colliders.push(new THREE.Box3().setFromObject(obj));
    return obj;
  }

  private box(mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, collide = true, cast = true): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = cast;
    m.receiveShadow = true;
    this.group.add(m);
    if (collide) this.colliders.push(new THREE.Box3().setFromObject(m));
    return m;
  }

  private cyl(mat: THREE.Material, x: number, y: number, z: number, r: number, h: number, seg = 12): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  private interact(id: string, kind: Interactable['kind'], label: string, object: THREE.Object3D, data?: Interactable['data'], pos?: THREE.Vector3) {
    object.traverse((child) => { child.userData.interactableId = id; });
    object.userData.interactableId = id;
    const worldPos = pos ?? new THREE.Vector3().setFromMatrixPosition(object.matrixWorld);
    if (worldPos.lengthSq() === 0 && object.position.lengthSq() > 0) worldPos.copy(object.position);
    this.interactables.push({ id, kind, label, object, pos: worldPos, data });
  }

  private floors() {
    const m = this.materials;
    const plane = (mat: THREE.Material, x: number, z: number, w: number, d: number, y = 0.02) => {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      this.group.add(mesh);
    };
    plane(m.floorWood, -4.75, -2.5, 6.5, 7);
    plane(m.tile, 4.75, -2.5, 6.5, 7);
    plane(m.carpet, -4.75, 3.5, 6.5, 5);
    plane(m.tile, 3.25, 3.5, 3.5, 5);
    plane(m.concrete, 6.5, 3.5, 3, 5);
    plane(m.floorWood, 0, 0, 3, 12);

    // Decorative cozy rugs
    plane(m.fabricRed, -5.0, -3.4, 3.4, 2.4, 0.032);
    plane(m.fabricSage, 0, -1.2, 1.35, 5.4, 0.032);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), m.wall);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 2.9;
    this.group.add(ceil);

    // Pendant ceiling fixtures aligned with room lights
    for (const [x, z] of [[-4.5, -3], [4.5, -3], [-4.5, 3], [0, 0]]) {
      this.place(this.props.ceilingLamp(), x, 2.9, z);
    }
  }

  private wall(a: [number, number], b: [number, number], openings: Opening[] = [], height = 2.9, thick = 0.16) {
    this.wallSegments.push([a[0], a[1], b[0], b[1]]);
    const dx0 = b[0] - a[0], dz0 = b[1] - a[1];
    const len = Math.hypot(dx0, dz0);
    if (len < 0.01) return;
    const ux = dx0 / len, uz = dz0 / len;
    const angle = Math.atan2(-uz, ux);
    const sorted = [...openings].sort((p, q) => p.at - q.at);
    let cursor = 0;

    const piece = (from: number, to: number, y: number, h: number, addBaseboard = false) => {
      if (to - from < 0.02 || h < 0.02) return;
      const cx = a[0] + ux * (from + to) / 2;
      const cz = a[1] + uz * (from + to) / 2;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(to - from, h, thick), this.materials.wall);
      mesh.position.set(cx, y, cz);
      mesh.rotation.y = angle;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.colliders.push(new THREE.Box3().setFromObject(mesh));

      if (addBaseboard) {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(to - from, 0.11, thick + 0.03), this.materials.darkWood);
        trim.position.set(cx, 0.065, cz);
        trim.rotation.y = angle;
        this.group.add(trim);
      }
    };

    for (const o of sorted) {
      const start = Math.max(0, o.at - o.width / 2);
      const end = Math.min(len, o.at + o.width / 2);
      piece(cursor, start, height / 2, height, true);
      const bottom = o.bottom ?? 0;
      const top = height - (o.height ?? 2.15);
      if (bottom > 0.02) piece(start, end, bottom / 2, bottom, true);
      if (top > 0.02) piece(start, end, height - top / 2, top, false);

      const cx = a[0] + ux * o.at, cz = a[1] + uz * o.at;
      if (o.type === 'window') {
        this.makeWindow(cx, cz, angle, o.width, o.height ?? 1.15, bottom);
        this.shadowSpawns.push(new THREE.Vector3(cx + ux * 2.2, 0.2, cz + uz * 2.2));
      } else {
        this.makeDoor(cx, cz, ux, uz, angle, o.width, o.height ?? 2.15);
      }
      cursor = end;
    }
    piece(cursor, len, height / 2, height, true);
  }

  private makeWindow(cx: number, cz: number, angle: number, width: number, height: number, bottom: number) {
    const winGroup = new THREE.Group();
    winGroup.position.set(cx, bottom + height / 2, cz);
    winGroup.rotation.y = angle;

    const glass = new THREE.Mesh(new THREE.PlaneGeometry(width - 0.08, height - 0.08), this.materials.glass);
    winGroup.add(glass);

    // Subtle cool moonlight glow on the glass when curtains are open
    const moonGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(width - 0.12, height - 0.12),
      new THREE.MeshBasicMaterial({ color: 0x7ca6d8, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false })
    );
    moonGlow.position.z = 0.02;
    winGroup.add(moonGlow);

    // Sill, frame, cross-mullions & brass rod
    const sill = new THREE.Mesh(new THREE.BoxGeometry(width + 0.14, 0.055, 0.25), this.materials.darkWood);
    sill.position.y = -height / 2 - 0.01;
    winGroup.add(sill);
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.035, height, 0.05), this.materials.darkWood);
    const barH = new THREE.Mesh(new THREE.BoxGeometry(width, 0.035, 0.05), this.materials.darkWood);
    winGroup.add(barV, barH);

    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, width + 0.42, 8), this.materials.brass);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, height / 2 + 0.13, 0.12);
    winGroup.add(rod);

    // Animated left & right curtain panels (full half-width geometry, scaled horizontally from 0.28 -> 1.0)
    const halfW = width * 0.54;
    const curtainL = new THREE.Mesh(new THREE.BoxGeometry(halfW, height + 0.36, 0.045), this.materials.fabricSage);
    curtainL.scale.x = 0.32;
    curtainL.position.set(-width / 2 - 0.02, -0.02, 0.12);
    const curtainR = new THREE.Mesh(new THREE.BoxGeometry(halfW, height + 0.36, 0.045), this.materials.fabricSage);
    curtainR.scale.x = 0.32;
    curtainR.position.set(width / 2 + 0.02, -0.02, 0.12);
    winGroup.add(curtainL, curtainR);

    this.group.add(winGroup);
    const id = `window${this.doorCounter++}`;
    const winData: WindowData = {
      curtainL,
      curtainR,
      moonGlow,
      width,
      closed: false,
      progress: 0,
      errandId: 'close_curtains',
    };
    this.interact(id, 'window', 'Close curtains', winGroup, winData, new THREE.Vector3(cx, bottom + height / 2, cz));
  }

  /**
   * Properly hinged paneled door:
   * - Static jambs + header casing stay fixed in the wall opening.
   * - Rotating `pivot` sits at the EXACT left hinge edge (not the opening center!).
   * - Leaf spans [0, leafW] in local +X, with recessed panels & brass handles on both sides.
   * - Swings smoothly in Game.ts and updates its collider accurately.
   */
  private makeDoor(cx: number, cz: number, ux: number, uz: number, angle: number, width: number, height: number) {
    // 1) Static door frame centered in opening
    const frameGroup = new THREE.Group();
    frameGroup.position.set(cx, 0, cz);
    frameGroup.rotation.y = angle;
    const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.07, height, 0.21), this.materials.darkWood);
    jambL.position.set(-width / 2 + 0.035, height / 2, 0);
    const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.07, height, 0.21), this.materials.darkWood);
    jambR.position.set(width / 2 - 0.035, height / 2, 0);
    const header = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.08, 0.22), this.materials.darkWood);
    header.position.set(0, height + 0.02, 0);
    frameGroup.add(jambL, jambR, header);
    this.group.add(frameGroup);

    // 2) Hinge pivot at the inner left jamb edge
    const halfInner = width / 2 - 0.07;
    const hx = cx - ux * halfInner;
    const hz = cz - uz * halfInner;
    const leafW = width - 0.14;
    const leafH = height - 0.03;

    const pivot = new THREE.Group();
    pivot.position.set(hx, 0, hz);
    pivot.rotation.y = angle;

    // Main wood slab
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.055), this.materials.darkWood);
    leaf.position.set(leafW / 2, leafH / 2, 0);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    pivot.add(leaf);

    // Decorative recessed panels on both faces
    for (const zOff of [-0.03, 0.03]) {
      const topPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.72, leafH * 0.34, 0.012), this.materials.warmWood);
      topPanel.position.set(leafW / 2, leafH * 0.71, zOff);
      const botPanel = new THREE.Mesh(new THREE.BoxGeometry(leafW * 0.72, leafH * 0.32, 0.012), this.materials.warmWood);
      botPanel.position.set(leafW / 2, leafH * 0.27, zOff);
      pivot.add(topPanel, botPanel);

      // Brass lever handle + rosette
      const rosette = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.015, 10), this.materials.brass);
      rosette.rotation.x = Math.PI / 2;
      rosette.position.set(leafW - 0.12, 1.02, zOff * 1.15);
      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.022), this.materials.brass);
      lever.position.set(leafW - 0.16, 1.02, zOff * 1.9);
      pivot.add(rosette, lever);
    }

    // Hinge barrels along x = 0
    for (const hy of [0.35, 1.08, 1.82]) {
      const hPin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 8), this.materials.brass);
      hPin.position.set(0, hy, 0.032);
      pivot.add(hPin);
    }

    this.group.add(pivot);
    pivot.updateMatrixWorld(true);

    const closedBox = new THREE.Box3().setFromObject(leaf);
    const collider = closedBox.clone();
    this.colliders.push(collider);

    const id = `door${this.doorCounter++}`;
    const locked = this.doorCounter === 5; // Only 1 interior door starts locked, keeping navigation fluid
    const doorData: DoorData = {
      pivot,
      open: false,
      locked,
      collider,
      closedBox,
      baseAngle: angle,
      currentAngle: 0,
      targetAngle: 0,
      swingDir: 1,
    };

    this.interact(
      id,
      'door',
      locked ? 'Locked door (needs keys)' : 'Open / close door',
      pivot,
      doorData,
      new THREE.Vector3(cx, 1.1, cz)
    );
  }

  private walls() {
    const win: Opening = { at: 0, width: 1.35, bottom: 0.95, height: 1.18, type: 'window' };
    const door: Opening = { at: 0, width: 1.4, height: 2.15, type: 'door' };
    const smallDoor: Opening = { at: 0, width: 1.15, height: 2.12, type: 'door' };

    this.wall([-8, -6], [8, -6], [{ ...win, at: 2.1 }, { ...door, at: 8 }, { ...win, at: 13.8 }]);
    this.wall([-8, 6], [8, 6], [{ ...win, at: 2.4 }, { ...door, at: 8 }, { ...win, at: 13.6 }]);
    this.wall([-8, -6], [-8, 6], [{ ...win, at: 3 }, { ...win, at: 9 }]);
    this.wall([8, -6], [8, 6], [{ ...win, at: 3 }, { ...win, at: 9 }]);
    this.wall([-1.5, -6], [-1.5, 6], [{ ...smallDoor, at: 3 }, { ...smallDoor, at: 9 }]);
    this.wall([1.5, -6], [1.5, 6], [{ ...smallDoor, at: 3 }, { ...smallDoor, at: 9 }]);
    this.wall([-8, 1], [-1.5, 1], [{ ...smallDoor, at: 3 }]);
    this.wall([1.5, 1], [8, 1], [{ ...smallDoor, at: 1.5 }, { ...smallDoor, at: 5 }]);
    this.wall([5, 1], [5, 6], [{ ...smallDoor, at: 2.5 }]);
  }

  private furniture() {
    const m = this.materials;
    const ph = (id: string, x: number, y: number, z: number, ry = 0) => {
      const group = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.025), m.darkWood);
      group.add(frame);
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.3), new THREE.MeshStandardMaterial({ map: photoTexture(x), roughness: 0.75 }));
      pic.position.z = 0.015;
      group.add(pic);
      group.position.set(x, y, z);
      group.rotation.y = ry;
      this.group.add(group);
      this.interact(id, 'photo', 'Inspect family photograph', group, undefined, new THREE.Vector3(x, y, z));
    };

    // ---- LIVING ROOM ----
    if (!this.tryKit('sofa_cozy', -6.2, 0, -3.6)) {
      this.place(this.props.sofa(), -6.2, 0, -3.6, Math.PI / 2, true);
      this.place(this.props.contactShadow(0.75, 1.35), -6.2, 0, -3.6);
    }
    this.place(this.props.coffeeTable(), -4.3, 0, -3.5, 0, false);
    this.place(this.props.contactShadow(0.75, 0.48), -4.3, 0, -3.5);
    this.place(this.props.bookshelf(), -7.45, 0, -0.6, Math.PI / 2, true);
    this.place(this.props.fireplace(), -7.65, 0, -3.6, Math.PI / 2, false);
    this.place(this.props.floorLamp(), -6.95, 0, -5.25);
    this.place(this.props.pottedPlant(), -2.2, 0, -0.2);
    this.place(this.props.fairyLights(3.8, 12), -4.7, 2.38, -5.84);
    this.place(this.props.wallPainting(0xd98a5f), -4.7, 1.78, -5.88);
    this.place(this.props.wallPainting(0x5f8ea8), -7.86, 1.85, -1.9, Math.PI / 2);

    const tv = this.props.tvConsole();
    this.place(tv.group, -2.5, 0, -5.62, 0, false);
    this.interact('tv', 'tv', 'Toggle television', tv.screen, undefined, new THREE.Vector3(-2.5, 1.1, -5.6));
    ph('photo_living', -7.6, 1.75, -5.88, 0);

    // ---- KITCHEN ----
    this.box(m.darkWood, 4.6, 0.44, -5.55, 5.2, 0.88, 0.62);
    this.box(m.ceramic, 4.6, 0.9, -5.55, 5.28, 0.05, 0.68, false);
    // Upper cozy kitchen cabinets
    this.box(m.warmWood, 4.6, 2.15, -5.72, 4.6, 0.68, 0.34, false);
    this.place(this.props.fridge(), 7.3, 0, -3.4, -Math.PI / 2, true);
    this.place(this.props.contactShadow(0.55, 0.55), 7.3, 0, -3.4);
    this.place(this.props.coffeeTable(), 4.2, 0, -2.6, 0, false);
    this.place(this.props.chair(), 3.4, 0, -2.6, Math.PI / 2);
    this.place(this.props.chair(), 5.0, 0, -2.6, -Math.PI / 2);
    this.place(this.props.chair(), 4.2, 0, -3.2, 0);
    this.place(this.props.chair(), 4.2, 0, -2.0, Math.PI);
    const kettle = this.place(this.props.kettle(), 3.6, 0.92, -5.45);
    this.interact('kettle', 'errand', 'Boil chamomile tea', kettle, { errandId: 'make_tea' }, new THREE.Vector3(3.6, 1.05, -5.45));
    const charger = this.box(m.neonAmber, 5.4, 0.99, -5.25, 0.16, 0.1, 0.12, false);
    this.interact('charger_kitchen', 'charger', 'Use wall charger (+battery)', charger, undefined, new THREE.Vector3(5.4, 1.0, -5.25));

    // ---- BEDROOM ----
    this.place(this.props.bed(), -5.6, 0, 4.4, 0, true);
    this.place(this.props.contactShadow(1.25, 1.3), -5.6, 0, 4.4);
    this.place(this.props.fairyLights(3.2, 10), -5.6, 2.25, 5.84);
    this.place(this.props.wallPainting(0x886ea8), -5.6, 1.72, 5.86, Math.PI);
    this.box(m.darkWood, -7.1, 0.3, 3.6, 0.52, 0.6, 0.48);
    const lamp = this.place(this.props.bedsideLamp(), -7.1, 0.6, 3.6);
    this.interact('lamp_bed', 'switch', 'Toggle bedside lamp', lamp, undefined, new THREE.Vector3(-7.1, 0.9, 3.6));
    this.place(this.props.pottedPlant(), -2.3, 0, 5.2);
    // Vanity mirror
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.55, 0.04), m.darkWood);
    const glassM = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 1.44), m.mirror);
    glassM.position.z = 0.025;
    mirror.add(glassM);
    this.place(mirror, -2.0, 1.45, 5.86, Math.PI);
    this.interact('mirror', 'note', 'Look in the mirror', mirror, { text: 'You look tired. Take a slow breath.' }, new THREE.Vector3(-2.0, 1.45, 5.86));
    ph('photo_bed', -3.2, 1.7, 2.08, 0);
    const pb = this.box(m.screen, -7.35, 0.67, 4.9, 0.2, 0.08, 0.12, false);
    this.interact('powerbank', 'powerbank', 'Take emergency power bank (+40%)', pb, undefined, new THREE.Vector3(-7.35, 0.7, 4.9));

    // ---- BATHROOM ----
    this.box(m.ceramic, 2.3, 0.32, 5.1, 1.75, 0.64, 0.82, true);
    this.cyl(m.ceramic, 4.3, 0.4, 2.2, 0.25, 0.8);
    const med = this.box(m.metal, 1.72, 1.5, 3.2, 0.14, 0.6, 0.5, false);
    this.interact('medicine', 'medicine', 'Check medicine cabinet', med, { text: 'Your inhaler is empty. You need to walk to the Night Market.' }, new THREE.Vector3(1.72, 1.5, 3.2));

    // ---- STORAGE / GARAGE ----
    for (let i = 0; i < 4; i++) this.box(m.warmWood, 5.6 + (i % 2) * 1.5, 0.3 + Math.floor(i / 2) * 0.6, 5.2, 1.1, 0.55, 0.85);
    const torch = this.cyl(m.metal, 7.35, 0.95, 4.3, 0.045, 0.32);
    torch.rotation.z = Math.PI / 2;
    this.interact('flashlight_pickup', 'flashlight', 'Pick up tactical flashlight', torch, undefined, new THREE.Vector3(7.35, 0.95, 4.3));
    const panel = this.box(m.metal, 7.82, 1.4, 1.8, 0.1, 0.48, 0.38, false);
    this.interact('security', 'security', 'Check security panel', panel, { text: 'All sensors armed. Battery backup active.' }, new THREE.Vector3(7.82, 1.4, 1.8));

    // ---- HALLWAY ----
    this.box(m.darkWood, 0, 0.4, 0.9, 0.85, 0.8, 0.38, false);
    const keyRing = this.cyl(m.brass, 0, 0.83, 0.9, 0.06, 0.02, 12);
    this.interact('keys', 'key', 'Pick up apartment keys', keyRing, undefined, new THREE.Vector3(0, 0.84, 0.9));
    this.place(this.props.coatRack(), 1.05, 0, -5.15);
    const trash = this.place(this.props.trashBag(), -0.92, 0, -4.65);
    this.place(this.props.contactShadow(0.32, 0.32), -0.92, 0, -4.65);
    this.interact('trash_bag', 'errand', 'Pick up trash bag', trash, { errandId: 'take_trash' }, new THREE.Vector3(-0.92, 0.45, -4.65));
    ph('photo_hall', 1.35, 1.7, -1.5, -Math.PI / 2);

    const sw1 = this.box(m.paper, 1.35, 1.3, -4.4, 0.03, 0.14, 0.09, false);
    this.interact('switch_living', 'switch', 'Toggle living room light', sw1, undefined, new THREE.Vector3(1.35, 1.3, -4.4));
    const sw2 = this.box(m.paper, -1.35, 1.3, 2.4, 0.03, 0.14, 0.09, false);
    this.interact('switch_bed', 'switch', 'Toggle bedroom light', sw2, undefined, new THREE.Vector3(-1.35, 1.3, 2.4));
  }

  private outdoors() {
    const m = this.materials;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), m.grass);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    this.group.add(ground);

    for (let x = -10; x <= 10; x += 1.2) this.box(m.darkWood, x, 0.55, 9.5, 0.08, 1.1, 0.08, false);
    this.box(m.darkWood, 0, 0.5, 9.5, 20, 0.08, 0.08, false);

    for (const [x, z, h] of [[-12, 14, 3.2], [9, 16, 3.8], [-15, -8, 4.1], [14, -10, 3.5]] as [number, number, number][]) {
      this.place(this.props.tree(h), x, 0, z);
    }

    // Porch walkway, awning, warm porch lamp & outdoor curbside trash bin
    this.box(m.concrete, 0, 0.03, -7.2, 3.6, 0.06, 2.4, false);
    this.box(m.darkWood, 0, 2.55, -6.9, 2.8, 0.12, 1.8, false);
    this.place(this.props.ceilingLamp(), 0, 2.5, -6.7);

    const bin = this.place(this.props.outdoorTrashBin(), 1.35, 0, -7.15, -0.3, false);
    this.interact('outdoor_trash_bin', 'errand', 'Drop trash in curbside bin', bin, { errandId: 'take_trash' }, new THREE.Vector3(1.35, 0.65, -7.15));

    const shed = this.box(m.darkWood, 10, 1.0, 8, 2.4, 2, 2.2, false);
    this.interact('garden_shed', 'clue', 'Look inside garden shed', shed, {
      reveal: 'garden_shed', text: 'Old garden tools and a calendar circled at 06:00.'
    }, new THREE.Vector3(10, 1.0, 8));
  }

  private nav() {
    const pts: [number, number][] = [
      [0, -4], [0, 0], [0, 4], [-4.5, -3], [-4.5, 3.5], [4.5, -3], [3.2, 3.5], [6.5, 3.5]
    ];
    for (const [x, z] of pts) {
      this.navNodes.push(new THREE.Vector3(x, 0, z));
      this.navEdges.push([]);
    }
    const link = (a: number, b: number) => { this.navEdges[a].push(b); this.navEdges[b].push(a); };
    link(0, 1); link(1, 2); link(0, 3); link(1, 3); link(1, 5); link(2, 4); link(2, 6); link(6, 7);
    this.rooms.push(
      { name: 'Living Room', center: new THREE.Vector3(-4.7, 1.4, -2.5), radius: 4 },
      { name: 'Kitchen', center: new THREE.Vector3(4.7, 1.4, -2.5), radius: 4 },
      { name: 'Bedroom', center: new THREE.Vector3(-4.7, 1.4, 3.5), radius: 3.5 },
      { name: 'Hallway', center: new THREE.Vector3(0, 1.4, 0), radius: 3 }
    );
  }

  private addExit() {
    const marker = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.12, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x102230, emissive: 0x3ec2db, emissiveIntensity: 0.95, transparent: true, opacity: 0.78 })
    );
    marker.position.set(0, 0.09, -8.0);
    this.group.add(marker);
    this.interact('exit_street', 'zone', 'Walk out to Oaklane Street', marker, { target: 'street', spawn: 'home' }, new THREE.Vector3(0, 1.0, -8.0));
  }
}
