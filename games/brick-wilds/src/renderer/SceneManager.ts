import * as THREE from 'three';

/**
 * WebGLRenderer + bright diorama lighting (warm key sun + sky bounce + rim light).
 */
export class SceneManager {
  readonly scene: THREE.Scene;
  readonly renderer: THREE.WebGLRenderer;
  readonly sunLight: THREE.DirectionalLight;
  readonly hemiLight: THREE.HemisphereLight;
  private readonly container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6ec3e8);
    this.scene.fog = new THREE.FogExp2(0x88d4f2, 0.014);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.hemiLight = new THREE.HemisphereLight(0xdff6ff, 0x3b5249, 0.95);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff4d6, 2.0);
    this.sunLight.position.set(16, 28, 14);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 75;
    const d = 24;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);
  }

  setSkyTheme(topHex: number, bottomHex: number): void {
    this.scene.background = new THREE.Color(topHex);
    this.scene.fog = new THREE.FogExp2(bottomHex, 0.011);
    this.hemiLight.color.setHex(bottomHex);
  }

  applyQuality(level: 'low' | 'medium' | 'high'): void {
    const dpr = window.devicePixelRatio || 1;
    if (level === 'low') {
      this.renderer.setPixelRatio(Math.min(dpr, 1));
      this.renderer.shadowMap.enabled = false;
      this.sunLight.castShadow = false;
    } else if (level === 'medium') {
      this.renderer.setPixelRatio(Math.min(dpr, 1.5));
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    } else {
      this.renderer.setPixelRatio(Math.min(dpr, 2));
      this.renderer.shadowMap.enabled = true;
      this.sunLight.castShadow = true;
    }
    this.renderer.shadowMap.needsUpdate = true;
  }

  resize(): { width: number; height: number } {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    return { width, height };
  }

  render(camera: THREE.Camera): void {
    this.renderer.render(this.scene, camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
