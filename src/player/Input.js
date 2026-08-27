import * as THREE from 'three';

export class Input {
  constructor(game) {
    this.game = game;
    this.keys = new Set();
    this.pointer = new THREE.Vector2();
    this.worldPoint = new THREE.Vector3();
    this.interactPressed = false;

    this._ray = new THREE.Raycaster();
    this._plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    addEventListener('keydown', e => {
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.interactPressed = true;
    });
    addEventListener('keyup', e => this.keys.delete(e.code));
    addEventListener('mousemove', e => {
      this.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
    });
  }

  // direção de movimento alinhada ao eixo visual da câmera isométrica
  moveVector() {
    let x = 0, z = 0;
    if (this.keys.has('KeyW')) z -= 1;
    if (this.keys.has('KeyS')) z += 1;
    if (this.keys.has('KeyA')) x -= 1;
    if (this.keys.has('KeyD')) x += 1;
    const v = new THREE.Vector3(x, 0, z);
    if (v.lengthSq() === 0) return v;
    v.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    return v;
  }

  updateWorldPoint() {
    this._ray.setFromCamera(this.pointer, this.game.camera);
    this._ray.ray.intersectPlane(this._plane, this.worldPoint);
    return this.worldPoint;
  }

  consumeInteract() {
    const v = this.interactPressed;
    this.interactPressed = false;
    return v;
  }
}