import * as THREE from 'three';
import type { Materials } from '../renderer/ProceduralAssets';
import type { ZoneDef } from '../data/zones';
import { kitGeometry, kitMaterial } from './AssetKit';
import { HouseBuilder } from './HouseBuilder';
import { PropFactory } from './PropFactory';
import type { Interactable, World } from './Interactable';

export class ZoneBuilder {
  private group = new THREE.Group();
  private props: PropFactory;
  private colliders: THREE.Box3[] = [];
  private interactables: Interactable[] = [];
  private navNodes: THREE.Vector3[] = [];
  private navEdges: number[][] = [];
  private rooms: World['rooms'] = [];
  private wallSegments: Array<[number, number, number, number]> = [];
  private id = 0;

  constructor(private materials: Materials) {
    this.props = new PropFactory(materials);
  }

  build(zone: ZoneDef): World {
    if (zone.kind === 'home') return new HouseBuilder(this.materials).build();
    const outdoor = zone.kind === 'street' || zone.kind === 'park' || zone.kind === 'cemetery' || zone.kind === 'harbour' || zone.kind === 'campus';
    if (outdoor) this.outdoor(zone);
    else this.interior(zone);
    return {
      group: this.group,
      colliders: this.colliders,
      interactables: this.interactables,
      navNodes: this.navNodes,
      navEdges: this.navEdges,
      rooms: this.rooms,
      bounds: new THREE.Box3(
        new THREE.Vector3(zone.bounds[0], 0, zone.bounds[1]),
        new THREE.Vector3(zone.bounds[2], 3.2, zone.bounds[3])
      ),
      shadowsSpawn: zone.shadowSpawns.map(([x, z]) => new THREE.Vector3(x, 0.2, z)),
      wallSegments: this.wallSegments,
    };
  }

  private cullable<T extends THREE.Object3D>(o: T): T {
    o.userData.cullable = true;
    return o;
  }

  private tryKit(pack: string, id: string, x: number, y: number, z: number, ry = 0): THREE.Mesh | null {
    const geo = kitGeometry(id, pack);
    if (!geo) return null;
    const m = new THREE.Mesh(geo, kitMaterial());
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    return m;
  }

  private place(obj: THREE.Object3D, x: number, y: number, z: number, ry = 0, collide = false, cull = false) {
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    this.group.add(obj);
    if (collide) this.colliders.push(new THREE.Box3().setFromObject(obj));
    return cull ? this.cullable(obj) : obj;
  }

  private box(mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, collide = true, cull = false): THREE.Mesh {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    this.group.add(m);
    if (collide) this.colliders.push(new THREE.Box3().setFromObject(m));
    return cull ? this.cullable(m) : m;
  }

  private interact(id: string, kind: Interactable['kind'], label: string, object: THREE.Object3D, data?: Interactable['data'], pos?: THREE.Vector3) {
    object.traverse((c) => { c.userData.interactableId = id; });
    object.userData.interactableId = id;
    const p = pos ?? object.position.clone();
    this.interactables.push({ id, kind, label, object, pos: p, data });
  }

