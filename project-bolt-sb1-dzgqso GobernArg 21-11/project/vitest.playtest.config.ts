import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

// Playtest automatizado (Fase 7): partidas completas con bots. No corre en `npm test`.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'node',
      include: ['playtest/**/*.playtest.ts'],
      testTimeout: 600000,
    },
  })
);
