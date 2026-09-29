import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dirección pública del sitio para la vista previa al compartir (index.html).
// En Netlify la define netlify.toml con $URL; en local queda vacía (link relativo).
process.env.VITE_SITE_URL ??= '';

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
    // El pedazo del juego (datos + motor + interfaz) queda por debajo de este límite.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Fase 4: en vez de un solo archivo de 1 MB, las librerías van aparte y
        // el navegador las guarda entre actualizaciones del juego. El código del
        // juego queda en un solo pedazo: datos, motor e interfaz se importan
        // entre sí y separarlos rompe el orden de carga ("Cannot access before
        // initialization"). 
        manualChunks(id) {
          const p = id.replace(/\\/g, '/');
          if (p.includes('/node_modules/react') || p.includes('/node_modules/scheduler')) return 'react';
          if (p.includes('/node_modules/')) return 'vendor';
          return undefined;
        },
      },
    },
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
