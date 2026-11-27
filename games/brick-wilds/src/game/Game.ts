import * as THREE from 'three';
import { SoundEngine } from '../audio/SoundEngine';
import {
  ELEMENTAL_COMBOS,
  QUICK_BUILDS,
  ROGUELITE_PERKS,
  type QuickBuildId,
  type RoguelitePerkDef,
  type RoguelitePerkId,
  type SculptureVoxel,
} from '../data/advanced';
import { BEAST_LIST } from '../data/beasts';
import { BRICK_PALETTE, ELEMENT_COLORS } from '../data/brickPalette';
import { BIOMES, GRAND_INTRO_SLIDES, STORY_CHAPTERS } from '../data/expeditions';
import { WEAPON_MODES } from '../data/heroes';
import { COMMUNITY_QUESTS, HUB_PLOTS } from '../data/hubPlots';
import type { CaveDef } from '../data/openWorldContent';
import type {
  BeastId,
  BiomeId,
  CutsceneSlide,
  ElementType,
  GameMode,
  GameSettings,
  HeroId,
  HouseAddonId,
  ModBlockId,
  OutfitId,
  PlotThemeId,
  StoryChapterDef,
  WeaponModeId,
} from '../data/types';
import { HeroController } from '../entities/HeroController';
import { PipManager } from '../entities/PipManager';
import { ProjectileManager } from '../entities/ProjectileManager';
import { SynthBeast } from '../entities/SynthBeast';
import { getLang, t } from '../i18n';
import { InputManager } from '../input/InputManager';
import { BrickBlueprints } from '../renderer/BrickBlueprints';
import { BrickEngine } from '../renderer/BrickEngine';
import { DioramaCamera } from '../renderer/DioramaCamera';
import { SceneManager } from '../renderer/SceneManager';
import { StopMotionFX } from '../renderer/StopMotionFX';
import { WeatherAndDayNight, type WeatherKind } from '../renderer/WeatherAndDayNight';
import { CaveStage } from '../world/CaveStage';
import { ExpeditionStage } from '../world/ExpeditionStage';
import { HubWorld } from '../world/HubWorld';
import { getOpenWorldElevationAt, getOpenWorldRegionAt, isOpenWorldWaterAt, OpenWorldStage } from '../world/OpenWorldStage';
import { TitanHuntStage } from '../world/TitanHuntStage';
import { GameState } from './GameState';

export interface ActiveCutscene {
  slides: CutsceneSlide[];
  index: number;
  onComplete: () => void;
}

interface QuickBuildStructure {
  kind: QuickBuildId;
  pos: THREE.Vector3;
  mesh: THREE.Group;
  hp: number;
  life: number;
  element: ElementType;
  fireTimer: number;
}

export interface DamageNumberEvent {
  screenX: number;
  screenY: number;
  text: string;
  color: string;
  large?: boolean;
}

export interface HudSnapshot {
  mode: GameMode;
  pips: number;
  coreCubes: number;
  biomeName: string;
  waveIndex: number;
  waveTotal: number;
  bossName: string | null;
  bossHp: number;
  bossMaxHp: number;
  coopActive: boolean;
  promptText: string | null;
  stealthActive: boolean;
  swimmingActive: boolean;
  photoMode: boolean;
  dayPhase: '☀️' | '🌅' | '🌙';
  musicEnabled: boolean;
  comboCount: number;
  titanProgress: { collected: number; total: number; elapsed: number } | null;
  activePerks: RoguelitePerkId[];
  trackedQuest: { titleKey: string; current: number; target: number; completed: boolean } | null;
  openWorldMap: {
    playerX: number;
    playerZ: number;
    worldRadius: number;
    regionName: string;
    towers: Array<{ x: number; z: number; activated: boolean }>;
    chests: Array<{ x: number; z: number; opened: boolean }>;
    caves: Array<{ x: number; z: number }>;
    npcs: Array<{ x: number; z: number }>;
    collectibles: Array<{ x: number; z: number }>;
    collectedCount: number;
    collectiblesTotal: number;
    beasts: Array<{ x: number; z: number; isBoss: boolean }>;
  } | null;
  cutsceneSlide: CutsceneSlide | null;
  cutsceneIndex: number;
  cutsceneTotal: number;
  players: Array<{
    heroId: HeroId;
    hearts: number;
    maxHearts: number;
    downed: boolean;
    weaponMode: WeaponModeId;
    dashCooldown: number;
    dashCooldownMax: number;
    specialCooldown: number;
    specialCooldownMax: number;
    heavyAmmo: number;
    mountName: string | null;
    mountTimer: number;
    perfectDodgeBuff: boolean;
  }>;
}

export class Game {
  readonly state = new GameState();
  readonly sound = new SoundEngine();
  readonly sceneManager: SceneManager;
  readonly brickEngine = new BrickEngine();
  readonly blueprints: BrickBlueprints;
  readonly camera: DioramaCamera;
  readonly fx: StopMotionFX;
  readonly weather: WeatherAndDayNight;
  readonly input: InputManager;
  readonly pipManager: PipManager;
  readonly projectileManager: ProjectileManager;

  mode: GameMode = 'title';
  paused = false;
  coopActive = false;
  photoMode = false;
  photoAngle = 0;
  photoZoom = 1.0;

  private hubWorld: HubWorld | null = null;
  private stage: ExpeditionStage | null = null;
  private titanStage: TitanHuntStage | null = null;
  private openWorldStage: OpenWorldStage | null = null;
  private caveStage: CaveStage | null = null;
  private caveReturnPos: THREE.Vector3 | null = null;
  private currentRegionId = 'meadow';
  private openWorldSpawnTimer = 0;
  private relicRadarTimer = 0;
  private titanElapsed = 0;
  private cutsceneFxTimer = 0;

  private activeBiomeId: BiomeId = 'sun-canopy';
  private activeStoryChapter: StoryChapterDef | null = null;
  private activeCutscene: ActiveCutscene | null = null;
  private cutsceneTime = 0;

  private currentWave = 0;
  private rogueliteWave = 1;
  private activePerks: RoguelitePerkId[] = [];
  private heroes: HeroController[] = [];
  private beasts: SynthBeast[] = [];
  private quickStructures: QuickBuildStructure[] = [];

  // Game Feel: Hit-Stop, Bullet-Time (Perfect Dodge), Arcade Combo Meter
  private hitStopTimer = 0;
  private bulletTimeTimer = 0;
  private comboCount = 0;
  private comboDecayTimer = 0;
  private fireworkTimer = 0;

  private rafId = 0;
  private lastTime = 0;
  private accum = 0;
  private readonly fixedDt = 1 / 60;
  private readonly mouseWorld = new THREE.Vector3();
  private readonly projVec = new THREE.Vector3();

  onHudUpdate: ((snap: HudSnapshot) => void) | null = null;
  onBanner: ((text: string, tone?: 'info' | 'warn' | 'victory') => void) | null = null;
  onDamageNumber: ((ev: DamageNumberEvent) => void) | null = null;
  onRogueliteOffer: ((perks: RoguelitePerkDef[]) => void) | null = null;
  onPauseToggle: (() => void) | null = null;
  onOpenPanel:
    | ((
        panel:
          | 'story'
          | 'expeditions'
          | 'village'
          | 'wardrobe'
          | 'codex'
          | 'library'
          | 'building'
          | 'npc'
          | 'quests'
          | 'mods'
          | 'brick-lab',
        plotId?: string,
      ) => void)
    | null = null;

  constructor(sceneContainer: HTMLElement) {
    this.sceneManager = new SceneManager(sceneContainer);
    this.blueprints = new BrickBlueprints(this.brickEngine);
    const { width, height } = this.sceneManager.resize();
    this.camera = new DioramaCamera(width / Math.max(1, height));
    this.fx = new StopMotionFX(this.sceneManager.scene, this.brickEngine);
    this.weather = new WeatherAndDayNight(this.sceneManager.scene, this.brickEngine);
    this.input = new InputManager(sceneContainer);
    this.pipManager = new PipManager(this.sceneManager.scene, this.brickEngine);
    this.projectileManager = new ProjectileManager(this.sceneManager.scene, this.brickEngine);

    window.addEventListener('resize', this.handleResize);
    this.applySettings(this.state.data.settings);
    this.enterHub(true);
    this.mode = 'title';
    this.sound.setMusicMood('off');
  }

  applySettings(patch: Partial<GameSettings>): void {
    this.state.updateSettings(patch);
    const s = this.state.data.settings;
    this.sceneManager.applyQuality(s.quality);
    this.sound.muted = !s.sfxEnabled;
    this.sound.musicEnabled = s.musicEnabled;
    this.emitHud();
  }

  private handleResize = (): void => {
    const { width, height } = this.sceneManager.resize();
    this.camera.resize(width, height);
  };

