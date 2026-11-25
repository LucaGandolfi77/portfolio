import { useEffect, useRef } from "react";
import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color3, Color4,
  MeshBuilder, StandardMaterial, Mesh,
} from "@babylonjs/core";
import { getSocket } from "../network/socket";
import { useGameStore } from "../state/gameStore";

// Mob mesh pool
const mobMeshes = new Map<string, Mesh>();
const mobHealthBars = new Map<string, Mesh>();
let sceneRef: Scene | null = null;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef = scene;
    scene.clearColor = new Color4(0.08, 0.1, 0.14, 1);

    // Camera
    const camera = new ArcRotateCamera("cam", -Math.PI / 4, Math.PI / 3.5, 25, Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 60;
    camera.wheelPrecision = 15;
    camera.panningSensibility = 200;

    // Lighting
    const light = new HemisphericLight("light", new Vector3(0.5, 1, 0.3), scene);
    light.intensity = 0.85;
    light.diffuse = new Color3(1, 0.95, 0.85);
    light.groundColor = new Color3(0.12, 0.1, 0.08);

    // Ground — Greenvale
    const ground = MeshBuilder.CreateGround("ground", { width: 120, height: 120, subdivisions: 30 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.22, 0.42, 0.18);
    groundMat.specularColor = Color3.Black();
    ground.material = groundMat;

    // Scenery — simple trees (instanced pillars)
    const treeTrunk = MeshBuilder.CreateCylinder("trunk", { height: 2, diameter: 0.4 }, scene);
    const trunkMat = new StandardMaterial("trunkMat", scene);
    trunkMat.diffuseColor = new Color3(0.35, 0.25, 0.15);
    trunkMat.specularColor = Color3.Black();
    treeTrunk.material = trunkMat;
    treeTrunk.isVisible = false;

    const treeCanopy = MeshBuilder.CreateSphere("canopy", { diameter: 2.5, segments: 6 }, scene);
    const canopyMat = new StandardMaterial("canopyMat", scene);
    canopyMat.diffuseColor = new Color3(0.15, 0.5, 0.15);
    canopyMat.specularColor = Color3.Black();
    treeCanopy.material = canopyMat;
    treeCanopy.isVisible = false;

    const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; };
    const rand = rng(42);
    for (let i = 0; i < 40; i++) {
      const x = (rand() - 0.5) * 100;
      const z = (rand() - 0.5) * 100;
      if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
      const trunk = treeTrunk.createInstance(`trunk_${i}`);
      trunk.position.set(x, 1, z);
      trunk.scaling.set(0.8 + rand() * 0.4, 0.8 + rand() * 0.6, 0.8 + rand() * 0.4);
      trunk.isVisible = true;
      const canopy = treeCanopy.createInstance(`canopy_${i}`);
      canopy.position.set(x, 2.5 + rand() * 1, z);
      canopy.scaling.set(1 + rand() * 0.5, 0.8 + rand() * 0.5, 1 + rand() * 0.5);
      canopy.isVisible = true;
    }

    // Player capsule
    const player = MeshBuilder.CreateCapsule("player", { height: 1.8, radius: 0.4 }, scene);
    player.position.y = 0.9;
    const playerMat = new StandardMaterial("playerMat", scene);
    playerMat.diffuseColor = new Color3(0.3, 0.5, 0.9);
    playerMat.specularColor = new Color3(0.2, 0.2, 0.2);
    player.material = playerMat;

    // Input
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const socket = getSocket();

    // Game loop
    let lastSend = 0;
    scene.onBeforeRenderObservable.add(() => {
      const dt = engine.getDeltaTime() / 1000;
      const speed = 6;
      let moved = false;

      const forward = new Vector3(Math.sin(camera.alpha), 0, Math.cos(camera.alpha));
      const right = new Vector3(forward.z, 0, -forward.x);

      if (keys["w"]) { player.position.addInPlace(forward.scale(speed * dt)); moved = true; }
      if (keys["s"]) { player.position.addInPlace(forward.scale(-speed * dt)); moved = true; }
      if (keys["a"]) { player.position.addInPlace(right.scale(-speed * dt)); moved = true; }
      if (keys["d"]) { player.position.addInPlace(right.scale(speed * dt)); moved = true; }

      player.position.y = 0.9;

      const now = Date.now();
      if (moved && now - lastSend > 50) {
        socket.emit("move", {
          x: player.position.x,
          y: player.position.y,
          z: player.position.z,
          ry: player.rotation.y,
        });
        lastSend = now;
      }

      camera.target = Vector3.Lerp(camera.target, player.position, 0.1);
    });

    // Listen for mob sync
    socket.on("mobs:sync", (data: Record<string, any>) => {
      if (!sceneRef) return;
      const activeIds = new Set(Object.keys(data));

      // Remove dead mobs
      for (const [id, mesh] of mobMeshes) {
        if (!activeIds.has(id)) {
          mesh.dispose();
          mobMeshes.delete(id);
          const hb = mobHealthBars.get(id);
          if (hb) { hb.dispose(); mobHealthBars.delete(id); }
        }
      }

      // Update/create mobs
      for (const [id, mob] of Object.entries(data)) {
        let mesh = mobMeshes.get(id);
        if (!mesh) {
          mesh = createMobMesh(id, mob.defId, mob.type, scene);
          mobMeshes.set(id, mesh);
        }
        mesh.position.set(mob.pos.x, mob.pos.y + 0.9, mob.pos.z);

        // Health bar
        let hb = mobHealthBars.get(id);
        if (!hb) {
          hb = MeshBuilder.CreatePlane(`hb_${id}`, { width: 1.2, height: 0.1 }, scene);
          const hbMat = new StandardMaterial(`hbMat_${id}`, scene);
          hbMat.diffuseColor = mob.hp > mob.maxHp * 0.3 ? new Color3(0.8, 0.2, 0.2) : new Color3(1, 0.1, 0.1);
          hbMat.emissiveColor = hbMat.diffuseColor;
          hbMat.specularColor = Color3.Black();
          hbMat.backFaceCulling = false;
          hb.material = hbMat;
          hb.parent = mesh;
          hb.position.y = 1.4;
          hb.billboardMode = Mesh.BILLBOARDMODE_ALL;
          mobHealthBars.set(id, hb);
        }
      }
    });

    // Combat events
    socket.on("combat:damage", (data: any) => {
      showFloatingDamage(data.targetId, data.amount, data.isCrit);
    });

    socket.on("mob:kill", (data: any) => {
      const mesh = mobMeshes.get(data.mobId);
      if (mesh) {
        mesh.dispose();
        mobMeshes.delete(data.mobId);
        const hb = mobHealthBars.get(data.mobId);
        if (hb) { hb.dispose(); mobHealthBars.delete(data.mobId); }
      }
    });

    socket.on("player:levelup", (data: any) => {
      const store = useGameStore.getState();
      if (store.character) {
        store.setCharacter({ ...store.character, level: data.level, xp: data.xp });
      }
    });

    engine.runRenderLoop(() => scene.render());

    const onResize = () => engine.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      scene.dispose();
      engine.dispose();
      sceneRef = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100vw", height: "100vh", display: "block", touchAction: "none" }}
    />
  );
}

