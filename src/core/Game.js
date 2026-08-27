import * as THREE from 'three';

export class Game {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(1); // pixel-art: sem AA, sem upscale
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1520);
    this.scene.fog = new THREE.Fog(0x1a1520, 25, 60);

    this.clock = new THREE.Clock();
    this.systems = [];

    this._setupCamera();
    this._setupLights();
    this._onResize();
    window.addEventListener('resize', () => this._onResize());
  }

  _setupCamera() {
    this.viewSize = 16; // altura visível em unidades de mundo
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    // ângulo isométrico clássico
    this.cameraOffset = new THREE.Vector3(20, 22, 20);
    this.camera.position.copy(this.cameraOffset);
    this.camera.lookAt(0, 0, 0);
  }

  _setupLights() {
    this.scene.add(new THREE.HemisphereLight(0x5566aa, 0x221a22, 0.7));
    const sun = new THREE.DirectionalLight(0xffe6c4, 1.1);
    sun.position.set(15, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const d = 30;
    Object.assign(sun.shadow.camera, { left: -d, right: d, top: d, bottom: -d, far: 80 });
    this.scene.add(sun);
  }

  _onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    const aspect = w / h;
    const c = this.camera;
    c.left = -this.viewSize * aspect / 2;
    c.right = this.viewSize * aspect / 2;
    c.top = this.viewSize / 2;
    c.bottom = -this.viewSize / 2;
    c.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  add(system) { this.systems.push(system); return system; }

  start() {
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      for (const s of this.systems) s.update?.(dt);
      this.renderer.render(this.scene, this.camera);
    });
  }

  followCamera(target) {
    this.camera.position.copy(target).add(this.cameraOffset);
    this.camera.lookAt(target);
  }
}