  startLoop(): void {
    this.lastTime = performance.now();
    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      const rawDt = Math.min(0.08, (now - this.lastTime) / 1000);
      this.lastTime = now;

      if (this.photoMode) {
        const focus = this.heroes[0]?.pos ?? new THREE.Vector3(0, 1, 0);
        const radius = 16 * this.photoZoom;
        this.camera.camera.position.set(
          focus.x + Math.sin(this.photoAngle) * radius,
          focus.y + 11 * this.photoZoom,
          focus.z + Math.cos(this.photoAngle) * radius,
        );
        this.camera.camera.lookAt(focus.x, focus.y + 1, focus.z);
        this.sceneManager.render(this.camera.camera);
        return;
      }

      if (!this.paused) {
        if (this.hitStopTimer > 0) {
          this.hitStopTimer = Math.max(0, this.hitStopTimer - rawDt);
        } else {
          const timeScale = this.bulletTimeTimer > 0 ? 0.35 : 1.0;
          if (this.bulletTimeTimer > 0) this.bulletTimeTimer = Math.max(0, this.bulletTimeTimer - rawDt);
          this.accum += rawDt * timeScale;
          while (this.accum >= this.fixedDt) {
            this.step(this.fixedDt);
            this.accum -= this.fixedDt;
          }
        }
      }
      this.sceneManager.render(this.camera.camera);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private clearWorld(): void {
    if (this.hubWorld) {
      this.sceneManager.scene.remove(this.hubWorld.group);
      this.hubWorld = null;
    }
    if (this.stage) {
      this.sceneManager.scene.remove(this.stage.group);
      this.stage = null;
    }
    if (this.titanStage) {
      this.sceneManager.scene.remove(this.titanStage.group);
      this.titanStage = null;
    }
    if (this.openWorldStage) {
      this.sceneManager.scene.remove(this.openWorldStage.group);
      this.openWorldStage = null;
    }
    if (this.caveStage) {
      this.sceneManager.scene.remove(this.caveStage.group);
      this.caveStage = null;
    }
    for (const h of this.heroes) h.dispose();
    this.heroes = [];
    for (const b of this.beasts) b.dispose(this.sceneManager.scene);
    this.beasts = [];
    for (const q of this.quickStructures) this.sceneManager.scene.remove(q.mesh);
    this.quickStructures = [];
    this.pipManager.clear();
    this.projectileManager.clear();
    this.comboCount = 0;
  }

  private spawnHeroes(origin: THREE.Vector3): void {
    const bigHead = this.state.hasMod('big-head');
    const p1Id = this.state.data.selectedHeroP1;
    const p1 = new HeroController(
      0,
      p1Id,
      this.state.data.heroProgress[p1Id].outfit,
      this.state.getHeroMaxHearts(p1Id),
      bigHead,
      origin.clone().add(new THREE.Vector3(this.coopActive ? -1.4 : 0, 0, 0)),
      this.blueprints,
      this.sceneManager.scene,
    );
    this.heroes.push(p1);

    if (this.coopActive) {
      const p2Id = this.state.data.selectedHeroP2;
      const p2 = new HeroController(
        1,
        p2Id,
        this.state.data.heroProgress[p2Id].outfit,
        this.state.getHeroMaxHearts(p2Id),
        bigHead,
        origin.clone().add(new THREE.Vector3(1.4, 0, 0)),
        this.blueprints,
        this.sceneManager.scene,
      );
      this.heroes.push(p2);
    }
    this.camera.snapTo(origin);
  }

  private weatherForBiome(biomeId: BiomeId): WeatherKind {
    if (biomeId === 'sun-canopy' || biomeId === 'emerald-marsh' || biomeId === 'neo-edo' || biomeId === 'maya-solaris') {
      return 'rain';
    }
    if (biomeId === 'frost-spire' || biomeId === 'starlight-nexus' || biomeId === 'viking-fjords') {
      return 'snow';
    }
    if (biomeId === 'eclipse-citadel' || biomeId === 'solar-sanctum' || biomeId === 'clockwork-victorian') {
      return 'embers';
    }
    return 'clear';
  }

  checkAchievements(): void {
    const unlocked = this.state.evaluateAchievements();
    for (const ach of unlocked) {
      const title = getLang() === 'it' ? ach.titleIt : ach.titleEn;
      this.sound.playVictory();
      this.onBanner?.(`🏆 ${t('banner.achievement')} ${title} (+${ach.rewardPips} 🪙)`, 'victory');
    }
  }

  playGrandIntroMovie(onFinish?: () => void): void {
    this.enterHub(true);
    this.sound.setMusicMood('boss');
    this.playCutscene(GRAND_INTRO_SLIDES, () => {
      if (onFinish) onFinish();
      else this.enterHub();
    });
  }

  startOpenWorld(spawnOverride?: THREE.Vector3): void {
    this.clearWorld();
    this.activeStoryChapter = null;
    this.activePerks = [];
    this.mode = 'openworld';
    this.currentRegionId = 'meadow';
    this.openWorldSpawnTimer = 1.0;

    this.openWorldStage = new OpenWorldStage(
      this.brickEngine,
      this.blueprints,
      this.state.data.activatedTowers,
      this.state.data.collectedRelics,
    );
    this.sceneManager.scene.add(this.openWorldStage.group);
    this.sceneManager.setSkyTheme(0x3ba9d6, 0xa8e6ff);
    this.weather.setBiomeAtmosphere('clear', 0x3ba9d6, 0xa8e6ff);
    this.spawnHeroes(spawnOverride ?? new THREE.Vector3(0, 0, 2));
    this.sound.setMusicMood('hub');
    this.sound.playBrickSnap();
    if (!spawnOverride) this.onBanner?.(t('banner.openWorldStart'), 'info');
    this.emitHud();
  }

  enterCave(caveDef: CaveDef): void {
    this.caveReturnPos = new THREE.Vector3(caveDef.entranceX, 0, caveDef.entranceZ + 4.5);
    this.clearWorld();
    this.mode = 'openworld';
    this.caveStage = new CaveStage(caveDef, this.brickEngine);
    this.sceneManager.scene.add(this.caveStage.group);
    this.sceneManager.setSkyTheme(0x0b0f1a, caveDef.floorColor);
    this.weather.setBiomeAtmosphere('clear', 0x0b0f1a, caveDef.floorColor);
    this.spawnHeroes(new THREE.Vector3(0, 0, 9.5));

    // Spawn cavern guardian beasts
    caveDef.beasts.forEach((bId, idx) => {
      this.state.discoverBeast(bId);
      const pos = new THREE.Vector3((idx - 0.5) * 5.5, 0, -5.5);
      this.beasts.push(new SynthBeast(bId, pos, this.blueprints, this.sceneManager.scene));
    });
    this.sound.setMusicMood('combat');
    this.sound.playVisorScan();
    const label = getLang() === 'it' ? caveDef.nameIt : caveDef.nameEn;
    this.onBanner?.(`🕳️ ${label}`, 'info');
    this.emitHud();
  }

  enterHub(silent = false): void {
    this.clearWorld();
    this.activeStoryChapter = null;
    this.activeCutscene = null;
    this.activePerks = [];
    this.mode = 'hub';
    this.sceneManager.setSkyTheme(0x3ba9d6, 0xa8e6ff);
    this.weather.setBiomeAtmosphere('clear', 0x3ba9d6, 0xa8e6ff);
    this.hubWorld = new HubWorld(this.brickEngine, this.blueprints, this.state.data.plots, this.state.data.sculpture);
    this.sceneManager.scene.add(this.hubWorld.group);
    this.spawnHeroes(new THREE.Vector3(0, 0, 4.5));
    this.sound.setMusicMood('hub');
    if (!silent) {
      this.sound.playBrickSnap();
      this.onBanner?.(t('hud.hub'), 'info');
    }
    this.emitHud();
  }

  startStoryChapter(chapterId: string): void {
    const chapter = STORY_CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) return;
    this.activeStoryChapter = chapter;
    this.activePerks = [];
    this.prepareBiomeDiorama(chapter.biomeId);
    this.playCutscene(chapter.introSlides, () => {
      this.beginExpeditionCombat(chapter.biomeId);
    });
  }

  startExpedition(biomeId: BiomeId): void {
    if (!this.state.data.unlockedBiomes.includes(biomeId)) return;
    this.activeStoryChapter = null;
    this.activePerks = [];
    this.prepareBiomeDiorama(biomeId);
    this.beginExpeditionCombat(biomeId);
  }

  startRoguelite(): void {
    this.activeStoryChapter = null;
    this.activePerks = [];
    this.rogueliteWave = 1;
    this.prepareBiomeDiorama('eclipse-citadel');
    this.mode = 'roguelite';
    this.sound.setMusicMood('combat');
    this.spawnRogueliteWave(1);
    this.onBanner?.(`${t('mode.roguelite')} — ${t('hud.wave')} 1`, 'info');
    this.emitHud();
  }

  startTitanHunt(): void {
    this.clearWorld();
    this.activeStoryChapter = null;
    this.activePerks = [];
    this.mode = 'titan-hunt';
    this.titanElapsed = 0;
    this.sceneManager.setSkyTheme(0x2c82c9, 0x9be7ff);
    this.weather.setBiomeAtmosphere('clear', 0x2c82c9, 0x9be7ff);
    this.titanStage = new TitanHuntStage(this.brickEngine);
    this.sceneManager.scene.add(this.titanStage.group);
    this.spawnHeroes(new THREE.Vector3(0, 0, 12));
    this.sound.setMusicMood('combat');
    this.onBanner?.(t('banner.titanStart'), 'info');
    this.emitHud();
  }

  pickRoguelitePerk(perkId: RoguelitePerkId): void {
    this.activePerks.push(perkId);
    if (perkId === 'vampiric-pips') {
      for (const h of this.heroes) {
        h.maxHearts += 1;
        h.heal(h.maxHearts);
      }
    }
    this.paused = false;
    this.rogueliteWave += 1;
    this.sound.playVictory();
    this.spawnRogueliteWave(this.rogueliteWave);
    this.emitHud();
  }

  private prepareBiomeDiorama(biomeId: BiomeId): void {
    this.clearWorld();
    this.activeBiomeId = biomeId;
    const biome = BIOMES[biomeId];
    this.sceneManager.setSkyTheme(biome.skyTop, biome.skyBottom);
    this.weather.setBiomeAtmosphere(this.weatherForBiome(biomeId), biome.skyTop, biome.skyBottom);
    this.stage = new ExpeditionStage(biome, this.brickEngine, this.blueprints);
    this.sceneManager.scene.add(this.stage.group);
    this.spawnHeroes(new THREE.Vector3(0, 0, 10));
  }

