import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {
  constructor(game, input) {
    this.game = game;
    this.input = input;
    this.speed = 6;
    this.radius = 0.4;
    this.root = new THREE.Group();
    this.velocity = new THREE.Vector3();

    // placeholder até chegar o .gltf do cientista
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
    model.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        if (o.material.map) {
          o.material.map.magFilter = THREE.NearestFilter; // pixel-art
          o.material.map.minFilter = THREE.NearestFilter;
          o.material.map.generateMipmaps = false;
        }
      }
    });
    this.root.remove(this.placeholder);
    this.root.add(model);
    this.mixer = new THREE.AnimationMixer(model);
    this.clips = Object.fromEntries(gltf.animations.map(c => [c.name, c]));
  }

  update(dt) {
    const dir = this.input.moveVector();
    this.velocity.lerp(dir.multiplyScalar(this.speed), 1 - Math.exp(-18 * dt));
    this.root.position.addScaledVector(this.velocity, dt);

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