  private marker(x: number, z: number, color: number, label: string, data: Interactable['data']) {
    const g = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.15, 0.14), this.materials.darkWood);
    frame.position.y = 1.08;
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.84, 1.85),
      new THREE.MeshStandardMaterial({ color: 0x0b1622, emissive: color, emissiveIntensity: 0.65, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    );
    glow.position.set(0, 1.05, 0.08);
    g.add(frame, glow);
    this.place(g, x, 0, z, 0, false, true);
    this.interact(`zone_${this.id++}`, 'zone', label, g, data, new THREE.Vector3(x, 1.1, z));
  }

  private prop(p: ZoneDef['props'][number]) {
    const c = p.kind === 'powerbank' ? 0x6fd6c4 : p.kind === 'charger' ? 0x7fe4ff : p.kind === 'errand' ? 0xffb347 : 0xffd9a8;
    const obj = p.kind === 'charger'
      ? this.props.chargerKiosk()
      : this.props.objectiveProp(c, p.kind === 'clue' || p.kind === 'photo' || p.kind === 'note');
    this.place(obj, p.at[0], 0, p.at[1], 0, false, true);
    this.interact(`prop_${this.id++}`, p.kind, p.label, obj, { reveal: p.reveal, text: p.text, errandId: p.errandId }, new THREE.Vector3(p.at[0], 0.95, p.at[1]));
  }

  private ground(color: string, w: number, d: number, y = 0, useAsphalt = false) {
    const mat = useAsphalt ? this.materials.asphalt : new THREE.MeshStandardMaterial({ color, roughness: 1 });
    const g = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    g.rotation.x = -Math.PI / 2;
    g.position.y = y;
    g.receiveShadow = true;
    this.group.add(g);
    return g;
  }

  private lamp(x: number, z: number) {
    if (this.tryKit('street', 'streetlamp_gooseneck', x, 0, z)) return;
    this.place(this.props.streetlamp(), x, 0, z, 0, false, true);
  }

  private tree(x: number, z: number, h = 3.4) {
    if (this.tryKit('street', 'maple_tree_a', x, 0, z)) return;
    this.place(this.props.tree(h), x, 0, z, 0, false, true);
    this.colliders.push(new THREE.Box3(new THREE.Vector3(x - 0.25, 0, z - 0.25), new THREE.Vector3(x + 0.25, h, z + 0.25)));
  }

  private outdoor(zone: ZoneDef) {
    const m = this.materials;
    const [minX, minZ, maxX, maxZ] = zone.bounds;
    const w = maxX - minX, d = maxZ - minZ;
    this.ground(zone.palette.ground, w + 8, d + 8);

    if (zone.kind === 'street') {
      this.ground('#151a23', w, 9.2, 0.01, true);
      // Dashed center road markings
      for (let x = minX + 3; x < maxX - 3; x += 5) {
        this.box(m.paper, x, 0.02, 0, 2.2, 0.01, 0.14, false, true);
      }
      // Raised sidewalks
      for (const z of [-5.5, 5.5]) this.box(m.concrete, 0, 0.09, z, w, 0.18, 1.8, false);
      for (let x = -24; x <= 24; x += 12) this.lamp(x, 4.7);

      const tints = [0x223042, 0x3b242c, 0x263830, 0x30333a];
      let ci = 0;
      for (let x = minX + 5; x < maxX - 4; x += 12) {
        if (!this.tryKit('street', 'sedan_parked', x, 0, -2.1)) {
          this.place(this.props.parkedCar(tints[ci++ % tints.length]), x, 0, -2.1, 0, true, true);
        }
      }

      // Brick townhouse facades with recessed lit/dark windows & cornices
      for (let x = minX + 3; x <= maxX - 3; x += 6) {
        const bh = 4.6 + (Math.abs(x) % 3) * 1.1;
        this.box(m.brick, x, bh / 2, -9.2, 5.6, bh, 1.6);
        this.box(m.concrete, x, bh + 0.14, -8.35, 5.8, 0.24, 0.35, false, true);
        for (const wy of [1.8, 3.4]) {
          if (wy > bh - 0.6) continue;
          const lit = (Math.abs(x) + wy * 10) % 12 < 5;
          const win = this.cullable(new THREE.Mesh(
            new THREE.PlaneGeometry(1.15, 0.9),
            new THREE.MeshStandardMaterial({ color: 0x151e2c, emissive: lit ? 0xffcf94 : 0x0d121b, emissiveIntensity: lit ? 0.65 : 0.08 })
          ));
          win.position.set(x, wy, -8.38);
          this.group.add(win);
        }
      }
      this.wallSegments.push([minX, -8.4, maxX, -8.4], [minX, 6.4, maxX, 6.4]);
    } else if (zone.kind === 'park') {
      const lake = new THREE.Mesh(new THREE.CircleGeometry(11, 28), new THREE.MeshStandardMaterial({ color: 0x1a3b4e, roughness: 0.2, metalness: 0.3 }));
      lake.rotation.x = -Math.PI / 2;
      lake.position.set(0, 0.03, -12);
      this.group.add(lake);
      for (const [x, z] of [[-26, -16], [26, -16], [-28, 12], [28, 12], [-14, 6], [14, 6], [-20, -4], [20, -2]] as [number, number][]) this.tree(x, z, 3.6);
      for (let i = 0; i < 6; i++) this.place(this.props.parkBench(), -15 + i * 6, 0, 6, Math.PI, false, true);
      this.lamp(-14, 0); this.lamp(16, -6);
    } else if (zone.kind === 'cemetery') {
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2;
        this.place(this.props.headstone(), Math.cos(a) * 19, 0, Math.sin(a) * 13 - 2, -a, false, true);
      }
      for (const [x, z] of [[-16, -10], [16, -10], [-16, 10], [16, 10]] as [number, number][]) this.box(m.concrete, x, 1.3, z, 2.5, 2.6, 2.2, true, true);
      this.lamp(0, -4);
    } else if (zone.kind === 'harbour') {
      const water = new THREE.Mesh(new THREE.PlaneGeometry(w + 30, 26), new THREE.MeshStandardMaterial({ color: 0x0f2233, roughness: 0.18, metalness: 0.4 }));
      water.rotation.x = -Math.PI / 2;
      water.position.set(0, 0.02, -20);
      this.group.add(water);
      for (let x = minX + 4; x < maxX - 2; x += 8) this.box(m.darkWood, x, 0.3, -12, 5.5, 0.6, 2.2, false, true);
      for (const [x, z] of [[-16, -14], [10, -15], [24, -13]] as [number, number][]) this.place(this.props.boat(), x, 0.1, z, 0.1, false, true);
      this.lamp(-18, 0); this.lamp(18, -4);
    } else if (zone.kind === 'campus') {
      for (const x of [-24, -10, 6, 20]) this.box(m.brick, x, 2.4, -12, 10, 4.8, 3, true);
      this.lamp(-16, 0); this.lamp(16, 0);
    }

    for (const e of zone.exits) this.marker(e.at[0], e.at[1], 0x3ec2db, e.label, { target: e.target, spawn: e.spawn, requires: e.requires });
    for (const p of zone.props) this.prop(p);
    this.navOutdoor(zone);
  }

  private interior(zone: ZoneDef) {
    const m = this.materials;
    const [minX, minZ, maxX, maxZ] = zone.bounds;
    const w = maxX - minX, d = maxZ - minZ;
    const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
    this.wallSegments.push([minX, minZ, maxX, minZ], [maxX, minZ, maxX, maxZ], [maxX, maxZ, minX, maxZ], [minX, maxZ, minX, minZ]);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: zone.palette.ground, roughness: 0.85 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(cx, 0.02, cz);
    floor.receiveShadow = true;
    this.group.add(floor);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m.wall);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(cx, 2.9, cz);
    this.group.add(ceil);

    const h = 2.9, t = 0.18;
    const exitX = zone.exits[0]?.at[0] ?? 0;
    this.box(m.wall, minX + (exitX - 0.85 - minX) / 2, h / 2, minZ, exitX - 0.85 - minX, h, t);
    this.box(m.wall, (exitX + 0.85 + maxX) / 2, h / 2, minZ, maxX - (exitX + 0.85), h, t);
    this.box(m.wall, minX, h / 2, cz, t, h, d);
    this.box(m.wall, maxX, h / 2, cz, t, h, d);
    this.box(m.wall, cx, h / 2, maxZ, w, h, t);

    this.place(this.props.ceilingLamp(), cx, 2.9, cz);
    this.place(this.props.sofa(), cx - 4, 0, cz + 1.5, Math.PI / 4, true);
    this.place(this.props.coffeeTable(), cx, 0, cz + 2.2);
    this.place(this.props.pottedPlant(), minX + 1.3, 0, maxZ - 1.3);
    this.place(this.props.pottedPlant(), maxX - 1.3, 0, maxZ - 1.3);

    if (zone.kind === 'bar') {
      this.place(this.props.barCounter(), cx, 0, minZ + 2.2, 0, true);
    } else if (zone.kind === 'shop' || zone.kind === 'mall') {
      for (let x = minX + 4; x < maxX - 3; x += 5.5) this.place(this.props.bookshelf(), x, 0, cz - 2.2, 0, true, true);
    } else if (zone.kind === 'hospital') {
      for (const z of [cz - 3, cz + 2]) {
        this.place(this.props.bed(), cx - 4.5, 0, z, Math.PI / 2, true, true);
        this.place(this.props.bed(), cx + 4.5, 0, z, -Math.PI / 2, true, true);
      }
    }

    for (const e of zone.exits) this.marker(e.at[0], e.at[1], 0x3ec2db, e.label, { target: e.target, spawn: e.spawn, requires: e.requires });
    for (const p of zone.props) this.prop(p);
    this.navInterior(zone);
  }

  private addNode(x: number, z: number) {
    const i = this.navNodes.length;
    this.navNodes.push(new THREE.Vector3(x, 0, z));
    this.navEdges.push([]);
    return i;
  }

  private link(a: number, b: number) { this.navEdges[a].push(b); this.navEdges[b].push(a); }

  private navOutdoor(zone: ZoneDef) {
    const center = this.addNode(0, 0);
    for (const e of zone.exits) this.link(center, this.addNode(e.at[0], e.at[1]));
    for (const s of zone.shadowSpawns) this.link(center, this.addNode(s[0], s[1]));
    this.link(center, this.addNode(zone.spawn[0], zone.spawn[1]));
    this.rooms.push({ name: zone.name, center: new THREE.Vector3(0, 1.3, 0), radius: (zone.bounds[2] - zone.bounds[0]) / 2 });
  }

  private navInterior(zone: ZoneDef) {
    const center = this.addNode(0, 0);
    for (const e of zone.exits) this.link(center, this.addNode(e.at[0], e.at[1]));
    for (const p of zone.props) this.link(center, this.addNode(p.at[0], p.at[1]));
    this.link(center, this.addNode(zone.spawn[0], zone.spawn[1]));
    this.rooms.push({ name: zone.name, center: new THREE.Vector3(0, 1.3, 0), radius: (zone.bounds[2] - zone.bounds[0]) / 2 });
  }
}