  private beginExpeditionCombat(biomeId: BiomeId): void {
    this.mode = 'expedition';
    this.activeCutscene = null;
    this.currentWave = 0;
    const biome = BIOMES[biomeId];
    this.spawnWave(0);
    this.sound.playBrickSnap();
    this.onBanner?.(`${biome.name} — ${t('hud.wave')} 1/${biome.waves.length}`, 'info');
    this.emitHud();
  }

  private playCutscene(slides: CutsceneSlide[], onComplete: () => void): void {
    this.mode = 'cutscene';
    this.cutsceneTime = 0;
    this.activeCutscene = { slides, index: 0, onComplete };
    this.sound.playVisorScan();
    this.emitHud();
  }

  advanceCutscene(): void {
    if (!this.activeCutscene) return;
    this.activeCutscene.index += 1;
    this.sound.playBrickSnap();
    if (this.activeCutscene.index >= this.activeCutscene.slides.length) {
      const cb = this.activeCutscene.onComplete;
      this.activeCutscene = null;
      cb();
    } else {
      this.emitHud();
    }
  }

  skipCutscene(): void {
    if (!this.activeCutscene) return;
    const cb = this.activeCutscene.onComplete;
    this.activeCutscene = null;
    cb();
  }

  togglePhotoMode(): void {
    if (this.mode === 'title' || this.mode === 'cutscene') return;
    this.photoMode = !this.photoMode;
    this.photoAngle = 0;
    this.photoZoom = 1.0;
    this.emitHud();
  }

  capturePhotoPng(): string {
    this.sceneManager.render(this.camera.camera);
    return this.sceneManager.renderer.domElement.toDataURL('image/png');
  }

  cycleDayNight(): void {
    this.weather.cycleTimePhase();
    this.sound.playBrickSnap();
    this.emitHud();
  }

  toggleMusic(): void {
    this.sound.musicEnabled = !this.sound.musicEnabled;
    this.emitHud();
  }

  saveBrickLabSculpture(voxels: SculptureVoxel[]): void {
    this.state.saveSculpture(voxels);
    this.hubWorld?.updateSculpture(voxels);
    this.sound.playBuild();
  }

  selectP1WeaponMode(mode: WeaponModeId): void {
    const h = this.heroes[0];
    if (!h) return;
    h.setWeaponMode(mode);
    this.sound.playWeaponSwitch();
    this.emitHud();
  }

  triggerP1QuickBuild(id: QuickBuildId): void {
    const h = this.heroes[0];
    if (!h) return;
    const aimDir = new THREE.Vector3(Math.sin(h.facing), 0, Math.cos(h.facing));
    this.handleQuickBuild(h, id, aimDir);
  }

