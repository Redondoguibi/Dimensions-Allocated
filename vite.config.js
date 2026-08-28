import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isTauri = mode === 'tauri';

  return {
    base: isTauri ? './' : '/dimensions-alocated/',
    build: {
      outDir: 'dist',
      target: 'esnext',
      emptyOutDir: true,
      assetsInlineLimit: 0,
      sourcemap: !isTauri
    },
    server: {
      port: 5173,
      strictPort: true,
      host: false
    },
    assetsInclude: ['**/*.glb', '**/*.gltf']
  };
});