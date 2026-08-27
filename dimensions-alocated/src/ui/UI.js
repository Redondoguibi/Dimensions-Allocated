export class UI {
  constructor() {
    this.prompt = document.createElement('div');
    this.prompt.id = 'prompt';
    document.body.appendChild(this.prompt);

    this.modal = document.createElement('div');
    this.modal.id = 'modal';
    this.modal.style.display = 'none';
    document.body.appendChild(this.modal);
  }

  setPrompt(text) {
    this.prompt.textContent = text ?? '';
    this.prompt.style.opacity = text ? 1 : 0;
  }

  openLevelMap(dim) {
    this.modal.style.display = 'flex';
    this.modal.innerHTML = `
      <div class="panel" style="--accent:#${dim.color.toString(16).padStart(6, '0')}">
        <h2>${dim.name}</h2>
        <ul>
          <li>Fase 1</li><li>Fase 2</li><li>Fase 3</li><li>Boss</li>
        </ul>
        <button id="close">Voltar</button>
      </div>`;
    this.modal.querySelector('#close').onclick = () => {
      this.modal.style.display = 'none';
    };
  }
}