  toggleCoop(): void {
    this.coopActive = !this.coopActive;
    if (this.coopActive && this.heroes.length === 1) {
      const p2Id = this.state.data.selectedHeroP2;
      const p2 = new HeroController(
        1,
        p2Id,
        this.state.data.heroProgress[p2Id].outfit,
        this.state.getHeroMaxHearts(p2Id),
        this.state.hasMod('big-head'),
        this.heroes[0].pos.clone().add(new THREE.Vector3(1.8, 0, 0)),
        this.blueprints,
        this.sceneManager.scene,
      );
      this.heroes.push(p2);
      this.fx.spawnBrickBurst(p2.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan], 14);
      this.sound.playBrickSnap();
      this.onBanner?.(t('hud.coopActive'), 'info');
    } else if (!this.coopActive && this.heroes.length > 1) {
      const removed = this.heroes.pop();
      removed?.dispose();
    }
    this.emitHud();
  }

  refreshHeroVisuals(): void {
    const bigHead = this.state.hasMod('big-head');
    for (const h of this.heroes) {
      const id = h.playerIndex === 0 ? this.state.data.selectedHeroP1 : this.state.data.selectedHeroP2;
      h.rebuildVisual(id, this.state.data.heroProgress[id].outfit, this.state.getHeroMaxHearts(id), bigHead);
    }
    this.emitHud();
  }

  customizeHubPlot(plotId: string, theme: PlotThemeId): boolean {
    const ok = this.state.customizePlot(plotId, theme);
    if (ok && this.hubWorld) {
      const st = this.state.data.plots[plotId];
      this.hubWorld.rebuildPlot(plotId, theme, true, st?.addon ?? 'none');
      const plotDef = HUB_PLOTS.find((p) => p.id === plotId);
      if (plotDef) {
        this.fx.spawnBrickBurst(
          new THREE.Vector3(plotDef.position[0], 1.5, plotDef.position[2]),
          [BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan],
          18,
        );
      }
      this.sound.playBrickSnap();
      this.emitHud();
    }
    return ok;
  }

  installHubAddon(plotId: string, addonId: HouseAddonId): boolean {
    const ok = this.state.installPlotAddon(plotId, addonId);
    if (ok && this.hubWorld) {
      const st = this.state.data.plots[plotId];
      this.hubWorld.rebuildPlot(plotId, st.theme, st.built, st.addon);
      this.sound.playBrickSnap();
      this.emitHud();
    }
    return ok;
  }

  buyOrEquipOutfit(heroId: HeroId, outfitId: OutfitId): boolean {
    const ok = this.state.buyOrEquipOutfit(heroId, outfitId);
    if (ok) {
      this.refreshHeroVisuals();
      this.sound.playBrickSnap();
    }
    return ok;
  }

  toggleModBlock(modId: ModBlockId): boolean {
    const ok = this.state.toggleMod(modId);
    if (ok) {
      this.refreshHeroVisuals();
      this.sound.playBrickSnap();
    }
    return ok;
  }

  private applyVillageWaveBonuses(): void {
    // Botanic Greenhouse: spawns an extra heart berry every wave!
    if (this.state.isPlotBuilt('botanic-dome')) {
      this.pipManager.spawnHeartBerry(new THREE.Vector3(0, 0, 7.5));
    }
    // Star Observatory: automatically highlights all beast weak points at wave start!
    if (this.state.isPlotBuilt('star-observatory')) {
      for (const b of this.beasts) b.applyVisorHighlight(4.5);
    }
  }

  private spawnWave(waveIdx: number): void {
    for (const b of this.beasts) b.dispose(this.sceneManager.scene);
    this.beasts = [];

    const biome = BIOMES[this.activeBiomeId];
    const wave = biome.waves[waveIdx];
    if (!wave) return;

    let spawnCount = 0;
    let hasBoss = false;
    for (const group of wave) {
      this.state.discoverBeast(group.beastId);
      for (let i = 0; i < group.count; i++) {
        const angle = (spawnCount / 6) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 10 + Math.random() * 4;
        const pos = new THREE.Vector3(Math.cos(angle) * dist, 0, -Math.abs(Math.sin(angle) * dist) - 2);
        const beast = new SynthBeast(group.beastId, pos, this.blueprints, this.sceneManager.scene);
        if (beast.def.isBoss) hasBoss = true;
        this.beasts.push(beast);
        this.fx.spawnBrickBurst(pos, [beast.def.armorColor, beast.def.glowColor], 12);
        spawnCount++;
      }
    }

    this.sound.setMusicMood(hasBoss ? 'boss' : 'combat');
    this.pipManager.spawnSpecialOrb(new THREE.Vector3((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 8));
    this.applyVillageWaveBonuses();
  }

  private spawnRogueliteWave(waveNum: number): void {
    for (const b of this.beasts) b.dispose(this.sceneManager.scene);
    this.beasts = [];

    const isBossWave = waveNum % 3 === 0;
    const nonBossPool: BeastId[] = [
      'opti-raptor',
      'solar-stag',
      'volt-crab',
      'stalker-lynx',
      'cryo-mammoth',
      'magma-beetle',
      'aero-hawk',
    ];
    const count = isBossWave ? 2 : Math.min(7, 2 + waveNum);

    for (let i = 0; i < count; i++) {
      const id: BeastId =
        isBossWave && i === 0
          ? waveNum % 6 === 0
            ? 'apex-rex'
            : 'pyro-wyvern'
          : nonBossPool[(waveNum + i * 2) % nonBossPool.length];
      this.state.discoverBeast(id);
      const angle = (i / Math.max(1, count)) * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(angle) * 11, 0, -Math.abs(Math.sin(angle) * 10) - 2);
      const beast = new SynthBeast(id, pos, this.blueprints, this.sceneManager.scene);
      beast.maxHp = Math.round(beast.maxHp * (1 + (waveNum - 1) * 0.14));
      beast.hp = beast.maxHp;
      this.beasts.push(beast);
    }

    this.sound.setMusicMood(isBossWave ? 'boss' : 'combat');
    this.pipManager.spawnSpecialOrb(new THREE.Vector3(0, 0, 2));
    this.applyVillageWaveBonuses();
  }

  private emitDamagePopup(worldPos: THREE.Vector3, text: string, color: string, large = false): void {
    if (!this.onDamageNumber || !this.state.data.settings.damageNumbers) return;
    this.projVec.copy(worldPos).add(new THREE.Vector3(0, 1.8, 0)).project(this.camera.camera);
    const { width, height } = this.sceneManager.renderer.domElement.getBoundingClientRect();
    const screenX = (this.projVec.x * 0.5 + 0.5) * width;
    const screenY = (-this.projVec.y * 0.5 + 0.5) * height;
    this.onDamageNumber({ screenX, screenY, text, color, large });
  }

  private handleHeroDash(hero: HeroController): void {
    this.sound.playDash();
    const col = WEAPON_MODES[hero.weaponMode].color;
    this.fx.spawnBrickBurst(hero.pos, [col, BRICK_PALETTE.pureWhite, BRICK_PALETTE.visorCyan], 10, 5.5, 0.25);

    if (this.activePerks.includes('dash-fire')) {
      this.triggerExplosion(hero.pos.clone(), 3.4, 42, 'fire', hero.playerIndex);
    }

    // Check Perfect Dodge! (Dashing within 2.5m of an enemy projectile or telegraphing beast)
    const nearDanger =
      this.projectileManager.projectiles.some(
        (p) => p.owner === 'enemy' && Math.hypot(p.pos.x - hero.pos.x, p.pos.z - hero.pos.z) < 2.8,
      ) ||
      this.beasts.some((b) => !b.dead && b.telegraphTimer > 0 && b.pos.distanceTo(hero.pos) < b.def.radius + 3.2);

    if (nearDanger) {
      this.bulletTimeTimer = 0.45;
      hero.perfectDodgeBuff = true;
      this.comboCount += 2;
      this.comboDecayTimer = 5.5;
      this.sound.playPerfectDodge();
      this.onBanner?.(t('banner.perfectDodge'), 'victory');
    }
  }

  private handleQuickBuild(hero: HeroController, buildId: QuickBuildId, aimDir: THREE.Vector3): void {
    const def = QUICK_BUILDS[buildId];
    if (this.state.data.pips < def.costPips) {
      this.onBanner?.(`${t('banner.needPips')} (${def.costPips} 🪙)`, 'warn');
      return;
    }
    this.state.data.pips -= def.costPips;
    this.state.save();

    const pos = hero.pos.clone().addScaledVector(aimDir, 2.5);
    pos.y = 0;

    let mesh: THREE.Group;
    if (buildId === 'shield-wall') {
      mesh = this.brickEngine.createBrick(3.0, 1.8, 0.65, def.color, { studs: true });
      mesh.position.set(pos.x, 0.9, pos.z);
      mesh.rotation.y = hero.facing;
    } else if (buildId === 'jump-pad') {
      mesh = this.brickEngine.createBrick(1.8, 0.35, 1.8, def.color, { studs: true, emissive: true });
      mesh.position.set(pos.x, 0.18, pos.z);
    } else {
      const elCol = ELEMENT_COLORS[hero.activeElement];
      mesh = this.brickEngine.createBrick(1.1, 1.3, 1.1, elCol, { studs: true, emissive: true });
      mesh.position.set(pos.x, 0.65, pos.z);
    }

    this.sceneManager.scene.add(mesh);
    this.quickStructures.push({
      kind: buildId,
      pos,
      mesh,
      hp: 4,
      life: 14,
      element: hero.activeElement === 'none' ? 'fire' : hero.activeElement,
      fireTimer: 0.35,
    });
    this.fx.spawnBrickBurst(pos, [def.color, BRICK_PALETTE.pureWhite], 12, 6);
    this.sound.playBuild();
  }

  private handleHeroAttack(hero: HeroController, aimDir: THREE.Vector3): void {
    const modeDef = WEAPON_MODES[hero.weaponMode];
    const perkMult = this.activePerks.includes('elem-mastery') ? 1.4 : 1.0;
    const dodgeMult = hero.perfectDodgeBuff ? 2.0 : 1.0;
    hero.perfectDodgeBuff = false;

    const dmg = Math.round(this.state.getHeroDamage(hero.heroId) * modeDef.damageMult * perkMult * dodgeMult);
    const el = hero.activeElement;
    const origin = hero.pos.clone().add(new THREE.Vector3(0, 1.05, 0)).addScaledVector(aimDir, 0.75);
    const pierce = this.activePerks.includes('ricochet');

    if (hero.heavyWeaponAmmo > 0) {
      hero.heavyWeaponAmmo -= 1;
      this.projectileManager.spawn({
        owner: 'player',
        playerIndex: hero.playerIndex,
        kind: 'disc',
        element: el === 'none' ? 'fire' : el,
        origin,
        dir: aimDir,
        speed: 26,
        damage: Math.round(dmg * 2.4),
        maxAge: 1.5,
      });
      this.sound.playShoot('disc');
      this.camera.triggerShake(0.24, 0.14);
      return;
    }

    const angles = this.activePerks.includes('multishot') ? [-0.18, 0, 0.18] : [0];
    const baseAng = Math.atan2(aimDir.x, aimDir.z);

    if (hero.heroId === 'bram') {
      this.sound.playShoot('hammer');
      this.camera.triggerShake(0.32, 0.18);
      const smashPos = hero.pos.clone().addScaledVector(aimDir, 2.1);
      this.triggerExplosion(smashPos, 3.8, dmg, el, hero.playerIndex);
    } else {
      const kind = hero.heroId === 'ayla' ? 'arrow' : hero.heroId === 'varn' ? 'spear' : 'bomb';
      for (const offset of angles) {
        const dir = new THREE.Vector3(Math.sin(baseAng + offset), 0, Math.cos(baseAng + offset));
        this.projectileManager.spawn({
          owner: 'player',
          playerIndex: hero.playerIndex,
          kind,
          element: el,
          origin,
          dir,
          speed: hero.def.projectileSpeed,
          damage: dmg,
          pierce: pierce || kind === 'spear',
          maxAge: kind === 'bomb' ? 0.95 : undefined,
        });
      }
      this.sound.playShoot(kind);
    }

    this.checkMeleeDestructibles(hero.pos, 3.2);
  }

  private handleHeroSpecial(hero: HeroController, aimDir: THREE.Vector3): void {
    if (this.activePerks.includes('rapid-special')) {
      hero.specialCooldown *= 0.55;
    }
    const dmg = Math.round(
      this.state.getHeroDamage(hero.heroId) * (this.activePerks.includes('elem-mastery') ? 1.4 : 1.0),
    );
    const el = hero.activeElement;
    const origin = hero.pos.clone().add(new THREE.Vector3(0, 1.15, 0));
    const baseAngle = Math.atan2(aimDir.x, aimDir.z);

    this.sound.playSpecial();
    this.camera.triggerShake(0.38, 0.22);
    const skillName = getLang() === 'it' ? hero.def.special.nameIt : hero.def.special.nameEn;
    this.onBanner?.(`${hero.def.special.icon} ${skillName}!`, 'info');

    if (hero.heroId === 'ayla') {
      for (let i = -3; i <= 3; i++) {
        const ang = baseAngle + i * 0.14;
        const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
        this.projectileManager.spawn({
          owner: 'player',
          playerIndex: hero.playerIndex,
          kind: 'arrow',
          element: el === 'none' ? 'shock' : el,
          origin,
          dir,
          speed: 31,
          damage: Math.round(dmg * 1.45),
        });
      }
      this.fx.spawnBrickBurst(origin, [ELEMENT_COLORS[el], BRICK_PALETTE.visorCyan], 18, 8);
    } else if (hero.heroId === 'varn') {
      for (let i = 0; i < 6; i++) {
        const ang = baseAngle + (i / 6) * Math.PI * 2;
        const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
        this.projectileManager.spawn({
          owner: 'player',
          playerIndex: hero.playerIndex,
          kind: 'spear',
          element: el === 'none' ? 'frost' : el,
          origin,
          dir,
          speed: 25,
          damage: Math.round(dmg * 1.55),
          pierce: true,
        });
      }
      this.fx.spawnBrickBurst(origin, [BRICK_PALETTE.limeGreen, ELEMENT_COLORS[el]], 22, 9);
    } else if (hero.heroId === 'tessa') {
      for (let i = -2; i <= 2; i++) {
        const ang = baseAngle + i * 0.26;
        const dir = new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang));
        this.projectileManager.spawn({
          owner: 'player',
          playerIndex: hero.playerIndex,
          kind: 'bomb',
          element: el === 'none' ? 'fire' : el,
          origin,
          dir,
          speed: 14 + Math.abs(i) * 2,
          damage: Math.round(dmg * 1.6),
          maxAge: 0.9,
        });
      }
    } else {
      hero.velY = 6.5;
      this.fx.spawnBrickBurst(hero.pos, [BRICK_PALETTE.sunsetOrange, BRICK_PALETTE.brightYellow, ELEMENT_COLORS[el]], 30, 11);
      for (const b of this.beasts) {
        if (!b.dead && b.pos.distanceTo(hero.pos) < 8.5) {
          const res = b.takeDamage(Math.round(dmg * 1.9), el === 'none' ? 'shock' : el, b.pos, true);
          this.handleBeastDamageResult(b, res, hero.playerIndex);
        }
      }
    }
  }

  private handleHeroVisor(hero: HeroController): void {
    this.fx.triggerVisorPulse(hero.pos);
    this.sound.playVisorScan();
    for (const b of this.beasts) {
      if (!b.dead) b.applyVisorHighlight(6.0);
    }
    if (this.mode === 'openworld' && this.openWorldStage) {
      this.relicRadarTimer = 6.5;
      let nearestDist = Infinity;
      for (const col of this.openWorldStage.collectibles) {
        if (col.collected) continue;
        const d = Math.hypot(col.pos.x - hero.pos.x, col.pos.z - hero.pos.z);
        if (d < nearestDist) nearestDist = d;
      }
      if (nearestDist < Infinity) {
        this.onBanner?.(`💎 ${t('banner.relicPing')} ${Math.round(nearestDist)}m!`, 'info');
      }
    }
  }

  private handleHeroInteract(hero: HeroController): void {
    if (this.mode === 'hub' && this.hubWorld) {
      if (this.hubWorld.isNearPortal(hero.pos)) {
        this.onOpenPanel?.('story');
        return;
      }
      if (this.hubWorld.isNearPedestal(hero.pos)) {
        this.onOpenPanel?.('brick-lab');
        return;
      }
      const plot = this.hubWorld.findNearestPlot(hero.pos);
      if (plot) {
        const st = this.state.data.plots[plot.id];
        if (st?.built) this.onOpenPanel?.('building', plot.id);
        else this.onOpenPanel?.('village', plot.id);
        return;
      }
    }

    // Underground Cave Exit Portal!
    if (this.mode === 'openworld' && this.caveStage) {
      if (this.caveStage.isNearExit(hero.pos)) {
        const ret = this.caveReturnPos ?? new THREE.Vector3(0, 0, 2);
        this.startOpenWorld(ret);
        return;
      }
    }

    // Open-World NPCs, Caves, Signal Towers & Return Portal!
    if (this.mode === 'openworld' && this.openWorldStage) {
      if (this.openWorldStage.isNearReturnPortal(hero.pos)) {
        this.enterHub();
        return;
      }
      const npc = this.openWorldStage.findNearestNpc(hero.pos);
      if (npc) {
        this.onOpenPanel?.('npc', npc.def.id);
        return;
      }
      const cave = this.openWorldStage.findNearestCave(hero.pos);
      if (cave) {
        this.enterCave(cave.def);
        return;
      }
      const tower = this.openWorldStage.findNearestUnactivatedTower(hero.pos);
      if (tower) {
        if (this.state.activateTower(tower.id)) {
          this.openWorldStage.markTowerActivated(tower.id);
          this.fx.triggerVisorPulse(tower.pos);
          this.fx.spawnBrickBurst(tower.pos.clone().setY(4), [BRICK_PALETTE.visorCyan, BRICK_PALETTE.brightYellow], 26, 10);
          this.sound.playVictory();
          this.onBanner?.(`${t('banner.towerActivated')} (+1 🟨, +350 🪙)`, 'victory');
          this.checkAchievements();
        }
        return;
      }
    }

    // Titan-Walker Beacon Hack!
    if (this.mode === 'titan-hunt' && this.titanStage && this.titanStage.allCollected) {
      if (hero.pos.distanceTo(this.titanStage.beaconPos) < 5.0) {
        this.state.recordTitanTime(this.titanElapsed);
        this.state.addCoreCubes(2);
        const pips = this.state.addPips(600);
        this.sound.playVictory();
        this.onBanner?.(`${t('banner.titanClear')} (${this.titanElapsed.toFixed(1)}s · +2 🟨, +${pips} 🪙)`, 'victory');
        this.enterHub(true);
        return;
      }
    }

    // Hack / Ride a Stunned Synth-Beast!
    const stunnedBeast = this.beasts.find(
      (b) => !b.dead && !b.def.isBoss && b.stunTimer > 0 && b.pos.distanceTo(hero.pos) < b.def.radius + 2.8,
    );
    if (stunnedBeast) {
      hero.mountTimer = 12.0;
      hero.mountName = stunnedBeast.def.name;
      stunnedBeast.dead = true;
      stunnedBeast.dispose(this.sceneManager.scene);
      this.state.recordStat('beasts_defeated', 1);
      this.fx.spawnBrickBurst(hero.pos, [BRICK_PALETTE.visorCyan, BRICK_PALETTE.brightYellow], 20, 8);
      this.sound.playCombo();
      this.onBanner?.(`🦖 ${t('banner.riding')} ${hero.mountName}!`, 'victory');
      return;
    }

    this.checkMeleeDestructibles(hero.pos, 3.2);
  }

  private checkMeleeDestructibles(origin: THREE.Vector3, radius: number): void {
    if (this.hubWorld) {
      for (const d of this.hubWorld.destructibles) {
        if (!d.smashed && d.pos.distanceTo(origin) < radius) {
          d.smashed = true;
          d.mesh.visible = false;
          d.respawnTimer = 14;
          this.fx.spawnBrickBurst(d.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.sunsetOrange], 14);
          this.pipManager.spawnPipShower(d.pos, 50);
          this.sound.playBrickSnap();
        }
      }
    }
    if (this.stage) {
      for (const c of this.stage.chests) {
        if (!c.opened && c.pos.distanceTo(origin) < radius) {
          c.opened = true;
          c.mesh.visible = false;
          this.state.recordStat('chests_opened', 1);
          this.fx.spawnBrickBurst(c.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.pipCobalt], 18);
          this.pipManager.spawnPipShower(c.pos, 250);
          this.pipManager.spawnHeartBerry(c.pos.clone().add(new THREE.Vector3(0.8, 0, 0)));
          this.sound.playBrickSnap();
        }
      }
    }
    if (this.openWorldStage) {
      for (const c of this.openWorldStage.chests) {
        if (!c.opened && c.pos.distanceTo(origin) < radius) {
          c.opened = true;
          c.mesh.visible = false;
          this.state.recordStat('chests_opened', 1);
          this.fx.spawnBrickBurst(c.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.pipCobalt], 20);
          this.pipManager.spawnPipShower(c.pos, 320);
          this.pipManager.spawnHeartBerry(c.pos.clone().add(new THREE.Vector3(0.8, 0, 0)));
          this.sound.playVictory();
        }
      }
    }
    if (this.caveStage) {
      for (const c of this.caveStage.chests) {
        if (!c.opened && c.pos.distanceTo(origin) < radius) {
          c.opened = true;
          c.mesh.visible = false;
          this.state.recordStat('chests_opened', 1);
          this.fx.spawnBrickBurst(c.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan], 20);
          this.pipManager.spawnPipShower(c.pos, 350);
          this.pipManager.spawnHeartBerry(c.pos.clone());
          this.sound.playVictory();
        }
      }
    }
  }

  private triggerExplosion(
    origin: THREE.Vector3,
    radius: number,
    damage: number,
    element: ElementType,
    playerIndex: number,
  ): void {
    const colors = this.state.hasMod('confetti-boom')
      ? [BRICK_PALETTE.brightRed, BRICK_PALETTE.brightYellow, BRICK_PALETTE.limeGreen, BRICK_PALETTE.skyBlue, BRICK_PALETTE.coralPink]
      : [ELEMENT_COLORS[element], BRICK_PALETTE.brightYellow, BRICK_PALETTE.sunsetOrange];
    this.fx.spawnBrickBurst(origin, colors, 22, 9.5, 0.4);
    this.sound.playExplosion();
    this.camera.triggerShake(0.36, 0.22);

    for (const b of this.beasts) {
      if (!b.dead && b.pos.distanceTo(origin) < radius + b.def.radius) {
        const res = b.takeDamage(damage, element, origin);
        this.handleBeastDamageResult(b, res, playerIndex);
      }
    }
  }

  private handleBeastDamageResult(
    beast: SynthBeast,
    res: ReturnType<SynthBeast['takeDamage']>,
    playerIndex: number,
  ): void {
    if (res.damageApplied > 0) {
      this.comboCount += 1;
      this.comboDecayTimer = 4.2;
      const color = res.comboTriggered
        ? '#facc15'
        : res.superEffective
          ? '#fb923c'
          : res.hitWeakPoint
            ? '#fde047'
            : '#f8fafc';
      this.emitDamagePopup(
        beast.pos,
        `${res.damageApplied}${res.comboTriggered || res.superEffective ? '!' : ''}`,
        color,
        Boolean(res.comboTriggered || res.weakPointBroken),
      );
    }

    if (res.comboTriggered) {
      const combo = ELEMENTAL_COMBOS[res.comboTriggered];
      this.state.recordStat('elemental_reactions', 1);
      this.hitStopTimer = 0.045;
      this.sound.playCombo();
      this.camera.triggerShake(0.42, 0.24);
      const label = getLang() === 'it' ? combo.nameIt : combo.nameEn;
      this.onBanner?.(`${combo.icon} ${label}`, 'victory');
      this.fx.spawnBrickBurst(beast.pos, [combo.color, BRICK_PALETTE.pureWhite, BRICK_PALETTE.visorCyan], 28, 11);

      // AoE splash on neighboring beasts
      for (const other of this.beasts) {
        if (other !== beast && !other.dead && other.pos.distanceTo(beast.pos) < combo.aoeRadius) {
          other.hp = Math.max(1, other.hp - Math.round(combo.bonusDamage * 0.65));
          other.stunTimer = Math.max(other.stunTimer, 1.4);
        }
      }
    } else if (res.superEffective) {
      this.state.recordStat('elemental_reactions', 1);
      this.sound.playSuperEffective();
      if (!res.weakPointBroken) {
        this.onBanner?.(`${t('banner.superEffective')} (${res.damageApplied})`, 'info');
      }
    }

    if (res.weakPointBroken) {
      this.state.recordStat('weakpoints_broken', 1);
      this.hitStopTimer = 0.04;
      this.sound.playWeakPointBreak();
      this.camera.triggerShake(0.32, 0.2);
      this.onBanner?.(`${t('banner.weakBreak')} (${res.weakPointBroken.label})`, 'info');
      this.fx.spawnBrickBurst(beast.pos, [res.weakPointBroken.color, BRICK_PALETTE.brightYellow], 20, 8.5);
      this.pipManager.spawnPipShower(beast.pos, 80);

      if (res.weakPointBroken.onBreak === 'fire-boom') {
        this.triggerExplosion(beast.pos.clone(), 5.0, 65, 'fire', playerIndex);
      } else if (res.weakPointBroken.onBreak === 'frost-nova') {
        this.triggerExplosion(beast.pos.clone(), 5.0, 55, 'frost', playerIndex);
      } else if (res.weakPointBroken.onBreak === 'drop-loot') {
        this.pipManager.spawnPipShower(beast.pos, 200);
        this.pipManager.spawnHeartBerry(beast.pos.clone());
      } else if (res.weakPointBroken.onBreak === 'drop-weapon') {
        this.pipManager.spawnHeavyWeaponDrop(beast.pos.clone().add(new THREE.Vector3(1.5, 0, 1.5)));
      }
    }

    if (res.killed) {
      this.state.recordBeastDefeated(beast.def.id, Boolean(beast.def.isBoss));
      if (beast.def.isBoss) {
        this.hitStopTimer = 0.06;
      }
      const heroId = playerIndex === 0 ? this.state.data.selectedHeroP1 : this.state.data.selectedHeroP2;
      this.state.addHeroXp(heroId, beast.def.xpReward);
      this.fx.spawnBrickBurst(beast.pos, [beast.def.armorColor, beast.def.chassisColor, beast.def.glowColor], 26, 9);
      this.pipManager.spawnPipShower(beast.pos, beast.def.pipReward);
      if (Math.random() < 0.45) this.pipManager.spawnHeartBerry(beast.pos.clone());
      beast.dispose(this.sceneManager.scene);
      this.sound.playExplosion();
      this.checkAchievements();
    }
  }

  private step(dt: number): void {
    this.weather.update(dt, this.sceneManager);

    if (this.comboDecayTimer > 0) {
      this.comboDecayTimer -= dt;
      if (this.comboDecayTimer <= 0) this.comboCount = 0;
    }

    if (this.mode === 'title') {
      this.hubWorld?.update(dt);
      this.fx.update(dt);
      this.camera.update(dt, [new THREE.Vector3(Math.sin(performance.now() * 0.0004) * 4, 0, 0)]);
      this.input.endFrame();
      return;
    }

    if (this.mode === 'cutscene' && this.activeCutscene) {
      this.cutsceneTime += dt;
      this.cutsceneFxTimer -= dt;
      const slide = this.activeCutscene.slides[this.activeCutscene.index];
      if (slide) {
        this.camera.updateCinematic(dt, slide.cameraPos, slide.cameraLook, this.cutsceneTime);
        if (this.cutsceneFxTimer <= 0) {
          this.cutsceneFxTimer = 1.65;
          const burstOrigin = new THREE.Vector3((Math.random() - 0.5) * 12, 3.5, (Math.random() - 0.5) * 10);
          this.fx.spawnBrickBurst(
            burstOrigin,
            [BRICK_PALETTE.sunsetOrange, BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan],
            14,
            7,
          );
          this.fx.triggerVisorPulse(new THREE.Vector3(0, 0, 0));
        }
      }
      this.stage?.update(dt, []);
      this.hubWorld?.update(dt);
      this.fx.update(dt);
      this.input.endFrame();
      return;
    }

    if (this.input.wasKeyJustPressed('Escape')) {
      this.onPauseToggle?.();
      this.input.endFrame();
      return;
    }

    if (this.input.wasKeyJustPressed('KeyP')) {
      this.togglePhotoMode();
      this.input.endFrame();
      return;
    }

    // Hub Fireworks if any house has the Firework Spire addon!
    if (this.mode === 'hub') {
      const hasFirework = Object.values(this.state.data.plots).some((p) => p.built && p.addon === 'firework-tower');
      if (hasFirework) {
        this.fireworkTimer -= dt;
        if (this.fireworkTimer <= 0) {
          this.fireworkTimer = 3.8;
          const pos = new THREE.Vector3((Math.random() - 0.5) * 16, 7.5 + Math.random() * 3, (Math.random() - 0.5) * 14);
          this.fx.spawnBrickBurst(
            pos,
            [BRICK_PALETTE.brightRed, BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan, BRICK_PALETTE.coralPink],
            16,
            6.5,
            0.32,
          );
        }
      }
    }

    if (!this.coopActive && this.input.shouldAutoJoinP2()) {
      this.toggleCoop();
    }

    const { width, height } = this.sceneManager.renderer.domElement.getBoundingClientRect();
    const hasMouseWorld =
      this.input.mouseClient.moved &&
      this.camera.screenToGround(this.input.mouseClient.x, this.input.mouseClient.y, width, height, this.mouseWorld);

    const arenaRadius = this.caveStage
      ? this.caveStage.arenaRadius
      : this.openWorldStage
        ? this.openWorldStage.worldRadius
        : this.stage
          ? this.stage.arenaRadius
          : this.titanStage
            ? this.titanStage.arenaRadius
            : 16.5;

    for (const hero of this.heroes) {
      const inp = this.input.pollPlayer(hero.playerIndex, hero.pos, hasMouseWorld ? this.mouseWorld : null);
      const inGrass = this.stage ? this.stage.isInsideStealthGrass(hero.pos) : false;
      hero.isSwimming = Boolean(this.mode === 'openworld' && this.openWorldStage && isOpenWorldWaterAt(hero.pos.x, hero.pos.z));
      hero.groundY =
        this.mode === 'openworld' && this.openWorldStage && !hero.isSwimming
          ? getOpenWorldElevationAt(hero.pos.x, hero.pos.z)
          : 0;
      if (hero.isSwimming) {
        hero.swimSplashTimer -= dt;
        if (hero.swimSplashTimer <= 0) {
          hero.swimSplashTimer = 0.24;
          this.fx.spawnBrickBurst(hero.pos, [BRICK_PALETTE.iceCyan, BRICK_PALETTE.pureWhite], 3, 2.8, 0.2);
        }
      }
      hero.update(dt, inp, arenaRadius, inGrass, {
        onAttack: (h, dir) => this.handleHeroAttack(h, dir),
        onDash: (h) => this.handleHeroDash(h),
        onSpecial: (h, dir) => this.handleHeroSpecial(h, dir),
        onWeaponSwitch: (_h, mode) => {
          this.sound.playWeaponSwitch();
          const def = WEAPON_MODES[mode];
          this.onBanner?.(`${def.icon} ${getLang() === 'it' ? def.nameIt : def.nameEn}`, 'info');
        },
        onVisor: (h) => this.handleHeroVisor(h),
        onInteract: (h) => this.handleHeroInteract(h),
        onQuickBuild: (h, bId, dir) => this.handleQuickBuild(h, bId, dir),
      });

      // Mounted Synth-Beast Ramming!
      if (hero.mountTimer > 0) {
        for (const b of this.beasts) {
          if (!b.dead && b.pos.distanceTo(hero.pos) < b.def.radius + 1.45) {
            const res = b.takeDamage(35, 'fire', b.pos);
            this.handleBeastDamageResult(b, res, hero.playerIndex);
          }
        }
      }
    }

    // Update Quick-Build structures (Jump-Pads, Turrets, Shield Walls)
    for (let i = this.quickStructures.length - 1; i >= 0; i--) {
      const q = this.quickStructures[i];
      q.life -= dt;
      if (q.kind === 'jump-pad') {
        for (const h of this.heroes) {
          if (!h.downed && h.pos.y < 0.4 && Math.hypot(h.pos.x - q.pos.x, h.pos.z - q.pos.z) < 1.35) {
            h.velY = 14.5;
            this.sound.playDash();
          }
        }
      } else if (q.kind === 'elem-turret') {
        q.mesh.rotation.y += dt * 2.5;
        q.fireTimer -= dt;
        if (q.fireTimer <= 0) {
          q.fireTimer = 0.55;
          const target = this.beasts.find((b) => !b.dead);
          if (target) {
            const dir = target.pos.clone().sub(q.pos).setY(0).normalize();
            this.projectileManager.spawn({
              owner: 'player',
              kind: 'turret-pip',
              element: q.element,
              origin: q.pos.clone().setY(1.1),
              dir,
              speed: 22,
              damage: 24,
            });
            this.sound.playShoot('arrow');
          }
        }
      }
      if (q.life <= 0 || q.hp <= 0) {
        this.fx.spawnBrickBurst(q.pos, [BRICK_PALETTE.lightGray, BRICK_PALETTE.skyBlue], 10);
        this.sceneManager.scene.remove(q.mesh);
        this.quickStructures.splice(i, 1);
      }
    }

    // Titan-Walker Hunt updates
    if (this.mode === 'titan-hunt' && this.titanStage) {
      this.titanElapsed += dt;
      this.titanStage.update(dt);
      for (const h of this.heroes) {
        for (const jp of this.titanStage.jumpPads) {
          if (h.pos.y < 0.4 && Math.hypot(h.pos.x - jp.x, h.pos.z - jp.z) < 1.4) {
            h.velY = 14.5;
            this.sound.playDash();
          }
        }
        for (const gb of this.titanStage.goldenBricks) {
          if (!gb.collected && Math.hypot(h.pos.x - gb.pos.x, h.pos.z - gb.pos.z) < 1.6) {
            gb.collected = true;
            gb.mesh.visible = false;
            this.fx.spawnBrickBurst(gb.pos, [BRICK_PALETTE.brightYellow, BRICK_PALETTE.visorCyan], 18);
            this.sound.playPip(500);
            if (this.titanStage.allCollected) {
              this.onBanner?.(t('banner.titanReady'), 'victory');
            }
          }
        }
      }
    }

    if (this.heroes.length === 2) {
      const [h1, h2] = this.heroes;
      if (h1.downed && !h2.downed && h1.pos.distanceTo(h2.pos) < 2.2) {
        h1.heal(Math.ceil(h1.maxHearts / 2));
        this.sound.playBrickSnap();
      } else if (h2.downed && !h1.downed && h1.pos.distanceTo(h2.pos) < 2.2) {
        h2.heal(Math.ceil(h2.maxHearts / 2));
        this.sound.playBrickSnap();
      }
    }

    const hazards = this.stage ? this.stage.hazards : this.openWorldStage ? this.openWorldStage.hazards : [];
    this.projectileManager.update(
      dt,
      hazards,
      (proj) => {
        this.sound.playInfuse();
        this.fx.spawnBrickBurst(proj.pos, [ELEMENT_COLORS[proj.element]], 8, 4.5, 0.24);
        this.onBanner?.(t('banner.infused'), 'info');
      },
      (bomb) => {
        this.triggerExplosion(bomb.pos, 3.8, bomb.damage, bomb.element === 'none' ? 'fire' : bomb.element, bomb.playerIndex);
      },
      (barrel, proj) => {
        barrel.destroyed = true;
        barrel.mesh.visible = false;
        this.triggerExplosion(barrel.pos, 5.5, 95, 'fire', proj.playerIndex);
      },
    );

    for (let i = this.projectileManager.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectileManager.projectiles[i];
      if (p.owner === 'player') {
        this.checkMeleeDestructibles(p.pos, 1.3);

        for (const b of this.beasts) {
          if (b.dead) continue;
          if (Math.hypot(p.pos.x - b.pos.x, p.pos.z - b.pos.z) < b.def.radius + p.radius) {
            const res = b.takeDamage(p.damage, p.element, p.pos);
            this.handleBeastDamageResult(b, res, p.playerIndex);
            this.fx.spawnBrickBurst(p.pos, [ELEMENT_COLORS[p.element], b.def.armorColor], 7, 5, 0.24);
            if (!p.pierce) {
              this.projectileManager.removeAt(i);
            }
            break;
          }
        }
      } else {
        // Check Quick-Build Shield Walls blocking enemy bolts!
        let blocked = false;
        for (const q of this.quickStructures) {
          if (q.kind === 'shield-wall' && Math.hypot(p.pos.x - q.pos.x, p.pos.z - q.pos.z) < 1.8) {
            q.hp -= 1;
            this.fx.spawnBrickBurst(p.pos, [BRICK_PALETTE.skyBlue, BRICK_PALETTE.pureWhite], 8);
            this.sound.playBrickSnap();
            this.projectileManager.removeAt(i);
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        for (const h of this.heroes) {
          if (h.downed || h.isDashing) continue;
          if (Math.hypot(p.pos.x - h.pos.x, p.pos.z - h.pos.z) < 0.85 + p.radius && h.pos.y < 1.3) {
            if (h.takeDamage(p.damage)) {
              this.sound.playHurt();
              this.camera.triggerShake(0.3, 0.18);
            }
            this.projectileManager.removeAt(i);
            break;
          }
        }
      }
    }

    for (const b of this.beasts) {
      if (b.dead) continue;
      let target: THREE.Vector3 | null = null;
      let bestD = Infinity;
      for (const h of this.heroes) {
        if (h.downed || h.inStealthGrass) continue;
        const d = h.pos.distanceTo(b.pos);
        if (d < bestD) {
          bestD = d;
          target = h.pos;
        }
      }
      b.update(dt, target, arenaRadius, (beast, tgt) => {
        const dir = tgt.clone().sub(beast.pos).setY(0).normalize();
        if (beast.def.attackRange > 4.5) {
          this.projectileManager.spawn({
            owner: 'enemy',
            kind: beast.def.isBoss ? 'disc' : 'enemy-bolt',
            origin: beast.pos.clone().setY(beast.pos.y + (beast.def.flying ? 2.0 : 1.2)),
            dir,
            speed: beast.def.isBoss ? 15 : 13,
            damage: beast.def.attackDamage,
            maxAge: 2.2,
          });
          this.sound.playShoot('disc');
        } else {
          for (const h of this.heroes) {
            if (!h.downed && !h.isDashing && h.pos.distanceTo(beast.pos) < beast.def.radius + 2.0 && Math.abs(h.pos.y - beast.pos.y) < 1.5) {
              if (h.takeDamage(beast.def.attackDamage)) {
                this.sound.playHurt();
                this.camera.triggerShake(0.3, 0.2);
              }
            }
          }
        }
      });
      if (this.mode === 'openworld' && this.openWorldStage) {
        b.pos.y = getOpenWorldElevationAt(b.pos.x, b.pos.z);
        b.rig.root.position.y = b.pos.y;
      }
    }

    // Wave / Mode completion checks
    if ((this.mode === 'expedition' || this.mode === 'roguelite') && this.stage) {
      const aliveBeasts = this.beasts.filter((b) => !b.dead).length;
      const allDowned = this.heroes.every((h) => h.downed);

      if (allDowned) {
        if (this.mode === 'roguelite') {
          this.state.recordRogueliteWave(this.rogueliteWave);
          this.onBanner?.(`${t('banner.rogueliteEnd')} (${t('hud.wave')} ${this.rogueliteWave})`, 'warn');
          this.enterHub(true);
        } else {
          this.onBanner?.(t('banner.checkpoint'), 'warn');
          for (const h of this.heroes) {
            h.heal(h.maxHearts);
            h.pos.set(h.playerIndex === 0 ? -1.5 : 1.5, 0, 10);
          }
          this.spawnWave(this.currentWave);
        }
      } else if (aliveBeasts === 0) {
        if (this.mode === 'roguelite') {
          this.state.recordRogueliteWave(this.rogueliteWave);
          this.state.addPips(180 + this.rogueliteWave * 40);
          if (this.rogueliteWave % 3 === 0) this.state.addCoreCubes(1);
          this.paused = true;
          // Offer 3 random Roguelite perks!
          const shuffled = [...ROGUELITE_PERKS].sort(() => Math.random() - 0.5).slice(0, 3);
          this.onRogueliteOffer?.(shuffled);
        } else {
          const biome = BIOMES[this.activeBiomeId];
          if (this.currentWave + 1 < biome.waves.length) {
            this.currentWave += 1;
            this.onBanner?.(`${t('banner.waveClear')} → ${t('hud.wave')} ${this.currentWave + 1}/${biome.waves.length}`, 'info');
            this.sound.playVictory();
            this.spawnWave(this.currentWave);
          } else {
            const reward = this.state.completeBiome(this.activeBiomeId);
            const windmillBonus = this.state.isPlotBuilt('block-windmill') ? this.state.addPips(150) : 0;
            this.sound.playVictory();
            this.onBanner?.(
              `${t('banner.victory')} +${reward.cubes} 🟨, +${reward.pips + windmillBonus} 🪙!`,
              'victory',
            );
            if (this.activeStoryChapter) {
              const chapter = this.activeStoryChapter;
              this.state.completeChapter(chapter.id);
              this.playCutscene(chapter.outroSlides, () => {
                this.enterHub(true);
              });
            } else {
              this.enterHub(true);
            }
          }
        }
      }
    }

    const heroPositions = this.heroes.map((h) => h.pos);
    const magnetRadius = this.state.hasMod('pip-magnet') ? 8.5 : 4.2;
    this.pipManager.update(
      dt,
      heroPositions,
      magnetRadius,
      (val) => {
        this.state.addPips(val);
        this.sound.playPip(val);
      },
      (hIdx, pickup) => {
        const hero = this.heroes[hIdx];
        if (!hero) return;
        if (pickup.kind === 'heart') {
          hero.heal(2);
          this.sound.playPip(200);
        } else if (pickup.kind === 'special-orb') {
          hero.rechargeSpecial();
          hero.heal(1);
          this.sound.playSpecial();
          this.onBanner?.(t('banner.specialReady'), 'info');
        } else if (pickup.kind === 'heavy-weapon') {
          hero.heavyWeaponAmmo = 5;
          this.sound.playWeakPointBreak();
          this.onBanner?.(`${t('hud.heavy')} (5x)!`, 'info');
        }
      },
    );

    // Underground Cavern completion check!
    if (this.mode === 'openworld' && this.caveStage) {
      this.caveStage.update(dt);
      const alive = this.beasts.filter((b) => !b.dead).length;
      if (alive === 0 && !this.state.data.clearedCaves.includes(this.caveStage.def.id)) {
        if (this.state.markCaveCleared(this.caveStage.def.id, this.caveStage.def.rewardPips)) {
          this.sound.playVictory();
          this.onBanner?.(`${t('banner.caveCleared')} (+1 🟨, +${this.caveStage.def.rewardPips} 🪙)`, 'victory');
          this.checkAchievements();
        }
      }
    }

    // Open-World region discovery, hidden collectibles, dynamic weather & roaming Synth-Beast spawns!
    if (this.mode === 'openworld' && this.openWorldStage && this.heroes[0]) {
      this.openWorldStage.update(dt);
      if (this.relicRadarTimer > 0) this.relicRadarTimer = Math.max(0, this.relicRadarTimer - dt);
      const p1 = this.heroes[0];

      // Check Hidden Collectible pickups!
      for (const col of this.openWorldStage.collectibles) {
        if (col.collected) continue;
        if (this.heroes.some((h) => !h.downed && Math.hypot(h.pos.x - col.pos.x, h.pos.z - col.pos.z) < 1.9)) {
          col.collected = true;
          col.mesh.visible = false;
          const res = this.state.collectRelic(col.def.id);
          this.fx.spawnBrickBurst(col.pos, [col.def.color, BRICK_PALETTE.brightYellow, BRICK_PALETTE.pureWhite], 24, 9);
          this.sound.playVictory();
          const name = getLang() === 'it' ? col.def.nameIt : col.def.nameEn;
          const bonus = res.bonusCube ? ' +1 🟨!' : '';
          this.onBanner?.(`💎 ${name} (${res.total}/20 · +250 🪙, +1 ⏳${bonus})`, 'victory');
          this.checkAchievements();
        }
      }

      const reg = getOpenWorldRegionAt(p1.pos.x, p1.pos.z);
      if (reg.id !== this.currentRegionId) {
        this.currentRegionId = reg.id;
        this.weather.setBiomeAtmosphere(reg.weather, reg.skyTop, reg.skyBottom);
        const discovered = this.state.discoverRegion(reg.id);
        const regName = getLang() === 'it' ? reg.nameIt : reg.nameEn;
        this.onBanner?.(discovered ? `🗺️ ${t('banner.regionDiscovered')} ${regName}!` : `🧭 ${regName}`, discovered ? 'victory' : 'info');
        if (discovered) this.checkAchievements();
      }

      if (this.heroes.every((h) => h.downed)) {
        for (const h of this.heroes) {
          h.heal(h.maxHearts);
          h.pos.set(0, 0, 2);
        }
        this.onBanner?.(t('banner.openWorldRespawn'), 'warn');
      }

      const aliveNearby = this.beasts.filter((b) => !b.dead && b.pos.distanceTo(p1.pos) < 36);
      this.openWorldSpawnTimer -= dt;
      if (reg.id !== 'meadow' && reg.id !== 'ocean' && aliveNearby.length < 4 && this.openWorldSpawnTimer <= 0) {
        this.openWorldSpawnTimer = 3.2;
        const spawnBoss = Boolean(reg.bossId && !aliveNearby.some((b) => b.def.isBoss) && Math.random() < 0.25);
        const beastId = spawnBoss && reg.bossId ? reg.bossId : reg.beasts[Math.floor(Math.random() * reg.beasts.length)];
        this.state.discoverBeast(beastId);
        const ang = Math.random() * Math.PI * 2;
        const bx = THREE.MathUtils.clamp(p1.pos.x + Math.cos(ang) * 14, -204, 204);
        const bz = THREE.MathUtils.clamp(p1.pos.z + Math.sin(ang) * 14, -204, 204);
        const spawnPos = new THREE.Vector3(bx, getOpenWorldElevationAt(bx, bz), bz);
        if (!isOpenWorldWaterAt(spawnPos.x, spawnPos.z)) {
          const b = new SynthBeast(beastId, spawnPos, this.blueprints, this.sceneManager.scene);
          this.beasts.push(b);
          this.sound.setMusicMood(b.def.isBoss ? 'boss' : 'combat');
        }
      } else if ((reg.id === 'meadow' || reg.id === 'ocean') && aliveNearby.length === 0) {
        this.sound.setMusicMood('hub');
      }
    }

    this.hubWorld?.update(dt);
    this.stage?.update(dt, heroPositions);
    this.fx.update(dt);
    this.camera.update(dt, heroPositions);
    this.input.endFrame();
    this.emitHud();
  }

  private emitHud(): void {
    if (!this.onHudUpdate) return;
    const boss = this.beasts.find((b) => !b.dead && b.def.isBoss) ?? null;

    let promptText: string | null = null;
    const p1 = this.heroes[0];
    if (this.mode === 'hub' && this.hubWorld && p1) {
      if (this.hubWorld.isNearPortal(p1.pos)) {
        promptText = t('hud.promptPortal');
      } else if (this.hubWorld.isNearPedestal(p1.pos)) {
        promptText = t('hud.promptBrickLab');
      } else {
        const nearPlot = this.hubWorld.findNearestPlot(p1.pos);
        if (nearPlot) {
          const built = this.state.isPlotBuilt(nearPlot.id);
          promptText = built ? `${t('hud.promptEnterBuilding')} ${nearPlot.name}` : `${t('hud.promptPlot')} ${nearPlot.name}`;
        }
      }
    } else if (this.mode === 'openworld' && this.caveStage && p1) {
      if (this.caveStage.isNearExit(p1.pos)) promptText = t('hud.promptExitCave');
    } else if (this.mode === 'openworld' && this.openWorldStage && p1) {
      if (this.openWorldStage.isNearReturnPortal(p1.pos)) {
        promptText = t('hud.promptReturnHub');
      } else {
        const npc = this.openWorldStage.findNearestNpc(p1.pos);
        const cave = this.openWorldStage.findNearestCave(p1.pos);
        const tw = this.openWorldStage.findNearestUnactivatedTower(p1.pos);
        if (npc) promptText = `💬 ${t('hud.promptTalk')} ${npc.def.name}`;
        else if (cave) promptText = `🕳️ ${t('hud.promptEnterCave')} ${getLang() === 'it' ? cave.def.nameIt : cave.def.nameEn}`;
        else if (tw) promptText = t('hud.promptTower');
      }
    } else if (this.mode === 'titan-hunt' && this.titanStage && p1) {
      if (this.titanStage.allCollected && p1.pos.distanceTo(this.titanStage.beaconPos) < 5.2) {
        promptText = t('hud.promptTitanHack');
      }
    } else if (p1) {
      const stunned = this.beasts.find(
        (b) => !b.dead && !b.def.isBoss && b.stunTimer > 0 && b.pos.distanceTo(p1.pos) < b.def.radius + 2.8,
      );
      if (stunned) promptText = `🦖 ${t('hud.promptRide')} ${stunned.def.name}!`;
    }

    const modeTitle =
      this.mode === 'openworld'
        ? t('mode.openWorld')
        : this.mode === 'roguelite'
          ? t('mode.roguelite')
          : this.mode === 'titan-hunt'
            ? t('mode.titanHunt')
            : this.mode === 'expedition'
              ? BIOMES[this.activeBiomeId].name
              : t('hud.hub');

    const trackedDef = this.state.data.trackedQuestId
      ? COMMUNITY_QUESTS.find((q) => q.id === this.state.data.trackedQuestId) ?? null
      : null;
    const trackedQuest = trackedDef
      ? {
          titleKey: trackedDef.titleKey,
          current: Math.min(this.state.data.stats[trackedDef.metric] ?? 0, trackedDef.target),
          target: trackedDef.target,
          completed: (this.state.data.stats[trackedDef.metric] ?? 0) >= trackedDef.target,
        }
      : null;

    const owRegion =
      this.mode === 'openworld' && p1 ? getOpenWorldRegionAt(p1.pos.x, p1.pos.z) : null;
    const openWorldMap =
      this.mode === 'openworld' && this.openWorldStage && p1 && owRegion
        ? {
            playerX: p1.pos.x,
            playerZ: p1.pos.z,
            worldRadius: this.openWorldStage.worldRadius,
            regionName: getLang() === 'it' ? owRegion.nameIt : owRegion.nameEn,
            towers: this.openWorldStage.towers.map((tw) => ({
              x: tw.pos.x,
              z: tw.pos.z,
              activated: tw.activated,
            })),
            chests: this.openWorldStage.chests.map((c) => ({
              x: c.pos.x,
              z: c.pos.z,
              opened: c.opened,
            })),
            caves: this.openWorldStage.caves.map((c) => ({ x: c.pos.x, z: c.pos.z })),
            npcs: this.openWorldStage.npcs.map((n) => ({ x: n.pos.x, z: n.pos.z })),
            collectibles:
              this.relicRadarTimer > 0
                ? this.openWorldStage.collectibles
                    .filter((col) => !col.collected && Math.hypot(col.pos.x - p1.pos.x, col.pos.z - p1.pos.z) < 90)
                    .map((col) => ({ x: col.pos.x, z: col.pos.z }))
                : [],
            collectedCount: this.state.data.collectedRelics.length,
            collectiblesTotal: this.openWorldStage.collectibles.length,
            beasts: this.beasts
              .filter((b) => !b.dead)
              .map((b) => ({ x: b.pos.x, z: b.pos.z, isBoss: Boolean(b.def.isBoss) })),
          }
        : null;

    this.onHudUpdate({
      mode: this.mode,
      pips: this.state.data.pips,
      coreCubes: this.state.data.coreCubes,
      biomeName: this.caveStage ? (getLang() === 'it' ? this.caveStage.def.nameIt : this.caveStage.def.nameEn) : modeTitle,
      waveIndex: this.mode === 'roguelite' ? this.rogueliteWave : this.currentWave + 1,
      waveTotal: this.mode === 'roguelite' ? 99 : BIOMES[this.activeBiomeId].waves.length,
      bossName: boss ? boss.def.name : null,
      bossHp: boss ? Math.ceil(boss.hp) : 0,
      bossMaxHp: boss ? boss.maxHp : 0,
      coopActive: this.coopActive,
      promptText,
      stealthActive: this.heroes.some((h) => h.inStealthGrass),
      swimmingActive: this.heroes.some((h) => h.isSwimming),
      photoMode: this.photoMode,
      dayPhase: this.weather.getPhaseLabel(),
      musicEnabled: this.sound.musicEnabled,
      comboCount: this.comboCount,
      titanProgress: this.titanStage
        ? {
            collected: this.titanStage.collectedCount,
            total: this.titanStage.goldenBricks.length,
            elapsed: this.titanElapsed,
          }
        : null,
      activePerks: this.activePerks,
      trackedQuest,
      openWorldMap,
      cutsceneSlide: this.activeCutscene ? this.activeCutscene.slides[this.activeCutscene.index] ?? null : null,
      cutsceneIndex: this.activeCutscene ? this.activeCutscene.index + 1 : 0,
      cutsceneTotal: this.activeCutscene ? this.activeCutscene.slides.length : 0,
      players: this.heroes.map((h) => ({
        heroId: h.heroId,
        hearts: h.hearts,
        maxHearts: h.maxHearts,
        downed: h.downed,
        weaponMode: h.weaponMode,
        dashCooldown: h.dashCooldown,
        dashCooldownMax: h.dashCooldownMax,
        specialCooldown: h.specialCooldown,
        specialCooldownMax: h.def.special.cooldown,
        heavyAmmo: h.heavyWeaponAmmo,
        mountName: h.mountName,
        mountTimer: h.mountTimer,
        perfectDodgeBuff: h.perfectDodgeBuff,
      })),
    });
  }

  getTotalBeastsCount(): number {
    return BEAST_LIST.length;
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    this.sound.setMusicMood('off');
    this.clearWorld();
    this.input.dispose();
    this.brickEngine.dispose();
    this.sceneManager.dispose();
  }
}
