import * as THREE from 'three';

export const DIMENSIONS = [
  { id: 'jungle', name: 'Selva Profunda',       color: 0x3fa34d, unlocked: true  },
  { id: 'glacier', name: 'Geleiras Congelantes', color: 0x62d0ff, unlocked: false },
  { id: 'flames',  name: 'Chamas Ardentes',      color: 0xff6a2b, unlocked: false },
  { id: 'void',    name: 'Vazio Obscuro',        color: 0x8a4bd8, unlocked: false },
];

export class Interactable {
  constructor(object3d, label, onUse, range = 2.2) {
    Object.assign(this, { object3d, label, onUse, range });
  }
}

export class Hub {
  constructor(game, player, ui) {
    this.game = game; this.player = player; this.ui = ui;
    this.interactables = [];
    this._buildGround();
    this._buildRuins();
    this._buildPortalMachine();
    this._buildHouse();
  }

  _buildGround() {
    const g = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshLambertMaterial({ color: 0x4a4436 })
    );
    g.rotation.x = -Math.PI / 2;
    g.receiveShadow = true;
    this.game.scene.add(g);
  }

  _buildRuins() {
    // casas destruídas espalhadas — placeholders a serem trocados por .gltf
    const mat = new THREE.MeshLambertMaterial({ color: 0x6b5c4a });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 14 + Math.random() * 8;
      const h = 1 + Math.random() * 2.5;
      const m = new THREE.Mesh(new THREE.BoxGeometry(3, h, 3), mat);
      m.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
      m.rotation.y = Math.random() * Math.PI;
      m.castShadow = m.receiveShadow = true;
      this.game.scene.add(m);
    }
  }

  _buildPortalMachine() {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.6, 0.6, 12),
      new THREE.MeshLambertMaterial({ color: 0x3a3a44 })
    );
    base.position.set(0, 0.3, -6);
    base.receiveShadow = true;
    this.game.scene.add(base);

    this.samples = [];
    DIMENSIONS.forEach((dim, i) => {
      const a = (i / DIMENSIONS.length) * Math.PI * 2 - Math.PI / 2;
      const pos = new THREE.Vector3(
        base.position.x + Math.cos(a) * 2.2,
        1.4,
        base.position.z + Math.sin(a) * 2.2
      );
      const mesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.35),
        new THREE.MeshBasicMaterial({ color: dim.color })
      );
      mesh.position.copy(pos);
      mesh.visible = dim.unlocked;
      this.game.scene.add(mesh);

      const light = new THREE.PointLight(dim.color, dim.unlocked ? 3 : 0, 6);
      light.position.copy(pos);
      this.game.scene.add(light);

      const sample = { dim, mesh, light, phase: Math.random() * 6.28 };
      this.samples.push(sample);

      this.interactables.push(new Interactable(
        mesh,
        `Amostra: ${dim.name}`,
        () => this.ui.openLevelMap(dim),
      ));
    });
  }

  _buildHouse() {
    // a casa dele: nunca é reconstruída
    const mat = new THREE.MeshLambertMaterial({ color: 0x4b3d33 });
    const wreck = new THREE.Group();
    [[-1.5, 0.9, 0, 0.4, 1.8, 4], [1.5, 0.5, -1, 0.4, 1.0, 2]].forEach(
      ([x, y, z, w, h, d]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        m.castShadow = true;
        wreck.add(m);
      }
    );
    wreck.position.set(10, 0, 8);
    this.game.scene.add(wreck);
  }

  unlock(dimId) {
    const s = this.samples.find(s => s.dim.id === dimId);
    if (!s) return;
    s.dim.unlocked = true;
    s.mesh.visible = true;
    s.light.intensity = 3;
  }

  update(dt) {
    const t = performance.now() / 1000;
    for (const s of this.samples) {
      if (!s.dim.unlocked) continue;
      s.mesh.rotation.y += dt * 1.2;
      s.mesh.position.y = 1.4 + Math.sin(t * 2 + s.phase) * 0.12;
      s.light.intensity = 2.5 + Math.sin(t * 3 + s.phase) * 0.6;
    }
    this._updateInteraction();
  }

  _updateInteraction() {
    const p = this.player.root.position;
    let best = null, bestDist = Infinity;
    for (const it of this.interactables) {
      if (!it.object3d.visible) continue;
      const d = it.object3d.getWorldPosition(new THREE.Vector3()).distanceTo(p);
      if (d < it.range && d < bestDist) { best = it; bestDist = d; }
    }
    this.ui.setPrompt(best ? `[E] ${best.label}` : null);
    if (best && this.player.input.consumeInteract()) best.onUse();
  }
}