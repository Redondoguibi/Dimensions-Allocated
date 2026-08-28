const BASE = import.meta.env.BASE_URL;

/** Resolve um caminho relativo à raiz pública do build. */
export function asset(path) {
  return BASE + String(path).replace(/^\/+/, '');
}

export const modelPath   = (file) => asset(`models/${file}`);
export const texturePath = (file) => asset(`textures/${file}`);

/** true quando rodando dentro do Tauri (WebView), false no navegador. */
export const isTauri = '__TAURI_INTERNALS__' in window;