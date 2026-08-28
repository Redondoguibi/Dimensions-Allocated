import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_SCALE = 1 / 16;
const FADE = 0.15;

export class Player {
  constructor(game, input) {
    this.game = game;
    this.input = input;
    this.speed = 6;
    this.radius = 0.4;
    this.root = new THREE.Group();
    this.velocity = new THREE.Vector3();

    this.mixer = null;
    this.actions = {};
    this.current = null;

    // placeholder até chegar o .glb do cientista
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 0.9, 4, 8),
      new THREE.MeshLambertMaterial({ color: 0xc9d4e0 })
    );
    mesh.position.y = 0.85;
    mesh.castShadow = true;
    this.root.add(mesh);
    this.placeholder = mesh;

    game.scene.add(this.root);
  }

  async loadModel(url) {
    const gltf = await new GLTFLoader().loadAsync(url);
    const model = gltf.scene;

    model.scale.setScalar(MODEL_SCALE);
    model.traverse(o => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.frustumCulled = false;            // evita sumir com skinning
      const map = o.material.map;
      if (map) {
        map.magFilter = THREE.NearestFilter;   // pixel-art
        map.minFilter = THREE.NearestFilter;
        map.generateMipmaps = false;
        map.colorSpace = THREE.SRGBColorSpace;
      }
    });

    this.root.remove(this.placeholder);
    this.placeholder.geometry.dispose();
    this.placeholder.material.dispose();
    this.placeholder = null;

    this.root.add(model);

    this.mixer = new THREE.AnimationMixer(model);
    console.log('[Player] animações:', gltf.animations.map(c => c.name));

    for (const clip of gltf.animations) {
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      this.actions[clip.name] = action;
    }

    if (!this.actions.idle) console.warn('[Player] falta clip "idle"');
    if (!this.actions.walk) console.warn('[Player] falta clip "walk"');

    this.play('idle');
    return this;
  }

  play(name) {
    const next = this.actions[name];
    if (!next || this.current === next) return;
    next.reset().fadeIn(FADE).play();
    if (this.current) this.current.fadeOut(FADE);
    this.current = next;
  }

  update(dt) {
    const dir = this.input.moveVector();
    this.velocity.lerp(dir.multiplyScalar(this.speed), 1 - Math.exp(-18 * dt));
    this.root.position.addScaledVector(this.velocity, dt);

    // troca idle/walk pela velocidade real, não pela tecla
    this.play(this.velocity.lengthSq() > 0.25 ? 'walk' : 'idle');

    // olhar para o cursor
    const p = this.input.updateWorldPoint();
    this.root.rotation.y = Math.atan2(
      p.x - this.root.position.x,
      p.z - this.root.position.z
    );

    this.mixer?.update(dt);
    this.game.followCamera(this.root.position);
  }
}