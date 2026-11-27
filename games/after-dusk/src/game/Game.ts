import * as THREE from 'three';
import { ZONE_BY_ID, TAXI_SECONDS, taxiCost } from '../data/zones';
import { ENDINGS } from '../data/endings';
import type { ContactId, Difficulty, GameMode, Language, Quality } from '../data/types';
import { CONFIG } from './GameConfig';
import { GameState } from './GameState';
import { SceneManager } from '../renderer/SceneManager';
import { SkyDome } from '../renderer/SkyDome';
import { LightingManager } from '../renderer/LightingManager';
import { WeatherFX } from '../renderer/WeatherFX';
import { ViewModel } from '../renderer/ViewModel';
import { createMaterials } from '../renderer/ProceduralAssets';
import { kitReady } from '../world/AssetKit';
import { ZoneBuilder } from '../world/ZoneBuilder';
import type { DoorData, Interactable, WindowData, World } from '../world/Interactable';
import { ShadowManager } from '../enemies/ShadowManager';
import { FirstPersonController } from '../player/FirstPersonController';
import { InteractionSystem } from '../player/InteractionSystem';
import { MobileInput } from '../player/MobileInput';
import { GamepadInput } from '../player/GamepadInput';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { PanicSystem } from '../systems/PanicSystem';
import { ErrandSystem } from '../systems/ErrandSystem';
import { ThreatSystem, THREAT_WARNINGS } from '../systems/ThreatSystem';
import { BatterySystem } from '../systems/BatterySystem';
import { PhoneSystem, type PhoneTab } from '../systems/PhoneSystem';
import { CallSystem } from '../systems/CallSystem';
import { StorySystem } from '../systems/StorySystem';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';
import { InteractionMenu } from '../ui/InteractionMenu';
import { PhoneUI } from '../ui/PhoneUI';
import { Menus } from '../ui/Menus';
import { setLang, t } from '../i18n';
import { releaseWakeLock, requestWakeLock, vibrate } from '../pwa';

export class Game {
  readonly state = new GameState();
  private sm: SceneManager;
  private sky: SkyDome;
  private weather: WeatherFX;
  private materials = createMaterials();
  private world: World;
  private lighting: LightingManager;
  private viewModel: ViewModel;
  private audio: AudioSystem;
  private saves = new SaveSystem();
  private panic = new PanicSystem();
  private errands = new ErrandSystem();
  private threat = new ThreatSystem();
  private battery = new BatterySystem();
  private phone: PhoneSystem;
  private calls: CallSystem;
  private story: StorySystem;
  private shadows: ShadowManager;
  private controller: FirstPersonController;
  private interaction: InteractionSystem;
  private mobile: MobileInput | null = null;
  private gamepad: GamepadInput;
  private hud: HUD;
  private minimap: Minimap;
  private interactMenu: InteractionMenu;
  private phoneUI: PhoneUI;
  private menus: Menus;
  private captureEl: HTMLElement;
  private appEl: HTMLElement;
  private lastTime = performance.now();
  private saveTimer = 0;
  private cullTimer = 0;
  private time = 0;
  private fpsEma = 60;
  private lowFpsTimer = 0;
  private dprScale = 1;
  private autoBreatheTimer = 0;

