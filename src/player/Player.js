import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_SCALE = 1 / 16;
const MODEL_YAW = Math.PI;   // asset exportado olhando para -Z
const FADE = 0.15;
const MOVE_EPS = 0.25;       // velocidade² mínima para considerar "andando"

export class Player {
  constructor(game, input) {
    this.game = game;
    this.input = input;
    this.speed = 6;
    this.radius = 0.4;
    this.root = new THREE.Group();
    this.velocity = new THREE.Vector3();

    // pivot isola a correção de orientação das animações do gltf
    this.pivot = new THREE.Group();
    this.pivot.rotation.y = MODEL_YAW;
    this.root.add(this.pivot);

    this.mixer = null;
    this.actions = {};
    this.current = null;

    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.4, 0.9, 4, 8),
      new THREE.MeshLambertMaterial({ color: 0xc9d4e0 })
    );
    mesh.position.y = 0.85;
    mesh.castShadow = true;
    this.pivot.add(mesh);
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
      o.frustumCulled = false;
      const map = o.material.map;
      if (map) {
        map.magFilter = THREE.NearestFilter;   // pixel-art
        map.minFilter = THREE.NearestFilter;
        map.generateMipmaps = false;
        map.colorSpace = THREE.SRGBColorSpace;
      }
    });

    this._disposePlaceholder();
    this.pivot.add(model);

    this.mixer = new THREE.AnimationMixer(model);
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

  _disposePlaceholder() {
    if (!this.placeholder) return;
    this.pivot.remove(this.placeholder);
    this.placeholder.geometry.dispose();
    this.placeholder.material.dispose();
    this.placeholder = null;
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

    this.play(this.velocity.lengthSq() > MOVE_EPS ? 'walk' : 'idle');

    // convenção do jogo: +Z é a frente
    const p = this.input.updateWorldPoint();
    this.root.rotation.y = Math.atan2(
      p.x - this.root.position.x,
      p.z - this.root.position.z
    );

    this.mixer?.update(dt);
    this.game.followCamera(this.root.position);
  }
}