function createMobMesh(id: string, defId: string, type: string, scene: Scene): Mesh {
  const size = type === "boss" ? 1.8 : type === "elite" ? 1.3 : 1;
  const color = getMobColor(defId);

  const body = MeshBuilder.CreateCapsule(`mob_${id}`, { height: 1.6 * size, radius: 0.35 * size }, scene);
  const mat = new StandardMaterial(`mobMat_${id}`, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  body.material = mat;
  body.isPickable = false;

  // Name label (billboard plane with dynamic texture would be ideal, using simple plane for MVP)
  return body;
}

function getMobColor(defId: string): Color3 {
  const colors: Record<string, Color3> = {
    ember_rat: new Color3(0.7, 0.3, 0.1),
    cinderbound_scout: new Color3(0.6, 0.25, 0.15),
    thornback_beetle: new Color3(0.3, 0.5, 0.2),
    ash_hound: new Color3(0.5, 0.3, 0.2),
    cinder_warden: new Color3(0.8, 0.2, 0.1),
  };
  return colors[defId] ?? new Color3(0.5, 0.5, 0.5);
}

function showFloatingDamage(_targetId: string, amount: number, isCrit: boolean) {
  // Simple floating text using DOM overlay — will be replaced with proper 3D text later
  const canvas = document.createElement("div");
  canvas.className = "floating-damage";
  canvas.textContent = isCrit ? `${amount}!` : `${amount}`;
  canvas.style.cssText = `
    position: fixed; top: 40%; left: 50%; transform: translateX(-50%);
    color: ${isCrit ? "#ff4444" : "#ffaa44"}; font-size: ${isCrit ? "28px" : "20px"};
    font-weight: bold; pointer-events: none; z-index: 1000;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    animation: floatUp 1s ease-out forwards;
  `;
  document.body.appendChild(canvas);
  setTimeout(() => canvas.remove(), 1000);
}