  constructor(app: HTMLElement, sceneHost: HTMLElement) {
    this.appEl = app;
    this.sm = new SceneManager(sceneHost);
    this.sky = new SkyDome(this.sm.scene);
    this.weather = new WeatherFX(this.sm.scene);

    void kitReady('home', 2500);
    void kitReady('street', 2500);
    void kitReady('shadows', 2500);

    this.world = new ZoneBuilder(this.materials).build(ZONE_BY_ID.home);
    this.sm.scene.add(this.world.group);
    this.sm.setAtmosphere(ZONE_BY_ID.home.palette.sky, ZONE_BY_ID.home.palette.fog);
    this.lighting = new LightingManager(this.sm, this.materials);
    this.viewModel = new ViewModel(this.sm.camera, this.materials);

    this.audio = new AudioSystem(this.state);
    this.phone = new PhoneSystem(this.state);
    this.calls = new CallSystem(this.state, this.threat, {
      onToast: (msg) => this.hud.toast(msg),
      onReveal: (id) => this.hud.toast(`Clue recorded: ${id.replaceAll('_', ' ')}`),
      onEvent: (id) => this.story.trigger(id),
      onSound: (n) => this.audio.play(n),
    });
    this.story = new StorySystem(this.state, {
      onChapter: (id) => this.hud.toast(`Chapter ${id}: ${this.state.chapterData.title}`),
      onEvent: (_id, title, text) => this.hud.toast(`${title} — ${text}`, 5),
      onToast: (msg) => this.hud.toast(msg),
      onReveal: (id) => this.hud.toast(`Clue recorded: ${id.replaceAll('_', ' ')}`),
      onIncoming: () => { this.calls.start('unknown', true); this.togglePhone(true); vibrate([100, 60, 100]); },
      onEnding: (ending) => this.onEnding(ending.id),
    });
    this.shadows = new ShadowManager(
      this.sm.scene,
      this.world,
      this.materials,
      () => this.capture(),
      (name, at) => this.audio.play(name, at, this.controller.position)
    );

    this.hud = new HUD(app);
    this.hud.onPromptClick = () => this.interact();
    this.hud.onActionsClick = () => this.toggleInteractMenu();

    this.minimap = new Minimap(app);
    this.interactMenu = new InteractionMenu(app, {
      onInteractItem: (item) => this.interactWith(item),
      onToggleFlashlight: () => this.toggleFlashlight(),
      onTogglePhone: () => this.togglePhone(true),
      onToggleMap: () => this.minimap.toggleExpand(),
      onTriggerBreathe: () => { this.autoBreatheTimer = CONFIG.groundingDuration + 0.1; this.hud.toast(t('groundedToast'), 3); },
      onClose: () => this.toggleInteractMenu(false),
    });

    this.phoneUI = new PhoneUI(app, {
      onCall: (id) => this.startCall(id),
      onHangup: () => this.calls.hangUp(),
      onChoice: (i) => this.calls.choose(i),
      onClose: () => this.togglePhone(false),
      onTravel: (z) => this.travelByTaxi(z),
      onSound: (n) => this.audio.play(n),
    });
    this.phoneUI.onTab = (tab: PhoneTab) => { this.phone.tab = tab; };

    this.menus = new Menus(app, {
      onNew: (d, m) => this.newGame(d, m),
      onContinue: () => this.loadGame('slot1'),
      onLoadSlots: () => this.menus.slots(this.saves.list()),
      onSettings: () => this.menus.settings(),
      onCredits: () => this.menus.credits(),
      onResume: () => this.resume(),
      onSave: () => { this.saves.save(this.state, 'slot1', 'Manual Save'); this.hud.toast('Saved to Slot 1'); },
      onMenu: () => this.toMenu(),
      onRestart: () => this.newGame(this.state.difficulty, this.state.mode),
      onLoadSlot: (slot) => this.loadGame(slot),
      onDeleteSlot: (slot) => { this.saves.delete(slot); this.menus.slots(this.saves.list()); },
      onSetting: (k, v) => this.applySetting(k, v),
      onIntroDone: () => {
        this.menus.hide();
        this.hud.setVisible(true);
        this.minimap.setVisible(true);
        this.mobile?.show();
        this.controller.lock();
        void requestWakeLock();
      },
    });

    this.captureEl = document.createElement('div');
    this.captureEl.className = 'capture hidden';
    this.captureEl.textContent = t('capturedText');
    app.appendChild(this.captureEl);

    if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) this.ensureMobile();
    window.addEventListener('touchstart', () => { this.ensureMobile(); this.mobile?.show(); }, { once: true, passive: true });

    this.gamepad = new GamepadInput({
      interact: () => this.interact(),
      light: () => this.toggleFlashlight(),
      phone: () => this.togglePhone(),
      pause: () => this.togglePause(),
    });
    this.controller = new FirstPersonController(this.sm.camera, this.world, this.sm.renderer.domElement, this.mobile, this.gamepad);
    this.controller.onStep = () => this.audio.play('step');
    this.interaction = new InteractionSystem(this.sm.camera, this.world);

    this.bindInput();
    this.loadSettings();
    this.menus.bind(this.state, this.saves.list().some((s) => !!s.data));
    this.menus.main();
    requestAnimationFrame(() => this.loop());
  }

  private ensureMobile() {
    if (this.mobile) return;
    this.mobile = new MobileInput(this.appEl, {
      interact: () => this.interact(),
      light: () => this.toggleFlashlight(),
      phone: () => this.togglePhone(),
      crouch: () => {},
      sprint: () => {},
      pause: () => this.togglePause(),
    });
    if (this.controller) this.controller.mobile = this.mobile;
  }

  private loadSettings() {
    const s = this.saves.loadSettings();
    if (!s) return;
    if (typeof s.quality === 'string') this.state.quality = s.quality as Quality;
    if (typeof s.lang === 'string') { this.state.lang = s.lang as Language; setLang(this.state.lang); }
    if (typeof s.gyroAim === 'boolean') this.state.gyroAim = s.gyroAim;
    this.sm.setQuality(this.state.quality);
  }

  private applySetting(k: string, v: unknown) {
    if (k === 'quality') {
      this.state.quality = v as Quality;
      this.sm.setQuality(this.state.quality);
    } else if (k === 'lang') {
      this.state.lang = v as Language;
    } else if (k === 'gyroAim') {
      this.state.gyroAim = Boolean(v);
    }
    this.saves.saveSettings({ quality: this.state.quality, lang: this.state.lang, gyroAim: this.state.gyroAim });
  }

  private bindInput() {
    window.addEventListener('keydown', (e) => {
      if (this.state.phase !== 'playing') return;
      if (e.code === 'KeyE') this.interact();
      else if (e.code === 'KeyF') this.toggleFlashlight();
      else if (e.code === 'KeyI' || e.code === 'KeyQ') this.toggleInteractMenu();
      else if (e.code === 'KeyM') this.minimap.toggleExpand();
      else if (e.code === 'Tab') { e.preventDefault(); this.togglePhone(); }
      else if (e.code === 'Escape') {
        if (this.interactMenu.open) this.toggleInteractMenu(false);
        else if (this.state.phoneOpen) this.togglePhone(false);
        else this.togglePause();
      } else if (e.code === 'Digit1' && this.calls.connected) this.calls.choose(0);
      else if (e.code === 'Digit2' && this.calls.connected) this.calls.choose(1);
      else if (e.code === 'Digit3' && this.calls.connected) this.calls.choose(2);
    });
    this.sm.renderer.domElement.addEventListener('click', () => {
      if (this.state.phase === 'playing' && !this.state.phoneOpen && !this.interactMenu.open) this.controller.lock();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.phase === 'playing') this.togglePause();
    });
  }

  private toggleInteractMenu(force?: boolean) {
    const next = typeof force === 'boolean' ? force : !this.interactMenu.open;
    if (next && this.state.phoneOpen) this.togglePhone(false);
    this.interactMenu.setOpen(next);
    if (next) {
      this.controller.unlock();
      this.interactMenu.render(this.state, this.controller.position, this.world.interactables, this.errands.nextObjective(this.state));
    }
  }

  private newGame(d: Difficulty, mode: GameMode) {
    this.state.difficulty = d;
    this.state.reset(mode);
    this.story.reset();
    this.loadZoneWorld('home', [0, 1]);
    const ch = this.state.chapterData;
    const isIt = this.state.lang === 'it';
    this.menus.intro(isIt ? ch.titleIt : ch.title, isIt ? ch.introIt : ch.intro);
  }

  private loadGame(slot: string) {
    const snap = this.saves.load(slot);
    if (!snap) return;
    this.state.restore(snap);
    this.loadZoneWorld(this.state.zone, [this.state.position[0], this.state.position[2]]);
    this.menus.hide();
    this.hud.setVisible(true);
    this.minimap.setVisible(true);
    this.mobile?.show();
  }

  private loadZoneWorld(zoneId: string, spawn?: [number, number]) {
    const zone = ZONE_BY_ID[zoneId] ?? ZONE_BY_ID.home;
    const next = new ZoneBuilder(this.materials).build(zone);
    this.sm.scene.remove(this.world.group);
    this.world.group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
    this.world = next;
    this.sm.scene.add(next.group);
    this.controller.world = next;
    this.interaction.setWorld(next);
    this.shadows.setWorld(next);
    this.lighting.rebuild(zone.lights, !!zone.safe);
    this.sm.setAtmosphere(zone.palette.sky, zone.palette.fog);
    this.weather.setOutdoor(['street', 'park', 'cemetery', 'harbour', 'campus'].includes(zone.kind));

    this.state.zone = zone.id;
    this.state.visited.add(zone.id);
    const at = spawn ?? zone.spawn;
    this.controller.position.set(at[0], CONFIG.eyeHeight, at[1]);
    this.controller.yaw = 0;
    this.controller.pitch = 0;
    this.controller.syncTo(this.state);
    if (zone.reveal && this.state.reveal(zone.reveal)) this.hud.toast(`Visited ${zone.name}`);
  }

  private travelByTaxi(zoneId: string) {
    const cost = taxiCost(this.state.zone, zoneId);
    if (this.state.battery < cost + 4) { this.hud.toast('Battery too low for a taxi!'); return; }
    this.state.battery -= cost;
    this.state.elapsed += TAXI_SECONDS;
    this.togglePhone(false);
    this.loadZoneWorld(zoneId);
  }

  private startCall(id: ContactId) {
    if (this.calls.start(id)) this.phoneUI.render(this.state, this.phone, this.calls);
  }

  private togglePhone(force?: boolean) {
    if (!this.phone.usable && !this.state.phoneOpen) { this.hud.toast(t('batteryLow')); return; }
    if (this.interactMenu.open) this.toggleInteractMenu(false);
    if (typeof force === 'boolean') this.state.phoneOpen = force;
    else this.phone.toggle();
    if (this.state.phoneOpen) this.controller.unlock();
    this.phoneUI.render(this.state, this.phone, this.calls);
  }

  private toggleFlashlight() {
    if (!this.state.slots.flashlight) { this.hud.toast('Find the flashlight in the storage room first.'); return; }
    this.state.flashlightOn = !this.state.flashlightOn;
    this.audio.play('click');
  }

  private togglePause() {
    if (this.state.phase === 'playing') {
      this.state.phase = 'paused';
      this.toggleInteractMenu(false);
      this.controller.unlock();
      this.menus.pause();
    } else if (this.state.phase === 'paused') {
      this.resume();
    }
  }

  private resume() {
    this.state.phase = 'playing';
    this.menus.hide();
    this.controller.lock();
  }

  private toMenu() {
    this.state.phase = 'menu';
    this.hud.setVisible(false);
    this.minimap.setVisible(false);
    this.toggleInteractMenu(false);
    this.mobile?.hide();
    this.controller.unlock();
    void releaseWakeLock();
    this.menus.bind(this.state, this.saves.list().some((s) => !!s.data));
    this.menus.main();
  }

  private interact() {
    const item = this.interaction.current;
    if (item) this.interactWith(item);
  }

  private interactWith(item: Interactable) {
    this.audio.play('click');
    const data = item.data as { errandId?: string; target?: string; text?: string; reveal?: string } | undefined;

    if (item.kind === 'door') {
      const dd = item.data as DoorData;
      if (dd.locked && !this.state.slots.keys) { this.hud.toast('Locked. Pick up the apartment keys in the hallway.'); return; }
      dd.locked = false;
      dd.open = !dd.open;
      if (dd.open) {
        // Swing smoothly away from Emma's current side
        const normalX = -Math.sin(dd.baseAngle);
        const normalZ = Math.cos(dd.baseAngle);
        const toPlayerX = this.controller.position.x - dd.pivot.position.x;
        const toPlayerZ = this.controller.position.z - dd.pivot.position.z;
        const dot = toPlayerX * normalX + toPlayerZ * normalZ;
        dd.swingDir = dot >= 0 ? -1 : 1;
        dd.targetAngle = dd.swingDir * (Math.PI * 0.52);
        dd.collider.makeEmpty();
        item.label = 'Close door';
      } else {
        dd.targetAngle = 0;
        item.label = 'Open door';
      }
      return;
    } else if (item.kind === 'window') {
      const wd = item.data as WindowData;
      wd.closed = !wd.closed;
      item.label = wd.closed ? 'Open curtains' : 'Close curtains';
      this.audio.play('click');
      if (wd.closed) {
        this.state.panic = Math.max(0, this.state.panic - 3);
        this.hud.toast(this.state.lang === 'it' ? 'Hai chiuso le tende. La stanza sembra più sicura.' : 'Curtains drawn shut. The room feels warmer.', 3.2);
      } else {
        this.hud.toast(this.state.lang === 'it' ? 'Hai aperto le tende verso il buio.' : 'Curtains opened to the night sky.', 3.2);
      }
      if (wd.errandId) {
        const done = this.errands.complete(this.state, wd.errandId);
        if (done) {
          this.audio.play('chime');
          this.hud.toast(`✓ ${this.state.lang === 'it' ? done.titleIt : done.title} (+${done.composureReward} Composure)`);
        }
      }
      return;
    } else if (item.id === 'trash_bag') {
      this.state.slots.carryingTrash = true;
      item.object.visible = false;
      this.audio.play('click');
      this.hud.toast(
        this.state.lang === 'it'
          ? 'Sacco preso! Apri la porta d’ingresso e buttalo nel bidone sul portico.'
          : 'Trash bag picked up! Open the front door and drop it in the porch bin.',
        5.5
      );
      return;
    } else if (item.id === 'outdoor_trash_bin') {
      if (!this.state.slots.carryingTrash && !this.state.errandsDone.has('take_trash')) {
        this.hud.toast(
          this.state.lang === 'it'
            ? 'Prendi prima il sacco della spazzatura nell’ingresso vicino alla porta!'
            : 'Pick up the trash bag in the hallway by the front door first!',
          4.5
        );
        return;
      }
      this.state.slots.carryingTrash = false;
      const done = this.errands.complete(this.state, 'take_trash');
      if (done) {
        this.audio.play('chime');
        this.hud.toast(`✓ ${this.state.lang === 'it' ? done.titleIt : done.title} (+${done.composureReward} Composure)`);
      } else {
        this.hud.toast(this.state.lang === 'it' ? 'Il bidone è chiuso.' : 'Trash already dropped off.');
      }
      return;
    } else if (item.kind === 'switch') {
      this.lighting.toggleRoom(this.controller.position);
    } else if (item.kind === 'flashlight') {
      this.state.slots.flashlight = true;
      this.state.flashlightOn = true;
      item.object.visible = false;
      this.hud.toast('Flashlight picked up! Press [F] or LIGHT.');
    } else if (item.kind === 'key') {
      this.state.slots.keys = true;
      item.object.visible = false;
      this.hud.toast('Picked up apartment keys.');
    } else if (item.kind === 'powerbank') {
      if (this.battery.usePowerBank(this.state)) {
        item.object.visible = false;
        this.hud.toast('Power bank used (+40% battery).');
      }
    } else if (item.kind === 'charger') {
      this.battery.charge(this.state, 3);
      this.hud.toast('Phone charged!');
    } else if (item.kind === 'zone' && data?.target) {
      if (this.state.slots.carryingTrash && !this.state.errandsDone.has('take_trash')) {
        this.state.slots.carryingTrash = false;
        const done = this.errands.complete(this.state, 'take_trash');
        if (done) {
          this.audio.play('chime');
          this.hud.toast(`✓ ${this.state.lang === 'it' ? done.titleIt : done.title} (+${done.composureReward} Composure)`);
        }
      }
      this.loadZoneWorld(data.target);
    }

    if (data?.reveal && this.state.reveal(data.reveal)) {
      this.hud.toast(data.text ?? `Discovered: ${data.reveal}`, 5);
    } else if (data?.text && item.kind !== 'errand') {
      this.hud.toast(data.text, 5);
    }

    if (data?.errandId) {
      const done = this.errands.complete(this.state, data.errandId);
      if (done) {
        this.audio.play('chime');
        this.hud.toast(`Errand complete: ${this.state.lang === 'it' ? done.titleIt : done.title} (+${done.composureReward} Composure)`);
      }
    }
  }

  private updateDoors(dt: number) {
    for (const item of this.world.interactables) {
      if (item.kind === 'door') {
        const dd = item.data as DoorData;
        const diff = dd.targetAngle - dd.currentAngle;
        if (Math.abs(diff) > 0.002) {
          dd.currentAngle += diff * Math.min(1, dt * 8.5);
          dd.pivot.rotation.y = dd.baseAngle + dd.currentAngle;
        } else {
          dd.currentAngle = dd.targetAngle;
          dd.pivot.rotation.y = dd.baseAngle + dd.currentAngle;
        }
        if (!dd.open && Math.abs(dd.currentAngle) < 0.25 && dd.collider.isEmpty()) {
          dd.collider.copy(dd.closedBox);
        }
      } else if (item.kind === 'window') {
        const wd = item.data as WindowData;
        const target = wd.closed ? 1 : 0;
        if (Math.abs(target - wd.progress) > 0.002) {
          wd.progress += (target - wd.progress) * Math.min(1, dt * 7.0);
        } else {
          wd.progress = target;
        }
        const p = wd.progress;
        // Scale curtains horizontally from 0.32 (gathered at sides) -> 1.0 (fully drawn across glass)
        const sx = 0.32 + p * 0.68;
        const openX = wd.width / 2 + 0.02;
        const closedX = wd.width * 0.24;
        const xPos = openX + (closedX - openX) * p;
        wd.curtainL.scale.x = sx;
        wd.curtainR.scale.x = sx;
        wd.curtainL.position.x = -xPos;
        wd.curtainR.position.x = xPos;
        const mMat = wd.moonGlow.material as THREE.MeshBasicMaterial;
        mMat.opacity = 0.14 * (1 - p);
      }
    }
  }

  private capture() {
    this.state.phase = 'captured';
    this.controller.unlock();
    this.captureEl.classList.remove('hidden');
    vibrate([200, 80, 250]);
    setTimeout(() => {
      this.captureEl.classList.add('hidden');
      this.onEnding('shadows-win');
    }, 2200);
  }

  private onEnding(id: string) {
    this.state.phase = 'ending';
    this.hud.setVisible(false);
    this.minimap.setVisible(false);
    this.toggleInteractMenu(false);
    this.mobile?.hide();
    this.controller.unlock();
    this.menus.ending(ENDINGS[id] ?? ENDINGS['escape-alone'], this.state.lang === 'it');
  }

  private loop() {
    const now = performance.now();
    const dt = Math.min(0.08, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.time += dt;

    if (dt > 0.001) this.fpsEma = this.fpsEma * 0.94 + (1 / dt) * 0.06;
    if (this.fpsEma < 34) {
      this.lowFpsTimer += dt;
      if (this.lowFpsTimer > 3 && this.dprScale > 0.7) {
        this.lowFpsTimer = 0;
        this.dprScale = Math.max(0.7, this.dprScale - 0.15);
        this.sm.scaleResolution(this.dprScale);
      }
    } else {
      this.lowFpsTimer = 0;
    }

    let proximity = 0;
    if (this.state.phase === 'playing') {
      this.state.elapsed += dt;
      this.gamepad.update();
      this.updateDoors(dt);
      const canMove = !this.state.phoneOpen && !this.interactMenu.open;
      this.controller.update(dt, this.state, canMove);

      if (this.autoBreatheTimer > 0) this.autoBreatheTimer = Math.max(0, this.autoBreatheTimer - dt);
      const groundingHeld = this.controller.isGrounding || this.autoBreatheTimer > 0;

      const exposure = this.lighting.getLightExposure(this.controller.position);
      const panicRes = this.panic.update(dt, this.state, exposure, this.calls.connected, groundingHeld, proximity);
      if (panicRes.grounded) { this.autoBreatheTimer = 0; this.audio.play('chime'); this.hud.toast(t('breatheDone')); }

      const zone = ZONE_BY_ID[this.state.zone];
      proximity = this.shadows.update(
        dt, this.time, this.state.threat, this.controller.position, this.controller.yaw,
        this.state.flashlightOn, exposure >= 0.4, this.lighting.activePools,
        this.state.difficultyFactor.enemySpeed, !!zone?.safe
      );

      const lvl = this.threat.update(dt, this.state, this.calls.connected, proximity);
      if (lvl && THREAT_WARNINGS[lvl]) this.hud.toast(THREAT_WARNINGS[lvl], 4.5);

      if (this.battery.update(dt, this.state, this.state.phoneOpen, this.calls.connected)) {
        this.hud.toast(t('batteryLow'));
      }
      this.calls.update(dt);
      this.story.update(dt);
      this.audio.update(dt, this.state.panic, this.state.threat);

      const hit = this.interaction.update();
      this.hud.setPrompt(hit ? `[E] ${hit.label}` : null);
      const nextErrand = this.errands.nextObjective(this.state);
      const obj = nextErrand
        ? (this.state.lang === 'it' ? nextErrand.titleIt : nextErrand.title)
        : (this.state.lang === 'it' ? this.state.chapterData.objectiveIt : this.state.chapterData.objective);
      this.hud.update(dt, this.state, obj);

      this.minimap.render(
        this.time,
        this.state,
        zone?.name ?? this.state.zone,
        this.world,
        this.controller.position,
        this.controller.yaw,
        this.lighting.activePools,
        this.shadows.shadows,
        nextErrand
      );

      if (this.state.phoneOpen) this.phoneUI.render(this.state, this.phone, this.calls);

      this.cullTimer -= dt;
      if (this.cullTimer <= 0) {
        this.cullTimer = 0.3;
        this.world.group.traverse((o) => {
          if (o.userData.cullable) o.visible = o.position.distanceToSquared(this.controller.position) < 2600;
        });
      }

      this.saveTimer += dt;
      if (this.saveTimer >= 30) {
        this.saveTimer = 0;
        this.saves.save(this.state, 'slot1', 'Autosave');
      }
    } else if (this.state.phase === 'menu') {
      this.sm.camera.position.set(Math.sin(this.time * 0.12) * 1.4, 1.75, Math.cos(this.time * 0.12) * 1.4);
      this.sm.camera.lookAt(-3, 1.2, -3);
    }

    this.sky.update(this.time, this.state.hour, this.sm.camera.position);
    this.lighting.update(dt, this.time, this.state);
    this.weather.update(dt, this.sm.camera.position);
    this.viewModel.update(this.time, this.state, this.calls.call?.id ?? null);
    this.sm.render(this.time, this.state.panic / 100, proximity);

    requestAnimationFrame(() => this.loop());
  }
}
